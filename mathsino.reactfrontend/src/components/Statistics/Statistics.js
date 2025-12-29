import React, { useState, useEffect } from 'react';
import './Statistics.css';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';

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
import { useAdReward } from './useAdReward';
import { AdRewardModal } from './AdRewardModal';

const API_URL = 'http://localhost:5126';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const playClickSound = () => {
  const audio = new Audio(clickSound);
  audio.play();
};

function Statistics() {
  const { t } = useTranslation();
  const { user, refreshUser } = useOutletContext();

  const [stats, setStats] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);


  const adReward = useAdReward(user?.id, refreshUser, t);

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
        console.error('Error fetching stats:', error);
      }
    };

    const fetchGames = async () => {
      try {
        const response = await fetch(`${API_URL}/users/${user.id}/games`);
        const data = await response.json();
        setGames(data);
      } catch (error) {
        console.error('Error fetching games:', error);
      }
    };

    fetchStats();
    fetchGames();
    setLoading(false);
  }, [user?.id]);

  const chartData = React.useMemo(() => {
    if (!games || games.length === 0) {
      return {
        labels: [t('stats_no_data')],
        datasets: [
          {
            label: t('stats_balance_label'),
            data: [5000],
            fill: true,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 2,
            tension: 0.3,
          },
        ],
      };
    }

    const sortedGames = [...games]
      .sort((a, b) => new Date(a.endTime) - new Date(b.endTime))
      .slice(-10);

    return {
      labels: sortedGames.map((game, index) => `${t('stats_game')} ${index + 1}`),
      datasets: [
        {
          label: t('stats_balance_label'),
          data: sortedGames.map((game) => game.balanceAfterGame),
          fill: true,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
          tension: 0.3,
        },
      ],
    };
  }, [games, t]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: 'rgba(255, 255, 255, 0.7)' },
      },
      x: {
        grid: { display: false },
        ticks: { color: 'rgba(255, 255, 255, 0.7)' },
      },
    },
    plugins: {
      legend: { display: false },
    },
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
      <AdRewardModal
        showAd={adReward.showAd}
        showConfirmModal={adReward.showConfirmModal}
        timeLeft={adReward.timeLeft}
        rewardAmount={adReward.rewardAmount}
        onClose={adReward.handleCloseAd}
        onConfirmClose={adReward.confirmCloseAd}
        onCancelClose={adReward.cancelCloseAd}
        t={t}
      />

      <div className="statistics-container">
        <header>
          <h1>{t('stats_title')}</h1>
          <p>{t('stats_subtitle')}</p>
        </header>

        <button
          className={`ad-reward-button ${adReward.isDisabled ? 'disabled' : ''}`}
          disabled={adReward.isDisabled}
          onClick={() => {
            playClickSound();
            adReward.handleWatchAd();
          }}
        >
          {t('stats_watch_ad')} <i className="fa-solid fa-clapperboard" />
        </button>

        {/* Grid statystyk */}
        <div className="stats-overview-grid">
          <div className="dashboard-card stat-card">
            <span className="stat-card-label">
              <i className="fa-solid fa-trophy"></i>
              {t('stats_win_rate')}
            </span>
            <span className="stat-card-value rank-gold">
              {stats ? (stats.winRate * 100).toFixed(1) : 0}%
            </span>
          </div>

          <div className="dashboard-card stat-card">
            <span className="stat-card-label">
              <i className="fa-solid fa-wallet"></i>
              {t('stats_peak_balance')}
            </span>
            <span className="stat-card-value">
              {stats?.peakBalance?.toLocaleString() || '5,000'} PLN
            </span>
          </div>

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
              {games.filter((g) => {
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