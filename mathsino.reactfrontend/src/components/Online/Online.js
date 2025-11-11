import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './Online.css';
import tableImage from '../../assets/table5.png'; 
import dziesiecImage from '../../assets/zetony/dziesiec.png'; 
import piecdziesiatImage from '../../assets/zetony/piecdziesiat.png'; 
import stoImage from '../../assets/zetony/sto.png'; 
import piecsetImage from '../../assets/zetony/piecset.png'; 


const allCardFileNames = [

    '2_of_hearts', '3_of_hearts', '4_of_hearts', '5_of_hearts', '6_of_hearts', 
    '7_of_hearts', '8_of_hearts', '9_of_hearts', '10_of_hearts', 
    'jack_of_hearts', 'queen_of_hearts', 'king_of_hearts', 'ace_of_hearts',


    '2_of_diamonds', '3_of_diamonds', '4_of_diamonds', '5_of_diamonds', '6_of_diamonds', 
    '7_of_diamonds', '8_of_diamonds', '9_of_diamonds', '10_of_diamonds', 
    'jack_of_diamonds', 'queen_of_diamonds', 'king_of_diamonds', 'ace_of_diamonds',


    '2_of_clubs', '3_of_clubs', '4_of_clubs', '5_of_clubs', '6_of_clubs', 
    '7_of_clubs', '8_of_clubs', '9_of_clubs', '10_of_clubs', 
    'jack_of_clubs', 'queen_of_clubs', 'king_of_clubs', 'ace_of_clubs',


    '2_of_spades', '3_of_spades', '4_of_spades', '5_of_spades', '6_of_spades', 
    '7_of_spades', '8_of_spades', '9_of_spades', '10_of_spades', 
    'jack_of_spades', 'queen_of_spades', 'king_of_spades', 'ace_of_spades'
];

const cardImagesMap = allCardFileNames.reduce((acc, cardName) => {
    try {
        acc[cardName] = require(`../../assets/karty/${cardName}.png`); 
    } catch (e) {
        console.warn(`Nie udało się załadować obrazu dla: ${cardName}.png`);
    }
    return acc;
}, {});


const dealerCards = [
    { name: '8_of_clubs', src: cardImagesMap['8_of_clubs'] }, 
    { name: '2_of_diamonds', src: cardImagesMap['2_of_diamonds'] } 
];

const playerCards = [
    { name: 'queen_of_spades', src: cardImagesMap['queen_of_spades'] }, 
    { name: 'jack_of_diamonds', src: cardImagesMap['jack_of_diamonds'] } 
];



function Online() {
    const navigate = useNavigate(); 
    const currentBalance = 5000; 

    const [canSplit, setCanSplit] = useState(false); 
    const [canDouble, setCanDouble] = useState(false); 

    const handleGoBack = () => {
        navigate('/play'); 
    };

    const handleHit = () => {
        console.log('Akcja: Hit!');
    };
    
    const handleStand = () => {
        console.log('Akcja: Stand!');
    };
    
    const handleSplit = () => {
        if (canSplit) {
            console.log('Akcja: Split WŁĄCZONY!');
        } else {
            console.log('Akcja: Split WYŁĄCZONY - Brak uprawnień.');
        }
    };
    
    const handleDouble = () => {
        if (canDouble) {
            console.log('Akcja: Double WŁĄCZONY!');
        } else {
            console.log('Akcja: Double WYŁĄCZONY - Brak uprawnień.');
        }
    };

    const handleChipSelect = (value) => {
        console.log(`Wybrano żeton o wartości: ${value}`);
    };


    return (
        <div className="online-container">
            <button className="back-button" onClick={handleGoBack}>
                &#8592; Exit
            </button>
            
            <div className="betting-ui">
                <div className="chip-selection">
                    <img 
                        src={dziesiecImage} 
                        alt="Żeton 10" 
                        className="chip-image" 
                        onClick={() => handleChipSelect(10)} 
                        style={{ zIndex: 4 }}
                    />
                    <img 
                        src={piecdziesiatImage} 
                        alt="Żeton 50" 
                        className="chip-image" 
                        onClick={() => handleChipSelect(50)} 
                        style={{ zIndex: 3 }}
                    />
                    <img 
                        src={stoImage} 
                        alt="Żeton 100" 
                        className="chip-image" 
                        onClick={() => handleChipSelect(100)} 
                        style={{ zIndex: 2 }}
                    />
                    <img 
                        src={piecsetImage} 
                        alt="Żeton 500" 
                        className="chip-image" 
                        onClick={() => handleChipSelect(500)} 
                        style={{ zIndex: 1 }}
                    />
                </div>
            </div>
            
            <div className="current-balance">
                <span className="balance-label">Saldo:</span>
                <span className="balance-amount">{currentBalance.toLocaleString('pl-PL')} PLN</span>
            </div>


            <div className="game-table-area">
                <img src={tableImage} alt="Stół do gry Online" className="game-table-image" />

                {dealerCards.map((card, index) => (
                    <img 
                        key={card.name}
                        src={card.src} 
                        alt={card.name} 
                        className="card-image dealer-card" 
                        style={{ left: `${46 + index * 3}%`, top: '10%' }} 
                    />
                ))}

                {playerCards.map((card, index) => (
                    <img 
                        key={card.name}
                        src={card.src} 
                        alt={card.name} 
                        className="card-image player-card" 
                        style={{ left: `${46 + index * 3}%`, top: '40%' }} 
                    />
                ))}
            </div>

            <div className="game-actions">
                <button className="action-button stand" onClick={handleStand}>Stand</button>
                
                <button 
                    className={`action-button split ${!canSplit ? 'disabled-action' : ''}`} 
                    onClick={handleSplit}>
                    Split
                </button>
                
                <button className="action-button hit" onClick={handleHit}>Hit</button>
                
                <button 
                    className={`action-button double ${!canDouble ? 'disabled-action' : ''}`} 
                    onClick={handleDouble}>
                    Double
                </button>
            </div>
            
        </div>
    );
}

export default Online;