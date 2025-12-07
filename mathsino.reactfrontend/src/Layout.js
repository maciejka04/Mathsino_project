// src/Layout.js (Gotowa, zaktualizowana wersja)

import './App.css';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

// === ZMIANA 1: Dodajemy 'Link' do importów ===
// Będziemy go używać do podlinkowania logo
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';

// Importy usług audio
import audioService from './services/audioService';
import musicService from './services/musicService';

// Importy zasobów
import awatar from './assets/profilowe_smok.png';
import logo from './assets/logo.png';
import snake from './assets/profilepic/snake.png';
import mouse from './assets/profilepic/mouse.png';
import racoon from './assets/profilepic/racoon.png';
import boar from './assets/profilepic/boar.png';
import owl from './assets/profilepic/owl.png';
import fox from './assets/profilepic/fox.png';

const AVATAR_MAP = {
  'snake.png': snake,
  'mouse.png': mouse,
  'racoon.png': racoon,
  'boar.png': boar,
  'owl.png': owl,
  'fox.png': fox,
};

const BACKEND_URL = 'http://localhost:5126';

function Layout() {
  const { t } = useTranslation();

  const [user, setUser] = useState({
  name: "",
  email: "",
    avatarUrl: awatar,
    avatarPath: 'snake.png', 

 });
  const location = useLocation();
  const menuRef = useRef(null);


const fetchUserProfile = () => {
fetch(`${BACKEND_URL}/api/auth/profile`, {
    method: "GET",
    credentials: "include"
  })
    .then(res => {
    if (res.status === 401) {
      throw new Error("Unauthorized");
    }
      return res.json();
    })
  .then(data => {
        const avatarPathFromDb = data.avatarPath || 'profilowe_smok.png';
        const finalAvatarUrl = AVATAR_MAP[avatarPathFromDb] || awatar;
        const fetchedBalance = (data.balance !== undefined && data.balance !== null) 
            ? parseInt(data.balance, 10) 
            : 0;

        const userId = parseInt(data.userId);
        setUser({
          id: userId,
          name: data.userName || "Brak imienia",
          email: data.email,
          isAuthenticated: true,
            avatarUrl: finalAvatarUrl, 
            avatarPath: avatarPathFromDb,
            balance: fetchedBalance,
        });

        // Załaduj ustawienia audio po zalogowaniu
        if (userId) {
          fetch(`${BACKEND_URL}/users/${userId}`)
            .then(response => response.json())
            .then(userData => {
              const musicEnabled = userData.musicEnabled !== undefined ? userData.musicEnabled : true;
              const soundEffectsEnabled = userData.soundEffectsEnabled !== undefined ? userData.soundEffectsEnabled : true;
              
              // Zatrzymaj wszelką istniejącą muzykę
              audioService.stopAllMusic();
              
              // Ustaw utwór w musicService jeśli potrzebne
              if (userData.musicId) {
                musicService.setMusic(userData.musicId);
              }
              
              // Na końcu zainicjalizuj ustawienia audio
              audioService.initializeAudioSettings(musicEnabled, soundEffectsEnabled);
            })
            .catch(err => console.error('Failed to load audio preferences', err));
        }
})
.catch(err => {
  if (err.message === "Unauthorized") {
    console.log("Użytkownik niezalogowany. Ustawiam 'Gość'.");
  } else {
    console.error("Layout user load error:", err);
  }
    setUser({ name: "Gość", isAuthenticated: false, avatarUrl: awatar }); // Ustawienie domyślnego
  });
};

useEffect(() => {
  fetchUserProfile(); // Uruchom pobieranie przy montowaniu
}, []);

  // 2. Poprawiony useEffect dla animacji menu (bez zmian)
  useEffect(() => {
    if (!menuRef.current) {
      return;
    }
    const menuLinks = menuRef.current.querySelectorAll('li a');

    const mouseEnterHandler = (e) => {
      const item = e.currentTarget;
      const highlight = document.createElement('div');
      highlight.style.background = `radial-gradient(circle at ${e.offsetX}px ${e.offsetY}px, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)`;
      highlight.style.pointerEvents = 'none';

      item.appendChild(highlight);

      setTimeout(() => {
        highlight.style.opacity = '0';
        setTimeout(() => {
          if (item.contains(highlight)) {
            item.removeChild(highlight);
          }
        }, 300);
      }, 500);
    };

    menuLinks.forEach(item => {
      item.addEventListener('mouseenter', mouseEnterHandler);
    });

    // Funkcja czyszcząca
    return () => {
      if (menuLinks) { // Dodatkowe sprawdzenie
        menuLinks.forEach(item => {
          item.removeEventListener('mouseenter', mouseEnterHandler);
        });
      }
    };
  }, []); // Pusta tablica = uruchom tylko raz

  const hideMenu = location.pathname === '/online' || location.pathname === '/offline';
  return (
    <>
      <div className="container">
        {!hideMenu && (
          <aside className="sidebar">
            {/* Logo z linkiem do strony głównej */}
            <div className="logo">
              <Link to="/">
                <img src={logo} alt="Logo" />
              </Link>
            </div>

            {/* Nawigacja */}
            <nav className="menu" ref={menuRef}>
              <ul>
                <li>
                  <NavLink
                    to="/play"
                    className={({ isActive }) => (isActive ? 'active-link' : '')}
                  >
                    <i className="fa-solid fa-play" />
                    <span>{t('nav_play')}</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/learn"
                    className={({ isActive }) => (isActive ? 'active-link' : '')}
                  >
                    <i className="fa-solid fa-graduation-cap" />
                    <span>{t('nav_learn')}</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/statistics"
                    className={({ isActive }) => (isActive ? 'active-link' : '')}
                  >
                    <i className="fas fa-chart-simple" />
                    <span>{t('nav_statistics')}</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/friends"
                    className={({ isActive }) => (isActive ? 'active-link' : '')}
                  >
                    <i className="fa-solid fa-user-group" />
                    <span>{t('nav_friends')}</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/resources"
                    className={({ isActive }) => (isActive ? 'active-link' : '')}
                  >
                    <i className="fa-solid fa-gear" />
                    <span>{t('nav_resources')}</span>
                  </NavLink>
                </li>
              </ul>
            </nav>

            <Link to={user.isAuthenticated ? "/profile" : "/login"} className="profile">
              <div className="avatar">
                <img src={user.avatarUrl} alt="Profile" />
              </div>
              <div className="user-info">

                <h3>{user.name}</h3>
              </div>
            </Link>
          </aside>
        )}

        {/* Główna zawartość (podstrony) */}
        <main className="content">
          <Outlet context={{ user, refreshUser: fetchUserProfile }} />
        </main>
      </div>
    </>
  );
}

export default Layout;