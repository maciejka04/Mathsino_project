import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Achievements.css';
import { achievementsConfig } from './achievementsConfig';
import clickSound from '../../assets/mouse-click.mp3';
import audioService from '../../services/audioService';

const API_URL = "http://localhost:5126";

function Achievements() {
    const { user } = useOutletContext();
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Dodatkowy stan na statystyki gracza (pobieramy je osobno, tak jak w Home.js)
    const [stats, setStats] = useState(null);
    const [achievements, setAchievements] = useState([]); // lista UserAchievementDto z backendu

    const fetchAchievements = React.useCallback(async () => {
        if(!user?.id) return;
        try {
            const response = await fetch(`${API_URL}/users/${user.id}/achievements`);
            if(response.ok){
                const data = await response.json();
                setAchievements(data);
            }
        } catch(err){
            console.error('Error fetching achievements', err);
        }
    }, [user?.id]);

    useEffect(() => {
        if (!user?.id) return;

        // 1. Pobieramy statystyki (ilość gier, winrate itp.)
        const fetchStats = async () => {
            try {
                const response = await fetch(`${API_URL}/users/${user.id}/stats`);
                if(response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Error fetching stats:', error);
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

    // Funkcja obliczająca postęp dla danego kafelka
    const getProgress = (ach) => {
        const backend = achievements.find(a => a.id === ach.id);
        if(backend) return backend.progress;

        let current = 0;

        // Mapowanie kluczy z configu na to co mamy w `user` lub `stats`
        // Dostosuj te pola jak już zrobimy backend
        if (ach.statKey === 'gamesPlayed') current = stats?.totalGames || 0;
        else if (ach.statKey === 'maxBalance') current = user?.balance || 0; // Tymczasowo bieżący balans
        else if (ach.statKey === 'loginStreak') current = stats?.daysStreak || 0;
        else if (ach.statKey === 'friendsCount') current = 0; // TODO
        else if (ach.statKey === 'spinWheelCount') current = 0; // TODO
        else if (ach.statKey === 'blackjacksCount') current = 0; // TODO
        else if (ach.statKey === 'lessonsCompleted') current = 0; // TODO
        else if (ach.statKey === 'doubleDownWins') current = 0; // TODO
        
        return current;
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
                    
                    const backend = achievements.find(a => a.id === ach.id);
                    const status = backend ? backend.status : 0; // 0-nie,1-zrobione,2-odebrano
                    const isUnlocked = status >= 1 || currentVal >= target;
                    
                    const progressPercent = Math.min((currentVal / target) * 100, 100);

                    return (
                        <div key={ach.id} className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`}>
                            <div className="status-icon">
                                {isUnlocked ? <i className="fa-solid fa-check-circle unlocked"></i> : <i className="fa-solid fa-lock locked"></i>}
                            </div>
                            
                            <i className={`${ach.icon} achievement-icon`}></i>
                            
                            <div className="achievement-content">
                                <h3>{ach.title}</h3>
                                <p>{ach.description}</p>
                            </div>

                            {/* Progress Bar */}
                            <div className="progress-bar-container">
                                <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
                            </div>
                            <div className="progress-text">
                                {currentVal} / {target}
                            </div>

                            {status === 1 && (
                                <button className="claim-btn" onClick={async ()=>{
                                    playClick();
                                    try{
                                        const resp = await fetch(`${API_URL}/users/${user.id}/achievements/${ach.id}/claim`,{method:'POST'});
                                        if(resp.ok){
                                            fetchAchievements();
                                        }
                                    }catch(err){console.error('claim error',err);}
                                }}>Odbierz</button>
                            )}

                            <div className="reward-badge">
                                {((typeof ach.rewardType === 'string' && ach.rewardType.toUpperCase() === 'CASH') || ach.rewardType === 0) ? (
                                    <>
                                        <i className="fa-solid fa-coins"></i> +{ach.rewardValue} PLN
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-user-astronaut"></i> {ach.rewardLabel}
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Achievements;