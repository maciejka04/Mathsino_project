import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Achievements.css';
import { achievementsConfig } from './achievementsConfig';
import clickSound from '../../assets/mouse-click.mp3';
import audioService from '../../services/audioService';

const API_URL = "http://localhost:5126";

function Achievements() {
    const { user, refreshUser } = useOutletContext();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [stats, setStats] = useState(null);
    const [userAchievements, setUserAchievements] = useState([]);

    useEffect(() => {
        if (!user?.id) return;

        const fetchStats = async () => {
            try {
                const response = await fetch(`${API_URL}/users/${user.id}/stats`);
                if(response.ok) {
                    const data = await response.json();
                    console.log("Stats received from backend:", data); // <--- DEBUG: Zobacz w konsoli F12 co tu jest!
                    setStats(data);
                }
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };

        const fetchAchievements = async () => {
             try {
                 const response = await fetch(`${API_URL}/users/${user.id}/achievements`);
                 if(response.ok) {
                     const data = await response.json();
                     setUserAchievements(data);
                 }
             } catch (error) {
                 console.error('Error fetching achievements:', error);
             }
        };

        fetchStats();
        fetchAchievements();
    }, [user?.id]);


    const playClick = () => {
        if (audioService.areSoundEffectsEnabled()) {
            new Audio(clickSound).play().catch(()=>{});
        }
    };

    // Bezpieczna funkcja pobierania wartości (ignoruje wielkość liter)
    const getStatValue = (key) => {
        if (!stats) return 0;
        // Sprawdź wprost
        if (stats[key] !== undefined) return stats[key];
        // Sprawdź z dużej litery (np. key='totalGames', szukamy 'TotalGames')
        const upperKey = key.charAt(0).toUpperCase() + key.slice(1);
        if (stats[upperKey] !== undefined) return stats[upperKey];
        // Sprawdź z małej litery
        const lowerKey = key.charAt(0).toLowerCase() + key.slice(1);
        if (stats[lowerKey] !== undefined) return stats[lowerKey];
        
        return 0;
    };

    const getProgress = (ach) => {
        let current = 0;

        if (ach.statKey === 'maxBalance') current = user?.balance || 0;
        else if (ach.statKey === 'friendsCount') current = getStatValue('friendsCount'); 
        else if (ach.statKey === 'spinWheelCount') current = getStatValue('spinWheelCount');
        // Tu używamy naszej bezpiecznej funkcji, bo backend może zwracać TotalGames lub totalGames
        else if (ach.statKey === 'gamesPlayed') current = getStatValue('totalGames');
        else if (ach.statKey === 'loginStreak') current = getStatValue('daysStreak');
        else if (ach.statKey === 'blackjacksCount') current = getStatValue('blackJacks'); // Uwaga: Backend ma 'BlackJacks' w DTO
        else if (ach.statKey === 'lessonsCompleted') current = getStatValue('lessonsCompleted');
        else if (ach.statKey === 'doubleDownWins') current = getStatValue('doubleDownWins');
        
        return current;
    };

    const handleClaim = async (achievementId) => {
        playClick();
        try {
            const response = await fetch(`${API_URL}/users/${user.id}/achievements/claim?achievementId=${achievementId}`, {
                method: 'POST'
            });

            if (response.ok) {
                const data = await response.json();
                // Dodajemy ID do lokalnej listy, żeby przycisk zniknął od razu
                setUserAchievements((prev) => [...prev, achievementId]);
                if (refreshUser) refreshUser();
                // Opcjonalnie: alert("Nagroda odebrana!");
            } else {
                const err = await response.json();
                console.error("Backend error:", err);
                alert(err.message || "Błąd odbierania nagrody. Sprawdź konsolę.");
            }
        } catch (error) {
            console.error("Claim error:", error);
        }
    };

    return (
        <div className="achievements-container">
            <div className="achievements-header">
                <h2>{t('achievements_title') || "Achievements"}</h2>
                <p>{t('achievements_subtitle') || "Track your progress and earn rewards!"}</p>
            </div>

            <div className="achievements-grid">
                {achievementsConfig.map((ach) => {
                    const currentVal = getProgress(ach);
                    const target = ach.targetValue;
                    
                    const isClaimed = userAchievements.includes(ach.id);
                    const isConditionMet = currentVal >= target;
                    const progressPercent = Math.min((currentVal / target) * 100, 100);

                    return (
                        <div key={ach.id} className={`achievement-card ${isClaimed ? 'claimed' : (isConditionMet ? 'unlocked' : 'locked')}`}>
                            <div className="status-icon">
                                {isClaimed ? <i className="fa-solid fa-check-circle claimed-icon"></i> : 
                                 isConditionMet ? <i className="fa-solid fa-unlock unlocked-icon"></i> : 
                                 <i className="fa-solid fa-lock locked-icon"></i>}
                            </div>
                            
                            <i className={`${ach.icon} achievement-icon`}></i>
                            
                            <div className="achievement-content">
                                <h3>{ach.title}</h3>
                                <p>{ach.description}</p>
                            </div>

                            {/* TEN ELEMENT MA SZTYWNĄ WYSOKOŚĆ W CSS, WIĘC NIE SKACZE */}
                            <div className="achievement-actions">
                                {isClaimed ? (
                                    <div className="claimed-badge">Odebrano</div>
                                ) : isConditionMet ? (
                                    <button className="claim-button" onClick={() => handleClaim(ach.id)}>
                                        Odbierz nagrodę!
                                    </button>
                                ) : (
                                    <>
                                        <div className="progress-bar-container">
                                            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
                                        </div>
                                        <div className="progress-text">
                                            {currentVal} / {target}
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="reward-badge">
                                {ach.rewardType === 'CASH' ? 
                                    <><i className="fa-solid fa-coins"></i> +{ach.rewardValue} PLN</> : 
                                    <><i className="fa-solid fa-user-astronaut"></i> {ach.rewardLabel}</>
                                }
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Achievements;