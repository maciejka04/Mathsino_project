import React, { useState, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import "./Online.css";
import tableImage from "../../assets/table4.png";
import dziesiecImage from "../../assets/zetony/dziesiec.png";
import piecdziesiatImage from "../../assets/zetony/piecdziesiat.png";
import stoImage from "../../assets/zetony/sto.png";
import piecsetImage from "../../assets/zetony/piecset.png";
import { motion } from "framer-motion";
import Fireworks from 'fireworks-js';

import reverseCardImage from "../../assets/karty/reverse2.png";
import defaultAvatar from "../../assets/profilepic/snake.png";


const DECK_POSITION = { left: 15, top: 30 };

const allCardFileNames = [
  "2_of_hearts",
  "3_of_hearts",
  "4_of_hearts",
  "5_of_hearts",
  "6_of_hearts",
  "7_of_hearts",
  "8_of_hearts",
  "9_of_hearts",
  "10_of_hearts",
  "jack_of_hearts",
  "queen_of_hearts",
  "king_of_hearts",
  "ace_of_hearts",
  "2_of_diamonds",
  "3_of_diamonds",
  "4_of_diamonds",
  "5_of_diamonds",
  "6_of_diamonds",
  "7_of_diamonds",
  "8_of_diamonds",
  "9_of_diamonds",
  "10_of_diamonds",
  "jack_of_diamonds",
  "queen_of_diamonds",
  "king_of_diamonds",
  "ace_of_diamonds",
  "2_of_clubs",
  "3_of_clubs",
  "4_of_clubs",
  "5_of_clubs",
  "6_of_clubs",
  "7_of_clubs",
  "8_of_clubs",
  "9_of_clubs",
  "10_of_clubs",
  "jack_of_clubs",
  "queen_of_clubs",
  "king_of_clubs",
  "ace_of_clubs",
  "2_of_spades",
  "3_of_spades",
  "4_of_spades",
  "5_of_spades",
  "6_of_spades",
  "7_of_spades",
  "8_of_spades",
  "9_of_spades",
  "10_of_spades",
  "jack_of_spades",
  "queen_of_spades",
  "king_of_spades",
  "ace_of_spades",
];

const cardImagesMap = allCardFileNames.reduce((acc, cardName) => {
  try {
    acc[cardName] = require(`../../assets/karty/${cardName}.png`);
  } catch (e) { }
  return acc;
}, {});

const getCardProp = (card, prop) => {
  if (!card) return null;
  return (
    card[prop.toLowerCase()] ||
    card[prop.charAt(0).toUpperCase() + prop.slice(1)]
  );
};

const mapBackendCardToFilename = (card) => {
  if (!card) return null;
  let rankName = (getCardProp(card, "rank") || "").toLowerCase();
  if (rankName === "a") rankName = "ace";
  else if (rankName === "k") rankName = "king";
  else if (rankName === "q") rankName = "queen";
  else if (rankName === "j") rankName = "jack";
  const suitName = (getCardProp(card, "suit") || "").toLowerCase();
  return `${rankName}_of_${suitName}`;
};

const calculateHandValue = (hand) => {
    let sum = 0;
    let numAces = 0;

    for (const card of hand) {
        if (!card || !card.name) continue;
        
        const rank = card.name.split('_of_')[0].toLowerCase();

        if (rank === 'ace') {
            numAces += 1;
            sum += 11; 
        } else if (['king', 'queen', 'jack', '10'].includes(rank)) {
            sum += 10;
        } else {
            const numericalRank = parseInt(rank, 10);
            if (!isNaN(numericalRank)) {
                sum += numericalRank;
            }
        }
    }

    // Korekta dla Asów
    while (sum > 21 && numAces > 0) {
        sum -= 10; 
        numAces -= 1;
    }

    return sum;
};

function Online() {
  const navigate = useNavigate();
  const { user } = useOutletContext();
  const [currentBalance, setCurrentBalance] = useState(5000);
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
  const fireworksContainerRef = useRef(null);

  const [canSplit, setCanSplit] = useState(false);
  const [canDouble, setCanDouble] = useState(false);
  const [isSplitActive, setIsSplitActive] = useState(false);
  const [hasSplit, setHasSplit] = useState(false);

  const [mainDoubled, setMainDoubled] = useState(false);
  const [splitDoubled, setSplitDoubled] = useState(false);

  const [strategyFeedback, setStrategyFeedback] = useState(null);

  const API_URL = "http://localhost:5126";
  const USER_ID = user?.id || 1;

  console.log("ONLINE USER ID:", USER_ID);

  React.useEffect(() => {
    let fireworks;
    if (showFireworks && fireworksContainerRef.current) {
        fireworks = new Fireworks(fireworksContainerRef.current, {
            autoresize: true,
            opacity: 0.9,
            acceleration: 1.05,
            friction: 0.97,
            particles: 50,
            gravity: 1.5,
            traceSpeed: 0.5,
            delay: { min: 15, max: 30 },
            mouse: { click: false, move: false }, 
            boundaries: { 
                x: 50,
                y: 50,
                width: fireworksContainerRef.current.clientWidth - 100,
                height: fireworksContainerRef.current.clientHeight * 0.7,
            },
        });
        
        fireworks.start();
    }
    
    return () => {
        if (fireworks) {
            fireworks.stop();
        }
    };
  }, [showFireworks]);

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
      alert("Musisz postawić zakład, aby zagrać!");
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
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      const response = await fetch(
        `${API_URL}/games/create-singleplayer?userId=${USER_ID}`
      );
      if (!response.ok) throw new Error("Błąd tworzenia gry");
      const gameData = await response.json();

      setIsShuffling(false);
      updateGameState(gameData);

      if (gameData.status === "Completed") {
        await fetch(`${API_URL}/games/${gameData.id}/check-results/${gameData.players[0].playerId}`);
        await fetchGameStatus(gameData.id);
      }

    } catch (error) {
      console.error("Nie udało się rozpocząć gry:", error);
      alert("Błąd połączenia. Środki zostały zwrócone.");
      setCurrentBalance((prev) => prev + currentBet);
      setCurrentBet(0);
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

    if (mainResult === "Blackjack" || splitRes === "Blackjack") {
    setShowFireworks(true);
    setTimeout(() => {
    setShowFireworks(false);
   }, 8000); 
  }

    setTimeout(() => {
      setShowModal(true);
    }, 1000);

    let totalWin = 0;

    const calculateWin = (res, bet, isDoubled) => {
      const actualBet = isDoubled ? bet * 2 : bet;
      switch (res) {
        case "Win":
          return actualBet * 2;
        case "Blackjack":
          return actualBet * 2.5;
        case "Push":
          return actualBet;
        case "Lose":
          return 0;
        default:
          return 0;
      }
    };

    totalWin += calculateWin(mainResult, currentBet, isMainDoubledNow);

    if (hasSplit && splitRes) {
      totalWin += calculateWin(splitRes, currentBet, isSplitDoubledNow);
    }

    if (totalWin > 0) {
      setCurrentBalance((prev) => prev + totalWin);
    }
  };

  const fetchGameStatus = async (gId) => {
    const response = await fetch(`${API_URL}/games/${gId}`);
    const data = await response.json();
    updateGameState(data);
    return data;
  };

  React.useEffect(() => {
    if (gameStatus === "Completed" && !resultProcessed && gameId && playerId) {
      fetch(`${API_URL}/games/${gameId}/check-results/${playerId}`)
        .then(() => fetchGameStatus(gameId));
    }
  }, [gameStatus, playerId]);



  // --- ANALIZA RUCHU (TRENER) ---
  const analyzeMove = async (action) => {
    // 1. Wybierz rękę, którą teraz gramy (split lub main)
    const currentHand = isSplitActive ? splitCards : playerCards;

    const parseCardName = (filename) => {
      const parts = filename.split("_of_");
      let rank = parts[0];
      const suit = parts[1];
      if (rank === "ace") rank = "A";
      else if (rank === "king") rank = "K";
      else if (rank === "queen") rank = "Q";
      else if (rank === "j") rank = "J"; // małe j w nazwie pliku
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
          // Ważne: wysyłamy aktualne flagi, np. jeśli mam 3 karty to canDouble=false
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
    navigate("/play");
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
      await fetch(`${API_URL}/games/${gameId}/player-pass/${playerId}`);
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
    if (currentBalance < currentBet) {
      alert("Brak środków na Split!");
      return;
    }
    try {
      setCurrentBalance((prev) => prev - currentBet);
      await fetch(`${API_URL}/games/${gameId}/player-split/${playerId}`, {
        method: "POST",
      });
      await fetchGameStatus(gameId);
    } catch (error) {
      console.error("Błąd Split:", error);
    }
  };

  const handleDouble = async () => {
    analyzeMove("Double");
    if (!canDouble) return;
    if (currentBalance < currentBet) {
      alert("Brak środków na Double!");
      return;
    }
    try {
      setCurrentBalance((prev) => prev - currentBet);

      if (isSplitActive) {
        await fetch(
          `${API_URL}/games/${gameId}/player-double-split/${playerId}`,
          { method: "POST" }
        );
        setSplitDoubled(true);
      } else {
        await fetch(`${API_URL}/games/${gameId}/player-double/${playerId}`, {
          method: "POST",
        });
        setMainDoubled(true);
      }

      const data = await fetchGameStatus(gameId);
      if (data.status === "Completed") {
        await fetch(`${API_URL}/games/${gameId}/check-results/${playerId}`);
        await fetchGameStatus(gameId);
      }
    } catch (error) {
      console.error("Błąd Double:", error);
    }
  };

  const handleChipSelect = (value) => {
    if (gameStatus === "InProgress" || isShuffling) return;
    if (currentBalance < value) {
      alert("Nie masz wystarczająco środków!");
      return;
    }
    setCurrentBalance((prev) => prev - value);
    setCurrentBet((prev) => prev + value);
  };

  const clearBet = () => {
    if (gameStatus === "InProgress" || isShuffling) return;
    setCurrentBalance((prev) => prev + currentBet);
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
      msg = `Ręka 1: ${getResultText(gameResult)} | Ręka 2: ${getResultText(
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

  const getResultClass = (result) => {
    if (result === "Win" || result === "Blackjack") return "result-win";
    if (result === "Push") return "result-push";
    return "result-lose";
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
    <div className="online-container">
      {showFireworks && (
         <div 
            className="fireworks-container" 
            ref={fireworksContainerRef} 
        />
       )}
      <button className="back-button" onClick={handleGoBack}>
        &#8592; Exit
      </button>
      <div className="user-info-panel">
       <img 
          src={defaultAvatar} 
          alt="Awatar" 
          className="user-avatar" 
       />
       <span className="user-name">{user?.name || "Gość"}</span>
      </div>
      {/* FEEDBACK TRENERA */}
      {strategyFeedback && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            zIndex: 2000,
            padding: "20px",
            background: strategyFeedback.isCorrect ? "#28a745" : "#dc3545",
            color: "white",
            borderRadius: "10px",
            boxShadow: "0 5px 15px rgba(0,0,0,0.5)",
            fontFamily: "Arial, sans-serif",
            fontSize: "1.1rem",
            maxWidth: "300px",
          }}
        >
          <div
            style={{
              fontWeight: "bold",
              marginBottom: "5px",
              fontSize: "1.3rem",
            }}
          >
            {strategyFeedback.isCorrect ? "DOBRY RUCH!" : "ZŁY RUCH!"}
          </div>
          <div>{strategyFeedback.message}</div>
        </div>
      )}

      {/* Modal */}
      {showModal && (gameResult || splitResult) && (
        <div className="modal-overlay">
          <h2
            className="modal-title"
            style={{ fontSize: hasSplit ? "1.5rem" : "2.5rem" }}
          >
            {getFinalMessage().title}
          </h2>
          <p className="modal-text" style={{ color: "white" }}>
            {getFinalMessage().desc}
          </p>
          <button
            className="modal-button"
            onClick={() => {
              setShowModal(false);
              setCurrentBet(0);
              setGameStatus("Waiting");
              resetGameFlags();
            }}
          >
            OK
          </button>
        </div>
      )}

      <div className="game-table-area">
        <img src={tableImage} alt="Stół do gry" className="game-table-image" />
        {/* WARTOSC REKI KRUPIERA */}
        {dealerCards.length > 0 && (
            <div className="hand-value dealer-value">
                Krupier:{" "}
                <span style={{ fontWeight: "bold" }}>
                    {gameStatus === "InProgress" && dealerCards.length === 2
                        ? calculateHandValue(dealerCards.slice(0, 1))
                        : calculateHandValue(dealerCards)}
                </span>
            </div>
        )}
        
        {/* WARTOSC REKI GRACZA (MAIN) */}
        {playerCards.length > 0 && (
            <div
                className="hand-value player-main-value"
                style={{
                    left: hasSplit ? "40%" : "50%",
                }}
            >
                {hasSplit ? "Ręka 1" : "Ty"}:{" "}
                <span style={{ fontWeight: "bold" }}>
                    {calculateHandValue(playerCards)}
                </span>
            </div>
        )}

        {/* WARTOSC REKI GRACZA (SPLIT) */}
        {hasSplit && splitCards.length > 0 && (
            <div
                className="hand-value player-split-value"
                style={{
                    left: "60%",
                }}
            >
                Ręka 2:{" "}
                <span style={{ fontWeight: "bold" }}>
                    {calculateHandValue(splitCards)}
                </span>
            </div>
        )}
        {/* TASOWARKA */}
        <div
          style={{
            position: "absolute",
            left: `${DECK_POSITION.left}%`,
            top: `${DECK_POSITION.top}%`,
            zIndex: 5,
          }}
        >
          <img
            src={reverseCardImage}
            alt="Deck Base"
            style={{
              position: "absolute",
              width: "5vw",
              borderRadius: "4px",
              left: "0px",
              top: "0px",
            }}
          />
          <img
            src={reverseCardImage}
            alt="Deck Base"
            style={{
              position: "absolute",
              width: "5vw",
              borderRadius: "4px",
              left: "2px",
              top: "-2px",
            }}
          />
          <motion.img
            src={reverseCardImage}
            alt="Shuffling Card"
            style={{
              width: "5vw",
              borderRadius: "4px",
              position: "relative",
              left: "4px",
              top: "-4px",
            }}
            animate={
              isShuffling
                ? {
                  x: [0, -20, 20, -20, 20, 0],
                  y: [0, -5, 5, -5, 5, 0],
                  rotateZ: [0, -10, 10, -10, 10, 0],
                }
                : { x: 0, y: 0, rotateZ: 0 }
            }
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        </div>

        {/* DEALER CARDS */}
        {dealerCards.map((card, index) => {
          const isFaceDown = index === 1 && gameStatus === "InProgress";
          const finalLeft = 46 + index * 3;
          const startX = `${DECK_POSITION.left - finalLeft}vw`;
          const startY = `${DECK_POSITION.top - 10}vh`;
          const cardZIndex = index === 0 ? 51 : 49;

          return (
            <motion.div
              key={`dealer-${index}`}
              className="card-image dealer-card"
              style={{ left: `${finalLeft}%`}}
              initial={{
                x: startX,
                y: startY,
                opacity: 0,
                scale: 0.5,
                rotate: 180,
              }}
              animate={{
                x: 0,
                y: 0,
                opacity: 1,
                scale: 1,
                rotate: 0,
                rotateY: isFaceDown ? 180 : 0,
              }}
              transition={{
                duration: 0.6,
                delay: index * 0.2,
                type: "spring",
                stiffness: 80,
              }}
            >
              <img
                src={isFaceDown ? reverseCardImage : card.src}
                alt={isFaceDown ? "Zakryta karta" : card.name}
                style={{ width: "100%", height: "100%", borderRadius: "4px" }}
              />
            </motion.div>
          );
        })}

        {/* PLAYER CARDS (MAIN) */}
        {playerCards.map((card, index) => {
          const offset = hasSplit ? -10 : 0;
          const finalLeft = 46 + index * 3 + offset;
          const startX = `${DECK_POSITION.left - finalLeft}vw`;
          const startY = `${DECK_POSITION.top - 40}vh`;

          return (
            <motion.img
              key={`player-${index}`}
              src={card.src}
              alt={card.name}
              className="card-image player-card"
              style={{
                left: `${finalLeft}%`,
                border:
                  hasSplit && !isSplitActive && gameStatus === "InProgress"
                    ? "2px solid gold"
                    : "none",
              }}
              initial={{
                x: startX,
                y: startY,
                opacity: 0,
                scale: 0.5,
                rotate: -180,
              }}
              animate={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
              transition={{
                duration: 0.7,
                delay: index * 0.2 + 0.1,
                type: "spring",
                stiffness: 80,
              }}
            />
          );
        })}

        {/* PLAYER CARDS (SPLIT) */}
        {hasSplit &&
          splitCards.map((card, index) => {
            const finalLeft = 46 + index * 3 + 10;
            const startX = `${DECK_POSITION.left - finalLeft}vw`;
            const startY = `${DECK_POSITION.top - 40}vh`;

            return (
              <motion.img
                key={`split-${index}`}
                src={card.src}
                alt={card.name}
                className="card-image player-card"
                style={{
                  left: `${finalLeft}%`,
                  border:
                    isSplitActive && gameStatus === "InProgress"
                      ? "2px solid gold"
                      : "none",
                }}
                initial={{
                  x: startX,
                  y: startY,
                  opacity: 0,
                  scale: 0.5,
                  rotate: -180,
                }}
                animate={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
                transition={{
                  duration: 0.7,
                  delay: index * 0.2 + 0.1,
                  type: "spring",
                  stiffness: 80,
                }}
              />
            );
          })}

          <div className="betting-ui">
        <div className="chip-selection">
          <img
            src={dziesiecImage}
            alt="10"
            className="chip-image chip-z4"
            onClick={() => handleChipSelect(10)}
          />
          <img
            src={piecdziesiatImage}
            alt="50"
            className="chip-image chip-z3"
            onClick={() => handleChipSelect(50)}
          />
          <img
            src={stoImage}
            alt="100"
            className="chip-image chip-z2"
            onClick={() => handleChipSelect(100)}
          />
          <img
            src={piecsetImage}
            alt="500"
            className="chip-image chip-z1"
            onClick={() => handleChipSelect(500)}
          />
        </div>
      </div>
      </div>

      {/* PANEL LEWY DOLNY */}
      <div className="left-bottom-panel">
        <span className="balance-label">
          Saldo:{" "}
          <span className="balance-amount">
            {currentBalance.toLocaleString("pl-PL")} PLN
          </span>
        </span>
        <span className="balance-sublabel">
          Na stole: {displayedBetOnTable()} PLN
        </span>

        <div className="controls-wrapper">
          <button
            onClick={clearBet}
            className="btn-clear"
            disabled={
              gameStatus === "InProgress" || isShuffling || currentBet === 0
            }
          >
            Wyczyść
          </button>
          <button
            onClick={startNewGame}
            className="btn-deal"
            disabled={
              gameStatus === "InProgress" || isShuffling || currentBet === 0
            }
          >
            ROZDAJ KARTY
          </button>
        </div>
      </div>

      {/* Żetony */}
      

      {/* Przyciski Akcji */}
      <div className="game-actions">
        <button
          className="action-button stand"
          onClick={handleStand}
          disabled={gameStatus !== "InProgress" || isShuffling}
        >
          Stand
        </button>

        <button
          className={`action-button split ${!canSplit ? "disabled-action" : ""
            }`}
          onClick={handleSplitAction}
          disabled={!canSplit || gameStatus !== "InProgress"}
        >
          Split
        </button>

        <button
          className="action-button hit"
          onClick={handleHit}
          disabled={gameStatus !== "InProgress" || isShuffling}
        >
          Hit
        </button>

        <button
          className={`action-button double ${!canDouble ? "disabled-action" : ""
            }`}
          onClick={handleDouble}
          disabled={!canDouble || gameStatus !== "InProgress"}
        >
          Double
        </button>
      </div>
    </div>
  );
}

export default Online;