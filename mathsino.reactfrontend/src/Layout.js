// src/Layout.js

import './App.css';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import clickSound from './assets/mouse-click.mp3';


const AVATAR_MAP = {
  'snake.png': snake,
  'mouse.png': mouse,
  'racoon.png': racoon,
  'boar.png': boar,
  'owl.png': owl,
  'fox.png': fox,
};

const BACKEND_URL = 'http://localhost:5126';

const playClickSound = () => {
  audioService.playSoundEffect(clickSound);
};

function Layout() {
  const { t } = useTranslation();
  const [user, setUser] = useState({
    name: "",
    email: "",
    avatarUrl: awatar,
    avatarPath: 'snake.png',
    userName: ""
  });

  const location = useLocation();
  const menuRef = useRef(null);

  const fetchUserProfile = () => {
    fetch(`${BACKEND_URL}/api/auth/profile`, {
      method: "GET",
      credentials: "include"
    })
      .then(res => {
        if (res.status === 401) throw new Error("Unauthorized");
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
          userName: data.userNameTag
        });

        // --- LOGIKA AUDIO (UPROSZCZONA) ---
        if (userId) {
          fetch(`${BACKEND_URL}/users/${userId}`)
            .then(response => response.json())
            .then(userData => {
              const musicEnabled = userData.musicEnabled !== undefined ? userData.musicEnabled : true;
              const soundEffectsEnabled = userData.soundEffectsEnabled !== undefined ? userData.soundEffectsEnabled : true;

              // Pobieramy ID z bazy (lub domyślne 1)
              const newMusicId = userData.musicId || 1;

              // 1. Zaktualizuj globalne ustawienia (głośność itp.)
              audioService.initializeAudioSettings(musicEnabled, soundEffectsEnabled);

              // 2. Pobierz to, co aktualnie "myśli" serwis, że gra
              const currentMusicId = musicService.getCurrentMusic();

              if (!musicEnabled) {
                // Jeśli user wyłączył muzykę -> bezwzględna cisza
                audioService.stopAllMusic();
              }
              else if (currentMusicId === null) {
                // PRZYPADEK 1: Start aplikacji (nic nie grało) -> Graj to co w bazie
                console.log(`Initial music start: ID ${newMusicId}`);
                musicService.setMusic(newMusicId);
                audioService.changeBackgroundMusic(newMusicId);
              }
              else if (currentMusicId !== newMusicId) {
                // PRZYPADEK 2: Zmiana utworu (w bazie jest co innego niż gra)
                console.log(`Switching music from ${currentMusicId} to ${newMusicId}`);
                // changeBackgroundMusic wewnątrz i tak robi stopAllMusic, ale dla pewności:
                audioService.stopAllMusic();
                musicService.setMusic(newMusicId);
                audioService.changeBackgroundMusic(newMusicId);
              }
              // PRZYPADEK 3: currentMusicId == newMusicId -> Nie rób nic, niech gra dalej!
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
        setUser({ name: "Gość", isAuthenticated: false, avatarUrl: awatar });
      });
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Animacja menu
  useEffect(() => {
    if (!menuRef.current) return;
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
          if (item.contains(highlight)) item.removeChild(highlight);
        }, 300);
      }, 500);
    };

    menuLinks.forEach(item => item.addEventListener('mouseenter', mouseEnterHandler));

    return () => {
      if (menuLinks) {
        menuLinks.forEach(item => item.removeEventListener('mouseenter', mouseEnterHandler));
      }
    };
  }, []);

  const hideMenu = location.pathname === '/offline';

  return (
    <>
      <div className="container">
        {!hideMenu && (
          <aside className="sidebar">
            <div className="logo">
              <Link to="/" onClick={playClickSound}>
                <img src={logo} alt="Logo" />
              </Link>

            </div>

            <nav className="menu" ref={menuRef}>
              <ul>
                <li>
                  <NavLink
                    to="/play"
                    onClick={playClickSound}
                    className={({ isActive }) => (isActive ? 'active-link' : '')}
                  >
                    <i className="fa-solid fa-play" />
                    <span>{t('nav_play')}</span>
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/learn"
                    onClick={playClickSound}
                    className={({ isActive }) => (isActive ? 'active-link' : '')}
                  >
                    <i className="fa-solid fa-graduation-cap" />
                    <span>{t('nav_learn')}</span>
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/statistics"
                    onClick={playClickSound}
                    className={({ isActive }) => (isActive ? 'active-link' : '')}
                  >
                    <i className="fas fa-chart-simple" />
                    <span>{t('nav_statistics')}</span>
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/friends"
                    onClick={playClickSound}
                    className={({ isActive }) => (isActive ? 'active-link' : '')}
                  >
                    <i className="fa-solid fa-user-group" />
                    <span>{t('nav_friends')}</span>
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/resources"
                    onClick={playClickSound}
                    className={({ isActive }) => (isActive ? 'active-link' : '')}
                  >
                    <i className="fa-solid fa-gear" />
                    <span>{t('nav_resources')}</span>
                  </NavLink>
                </li>

              </ul>
            </nav>

            <Link
              to={user.isAuthenticated ? "/profile" : "/login"}
              className="profile"
              onClick={playClickSound}
            >
              <div className="avatar">
                <img src={user.avatarUrl} alt="Profile" />
              </div>
              <div className="user-info">
                <h3>{user.name}</h3>
                <h4>{user.userName}</h4>
              </div>
            </Link>

          </aside>
        )}

        <main className="content">
          <Outlet context={{ user, refreshUser: fetchUserProfile }} />
        </main>
      </div>
    </>
  );
}

export default Layout;