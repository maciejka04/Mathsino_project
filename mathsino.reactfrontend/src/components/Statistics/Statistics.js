// src/components/Statistics/Statistics.js


import React, { useState, useEffect } from 'react';
import './Statistics.css'; // Import the new CSS
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

const API_URL = "http://localhost:5126";

// 2. We must register the components we want to use
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

  const { user } = useOutletContext();
  const [stats, setStats] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);


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
        labels: ["Brak danych"],
        datasets: [{
          label: "Balance (PLN)",
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
      labels: sortedGames.map((game, index) => `Gra ${index + 1}`),
      datasets: [{
        label: "Balance (PLN)",
        data: sortedGames.map(game => game.balanceAfterGame),
        fill: true,
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
        tension: 0.3,
      }],
    };
  }, [games]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
        }
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  if (loading) {
    return (
      <div className="statistics-container">
        <header>
          <h1>Statistics</h1>
          <p>Loading...</p>
        </header>
      </div>
    );
  }
  return (
    <div className="statistics-container">
      <header>
        <h1>Statistics</h1>
        <p>Track your performance and lesson progress.</p>
      </header>

      {/* Grid for your 3 stat ideas */}
      <div className="stats-overview-grid">

        {/* Card 1: Rank */}
        <div className="dashboard-card stat-card">
          <span className="stat-card-label">
            <i className="fa-solid fa-trophy"></i>
            Win Rate
          </span>
          <span className="stat-card-value rank-gold">
            {stats ? (stats.winRate * 100).toFixed(1) : 0}%
          </span>
        </div>

        {/* Card 2: Peak Balance */}
        <div className="dashboard-card stat-card">
          <span className="stat-card-label">
            <i className="fa-solid fa-wallet"></i>
            Peak Balance
          </span>
          <span className="stat-card-value">
            {games.length > 0
              ? Math.max(...games.map(g => g.balanceAfterGame)).toLocaleString()
              : '5,000'} PLN
          </span>
        </div>

        {/* Card 3: Lesson Completion */}
        <div className="dashboard-card stat-card">
          <span className="stat-card-label">
            <i className="fa-solid fa-gamepad"></i>
            Total Games
          </span>
          <span className="stat-card-value lessons-green">
            {stats?.totalGames || 0}
          </span>
        </div>

      </div>
      {/* Second row*/}
      <div className="stats-overview-grid">

        <div className="dashboard-card stat-card">
          <span className="stat-card-label">
            <i className="fa-solid fa-circle-check"></i>
            Total Wins
          </span>
          <span className="stat-card-value" style={{ color: '#4caf50' }}>
            {stats?.totalWins || 0}
          </span>
        </div>

        <div className="dashboard-card stat-card">
          <span className="stat-card-label">
            <i className="fa-solid fa-circle-xmark"></i>
            Total Losses
          </span>
          <span className="stat-card-value" style={{ color: '#f44336' }}>
            {stats?.totalLosses || 0}
          </span>
        </div>

        <div className="dashboard-card stat-card">
          <span className="stat-card-label">
            <i className="fa-solid fa-handshake"></i>
            Total Pushes
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
            Blackjacks
          </span>
          <span className="stat-card-value" style={{ color: '#ff9800' }}>
            {stats?.blackJacks || 0}
          </span>
        </div>

        <div className="dashboard-card stat-card">
          <span className="stat-card-label">
            <i className="fa-solid fa-wallet"></i>
            Current Balance
          </span>
          <span className="stat-card-value">
            {games.length > 0
              ? games[games.length - 1].balanceAfterGame.toLocaleString()
              : '5,000'} PLN
          </span>
        </div>

        <div className="dashboard-card stat-card">
          <span className="stat-card-label">
            <i className="fa-solid fa-calendar"></i>
            Games Today
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
        <h3>Balance History</h3>
        <Line options={chartOptions} data={chartData} />
      </div>

    </div>
  );
}

export default Statistics;