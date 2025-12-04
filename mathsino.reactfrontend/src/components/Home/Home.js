// src/components/Home/Home.js (Wersja 'PRO')

import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import { useOutletContext } from "react-router-dom";

function Home() {
  const { user } = useOutletContext();
   const isLogged = user?.isAuthenticated;
  return (
    <>
      <header>
        {isLogged ? (
          <>
            <h1>Welcome back, {user.name} 👋</h1>
          </>
        ) : (
          <>
            <h1>Witaj!</h1>
            <p>Zaloguj się, aby zapisywać progres i odblokować pełne statystyki.</p>

            <Link to="/login" className="login-button">
              Zaloguj się
            </Link>
          </>
        )}
      </header>
      
      <div className="dashboard-grid">
    {isLogged && (
      <>
        {/* === 1. KARTA POWITALNA ZE STATYSTYKAMI (Szeroka) === */}
        <div className="dashboard-card welcome-stats-card">
          <div className="dashboard-card-text">
            <h4>Twoje postępy</h4>
            <p>Oto jak Ci idzie w tym tygodniu.</p>
          </div>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">1,204</span>
              <span className="stat-label">Rozdania</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">87%</span>
              <span className="stat-label">Trafność</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">3</span>
              <span className="stat-label">Dni z rzędu</span>
            </div>
          </div>
        </div>

        {/* === 2. GŁÓWNA AKCJA: Graj (Średnia) === */}
        <Link to="/play" className="dashboard-card primary-card">
          <i className="fa-solid fa-spade"></i>
          <div className="dashboard-card-text">
            <h3>Zacznij Grę</h3>
            <p>Wybierz tryb gry</p>
          </div>
        </Link>

        {/* === 3. GŁÓWNA AKCJA: Ucz się (Średnia) === */}
        <Link to="/learn" className="dashboard-card secondary-card">
          <i className="fa-solid fa-graduation-cap"></i>
          <div className="dashboard-card-text">
            <h3>Ucz się Strategii</h3>
            <p>Zobacz tabele i poradniki</p>
          </div>
        </Link>

        {/* === 4. KARTA FOKUS (Szeroka) === */}
        <div className="dashboard-card focus-card">
          <i className="fa-solid fa-crosshairs"></i>
          <div className="dashboard-card-text">
            <h4>Skup się na tym</h4>
            <p>Twój najczęstszy błąd to **stanie na "Soft 17"**. Poćwicz ten scenariusz.</p>
          </div>
        </div>
      </>
    )}
  </div>
    </>
  );
}

export default Home;