// src/pages/Offline/hooks/useGameLogic.js
import { useState, useRef, useEffect } from "react";
import { mapBackendCardToFilename, cardImagesMap, getCardProp } from "../utils/CardUtils";

const API_URL = "http://localhost:5126";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const useGameLogic = (user, audio, refreshUser, t) => {
    // --- STANY (STATE) ---
    const [gameId, setGameId] = useState(null);
    const [playerId, setPlayerId] = useState(null);

    const [dealerCards, setDealerCards] = useState([]);
    const [playerCards, setPlayerCards] = useState([]);
    const [splitCards, setSplitCards] = useState([]);

    const [gameStatus, setGameStatus] = useState("Waiting");
    const [gameResult, setGameResult] = useState(null);
    const [splitResult, setSplitResult] = useState(null);

    const [resultProcessed, setResultProcessed] = useState(false);
    const resultProcessedRef = useRef(false);
    const [showModal, setShowModal] = useState(false);
    const [isShuffling, setIsShuffling] = useState(false);
    const [showFireworks, setShowFireworks] = useState(false);

    // Flagi gry
    const [canSplit, setCanSplit] = useState(false);
    const [canDouble, setCanDouble] = useState(false);
    const [isSplitActive, setIsSplitActive] = useState(false);
    const [hasSplit, setHasSplit] = useState(false);
    const [mainDoubled, setMainDoubled] = useState(false);
    const [splitDoubled, setSplitDoubled] = useState(false);

    const [strategyFeedback, setStrategyFeedback] = useState(null);

    // --- POMOCNICZE ---
    const resetGameFlags = () => {
        setMainDoubled(false);
        setSplitDoubled(false);
        setHasSplit(false);
        setIsSplitActive(false);
        setCanSplit(false);
        setCanDouble(false);
        setSplitCards([]);
        setStrategyFeedback(null);
    };

    const fetchGameStatus = async (gId) => {
        const response = await fetch(`${API_URL}/games/${gId}`);
        const data = await response.json();
        updateGameState(data);
        return data;
    };

    const analyzeMove = async (action, isTrainerEnabled) => {
        if (!isTrainerEnabled) return;
        const currentHand = isSplitActive ? splitCards : playerCards;

        const parseCardName = (filename) => {
            const parts = filename.split("_of_");
            let rank = parts[0];
            const suit = parts[1];
            if (rank === "ace") rank = "A";
            else if (rank === "king") rank = "K";
            else if (rank === "queen") rank = "Q";
            else if (rank === "j") rank = "J";
            else if (rank === "jack") rank = "J";
            else rank = rank.toUpperCase();
            return { Rank: rank, Suit: suit };
        };

        const handPayload = currentHand.map((c) => parseCardName(c.name));
        const dealerPayload = dealerCards.length > 0 ? parseCardName(dealerCards[0].name) : null;
        if (!dealerPayload) return;

        try {
            const response = await fetch(`${API_URL}/games/analyze-move`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    playerHandCards: handPayload,
                    dealerCard: dealerPayload,
                    action: action,
                    canSplit: canSplit,
                    canDouble: canDouble,
                }),
            });
            const data = await response.json();
            setStrategyFeedback({
                isCorrect: data.isCorrect,
                message: data.message,
            });
            setTimeout(() => setStrategyFeedback(null), 5000);
        } catch (e) {
            console.error("Błąd analizy strategii:", e);
        }
    };

    // --- GŁÓWNA AKTUALIZACJA STANU ---
    const updateGameState = (gameData) => {
        setGameId(gameData.id);
        const dealer = gameData.dealer;
        const player = gameData.players.find((p) => p.user.id === user?.id);

        if (dealer) {
            setDealerCards(dealer.hand.map((c) => ({
                name: mapBackendCardToFilename(c),
                src: cardImagesMap[mapBackendCardToFilename(c)],
            })));
        }

        if (player) {
            setPlayerId(player.playerId);
            setPlayerCards(player.hand.map((c) => ({
                name: mapBackendCardToFilename(c),
                src: cardImagesMap[mapBackendCardToFilename(c)],
            })));

            let currentIsSplitActive = false;
            if (player.hasSplit) {
                setHasSplit(true);
                setSplitCards(player.splitHand ? player.splitHand.map((c) => ({
                    name: mapBackendCardToFilename(c),
                    src: cardImagesMap[mapBackendCardToFilename(c)],
                })) : []);

                if (player.status !== "Active" && player.splitStatus === "Active") {
                    currentIsSplitActive = true;
                }
            }
            setIsSplitActive(currentIsSplitActive);

            let doubleCondition = false;
            if (currentIsSplitActive) {
                doubleCondition = player.splitHand && player.splitHand.length === 2 && player.splitStatus === "Active" && !splitDoubled;
            } else {
                doubleCondition = player.hand.length === 2 && player.status === "Active" && !mainDoubled;
            }
            setCanDouble(doubleCondition);

            let splitCondition = false;
            if (player.hand.length === 2 && !player.hasSplit && player.status === "Active") {
                const rank1 = getCardProp(player.hand[0], "rank");
                const rank2 = getCardProp(player.hand[1], "rank");
                if (rank1 && rank2 && rank1 === rank2) {
                    splitCondition = true;
                }
            }
            setCanSplit(splitCondition);
            setMainDoubled(player.hasDoubledMain || mainDoubled);
            setSplitDoubled(player.hasDoubledSplit || splitDoubled);

            if (player.result) setGameResult(player.result);
            if (player.splitResult) setSplitResult(player.splitResult);
        }
        setGameStatus(gameData.status);
    };

    const processFinalResults = async (gId, pId) => {
        try {
            await fetch(`${API_URL}/games/${gId}/check-results/${pId}`);
            const finalData = await fetchGameStatus(gId);
            const player = finalData.players.find((p) => p.user.id === user?.id);
            if (player) {
                handleGameResult(player.result, player.splitResult);
            }
        } catch (error) {
            console.error("Błąd podczas przetwarzania wyników:", error);
        }
    };

    // --- LOGIKA DŹWIĘKÓW I WYNIKÓW ---
    const handleGameResult = (mainResult, splitRes) => {
        setResultProcessed(true);
        resultProcessedRef.current = true;

        const getHandScore = (res, isDoubled) => {
            const factor = isDoubled ? 2 : 1;
            if (res === "Blackjack") return 1.5 * factor;
            if (res === "Win") return 1 * factor;
            if (res === "Lose") return -1 * factor;
            return 0; // Push
        };

        const score1 = getHandScore(mainResult, mainDoubled);
        const score2 = splitRes ? getHandScore(splitRes, splitDoubled) : 0;
        const totalScore = score1 + score2;

        if (mainResult === "Blackjack" || splitRes === "Blackjack") {
            setShowFireworks(true);
            setTimeout(() => setShowFireworks(false), 8000);
        }

        if (totalScore > 0) {
            if (mainResult === "Blackjack" || splitRes === "Blackjack") {
                audio.playBlackjack();
            } else {
                audio.playWin();
            }
        } else if (totalScore < 0) {
            audio.playLose();
        } else {
            audio.playPush();
        }

        setTimeout(() => setShowModal(true), 500);
        if (refreshUser) refreshUser();
    };

    // --- AKCJE GRACZA (HANDLERS) ---
    const startNewGame = async (betAmount) => {
        if (betAmount <= 0) {
            alert(t('bet_must_place'));
            return;
        }

        setResultProcessed(false);
        resultProcessedRef.current = false;
        setGameResult(null);
        setSplitResult(null);
        setShowModal(false);
        setDealerCards([]);
        setPlayerCards([]);
        resetGameFlags();

        setIsShuffling(true);
        audio.playShuffle();

        await sleep(1000);

        try {
            const response = await fetch(
                `${API_URL}/games/create-singleplayer?userId=${user?.id}&betAmount=${betAmount}`,
                { method: 'POST', credentials: 'include' }
            );
            if (!response.ok) {
                const errorText = await response.text();
                setIsShuffling(false);
                alert(errorText.includes('Insufficient balance') ? t('not_enough_funds') : `Błąd: ${errorText}`);
                return;
            }
            const gameData = await response.json();
            setIsShuffling(false);
            if (refreshUser) refreshUser();
            updateGameState(gameData);

            if (gameData.status === "Completed") {
                await sleep(1500);
                await processFinalResults(gameData.id, gameData.players[0].playerId);
            }
        } catch (error) {
            console.error("Nie udało się rozpocząć gry:", error);
            alert("Błąd połączenia z serwerem.");
            setIsShuffling(false);
        }
    };

    // --- ZMODYFIKOWANY HIT (Z Opóźnieniem przy Bust) ---
    const handleHit = async (isTrainerEnabled) => {
        analyzeMove("Hit", isTrainerEnabled);
        if (!gameId || !playerId) return;
        try {
            if (isSplitActive) {
                await fetch(`${API_URL}/games/${gameId}/player-hit-split/${playerId}`, { method: "POST" });
            } else {
                await fetch(`${API_URL}/games/${gameId}/player-hit/${playerId}`);
            }

            // 1. Pobieramy dane RĘCZNIE, bez automatycznego updateGameState
            const response = await fetch(`${API_URL}/games/${gameId}`);
            const gameData = await response.json();

            // 2. Jeśli gra się skończyła (np. Bust), robimy aktualizację "na raty"
            if (gameData.status === "Completed") {
                // A. Pokaż TYLKO karty gracza (nową kartę, która powoduje Bust)
                const player = gameData.players.find((p) => p.user.id === user?.id);
                if (player) {
                    setPlayerCards(player.hand.map((c) => ({
                        name: mapBackendCardToFilename(c),
                        src: cardImagesMap[mapBackendCardToFilename(c)],
                    })));
                    // Jeśli split, to też aktualizujemy drugą rękę
                    if (player.splitHand) {
                        setSplitCards(player.splitHand.map((c) => ({
                            name: mapBackendCardToFilename(c),
                            src: cardImagesMap[mapBackendCardToFilename(c)],
                        })));
                    }
                }

                // B. Czekamy (gracz widzi "22" i wzdycha)
                await sleep(1000);

                // C. Odsłaniamy karty dealera (aktualizujemy resztę stanu)
                updateGameState(gameData);

                // D. Czekamy na animację dealera i pokazujemy wynik
                await sleep(2000);
                await processFinalResults(gameId, playerId);

            } else {
                // Gra trwa dalej - normalna szybka aktualizacja
                updateGameState(gameData);
            }

        } catch (error) {
            console.error("Błąd Hit:", error);
        }
    };

    const handleStand = async (isTrainerEnabled) => {
        analyzeMove("Stand", isTrainerEnabled);
        if (!gameId || !playerId) return;
        try {
            await fetch(`${API_URL}/games/${gameId}/player-pass/${playerId}`);

            const response = await fetch(`${API_URL}/games/${gameId}`);
            const data = await response.json();

            updateGameState(data);

            if (data.status === "Completed") {
                // Dealer dobiera karty - dajemy dużo czasu na animację
                await sleep(2500);
                await processFinalResults(gameId, playerId);
            }
        } catch (error) {
            console.error("Błąd Stand:", error);
        }
    };

    const handleSplit = async (currentBet, isTrainerEnabled) => {
        analyzeMove("Split", isTrainerEnabled);
        if (!canSplit) return;
        if (user.balance < currentBet) {
            alert(t('not_enough_funds'));
            return;
        }
        try {
            const response = await fetch(`${API_URL}/games/${gameId}/player-split/${playerId}`, { method: "POST" });
            if (!response.ok) {
                const errorText = await response.text();
                alert(errorText.includes('Insufficient balance') ? t('not_enough_funds') : `Błąd: ${errorText}`);
                return;
            }
            if (refreshUser) refreshUser();
            await fetchGameStatus(gameId);
        } catch (error) {
            console.error("Błąd Split:", error);
            alert("Błąd połączenia z serwerem.");
        }
    };

    // --- ZMODYFIKOWANY DOUBLE (Też z opóźnieniem) ---
    const handleDouble = async (currentBet, isTrainerEnabled) => {
        analyzeMove("Double", isTrainerEnabled);
        if (!canDouble) return;
        if (user.balance < currentBet) {
            alert(t('not_enough_funds'));
            return;
        }
        try {
            let response;
            if (isSplitActive) {
                response = await fetch(`${API_URL}/games/${gameId}/player-double-split/${playerId}`, { method: "POST" });
                setSplitDoubled(true);
            } else {
                response = await fetch(`${API_URL}/games/${gameId}/player-double/${playerId}`, { method: "POST" });
                setMainDoubled(true);
            }
            if (!response.ok) {
                const errorText = await response.text();
                alert(errorText.includes('Insufficient balance') ? t('not_enough_funds') : `Błąd: ${errorText}`);
                return;
            }
            if (refreshUser) refreshUser();

            // Double zawsze kończy turę dla danej ręki.
            // Sprawdzamy stan ręcznie
            const statusRes = await fetch(`${API_URL}/games/${gameId}`);
            const gameData = await statusRes.json();

            if (gameData.status === "Completed") {
                // A. Pokaż kartę gracza
                const player = gameData.players.find((p) => p.user.id === user?.id);
                if (player) {
                    setPlayerCards(player.hand.map((c) => ({
                        name: mapBackendCardToFilename(c),
                        src: cardImagesMap[mapBackendCardToFilename(c)],
                    })));
                    if (player.splitHand) {
                        setSplitCards(player.splitHand.map((c) => ({
                            name: mapBackendCardToFilename(c),
                            src: cardImagesMap[mapBackendCardToFilename(c)],
                        })));
                    }
                }

                // B. Czekaj (niech gracz zobaczy czy weszła 10-tka czy 2-ka)
                await sleep(1000);

                // C. Odsłoń Dealera
                updateGameState(gameData);

                // D. Czekaj na animację i wynik
                await sleep(2000);
                await processFinalResults(gameId, playerId);
            } else {
                updateGameState(gameData);
            }
        } catch (error) {
            console.error("Błąd Double:", error);
            alert("Błąd połączenia z serwerem.");
        }
    };

    useEffect(() => {
        if (gameStatus === "Completed" && !resultProcessed && gameId && playerId && !resultProcessedRef.current) {
            processFinalResults(gameId, playerId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        dealerCards, playerCards, splitCards,
        gameStatus, gameResult, splitResult,
        isShuffling, showModal, showFireworks,
        canSplit, canDouble, isSplitActive, hasSplit,
        mainDoubled, splitDoubled, strategyFeedback,
        startNewGame, handleHit, handleStand, handleSplit, handleDouble,
        closeModal: () => {
            setShowModal(false);
            setGameStatus("Waiting");
            resetGameFlags();
        }
    };
};