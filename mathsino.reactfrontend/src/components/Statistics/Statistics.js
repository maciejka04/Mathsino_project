// src/components/Statistics/Statistics.js

import React from 'react';
import './Statistics.css'; // Import the new CSS

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

// This is your random data generator
const getRandomNum = (max) => Math.floor(Math.random() * Math.floor(max));
const randomiseArray = (itemCount) => {
	let array = [];
	for (let i = 0; i < itemCount; i++) {
		let item = getRandomNum(100);
		array.push(item);
	}
	return array;
};

// This is your 'data' function, adapted for React
// We'll rename this chart to "Balance History"
const chartData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
  datasets: [
    {
      label: "Balance ($)",
      data: [...randomiseArray(7)], // Use your random data
      fill: true,
      backgroundColor: "rgba(255, 99, 132, 0.2)",
      borderColor: "rgba(255, 99, 132, 1)",
      borderWidth: 2,
      tension: 0.3, // Makes the line smoother
    },
  ],
};

// This is your 'options' object
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
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
      display: false, // You had this in your code
    },
  },
};


function Statistics() {
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
            <i className="fa-solid fa-shield-halved"></i>
            Current Rank
          </span>
          <span className="stat-card-value rank-gold">Gold II</span>
        </div>

        {/* Card 2: Peak Balance */}
        <div className="dashboard-card stat-card">
          <span className="stat-card-label">
            <i className="fa-solid fa-wallet"></i>
            Peak Balance
          </span>
          <span className="stat-card-value">$10,450</span>
        </div>

        {/* Card 3: Lesson Completion */}
        <div className="dashboard-card stat-card">
          <span className="stat-card-label">
            <i className="fa-solid fa-graduation-cap"></i>
            Lesson Completion
          </span>
          <span className="stat-card-value lessons-green">75%</span>
        </div>

      </div>

      {/* The Line Chart */}
      <div className="dashboard-card chart-container">
        <h3>Balance History (Last 7 Months)</h3>
        <Line options={chartOptions} data={chartData} />
      </div>

    </div>
  );
}

export default Statistics;