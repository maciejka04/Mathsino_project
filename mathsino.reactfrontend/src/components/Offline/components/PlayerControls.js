// src/pages/Offline/components/PlayerControls.js
import React from "react";

const PlayerControls = ({ 
    t, 
    gameStatus, 
    isShuffling, 
    userBalance, 
    currentBet, 
    onClearBet, 
    onStartGame,
    displayedBetOnTable
}) => {
    
    const isLocked = gameStatus === "InProgress" || isShuffling;

    return (
        <div className="left-bottom-panel">
            <span className="balance-label">
                {t('offline_balance')}:{" "}
                <span className="balance-amount">
                    {(gameStatus === "Waiting"
                        ? (userBalance - currentBet)
                        : userBalance
                    )?.toLocaleString("pl-PL") || 0} PLN
                </span>
            </span>
            <span className="balance-sublabel">
                {t('offline_on_table')}: {displayedBetOnTable} PLN
            </span>

            <div className="controls-wrapper">
                <button
                    onClick={onClearBet}
                    className="btn-clear"
                    disabled={isLocked || currentBet === 0}
                >
                    {t('offline_clear')}
                </button>
                <button
                    onClick={onStartGame}
                    className="btn-deal"
                    disabled={isLocked || currentBet === 0}
                >
                    {t('offline_deal_cards')}
                </button>
            </div>
        </div>
    );
};

export default PlayerControls;