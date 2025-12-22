// src/pages/Offline/components/GameOverlays.js
import React, { useEffect, useRef } from "react";
import Fireworks from 'fireworks-js';

const GameOverlays = ({ 
    showFireworks, 
    showModal, 
    gameResult, 
    splitResult, 
    finalMessage, 
    hasSplit, 
    strategyFeedback, 
    isTrainerEnabled,
    onModalClose 
}) => {
    const fireworksContainerRef = useRef(null);

    useEffect(() => {
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
            if (fireworks) fireworks.stop();
        };
    }, [showFireworks]);

    return (
        <>
            {/* FIREWORKS */}
            {showFireworks && (
                <div
                    className="fireworks-container"
                    ref={fireworksContainerRef}
                />
            )}

            {/* TRAINER FEEDBACK */}
            {strategyFeedback && isTrainerEnabled && (
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
                    <div style={{ fontWeight: "bold", marginBottom: "5px", fontSize: "1.3rem" }}>
                        {strategyFeedback.isCorrect ? "DOBRY RUCH!" : "ZŁY RUCH!"}
                    </div>
                    <div>{strategyFeedback.message}</div>
                </div>
            )}

            {/* RESULT MODAL */}
            {showModal && (gameResult || splitResult) && (
                <div className="modal-overlay">
                    <h2
                        className="modal-title"
                        style={{ fontSize: hasSplit ? "1.5rem" : "2.5rem" }}
                    >
                        {finalMessage.title}
                    </h2>
                    <p className="modal-text" style={{ color: "white" }}>
                        {finalMessage.desc}
                    </p>
                    <button
                        className="modal-button"
                        onClick={onModalClose}
                    >
                        OK
                    </button>
                </div>
            )}
        </>
    );
};

export default GameOverlays;