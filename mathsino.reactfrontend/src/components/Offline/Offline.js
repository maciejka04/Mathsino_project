import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './Offline.css';
import tableImage from '../../assets/table4.png'; 
import dziesiecImage from '../../assets/zetony/dziesiec.png'; 
import piecdziesiatImage from '../../assets/zetony/piecdziesiat.png'; 
import stoImage from '../../assets/zetony/sto.png'; 
import piecsetImage from '../../assets/zetony/piecset.png'; 
import { motion } from 'framer-motion';


import reverseCardImage from '../../assets/karty/reverse.png'; 

const DECK_POSITION = { left: 15, top: 30 }; 

const allCardFileNames = [
    '2_of_hearts', '3_of_hearts', '4_of_hearts', '5_of_hearts', '6_of_hearts', '7_of_hearts', '8_of_hearts', '9_of_hearts', '10_of_hearts', 'jack_of_hearts', 'queen_of_hearts', 'king_of_hearts', 'ace_of_hearts',
    '2_of_diamonds', '3_of_diamonds', '4_of_diamonds', '5_of_diamonds', '6_of_diamonds', '7_of_diamonds', '8_of_diamonds', '9_of_diamonds', '10_of_diamonds', 'jack_of_diamonds', 'queen_of_diamonds', 'king_of_diamonds', 'ace_of_diamonds',
    '2_of_clubs', '3_of_clubs', '4_of_clubs', '5_of_clubs', '6_of_clubs', '7_of_clubs', '8_of_clubs', '9_of_clubs', '10_of_clubs', 'jack_of_clubs', 'queen_of_clubs', 'king_of_clubs', 'ace_of_clubs',
    '2_of_spades', '3_of_spades', '4_of_spades', '5_of_spades', '6_of_spades', '7_of_spades', '8_of_spades', '9_of_spades', '10_of_spades', 'jack_of_spades', 'queen_of_spades', 'king_of_spades', 'ace_of_spades'
];

const cardImagesMap = allCardFileNames.reduce((acc, cardName) => {
    try {
        acc[cardName] = require(`../../assets/karty/${cardName}.png`); 
    } catch (e) {}
    return acc;
}, {});

const mapBackendCardToFilename = (card) => {
    if (!card) return null;
    
    let rankName = card.rank.toLowerCase();
    if (rankName === 'a') rankName = 'ace';
    else if (rankName === 'k') rankName = 'king';
    else if (rankName === 'q') rankName = 'queen';
    else if (rankName === 'j') rankName = 'jack';

    const suitName = card.suit.toLowerCase();
    return `${rankName}_of_${suitName}`;
};

