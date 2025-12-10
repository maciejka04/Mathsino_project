// src/components/Statistics/Statistics.js

import React, { useState, useEffect, useRef } from 'react';
import './Statistics.css';
import { useTranslation } from 'react-i18next'; // Import i18n
import { useOutletContext } from "react-router-dom";

// 1. Import chart.js components
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import clickSound from '../../assets/mouse-click.mp3';

const playClickSound = () => {
  const audio = new Audio(clickSound);
  audio.play();
};


const API_URL = "http://localhost:5126";

// 2. Register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Statistics() {
  const { t } = useTranslation(); // Hook tłumaczeń

  const { user, refreshUser } = useOutletContext();
  const [stats, setStats] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDisabled, setIsDisabled] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [rewardAmount, setRewardAmount] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_URL}/users/${user.id}/stats`);
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    const fetchGames = async () => {
      try {
        const response = await fetch(`${API_URL}/users/${user.id}/games`);
        const data = await response.json();
        setGames(data);
      } catch (error) {
        console.error("Error fetching games:", error);
      }
    };

    fetchStats();
    fetchGames();
    setLoading(false);
  }, [user?.id]);

  const chartData = React.useMemo(() => {
    if (!games || games.length === 0) {
      return {
        labels: [t('stats_no_data')], // Tłumaczenie
        datasets: [{
          label: t('stats_balance_label'), // Tłumaczenie
          data: [5000],
          fill: true,
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 2,
          tension: 0.3,
        }],
      };
    }

    const sortedGames = [...games]
      .sort((a, b) => new Date(a.endTime) - new Date(b.endTime))
      .slice(-10);

    return {
      labels: sortedGames.map((game, index) => `${t('stats_game')} ${index + 1}`), // "Gra X" -> "Game X"
      datasets: [{
        label: t('stats_balance_label'),
        data: sortedGames.map(game => game.balanceAfterGame),
        fill: true,
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
        tension: 0.3,
      }],
    };
  }, [games, t]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
        grid: { color: "rgba(255, 255, 255, 0.1)" },
        ticks: { color: "rgba(255, 255, 255, 0.7)" }
      },
      x: {
        grid: { display: false },
        ticks: { color: "rgba(255, 255, 255, 0.7)" }
      },
    },
    plugins: {
      legend: { display: false },
    },
  };

  // Timer logic
  useEffect(() => {
    if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
    }

    if (showAd && timeLeft > 0 && !isPaused) { 
        const id = setInterval(() => {
            setTimeLeft(prevTime => prevTime - 1);
        }, 1000);
        intervalRef.current = id;
    }

    return () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };
  }, [showAd, timeLeft, isPaused]);

  // Reward logic
  useEffect(() => {
    if (showAd && timeLeft === 0 && user?.id) {
        const USER_ID = user.id;

        const giveReward = async () => {
              try {
                  const response = await fetch(`${API_URL}/user/${USER_ID}/claim-ad-reward`, {
                      method: 'POST',
                      credentials: 'include',
                      headers: { 'Content-Type': 'application/json' },
                  });
                  if (response.ok) {
                      if (refreshUser) {
                          refreshUser(); 
                      }
                  } else {
                      alert(t('ad_error_reward')); // Tłumaczenie błędu
                  }
              } catch (error) {
                  console.error("Network error:", error);
                  alert(t('ad_error_network')); // Tłumaczenie błędu
              }
        
            setShowAd(false);
            setTimeout(() => setIsDisabled(false), 60000); 
        };
        
        giveReward();
    }
  }, [showAd, timeLeft, user, rewardAmount, refreshUser, t]);
 
  const handleWatchAd = () => {
    if (isDisabled || showAd || !user?.id) return;
    
    // Kwota jest teraz ustalana przez serwer, ale do wyświetlania w modalu 
    // możemy ustawić lokalnie (tylko informacyjnie).
    const fixedRewardAmount = 50; 

    setTimeLeft(20);           
    setRewardAmount(fixedRewardAmount); 
    setShowAd(true);          
    setIsDisabled(true);        
    setIsPaused(false);         
  };

  const handleCloseAd = () => {
    setIsPaused(true);
    setShowConfirmModal(true);
  };

  const confirmCloseAd = () => {
    setShowConfirmModal(false);
    setShowAd(false); 
    setTimeLeft(0);   
    setIsPaused(false); 
    setIsDisabled(false); 
  };

  const cancelCloseAd = () => {
    setShowConfirmModal(false);
    setIsPaused(false);
  };
  
  if (loading) {
    return (
      <div className="statistics-container">
        <header>
          <h1>{t('stats_title')}</h1>
          <p>{t('stats_loading')}</p>
        </header>
      </div>
    );
  }

  return (
    <>
      {/* MODAL POTWIERDZENIA ZAMKNIĘCIA REKLAMY */}
      {showConfirmModal && (
          <div className="modal-overlay">
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                  <h2 style={{ color: '#ff4d4d' }}>{t('ad_warning_title')}</h2>
                  <p style={{ color: '#DDD', fontSize: '1.1rem' }}>
                      {t('ad_warning_desc', { amount: rewardAmount })} {/* Interpolacja kwoty */}
                      <br />
                      {t('ad_warning_question')}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px' }}>
                      <button 
                          className="danger-button" 
                          onClick={confirmCloseAd}
                          style={{ border: 'none' }}
                      >
                          {t('ad_exit_button')}
                      </button>
                      <button 
                          className="logout-button" 
                          onClick={cancelCloseAd}
                          style={{ marginLeft: '10px' }}
                      >
                          {t('ad_continue_button')}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* OKNO REKLAMY */}
      {showAd && !showConfirmModal && (
          <div className="ad-overlay">
              <div className="ad-content">
                <button className="ad-close-button" onClick={handleCloseAd}>
                    x
                </button>
                  <p>{t('ad_reward_info', { amount: rewardAmount })}</p> {/* "Bądź gotowy na 50 PLN!" */}
                  <p>{t('ad_timer', { seconds: timeLeft })}</p> {/* "Reklama zniknie za X sekund" */}
                  
                  <div className="fake-ad-box">
                      <i className="fa-solid fa-gem" style={{ fontSize: '3rem', color: '#ffd700' }} />
                      <h2>{t('ad_promo_title')}</h2>
                      <p>{t('ad_promo_desc')}</p>
                  </div>
              </div>
          </div>
      )}

      <div className="statistics-container">
        <header>
          <h1>{t('stats_title')}</h1>
          <p>{t('stats_subtitle')}</p>
        </header>

        <button 
          className={`ad-reward-button ${isDisabled ? 'disabled' : ''}`}
          disabled={isDisabled} 
          onClick={() => {
              playClickSound();
              handleWatchAd();
          }}
      >
          {t('stats_watch_ad')} <i className="fa-solid fa-clapperboard" />
      </button>


        {/* Grid statystyk */}
        <div className="stats-overview-grid">
          {/* Card 1: Win Rate */}
          <div className="dashboard-card stat-card">
            <span className="stat-card-label">
              <i className="fa-solid fa-trophy"></i>
              {t('stats_win_rate')}
            </span>
            <span className="stat-card-value rank-gold">
              {stats ? (stats.winRate * 100).toFixed(1) : 0}%
            </span>
          </div>

          {/* Card 2: Peak Balance */}
          <div className="dashboard-card stat-card">
            <span className="stat-card-label">
              <i className="fa-solid fa-wallet"></i>
              {t('stats_peak_balance')}
            </span>
            <span className="stat-card-value">
              {games.length > 0
                ? Math.max(...games.map(g => g.balanceAfterGame)).toLocaleString()
                : '5,000'} PLN
            </span>
          </div>

          {/* Card 3: Total Games */}
          <div className="dashboard-card stat-card">
            <span className="stat-card-label">
              <i className="fa-solid fa-gamepad"></i>
              {t('stats_total_games')}
            </span>
            <span className="stat-card-value lessons-green">
              {stats?.totalGames || 0}
            </span>
          </div>
        </div>

        {/* Second row */}
        <div className="stats-overview-grid">
          <div className="dashboard-card stat-card">
            <span className="stat-card-label">
              <i className="fa-solid fa-circle-check"></i>
              {t('stats_total_wins')}
            </span>
            <span className="stat-card-value" style={{ color: '#4caf50' }}>
              {stats?.totalWins || 0}
            </span>
          </div>

          <div className="dashboard-card stat-card">
            <span className="stat-card-label">
              <i className="fa-solid fa-circle-xmark"></i>
              {t('stats_total_losses')}
            </span>
            <span className="stat-card-value" style={{ color: '#f44336' }}>
              {stats?.totalLosses || 0}
            </span>
          </div>

          <div className="dashboard-card stat-card">
            <span className="stat-card-label">
              <i className="fa-solid fa-handshake"></i>
              {t('stats_total_pushes')}
            </span>
            <span className="stat-card-value" style={{ color: '#ffc107' }}>
              {stats?.totalPushes || 0}
            </span>
          </div>
        </div>

        {/* Third row */}
        <div className="stats-overview-grid">
          <div className="dashboard-card stat-card">
            <span className="stat-card-label">
              <i className="fa-solid fa-bolt"></i>
              {t('stats_blackjacks')}
            </span>
            <span className="stat-card-value" style={{ color: '#ff9800' }}>
              {stats?.blackJacks || 0}
            </span>
          </div>

          <div className="dashboard-card stat-card">
            <span className="stat-card-label">
              <i className="fa-solid fa-wallet"></i>
              {t('stats_current_balance')}
            </span>
            <span className="stat-card-value">
              {user.balance?.toLocaleString('pl-PL') || '0'} PLN
            </span>
          </div>

          <div className="dashboard-card stat-card">
            <span className="stat-card-label">
              <i className="fa-solid fa-calendar"></i>
              {t('stats_games_today')}
            </span>
            <span className="stat-card-value lessons-green">
              {games.filter(g => {
                const today = new Date().toDateString();
                const gameDate = new Date(g.endTime).toDateString();
                return today === gameDate;
              }).length}
            </span>
          </div>
        </div>

        {/* The Line Chart */}
        <div className="dashboard-card chart-container">
          <h3>{t('stats_balance_history')}</h3>
          <Line options={chartOptions} data={chartData} />
        </div>
      </div>
    </>
  );
}

export default Statistics;