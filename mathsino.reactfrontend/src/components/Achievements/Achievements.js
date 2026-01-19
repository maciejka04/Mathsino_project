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
    const [achStatuses, setAchStatuses] = useState({}); // id -> status (0/1/2)
    const [claimingId, setClaimingId] = useState(null);

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

        // 2. Pobieramy listę odblokowanych osiągnięć (to trzeba dorobić w backendzie, na razie mock)
        // Zakładamy, że backend zwróci np. [1, 3, 8] - listę ID odblokowanych
        const fetchAchievements = async () => {
            try {
                const response = await fetch(`${API_URL}/users/${user.id}/achievements`);
                if (response.ok) {
                    const data = await response.json(); // [{Id,Status}]
                    const map = {};
                    data.forEach(a => map[a.id ?? a.Id] = a.status ?? a.Status);
                    setAchStatuses(map);
                }
            } catch (err) {
                console.error('Error fetching achievements list', err);
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

    const claimAchievement = async (achId) => {
        setClaimingId(achId);
        try {
            const res = await fetch(`${API_URL}/users/${user.id}/achievements/${achId}/claim`, { method: 'POST' });
            if (res.ok) {
                // refresh achievements
                const refreshed = await fetch(`${API_URL}/users/${user.id}/achievements`);
                const data = await refreshed.json();
                const map = {};
                data.forEach(a => map[a.id ?? a.Id] = a.status ?? a.Status);
                setAchStatuses(map);
            }
        } catch(e){
            console.error('claim error', e);
        }
        setClaimingId(null);
    };

    // Funkcja obliczająca postęp dla danego kafelka
    const getProgress = (ach) => {
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
        
        // Specjal handling for achievement 1 is now evaluated backend-side
        if (ach.id === 1) {
            return achStatuses[1] >= 1 ? 1 : 0;
        }

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
                    
                    // Unlocked if backend says completed/claimed OR fallback based on progress
                    const status = achStatuses[ach.id] ?? 0; // 0 not done,1 completed,2 claimed
                    const isUnlocked = status >= 1 || currentVal >= target; // fallback when backend not yet evaluated
                    
                    const progressPercent = Math.min((currentVal / target) * 100, 100);

                    return (
                        <div key={ach.id} className={`achievement-card ${status === 2 ? 'claimed' : isUnlocked ? 'unlocked' : 'locked'}`}>
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

                            <div className="reward-badge">
                                {ach.rewardType === 'CASH' ? (
                                    <>
                                        <i className="fa-solid fa-coins"></i> +{ach.rewardValue} PLN
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-user-astronaut"></i> {ach.rewardLabel}
                                    </>
                                )}
                            </div>

                            {status === 1 && (
                                <button className="claim-btn" disabled={claimingId===ach.id} onClick={() => claimAchievement(ach.id)}>
                                    {claimingId===ach.id ? '...' : t('achievements_claim') || 'Claim'}
                                </button>
                            )}
                            {status === 2 && (
                                <span className="claimed-label">{t('achievements_claimed') || 'Claimed'}</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Achievements;