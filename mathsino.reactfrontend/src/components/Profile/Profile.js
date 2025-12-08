// src/components/Profile/Profile.js

import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import './Profile.css';
import { useTranslation } from 'react-i18next';
// Zaimportuj swój domyślny awatar
import smok from '../../assets/profilowe_smok.png'; 
import panda from '../../assets/profilowe_panda.png'; 
import snake from '../../assets/profilepic/snake.png';
import mouse from '../../assets/profilepic/mouse.png';
import racoon from '../../assets/profilepic/racoon.png';
import boar from '../../assets/profilepic/boar.png';
import owl from '../../assets/profilepic/owl.png';
import fox from '../../assets/profilepic/fox.png';
import clickSound from '../../assets/mouse-click.mp3';
import audioService from '../../services/audioService';

const playClickSound = () => {
  audioService.playSoundEffect(clickSound);
};


const AVATAR_MAP = {
  'snake.png': snake,
  'mouse.png': mouse,
  'racoon.png': racoon,
  'boar.png': boar,
  'owl.png': owl,
  'fox.png': fox,
};

const avatars = [snake, mouse, racoon, boar, owl, fox ];

const getAvatarFilename = (avatarImport) => {
    const entries = Object.entries(AVATAR_MAP);
    for (const [filename, path] of entries) {
        if (path === avatarImport) {
            return filename;
        }
    }
    return 'snake.png'; 
};



function Profile() {
  const { t } = useTranslation();

  const { refreshUser } = useOutletContext();
   const [selectedAvatar, setSelectedAvatar] = useState(snake);
   const [pendingAvatar, setPendingAvatar] = useState(getAvatarFilename(snake));
   const [saveStatus, setSaveStatus] = useState('');
  const [user, setUser] = useState({
    name: "",
    email: ""
  });

  const handleAvatarSelect = (avatarSrc) => {
    setSelectedAvatar(avatarSrc);
    setPendingAvatar(getAvatarFilename(avatarSrc));
    setSaveStatus('Oczekuje na zapis...');
  };

  const handleAvatarSave = async () => {
    setSaveStatus('Zapisywanie...');
    try {
      const response = await fetch("http://localhost:5126/api/user/avatar", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ avatarPath: pendingAvatar }), 
      });

      if (response.ok) {
        setSaveStatus('Awatar zapisany pomyślnie! ✅');
        if (refreshUser) {
            refreshUser();
        }

      } else {
        const errorData = await response.json();
        setSaveStatus(`Błąd zapisu: ${errorData.message || 'Nieznany błąd'}`);
      }
    } catch (error) {
      console.error("Avatar save error:", error);
      setSaveStatus('Błąd połączenia z serwerem. ❌');
    }
  };

  // Pobranie danych zalogowanego użytkownika (imię i email)
useEffect(() => {
    fetch("http://localhost:5126/api/auth/profile", {
      method: "GET",
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        console.log("Profile API response:", data);
        setUser({ name: data.userName, email: data.email });
        if (data.avatarPath && AVATAR_MAP[data.avatarPath]) {
          const actualAvatarPath = AVATAR_MAP[data.avatarPath];
          setSelectedAvatar(actualAvatarPath);
          setPendingAvatar(data.avatarPath); 
        }
      })
      .catch(err => console.error("User load error:", err));
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5126/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleLogoutWithSound = () => {
  playClickSound();
  setTimeout(() => {
    handleLogout();
  }, 400);
};


  return (
    <div className="profile-page-container">
      <header>
        <h1>{t('profile_title')}</h1>
        <p>{t('profile_subtitle')}</p>
      </header>
      
      <div className="profile-grid">
        
        {/* Karta 1: Informacje o koncie */}
        <div className="dashboard-card profile-info-card">
          <h4>{t('profile_account_info')}</h4>
          <img 
            src={selectedAvatar} 
            alt="Obecny awatar" 
            className="profile-page-avatar" 
          />
          <h3>{user.name}</h3> 
          <p>{user.email}</p> 
        </div>

        {/* Karta 2: Wybór awatara */}
        <div className="dashboard-card profile-avatar-card">
          <h4>{t('profile_choose_avatar')}</h4>
          <p>{t('profile_choose_prompt')}</p>
          <div className="avatar-grid">
            {avatars.map((avatarSrc, index) => (
              <img 
                key={index}
                src={avatarSrc}
                alt={`Awatar ${index + 1}`}
                className={selectedAvatar === avatarSrc ? 'avatar-option active' : 'avatar-option'}
                onClick={() => { playClickSound(); handleAvatarSelect(avatarSrc); }}
              />
            ))}
          </div>
          <button 
            className="save-avatar-button" 
            onClick={() => { playClickSound(); handleAvatarSave(); }}
            disabled={saveStatus !== 'Oczekuje na zapis...'}
          >
            {t('profile_save')}
          </button>
          {saveStatus && <p className="save-status">{saveStatus}</p>} 
        </div>

        {/* Karta 3: Zarządzanie kontem */}
        <div className="dashboard-card profile-actions-card">
          <h4>{t('profile_account_manage')}</h4>
          <button className="logout-button" onClick={handleLogoutWithSound}>
            <i className="fa-solid fa-right-from-bracket"></i>
            {t('profile_logout')}
          </button>

          <div className="danger-zone">
            <h4>{t('profile_danger_zone')}</h4>
            <button 
              className="danger-button" 
              onClick={() => { playClickSound();  }}
            >
              {t('profile_reset_progress')}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Profile;