// src/pages/Offline/Offline.js
import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { useNavigate, useOutletContext } from "react-router-dom";
import "./Offline.css";
import tableImage from "../../assets/table4.png";

// Utils & Hooks
import { mapBackendCardToFilename, cardImagesMap, getCardProp } from "./utils/CardUtils";
import { useGameAudio } from "./hooks/useGameAudio";

// Components
import UserPanel from "./components/UserPanel";
import Deck from "./components/Deck";
import Hand from "./components/Hand";
import Chips from "./components/Chips";
import PlayerControls from "./components/PlayerControls";
import GameActions from "./components/GameActions";
import GameOverlays from "./components/GameOverlays";

const DECK_POSITION = { left: 15, top: 30 };

function Offline() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, refreshUser } = useOutletContext();
  const audio = useGameAudio();

  const [currentBet, setCurrentBet] = useState(0);

  const [gameId, setGameId] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [dealerCards, setDealerCards] = useState([]);

  const [playerCards, setPlayerCards] = useState([]);
  const [splitCards, setSplitCards] = useState([]);

  const [gameStatus, setGameStatus] = useState("Waiting");
  const [gameResult, setGameResult] = useState(null);
  const [splitResult, setSplitResult] = useState(null);

  const [resultProcessed, setResultProcessed] = useState(false);
  const resultProcessedRef = React.useRef(false);
  const [showModal, setShowModal] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);

  const [showFireworks, setShowFireworks] = useState(false);

  const [canSplit, setCanSplit] = useState(false);
  const [canDouble, setCanDouble] = useState(false);
  const [isSplitActive, setIsSplitActive] = useState(false);
  const [hasSplit, setHasSplit] = useState(false);

  const [mainDoubled, setMainDoubled] = useState(false);
  const [splitDoubled, setSplitDoubled] = useState(false);

  const [strategyFeedback, setStrategyFeedback] = useState(null);
  const [isTrainerEnabled, setIsTrainerEnabled] = useState(true);

  const API_URL = "http://localhost:5126";
  const USER_ID = user?.id || 1;

  console.log("OFFLINE USER ID:", USER_ID);

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

  const startNewGame = async () => {
    if (currentBet <= 0) {
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

    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      const response = await fetch(
        `${API_URL}/games/create-singleplayer?userId=${USER_ID}&betAmount=${currentBet}`,
        { method: 'POST' }
      );
      if (!response.ok) {
        const errorText = await response.text();
        setIsShuffling(false);

        if (errorText.includes('Insufficient balance')) {
          alert(t('not_enough_funds'));
        } else {
          alert(`Błąd: ${errorText}`);
        }
        return;
      }
      const gameData = await response.json();

      setIsShuffling(false);

      if (refreshUser) {
        refreshUser();
      }
      updateGameState(gameData);

      if (gameData.status === "Completed") {
        await fetch(`${API_URL}/games/${gameData.id}/check-results/${gameData.players[0].playerId}`);
        await fetchGameStatus(gameData.id);
      }

    } catch (error) {
      console.error("Nie udało się rozpocząć gry:", error);
      alert("Błąd połączenia z serwerem.");
      setIsShuffling(false);
    }
  };

  const updateGameState = (gameData) => {
    setGameId(gameData.id);
    const dealer = gameData.dealer;
    const player = gameData.players.find((p) => p.user.id === USER_ID);

    if (dealer) {
      setDealerCards(
        dealer.hand.map((c) => ({
          name: mapBackendCardToFilename(c),
          src: cardImagesMap[mapBackendCardToFilename(c)],
        }))
      );
    }

    if (player) {
      setPlayerId(player.playerId);
      setPlayerCards(
        player.hand.map((c) => ({
          name: mapBackendCardToFilename(c),
          src: cardImagesMap[mapBackendCardToFilename(c)],
        }))
      );

      let currentIsSplitActive = false;
      if (player.hasSplit) {
        setHasSplit(true);
        setSplitCards(
          player.splitHand
            ? player.splitHand.map((c) => ({
              name: mapBackendCardToFilename(c),
              src: cardImagesMap[mapBackendCardToFilename(c)],
            }))
            : []
        );

        if (player.status !== "Active" && player.splitStatus === "Active") {
          currentIsSplitActive = true;
        }
      }
      setIsSplitActive(currentIsSplitActive);

      // Logika przycisków
      let doubleCondition = false;
      if (currentIsSplitActive) {
        doubleCondition =
          player.splitHand &&
          player.splitHand.length === 2 &&
          player.splitStatus === "Active" &&
          !splitDoubled;
      } else {
        doubleCondition =
          player.hand.length === 2 &&
          player.status === "Active" &&
          !mainDoubled;
      }
      setCanDouble(doubleCondition);

      let splitCondition = false;
      if (
        player.hand.length === 2 &&
        !player.hasSplit &&
        player.status === "Active"
      ) {
        const rank1 = getCardProp(player.hand[0], "rank");
        const rank2 = getCardProp(player.hand[1], "rank");
        if (rank1 && rank2 && rank1 === rank2) {
          splitCondition = true;
        }
      }
      setCanSplit(splitCondition);
      setMainDoubled(player.hasDoubledMain || mainDoubled);
      setSplitDoubled(player.hasDoubledSplit || splitDoubled);

      setGameResult(player.result);
      setSplitResult(player.splitResult);

      if (gameData.status === "Completed" && !resultProcessedRef.current) {
        if (player.result && (!player.hasSplit || player.splitResult)) {
          handleGameResult(
            player.result,
            player.splitResult,
            player.hasDoubledMain,
            player.hasDoubledSplit
          );
        }
      }
    }

    setGameStatus(gameData.status);
  };

  const handleGameResult = (
    mainResult,
    splitRes,
    isMainDoubledNow,
    isSplitDoubledNow
  ) => {
    setResultProcessed(true);
    resultProcessedRef.current = true;

    if (mainResult === "Win") audio.playWin();
    if (mainResult === "Lose") audio.playLose();
    if (mainResult === "Push") audio.playPush();
    if (mainResult === "Blackjack") {
        audio.playBlackjack();
    }

    if (mainResult === "Blackjack" || splitRes === "Blackjack") {
      setShowFireworks(true);
      setTimeout(() => setShowFireworks(false), 8000);
    }

    setTimeout(() => {
      setShowModal(true);
    }, 1000);

    if (refreshUser) {
      refreshUser();
    }

  };

  const fetchGameStatus = async (gId) => {
    const response = await fetch(`${API_URL}/games/${gId}`);
    const data = await response.json();
    updateGameState(data);
    return data;
  };

  useEffect(() => {
    if (gameStatus === "Completed" && !resultProcessed && gameId && playerId) {
      fetch(`${API_URL}/games/${gameId}/check-results/${playerId}`)
        .then(() => fetchGameStatus(gameId));
    }
  }, [gameStatus, playerId]);

  const analyzeMove = async (action) => {
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
    const dealerPayload =
      dealerCards.length > 0 ? parseCardName(dealerCards[0].name) : null;

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

  const handleGoBack = () => {
    audio.playClick();
    setTimeout(() => {
        navigate("/play");
    }, 400);
  };

  const handleHit = async () => {
    analyzeMove("Hit");
    if (!gameId || !playerId) return;
    try {
      if (isSplitActive) {
        await fetch(`${API_URL}/games/${gameId}/player-hit-split/${playerId}`, {
          method: "POST",
        });
      } else {
        await fetch(`${API_URL}/games/${gameId}/player-hit/${playerId}`);
      }
      await fetchGameStatus(gameId);

      const gameData = await fetchGameStatus(gameId);
      if (gameData.status === "Completed") {
        await fetch(`${API_URL}/games/${gameId}/check-results/${playerId}`);
        await fetchGameStatus(gameId);
      }

    } catch (error) {
      console.error("Błąd Hit:", error);
    }
  };

  const handleStand = async () => {
    analyzeMove("Stand");
    if (!gameId || !playerId) return;
    try {
      await fetch(`${API_URL}/games/${gameId}/player-pass/${playerId}`
      );
      const data = await fetchGameStatus(gameId);
      if (data.status === "Completed") {
        await fetch(`${API_URL}/games/${gameId}/check-results/${playerId}`);
        await fetchGameStatus(gameId);
      }
    } catch (error) {
      console.error("Błąd Stand:", error);
    }
  };

  const handleSplitAction = async () => {
    analyzeMove("Split");
    if (!canSplit) return;
    if (user.balance < currentBet) {
      alert(t('not_enough_funds'));
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/games/${gameId}/player-split/${playerId}`,
        { method: "POST" }
      );

      if (!response.ok) {
        const errorText = await response.text();
        if (errorText.includes('Insufficient balance')) {
          alert(t('not_enough_funds'));
        } else {
          alert(`Błąd: ${errorText}`);
        }
        return;
      }
      if (refreshUser) {
        refreshUser();
      }

      await fetchGameStatus(gameId);

    } catch (error) {
      console.error("Błąd Split:", error);
      alert("Błąd połączenia z serwerem.");
    }
  };

  const handleDouble = async () => {
    analyzeMove("Double");
    if (!canDouble) return;

    if (user.balance < currentBet) {
      alert(t('not_enough_funds'));
      return;
    }

    try {
      let response;

      if (isSplitActive) {
        response = await fetch(
          `${API_URL}/games/${gameId}/player-double-split/${playerId}`,
          { method: "POST" }
        );
        setSplitDoubled(true);
      } else {
        response = await fetch(
          `${API_URL}/games/${gameId}/player-double/${playerId}`,
          { method: "POST" }
        );
        setMainDoubled(true);
      }

      if (!response.ok) {
        const errorText = await response.text();
        if (errorText.includes('Insufficient balance')) {
          alert(t('not_enough_funds'));
        } else {
          alert(`Błąd: ${errorText}`);
        }
        return;
      }
      if (refreshUser) {
        refreshUser();
      }

      const data = await fetchGameStatus(gameId);

      if (data.status === "Completed") {
        await fetch(`${API_URL}/games/${gameId}/check-results/${playerId}`);
        await fetchGameStatus(gameId);
      }

    } catch (error) {
      console.error("Błąd Double:", error);
      alert("Błąd połączenia z serwerem.");
    }
  };

  const handleChipSelect = (value) => {
    if (gameStatus === "InProgress" || isShuffling) return;

    if (currentBet + value > user.balance) {
      alert(t('not_enough_funds'));
      return;
    }
    setCurrentBet((prev) => prev + value);
  };

  const clearBet = () => {
    if (gameStatus === "InProgress" || isShuffling) return;
    setCurrentBet(0);
    resetGameFlags();
  };

  const getResultText = (result) => {
    if (!result) return "";
    if (result === "Win") return "WYGRANA!";
    if (result === "Lose") return "PRZEGRANA";
    if (result === "Push") return "REMIS";
    if (result === "Blackjack") return "BLACKJACK!";
    return "";
  };

  const getFinalMessage = () => {
    let msg = "";
    let totalWin = 0;

    const calc = (res, bet, isDoubled) => {
      const actualBet = isDoubled ? bet * 2 : bet;
      if (res === "Win")
        return { txt: "Wygrałeś", val: actualBet * 2 - actualBet };
      if (res === "Blackjack")
        return { txt: "Blackjack", val: actualBet * 2.5 - actualBet };
      if (res === "Push") return { txt: "Zwrot", val: 0 };
      return { txt: "Przegrałeś", val: -actualBet };
    };

    const main = calc(gameResult, currentBet, mainDoubled);
    totalWin += main.val;

    if (hasSplit) {
      const split = calc(splitResult, currentBet, splitDoubled);
      totalWin += split.val;
      msg = `${t('hand')} 1: ${getResultText(gameResult)} | ${t('hand')} 2: ${getResultText(
        splitResult
      )}`;
    } else {
      msg = getResultText(gameResult);
    }

    return {
      title: msg,
      desc:
        totalWin >= 0
          ? `Wygrałeś łącznie ${totalWin} PLN na czysto`
          : `Straciłeś łącznie ${Math.abs(totalWin)} PLN`,
    };
  };

  const displayedBetOnTable = () => {
    if (gameStatus === "Waiting") return currentBet;
    let total = currentBet;
    if (mainDoubled) total += currentBet;
    if (hasSplit) {
      total += currentBet;
      if (splitDoubled) total += currentBet;
    }
    return total;
  };

  return (
    <div className="offline-container">
      
      <UserPanel 
        user={user} 
        t={t} 
        isTrainerEnabled={isTrainerEnabled} 
        setIsTrainerEnabled={setIsTrainerEnabled} 
        onExit={handleGoBack}
      />

      <GameOverlays
        showFireworks={showFireworks}
        showModal={showModal}
        gameResult={gameResult}
        splitResult={splitResult}
        finalMessage={getFinalMessage()}
        hasSplit={hasSplit}
        strategyFeedback={strategyFeedback}
        isTrainerEnabled={isTrainerEnabled}
        onModalClose={() => {
            setShowModal(false);
            setCurrentBet(0);
            setGameStatus("Waiting");
            resetGameFlags();
        }}
      />

      {/* STÓŁ GRY */}
      <div className="game-table-area">
        <img src={tableImage} alt="Stół do gry" className="game-table-image" />

        {/* Dealer Hand */}
        <Hand 
            cards={dealerCards} 
            deckPosition={DECK_POSITION} 
            title={`${t('dealer')}:`} 
            gameStatus={gameStatus} 
            isDealer={true}
        />

        {/* Player Hand (Main) */}
        <Hand 
            cards={playerCards} 
            deckPosition={DECK_POSITION} 
            title={hasSplit ? `${t('hand')} 1` : "Ty"} 
            gameStatus={gameStatus} 
            isDealer={false}
            hasSplit={hasSplit}
            isActive={hasSplit && !isSplitActive}
        />

        {/* Player Hand (Split) */}
        {hasSplit && (
             <Hand 
                cards={splitCards} 
                deckPosition={DECK_POSITION} 
                title={`${t('hand')} 2:`} 
                gameStatus={gameStatus} 
                isDealer={false}
                hasSplit={hasSplit}
                isActive={isSplitActive}
                leftPositionBase={56}
            />
        )}

        {/* TASOWARKA */}
        <Deck position={DECK_POSITION} isShuffling={isShuffling} />

        {/* ŻETONY - Wewnątrz stołu, aby leżały "na stole" */}
        <Chips 
            onChipSelect={handleChipSelect} 
        />
      </div>

      {/* PANEL STEROWANIA I BALANS - Poza stołem, aby uniknąć ucięcia tekstu */}
      <PlayerControls 
          t={t}
          gameStatus={gameStatus}
          isShuffling={isShuffling}
          userBalance={user.balance}
          currentBet={currentBet}
          onClearBet={clearBet}
          onStartGame={startNewGame}
          displayedBetOnTable={displayedBetOnTable()}
      />

      <GameActions 
        t={t}
        gameStatus={gameStatus}
        isShuffling={isShuffling}
        canSplit={canSplit}
        canDouble={canDouble}
        onHit={handleHit}
        onStand={handleStand}
        onSplit={handleSplitAction}
        onDouble={handleDouble}
      />
    </div>
  );
}

export default Offline;