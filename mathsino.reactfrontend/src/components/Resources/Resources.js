// src/components/Resources/Resources.js

import React, { useState } from 'react';
import './Resources.css'; // Importujemy dedykowane style

function Resources() {
  
  // Stany dla naszych ustawień
  const [soundEffects, setSoundEffects] = useState(true);
  const [dealSpeed, setDealSpeed] = useState('normal'); // 'slow', 'normal', 'fast'

  return (
    <div className="settings-container">
      <header>
        <h1>Settings & Resources</h1>
        <p>Manage your preferences and find help.</p>
      </header>

      <div className="settings-grid">

        {/* === Karta 1: Ustawienia === */}
        <div className="dashboard-card">
          <div className="setting-row">
            <div className="setting-label">
              <h4>Sound Effects</h4>
              <p>Enable or disable game sounds.</p>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={soundEffects}
                onChange={() => setSoundEffects(!soundEffects)} 
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-row">
            <div className="setting-label">
              <h4>Deal Speed</h4>
              <p>Adjust the card dealing speed.</p>
            </div>
            <div className="speed-options">
              <button 
                className={dealSpeed === 'slow' ? 'active' : ''}
                onClick={() => setDealSpeed('slow')}
              >
                Slow
              </button>
              <button 
                className={dealSpeed === 'normal' ? 'active' : ''}
                onClick={() => setDealSpeed('normal')}
              >
                Normal
              </button>
              <button 
                className={dealSpeed === 'fast' ? 'active' : ''}
                onClick={() => setDealSpeed('fast')}
              >
                Fast
              </button>
            </div>
          </div>
        </div>

        {/* === Karta 2: Zasoby === */}
        <div className="dashboard-card">
          <h4>Resources</h4>
          <p style={{opacity: 0.7, fontSize: '14px', marginBottom: '16px'}}>
            Quick links to help you master the game.
          </p>

          <a href="#" className="resource-link">
            <span>How to Play Blackjack</span>
            <i className="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
          <a href="#" className="resource-link">
            <span>Basic Strategy Chart</span>
            <i className="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
          <a href="#" className="resource-link">
            <span>Glossary of Terms</span>
            <i className="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
        </div>

        {/* === Karta 3: O Aplikacji === */}
        <div className="dashboard-card about-section">
          <h4>About Mathsino</h4>
          <p>
            Version 1.0.0 <br />
            This application is for educational purposes only (18+). 
            Please play responsibly.
          </p>
          <p style={{marginTop: '10px'}}>
            <a href="#">Responsible Gaming</a> &middot; <a href="#">Privacy Policy</a> &middot; <a href="#">Terms of Service</a>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Resources;