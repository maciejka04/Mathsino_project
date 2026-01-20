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

    const getStatValue = (key) => {
        if (!stats) return 0;
        if (stats[key] !== undefined) return stats[key];
        const upperKey = key.charAt(0).toUpperCase() + key.slice(1);
        if (stats[upperKey] !== undefined) return stats[upperKey];
        const lowerKey = key.charAt(0).toLowerCase() + key.slice(1);
        if (stats[lowerKey] !== undefined) return stats[lowerKey];
        return 0;
    };

    const getProgress = (ach) => {
        let current = 0;
        if (!user || !stats) return 0;

        switch (ach.statKey) {
            case 'totalGames':
                current = getStatValue('totalGames'); 
                break;
            case 'peakBalance':
                current = getStatValue('peakBalance'); 
                break;
            case 'lessonsCompleted':
                current = getStatValue('lessonsCompleted');
                break;
            case 'spinWheelCount':
                current = getStatValue('spinWheelCount');
                break;
            case 'loginStreak':
                current = getStatValue('daysStreak');
                break;
            case 'doubleDownWins':
                current = getStatValue('doubleDownWins');
                break;
            default:
                current = 0;
        }
        return current;
    };

    const handleClaim = async (achievementId) => {
        playClick();
        try {
            const response = await fetch(`${API_URL}/users/${user.id}/achievements/claim?achievementId=${achievementId}`, {
                method: 'POST'
            });

            if (response.ok) {
                // const data = await response.json(); // opcjonalne użycie data
                setUserAchievements((prev) => [...prev, achievementId]);
                if (refreshUser) refreshUser();
            } else {
                const err = await response.json();
                alert(err.message || "Something went wrong.");
            }
        } catch (error) {
            console.error("Claim error:", error);
        }
    };

    return (
        <div className="achievements-container">
            <div className="achievements-header">
                <h2>{t('achievements_title')}</h2>
                <p>{t('achievements_subtitle')}</p>
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
                                {/* Tłumaczenie tytułu i opisu */}
                                <h3>{t(`achievement_${ach.id}_title`)}</h3>
                                <p>{t(`achievement_${ach.id}_desc`)}</p>
                            </div>

                            <div className="achievement-actions">
                                {isClaimed ? (
                                    <div className="claimed-badge">{t('ach_collected', 'Collected')}</div>
                                ) : isConditionMet ? (
                                    <button className="claim-button" onClick={() => handleClaim(ach.id)}>
                                        {t('ach_claim_reward', 'Claim Reward!')}
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
                                    <><i className="fa-solid fa-user-astronaut"></i> {t(`avatar_${ach.id}`) || ach.rewardLabel}</>
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