function Offline() {
    const navigate = useNavigate(); 
    const [currentBalance, setCurrentBalance] = useState(5000);
    const [currentBet, setCurrentBet] = useState(0);
    
    const [gameId, setGameId] = useState(null);
    const [playerId, setPlayerId] = useState(null);
    const [dealerCards, setDealerCards] = useState([]);
    const [playerCards, setPlayerCards] = useState([]);
    const [gameStatus, setGameStatus] = useState('Waiting'); 
    const [gameResult, setGameResult] = useState(null);
    const [resultProcessed, setResultProcessed] = useState(false);
    const [showModal, setShowModal] = useState(false);
    
    
    const [isShuffling, setIsShuffling] = useState(false);

    const API_URL = "http://localhost:5126";
    const USER_ID = 1; 

    const startNewGame = async () => {
        if (currentBet <= 0) {
            alert("Musisz postawić zakład, aby zagrać!");
            return;
        }
        
       
        setResultProcessed(false);
        setGameResult(null);
        setShowModal(false);
        setDealerCards([]);
        setPlayerCards([]);

       
        setIsShuffling(true);

        
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            const response = await fetch(`${API_URL}/games/create-singleplayer?userId=${USER_ID}`);
            if (!response.ok) throw new Error("Błąd tworzenia gry");
            const gameData = await response.json();
            
            
            setIsShuffling(false);
            updateGameState(gameData);

        } catch (error) {
            console.error("Nie udało się rozpocząć gry:", error);
            alert("Błąd połączenia. Środki zostały zwrócone.");
            setCurrentBalance(prev => prev + currentBet);
            setCurrentBet(0);
            setIsShuffling(false);
        }
    };

    const updateGameState = (gameData) => {
        setGameId(gameData.id);
        const dealer = gameData.dealer;
        const player = gameData.players.find(p => p.user.id === USER_ID);

        if (player) {
            setPlayerId(player.playerId);
            setPlayerCards(player.hand.map(c => ({
                name: mapBackendCardToFilename(c),
                src: cardImagesMap[mapBackendCardToFilename(c)]
            })));
            setGameResult(player.result);
            
            if (gameData.status === 'Completed' && player.result && !resultProcessed) {
                handleGameResult(player.result);
            }
        }

        if (dealer) {
            setDealerCards(dealer.hand.map(c => ({
                name: mapBackendCardToFilename(c),
                src: cardImagesMap[mapBackendCardToFilename(c)]
            })));
        }
        setGameStatus(gameData.status);
    };

    const handleGameResult = (result) => {
        setResultProcessed(true); 
        
        setTimeout(() => {
            setShowModal(true);
        }, 1000); 

        let winAmount = 0;
        switch (result) {
            case 'Win': winAmount = currentBet * 2; break;
            case 'Blackjack': winAmount = currentBet * 2.5; break;
            case 'Push': winAmount = currentBet; break;
            case 'Lose': winAmount = 0; break;
            default: break;
        }
        if (winAmount > 0) {
            setCurrentBalance(prev => prev + winAmount);
        }
    };

    const fetchGameStatus = async (gId) => {
        const response = await fetch(`${API_URL}/games/${gId}`);
        const data = await response.json();
        updateGameState(data);
        return data;
    };

    const handleGoBack = () => { navigate('/play'); };

    const handleHit = async () => {
        if (!gameId || !playerId) return;
        try {
            await fetch(`${API_URL}/games/${gameId}/player-hit/${playerId}`);
            await fetchGameStatus(gameId); 
        } catch (error) { console.error("Błąd Hit:", error); }
    };
    
    const handleStand = async () => {
        if (!gameId || !playerId) return;
        try {
            await fetch(`${API_URL}/games/${gameId}/player-pass/${playerId}`);
            await fetch(`${API_URL}/games/${gameId}/check-results/${playerId}`);
            await fetchGameStatus(gameId);
        } catch (error) { console.error("Błąd Stand:", error); }
    };
    
    const handleSplit = () => { console.log('Split niezaimplementowany'); };
    const handleDouble = () => { console.log('Double niezaimplementowany'); };

    const handleChipSelect = (value) => {
        if (gameStatus === 'InProgress' || isShuffling) return; 
        if (currentBalance < value) {
            alert("Nie masz wystarczająco środków!");
            return;
        }
        setCurrentBalance(prev => prev - value);
        setCurrentBet(prev => prev + value);
    };

    const clearBet = () => {
        if (gameStatus === 'InProgress' || isShuffling) return;
        setCurrentBalance(prev => prev + currentBet);
        setCurrentBet(0);
    };

    const getResultText = (result) => {
        if (result === 'Win') return 'WYGRANA!';
        if (result === 'Lose') return 'PRZEGRANA';
        if (result === 'Push') return 'REMIS';
        if (result === 'Blackjack') return 'BLACKJACK!';
        return '';
    };

    const getResultDescription = (result) => {
        if (result === 'Lose') return `Straciłeś ${currentBet} PLN`;
        if (result === 'Push') return `Zwrot stawki (${currentBet} PLN)`;
        const totalWin = (result === 'Blackjack' ? currentBet * 2.5 : currentBet * 2);
        const profit = totalWin - currentBet;
        return `Wygrałeś ${profit} PLN na czysto`;
    };

    const getResultClass = (result) => {
        if (result === 'Win' || result === 'Blackjack') return 'result-win';
        if (result === 'Push') return 'result-push';
        return 'result-lose';
    };

    return (
        <div className="offline-container">
            <button className="back-button" onClick={handleGoBack}>&#8592; Exit</button>
            
            {/* Modal */}
            {showModal && gameResult && (
                <div className="modal-overlay">
                    <h2 className="modal-title">{getResultText(gameResult)}</h2>
                    <p className={`modal-text ${getResultClass(gameResult)}`}>
                        {getResultDescription(gameResult)}
                    </p>
                    <button className="modal-button" onClick={() => { setShowModal(false); setCurrentBet(0); setGameStatus('Waiting'); }}>OK</button>
                </div>
            )}

            <div className="game-table-area">
                <img src={tableImage} alt="Stół do gry" className="game-table-image" />
                
                {/* --- TASOWARKA (LEWA STRONA) --- */}
                <div style={{ 
                    position: 'absolute', 
                    left: `${DECK_POSITION.left}%`, 
                    top: `${DECK_POSITION.top}%`, 
                    zIndex: 5 
                }}>
                    {}
                    <img src={reverseCardImage} alt="Deck Base" style={{ position: 'absolute', width: '5vw', borderRadius: '4px', left: '0px', top: '0px' }} />
                    <img src={reverseCardImage} alt="Deck Base" style={{ position: 'absolute', width: '5vw', borderRadius: '4px', left: '2px', top: '-2px' }} />
                    
                    {}
                    <motion.img
                        src={reverseCardImage}
                        alt="Shuffling Card"
                        style={{ width: '5vw', borderRadius: '4px', position: 'relative', left: '4px', top: '-4px' }}
                        animate={isShuffling ? { 
                            x: [0, -20, 20, -20, 20, 0], 
                            y: [0, -5, 5, -5, 5, 0],   
                            rotateZ: [0, -10, 10, -10, 10, 0] 
                        } : { 
                            x: 0, y: 0, rotateZ: 0 
                        }}
                        transition={{ 
                            duration: 0.8,      
                            ease: "easeInOut"
                        }}
                    />
                </div>

                {}
                {dealerCards.map((card, index) => {
                    const isFaceDown = index === 1 && gameStatus === 'InProgress';
                    
                    const finalLeft = 46 + index * 3;
                    const startX = `${DECK_POSITION.left - finalLeft}vw`;
                    const startY = `${DECK_POSITION.top - 10}vh`;

                    return (
                        <motion.div
                            key={index}
                            className="card-image dealer-card"
                            style={{ left: `${finalLeft}%` }}
                            initial={{ 
                                x: startX, 
                                y: startY, 
                                opacity: 0, 
                                scale: 0.5, 
                                rotate: 180 
                            }}
                            animate={{ 
                                x: 0, 
                                y: 0, 
                                opacity: 1, 
                                scale: 1, 
                                rotate: 0, 
                                rotateY: isFaceDown ? 180 : 0 
                            }}
                            transition={{ duration: 0.6, delay: index * 0.2, type: "spring", stiffness: 80 }}
                        >
                            <img 
                                src={isFaceDown ? reverseCardImage : card.src} 
                                alt={isFaceDown ? "Zakryta karta" : card.name}
                                style={{ width: '100%', height: '100%', borderRadius: '4px' }} 
                            />
                        </motion.div>
                    );
                })}

                {}
                {playerCards.map((card, index) => {
                    const finalLeft = 46 + index * 3;
                    const startX = `${DECK_POSITION.left - finalLeft}vw`;
                    const startY = `${DECK_POSITION.top - 40}vh`;

                    return (
                        <motion.img 
                            key={index}
                            src={card.src} 
                            alt={card.name} 
                            className="card-image player-card" 
                            style={{ left: `${finalLeft}%` }} 
                            
                            initial={{ 
                                x: startX, 
                                y: startY, 
                                opacity: 0, 
                                scale: 0.5, 
                                rotate: -180 
                            }}
                            animate={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ duration: 0.7, delay: index * 0.2 + 0.1, type: "spring", stiffness: 80 }}
                        />
                    );
                })}
            </div>

            {/* PANEL LEWY DOLNY */}
            <div className="left-bottom-panel">
                <span className="balance-label">
                    Saldo: <span className="balance-amount">{currentBalance.toLocaleString('pl-PL')} PLN</span>
                </span>
                <span className="balance-sublabel">
                    Na stole: {currentBet} PLN
                </span>

                {gameResult && (
                    <div className={`result-text ${getResultClass(gameResult)}`}>
                        {getResultText(gameResult)}
                    </div>
                )}

                <div className="controls-wrapper">
                    <button 
                        onClick={clearBet} 
                        className="btn-clear"
                        disabled={gameStatus === 'InProgress' || isShuffling || currentBet === 0}
                    >
                        Wyczyść
                    </button>
                    <button 
                        onClick={startNewGame} 
                        className="btn-deal"
                        disabled={gameStatus === 'InProgress' || isShuffling || currentBet === 0}
                    >
                        ROZDAJ KARTY
                    </button>
                </div>
            </div>

            {/* Żetony */}
            <div className="betting-ui">
                <div className="chip-selection">
                    <img src={dziesiecImage} alt="10" className="chip-image chip-z4" onClick={() => handleChipSelect(10)} />
                    <img src={piecdziesiatImage} alt="50" className="chip-image chip-z3" onClick={() => handleChipSelect(50)} />
                    <img src={stoImage} alt="100" className="chip-image chip-z2" onClick={() => handleChipSelect(100)} />
                    <img src={piecsetImage} alt="500" className="chip-image chip-z1" onClick={() => handleChipSelect(500)} />
                </div>
            </div>

            {/* Przyciski Akcji */}
            <div className="game-actions">
                <button className="action-button stand" onClick={handleStand} disabled={gameStatus !== 'InProgress' || isShuffling}>Stand</button>
                <button className="action-button split disabled-action" onClick={handleSplit}>Split</button>
                <button className="action-button hit" onClick={handleHit} disabled={gameStatus !== 'InProgress' || isShuffling}>Hit</button>
                <button className="action-button double disabled-action" onClick={handleDouble}>Double</button>
            </div>
        </div>
    );
}

export default Offline;