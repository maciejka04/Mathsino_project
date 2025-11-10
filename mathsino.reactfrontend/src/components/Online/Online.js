import React from 'react';
import { useNavigate } from 'react-router-dom'; 
import './Online.css';
import tableImage from '../../assets/table.png'; 
import dziesiecImage from '../../assets/zetony/dziesiec.png'; 
import piecdziesiatImage from '../../assets/zetony/piecdziesiat.png'; 
import stoImage from '../../assets/zetony/sto.png'; 
import piecsetImage from '../../assets/zetony/piecset.png'; 

function Online() {
    const navigate = useNavigate(); 
    const currentBalance = 5000; 

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
        console.log('Akcja: Split!');
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
                    />
                    <img 
                        src={piecdziesiatImage} 
                        alt="Żeton 50" 
                        className="chip-image" 
                        onClick={() => handleChipSelect(50)} 
                    />
                    <img 
                        src={stoImage} 
                        alt="Żeton 100" 
                        className="chip-image" 
                        onClick={() => handleChipSelect(100)} 
                    />
                    <img 
                        src={piecsetImage} 
                        alt="Żeton 500" 
                        className="chip-image" 
                        onClick={() => handleChipSelect(500)} 
                    />
                </div>
                
                <div className="current-balance">
                    <span className="balance-label">Saldo:</span>
                    <span className="balance-amount">{currentBalance.toLocaleString('pl-PL')} PLN</span>
                </div>
            </div>

            <div className="game-table-area">
                <img src={tableImage} alt="Stół do gry Online" className="game-table-image" />
            </div>

            <div className="game-actions">
                <button className="action-button hit" onClick={handleHit}>Hit</button>
                <button className="action-button stand" onClick={handleStand}>Stand</button>
                <button className="action-button split" onClick={handleSplit}>Split</button>
            </div>
            
        </div>
    );
}

export default Online;