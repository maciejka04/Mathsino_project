import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const API_URL = "http://localhost:5126";

function FriendStatistics({ friendId, currentUserId, profile }) {
  const { t } = useTranslation();

  const [stats, setStats] = useState(null);
  const [games, setGames] = useState([]);
  const [myGames, setMyGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fillData = (data, targetLength, initialBalance = 5000) => {

    const sortedData = [...data].sort((a, b) => new Date(a.endTime) - new Date(b.endTime));
    const lastValue = sortedData.length > 0 ? sortedData[sortedData.length - 1].balanceAfterGame : initialBalance;
    const filled = sortedData.map(g => g.balanceAfterGame);
    while (filled.length < targetLength) {
      filled.push(lastValue);
    }
    return filled;
  };


  useEffect(() => {
    if (!friendId || !currentUserId) {
      setLoading(false);
      return;
    }

    const fetchAllFriendStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const statsResponse = await fetch(`${API_URL}/users/${friendId}/stats`);
        const statsData = await statsResponse.json();
        if (!statsResponse.ok) throw new Error(t('stats_error_fetching') || 'Failed to fetch friend statistics');
        setStats(statsData);

        const gamesResponse = await fetch(`${API_URL}/users/${friendId}/games`);
        const gamesData = await gamesResponse.json();
        if (!gamesResponse.ok) throw new Error(t('stats_error_fetching') || 'Failed to fetch game history');
        setGames(gamesData);



        const myGamesResponse = await fetch(`${API_URL}/users/${currentUserId}/games`);
        const myGamesData = await myGamesResponse.json();
        if (!myGamesResponse.ok) throw new Error(t('stats_error_fetching') || 'Failed to fetch your game history');
        setMyGames(myGamesData);

      } catch (err) {
        console.error("Error fetching friend stats:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllFriendStats();
  }, [friendId, currentUserId, t]);


  const chartData = useMemo(() => {
    const friendGames = games;
    const userGames = myGames;

    const maxLen = Math.max(friendGames.length, userGames.length);

    if (maxLen === 0) {
      return {
        labels: [t('stats_no_data') || 'No Data'],
        datasets: [{ label: t('stats_balance_label'), data: [0], fill: false, borderColor: 'gray' }],
      };
    }

    const initialBalance = 5000;

    const labels = Array.from({ length: maxLen }, (_, i) => `${t('stats_game')} ${i + 1}`);

    const friendBalanceData = fillData(friendGames, maxLen, initialBalance);

    const myBalanceData = fillData(userGames, maxLen, initialBalance);

    return {
      labels: labels,
      datasets: [
        {
          label: t('stats_friend_balance', 'Friend Balance'),
          data: friendBalanceData,
          fill: false,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 2,
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: t('stats_my_balance', 'Your Balance'),
          data: myBalanceData,
          fill: false,
          backgroundColor: "rgba(216, 58, 122, 0.2)",
          borderColor: "rgba(216, 58, 122, 1)",
          borderWidth: 2,
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6,
        }
      ],
    };
  }, [games, myGames, t, profile, stats]);


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
      legend: {
        display: true,
        labels: { color: "rgba(255, 255, 255, 0.9)" }
      },
    },
  };


  if (loading) {
    return <p>{t('stats_loading') || 'Loading friend statistics...'}</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{t('error')}: {error}</p>;
  }

  const currentBalance = (games.length > 0
    ? games[games.length - 1]?.balanceAfterGame
    : (stats ? stats.initialBalance : 5000)
  ) || 0;

  const peakBalance = (games.length > 0
    ? Math.max(...games.map(g => g.balanceAfterGame))
    : (stats ? stats.initialBalance : 5000)
  ) || 0;


  return (
    <div className="friend-statistics-section">
      <h2 style={{ color: '#ffffff', marginBottom: '20px' }}>{t('stats_friend_summary', 'Summary')}</h2>

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
            {stats?.peakBalance?.toLocaleString() || '5,000'} PLN
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

      {/* The Line Chart */}
      <div className="dashboard-card chart-container" style={{ marginTop: '30px' }}>
        <h3>{t('stats_balance_history')}</h3>
        <div style={{ height: '300px' }}>
          <Line options={chartOptions} data={chartData} />
        </div>
      </div>
    </div>
  );
}

export default FriendStatistics;