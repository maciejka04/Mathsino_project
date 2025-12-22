// src/pages/Offline/components/GameActions.js
import React from "react";

const GameActions = ({ 
    t, 
    gameStatus, 
    isShuffling, 
    canSplit, 
    canDouble, 
    onHit, 
    onStand, 
    onSplit, 
    onDouble 
}) => {
    
    const isLocked = gameStatus !== "InProgress" || isShuffling;

    return (
        <div className="game-actions">
            <button
                className="action-button stand"
                onClick={onStand}
                disabled={isLocked}
            >
                {t('offline_stand')}
            </button>

            <button
                className={`action-button split ${!canSplit ? "disabled-action" : ""}`}
                onClick={onSplit}
                disabled={!canSplit || gameStatus !== "InProgress"}
            >
                {t('offline_split')}
            </button>

            <button
                className="action-button hit"
                onClick={onHit}
                disabled={isLocked}
            >
                {t('offline_hit')}
            </button>

            <button
                className={`action-button double ${!canDouble ? "disabled-action" : ""}`}
                onClick={onDouble}
                disabled={!canDouble || gameStatus !== "InProgress"}
            >
                {t('offline_double')}
            </button>
        </div>
    );
};

export default GameActions;