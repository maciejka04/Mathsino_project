import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './CheatSheet.css';
const API_URL = "http://localhost:5126";

const CheatSheet = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { user, refreshUser } = useOutletContext();
    const isPl = i18n.language === 'pl';

    const completed = user?.lessonsCompleted || 0;
    if (user && completed < 10) {
        return;
    }
    // Pomocnicza funkcja do renderowania komórki
    // val: S, H, D, SP, U (Surrender)
    const Cell = ({ action }) => {
        let className = "act-s"; // domyślnie Stand
        let text = "S";

        if (action.includes('H')) { className = "act-h"; text = "H"; }
        if (action.includes('D')) { className = "act-d"; text = "D"; }
        if (action.includes('SP')) { className = "act-sp"; text = "SP"; }
        // Obsługa specyficznych oznaczeń z obrazków (np. Uh, Us -> traktujemy jako Hit/Stand z kolorem Surrender lub dominującym)
        // Dla uproszczenia mapujemy:
        if (action === 'Uh') { className = "act-u"; text = "SUR"; } 
        if (action === 'Us') { className = "act-u"; text = "SUR"; } 
        
        return <td className={className}>{text}</td>;
    };

    // Nagłówek z kartami krupiera (2 do A)
    const DealerHeader = () => (
        <thead>
            <tr>
                <th className="player-hand-col">{isPl ? "Ręka Gracza" : "Player Hand"}</th>
                <th className="dealer-header">2</th>
                <th className="dealer-header">3</th>
                <th className="dealer-header">4</th>
                <th className="dealer-header">5</th>
                <th className="dealer-header">6</th>
                <th className="dealer-header">7</th>
                <th className="dealer-header">8</th>
                <th className="dealer-header">9</th>
                <th className="dealer-header">10</th>
                <th className="dealer-header">A</th>
            </tr>
        </thead>
    );

    const handleExit = async () => {
        if (user && user.lessonsCompleted < 11) {
            try {
                await fetch(`${API_URL}/users/${user.id}/progress/11`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' }
                });
                await refreshUser();
            } catch (error) {
                console.error("Błąd zapisu CheatSheet progress:", error);
            }
        }
        navigate('/learn');
    };

    return (
        <div className="cheatsheet-container">
            <button className="back-button" onClick={handleExit}>
                &#8592; {isPl ? "Wróć do Menu" : "Back to Menu"}
            </button>

            <h1 className="cheatsheet-title">
                {isPl ? "Lekcja 11: Ściąga Strategii" : "Lesson 11: Strategy Cheat Sheet"}
            </h1>

            {/* LEGENDA */}
            <div className="legend">
                <div className="legend-item"><div className="legend-box act-h"></div> H = Hit (Dobierz)</div>
                <div className="legend-item"><div className="legend-box act-s"></div> S = Stand (Czekaj)</div>
                <div className="legend-item"><div className="legend-box act-d"></div> D = Double (Podwój)</div>
                <div className="legend-item"><div className="legend-box act-sp"></div> SP = Split (Rozdziel)</div>
            </div>

            {/* TABELA 1: TWARDE RĘCE (HARD HANDS) - Dane z image_4a7b10.png */}
            <div className="strategy-section">
                <div className="section-header">{isPl ? "Twarde Ręce (Bez Asów)" : "Hard Hands"}</div>
                <table className="strategy-table">
                    <DealerHeader />
                    <tbody>
                        <tr><td className="player-hand-col">18 - 21</td><Cell action="S"/><Cell action="S"/><Cell action="S"/><Cell action="S"/><Cell action="S"/><Cell action="S"/><Cell action="S"/><Cell action="S"/><Cell action="S"/><Cell action="S"/></tr>
                        <tr><td className="player-hand-col">17</td><Cell action="S"/><Cell action="S"/><Cell action="S"/><Cell action="S"/><Cell action="S"/><Cell action="S"/><Cell action="S"/><Cell action="S"/><Cell action="S"/><Cell action="Us"/></tr>
                        <tr><td className="player-hand-col">16</td><Cell action="S"/><Cell action="S"/><Cell action="S"/><Cell action="S"/><Cell action="S"/><Cell action="H"/><Cell action="H"/><Cell action="Uh"/><Cell action="Uh"/><Cell action="Uh"/></tr>
                        <tr><td className="player-hand-col">15</td><Cell action="S"/><Cell action="S"/><Cell action="S"/><Cell action="S"/><Cell action="S"/><Cell action="H"/><Cell action="H"/><Cell action="H"/><Cell action="Uh"/><Cell action="Uh"/></tr>
                        <tr><td className="player-hand-col">13 - 14</td><Cell action="S"/><Cell action="S"/><Cell action="S"/><Cell action="S"/><Cell action="S"/><Cell action="H"/><Cell action="H"/><Cell action="H"/><Cell action="H"/><Cell action="H"/></tr>
                        <tr><td className="player-hand-col">12</td><Cell action="H"/><Cell action="H"/><Cell action="S"/><Cell action="S"/><Cell action="S"/><Cell action="H"/><Cell action="H"/><Cell action="H"/><Cell action="H"/><Cell action="H"/></tr>
                        <tr><td className="player-hand-col">11</td><Cell action="D"/><Cell action="D"/><Cell action="D"/><Cell action="D"/><Cell action="D"/><Cell action="D"/><Cell action="D"/><Cell action="D"/><Cell action="D"/><Cell action="D"/></tr>
                        <tr><td className="player-hand-col">10</td><Cell action="D"/><Cell action="D"/><Cell action="D"/><Cell action="D"/><Cell action="D"/><Cell action="D"/><Cell action="D"/><Cell action="D"/><Cell action="H"/><Cell action="H"/></tr>
                        <tr><td className="player-hand-col">9</td><Cell action="H"/><Cell action="D"/><Cell action="D"/><Cell action="D"/><Cell action="D"/><Cell action="H"/><Cell action="H"/><Cell action="H"/><Cell action="H"/><Cell action="H"/></tr>
                        <tr><td className="player-hand-col">5 - 8</td><Cell action="H"/><Cell action="H"/><Cell action="H"/><Cell action="H"/><Cell action="H"/><Cell action="H"/><Cell action="H"/><Cell action="H"/><Cell action="H"/><Cell action="H"/></tr>
                    </tbody>
                </table>
            </div>

            {/* TABELA 2: PARY (SPLITS) - Dane z image_4a7af2.png */}
            <div className="strategy-section">
                <div className="section-header">{isPl ? "Pary (Splity)" : "Pairs (Splits)"}</div>
                <table className="strategy-table">
                    <DealerHeader />
                    <tbody>
                        <tr><td className="player-hand-col">A, A</td><Cell action="SP"/><Cell action="SP"/><Cell action="SP"/><Cell action="SP"/><Cell action="SP"/><Cell action="SP"/><Cell action="SP"/><Cell action="SP"/><Cell action="SP"/><Cell action="SP"/></tr>
                        <tr><td className="player-hand-col">10, 10</td><Cell action="S"/><Cell action="S"/><Cell action="S"/><Cell action="S"/><Cell action="S"/><Cell action="S"/><Cell action="S"/><Cell action="S"/><Cell action="S"/><Cell action="S"/></tr>
                        <tr><td className="player-hand-col">9, 9</td><Cell action="SP"/><Cell action="SP"/><Cell action="SP"/><Cell action="SP"/><Cell action="SP"/><Cell action="S"/><Cell action="SP"/><Cell action="SP"/><Cell action="S"/><Cell action="S"/></tr>
                        <tr><td className="player-hand-col">8, 8</td><Cell action="SP"/><Cell action="SP"/><Cell action="SP"/><Cell action="SP"/><Cell action="SP"/><Cell action="SP"/><Cell action="SP"/><Cell action="SP"/><Cell action="SP"/><Cell action="Us"/></tr>
                        <tr><td className="player-hand-col">7, 7</td><Cell action="SP"/><Cell action="SP"/><Cell action="SP"/><Cell action="SP"/><Cell action="SP"/><Cell action="SP"/><Cell action="H"/><Cell action="H"/><Cell action="H"/><Cell action="H"/></tr>
                        <tr><td className="player-hand-col">6, 6</td><Cell action="SP"/><Cell action="SP"/><Cell action="SP"/><Cell action="SP"/><Cell action="SP"/><Cell action="H"/><Cell action="H"/><Cell action="H"/><Cell action="H"/><Cell action="H"/></tr>
                        <tr><td className="player-hand-col">5, 5</td><Cell action="D"/><Cell action="D"/><Cell action="D"/><Cell action="D"/><Cell action="D"/><Cell action="D"/><Cell action="D"/><Cell action="D"/><Cell action="H"/><Cell action="H"/></tr>
                        <tr><td className="player-hand-col">4, 4</td><Cell action="H"/><Cell action="H"/><Cell action="H"/><Cell action="SP"/><Cell action="SP"/><Cell action="H"/><Cell action="H"/><Cell action="H"/><Cell action="H"/><Cell action="H"/></tr>
                        <tr><td className="player-hand-col">2,2 - 3,3</td><Cell action="SP"/><Cell action="SP"/><Cell action="SP"/><Cell action="SP"/><Cell action="SP"/><Cell action="SP"/><Cell action="H"/><Cell action="H"/><Cell action="H"/><Cell action="H"/></tr>
                    </tbody>
                </table>
            </div>

            {/* TABELA 3: MIĘKKIE RĘCE (SOFT HANDS) - Dane z image_4a7af6.png */}
            <div className="strategy-section">
                <div className="section-header">{isPl ? "Miękkie Ręce (Z Asem)" : "Soft Hands (Ace)"}</div>
                <table className="strategy-table">
                    <DealerHeader />
                    <tbody>
                        <tr><td className="player-hand-col">A, 9 (20)</td><Cell action="S"/><Cell action="S"/><Cell action="S"/><Cell action="S"/><Cell action="S"/><Cell action="S"/><Cell action="S"/><Cell action="S"/><Cell action="S"/><Cell action="S"/></tr>
                        <tr><td className="player-hand-col">A, 8 (19)</td><Cell action="S"/><Cell action="S"/><Cell action="S"/><Cell action="S"/><Cell action="D"/><Cell action="S"/><Cell action="S"/><Cell action="S"/><Cell action="S"/><Cell action="S"/></tr>
                        <tr><td className="player-hand-col">A, 7 (18)</td><Cell action="D"/><Cell action="D"/><Cell action="D"/><Cell action="D"/><Cell action="D"/><Cell action="S"/><Cell action="S"/><Cell action="H"/><Cell action="H"/><Cell action="H"/></tr>
                        <tr><td className="player-hand-col">A, 6 (17)</td><Cell action="H"/><Cell action="D"/><Cell action="D"/><Cell action="D"/><Cell action="D"/><Cell action="H"/><Cell action="H"/><Cell action="H"/><Cell action="H"/><Cell action="H"/></tr>
                        <tr><td className="player-hand-col">A,4 - A,5</td><Cell action="H"/><Cell action="H"/><Cell action="D"/><Cell action="D"/><Cell action="D"/><Cell action="H"/><Cell action="H"/><Cell action="H"/><Cell action="H"/><Cell action="H"/></tr>
                        <tr><td className="player-hand-col">A,2 - A,3</td><Cell action="H"/><Cell action="H"/><Cell action="H"/><Cell action="D"/><Cell action="D"/><Cell action="H"/><Cell action="H"/><Cell action="H"/><Cell action="H"/><Cell action="H"/></tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CheatSheet;