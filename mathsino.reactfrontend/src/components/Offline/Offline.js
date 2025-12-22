// src/pages/Offline/Offline.js
import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import { useNavigate, useOutletContext } from "react-router-dom";
import "./Offline.css";
import tableImage from "../../assets/table4.png";

// Hooks
import { useGameAudio } from "./hooks/useGameAudio";
import { useGameLogic } from "./hooks/useGameLogic"; // <--- NOWY IMPORT

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

  // Stan lokalny tylko dla UI (Bet) i ustawień (Trener)
  const [currentBet, setCurrentBet] = useState(0);
  const [isTrainerEnabled, setIsTrainerEnabled] = useState(true);

  // --- UŻYCIE LOGIKI Z NOWEGO PLIKU ---
  const game = useGameLogic(user, audio, refreshUser, t);

  // Obsługa kliknięć UI
  const handleGoBack = () => {
    audio.playClick();
    setTimeout(() => navigate("/play"), 400);
  };

  const handleChipSelect = (value) => {
    if (game.gameStatus === "InProgress" || game.isShuffling) return;
    if (currentBet + value > user.balance) {
      alert(t('not_enough_funds'));
      return;
    }
    setCurrentBet((prev) => prev + value);
  };

  const clearBet = () => {
    if (game.gameStatus === "InProgress" || game.isShuffling) return;
    setCurrentBet(0);
  };

  // Helpery do wyświetlania komunikatów (zostają w UI bo dotyczą tekstu)
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
      if (res === "Win") return { txt: "Wygrałeś", val: actualBet }; // Zysk netto
      if (res === "Blackjack") return { txt: "Blackjack", val: actualBet * 1.5 };
      if (res === "Push") return { txt: "Zwrot", val: 0 };
      return { txt: "Przegrałeś", val: -actualBet };
    };

    const main = calc(game.gameResult, currentBet, game.mainDoubled);
    totalWin += main.val;

    if (game.hasSplit) {
      const split = calc(game.splitResult, currentBet, game.splitDoubled);
      totalWin += split.val;
      msg = `${t('hand')} 1: ${getResultText(game.gameResult)} | ${t('hand')} 2: ${getResultText(game.splitResult)}`;
    } else {
      msg = getResultText(game.gameResult);
    }

    return {
      title: msg,
      desc: totalWin >= 0
          ? `Wygrałeś łącznie ${totalWin} PLN na czysto`
          : `Straciłeś łącznie ${Math.abs(totalWin)} PLN`,
    };
  };

  const displayedBetOnTable = () => {
    if (game.gameStatus === "Waiting") return currentBet;
    let total = currentBet;
    if (game.mainDoubled) total += currentBet;
    if (game.hasSplit) {
      total += currentBet;
      if (game.splitDoubled) total += currentBet;
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
        showFireworks={game.showFireworks}
        showModal={game.showModal}
        gameResult={game.gameResult}
        splitResult={game.splitResult}
        finalMessage={getFinalMessage()}
        hasSplit={game.hasSplit}
        strategyFeedback={game.strategyFeedback}
        isTrainerEnabled={isTrainerEnabled}
        onModalClose={() => {
            game.closeModal();
            setCurrentBet(0);
        }}
      />

      <div className="game-table-area">
        <img src={tableImage} alt="Stół do gry" className="game-table-image" />

        <Hand 
            cards={game.dealerCards} 
            deckPosition={DECK_POSITION} 
            title={`${t('dealer')}:`} 
            gameStatus={game.gameStatus} 
            isDealer={true}
        />

        <Hand 
            cards={game.playerCards} 
            deckPosition={DECK_POSITION} 
            title={game.hasSplit ? `${t('hand')} 1` : "Ty"} 
            gameStatus={game.gameStatus} 
            isDealer={false}
            hasSplit={game.hasSplit}
            isActive={game.hasSplit && !game.isSplitActive}
        />

        {game.hasSplit && (
             <Hand 
                cards={game.splitCards} 
                deckPosition={DECK_POSITION} 
                title={`${t('hand')} 2:`} 
                gameStatus={game.gameStatus} 
                isDealer={false}
                hasSplit={game.hasSplit}
                isActive={game.isSplitActive}
                leftPositionBase={56}
            />
        )}

        <Deck position={DECK_POSITION} isShuffling={game.isShuffling} />
        <Chips onChipSelect={handleChipSelect} />
      </div>

      <PlayerControls 
          t={t}
          gameStatus={game.gameStatus}
          isShuffling={game.isShuffling}
          userBalance={user.balance}
          currentBet={currentBet}
          onClearBet={clearBet}
          onStartGame={() => game.startNewGame(currentBet)}
          displayedBetOnTable={displayedBetOnTable()}
      />

      <GameActions 
        t={t}
        gameStatus={game.gameStatus}
        isShuffling={game.isShuffling}
        canSplit={game.canSplit}
        canDouble={game.canDouble}
        // Przekazujemy funkcje z Hooka, przekazując potrzebne argumenty
        onHit={() => game.handleHit(isTrainerEnabled)}
        onStand={() => game.handleStand(isTrainerEnabled)}
        onSplit={() => game.handleSplit(currentBet, isTrainerEnabled)}
        onDouble={() => game.handleDouble(currentBet, isTrainerEnabled)}
      />
    </div>
  );
}

export default Offline;