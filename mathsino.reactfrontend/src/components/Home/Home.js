// src/components/Home/Home.js (Wersja 'PRO')

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import './Home.css';
import { useOutletContext } from "react-router-dom";
import clickSound from '../../assets/mouse-click.mp3';
import SpinWheelCard from './SpinWheelCard';

const API_URL = "http://localhost:5126";
const COOLDOWN_MINUTES = 2;


const playClickSound = () => {
  const audio = new Audio(clickSound);
  audio.play();
};


function Home() {
  const { user, refreshUser } = useOutletContext();
  const { t } = useTranslation();
  const isLogged = user?.isAuthenticated;
 

  return (
    <>
      <header>
        {isLogged ? (
          <>
            <h1>{t('welcome_back', { name: user.name })}</h1>
          </>
        ) : (
          <>
            <h1>{t('welcome')}</h1>
            <p>{t('login_prompt')}</p>

            <Link
              to="/login"
              className="login-button"
              onClick={playClickSound}
            >
              {t('login_button')}
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
            <h4>{t('your_progress')}</h4>
            <p>{t('weeks_performance')}</p>
          </div>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">1,204</span>
              <span className="stat-label">{t('hands_played')}</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">87%</span>
              <span className="stat-label">{t('accuracy')}</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">3</span>
              <span className="stat-label">{t('days_streak')}</span>
            </div>
          </div>
        </div>
        {/*=== koło fortuny ===*/}
        <SpinWheelCard user={user} refreshUser={refreshUser} />
        {/* === 2. GŁÓWNA AKCJA: Graj (Średnia) === */}
        <Link
          to="/play"
          className="dashboard-card primary-card"
          onClick={playClickSound}
        >
          <i className="fa-solid fa-spade"></i>
          <div className="dashboard-card-text">
            <h3>{t('start_game')}</h3>
            <p>{t('choose_mode')}</p>
          </div>
        </Link>

        {/* === 3. GŁÓWNA AKCJA: Ucz się (Średnia) === */}
        <Link
          to="/learn"
          className="dashboard-card secondary-card"
          onClick={playClickSound}
        >
          <i className="fa-solid fa-graduation-cap"></i>
          <div className="dashboard-card-text">
            <h3>{t('home_learn_strategy')}</h3>
            <p>{t('home_learn_strategy_desc')}</p>
          </div>
        </Link>

        {/* === 4. KARTA FOKUS (Szeroka) === */}
        <div className="dashboard-card focus-card">
          <i className="fa-solid fa-crosshairs"></i>
          <div className="dashboard-card-text">
            <h4>{t('home_focus_title')}</h4>
            <p>{t('home_focus_desc')}</p>
          </div>
        </div>
      </>
    )}
  </div>
    </>
  );
}

export default Home;