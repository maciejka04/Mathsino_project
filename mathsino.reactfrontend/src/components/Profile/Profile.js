// src/components/Profile/Profile.js

import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import './Profile.css';
import { useTranslation } from 'react-i18next';

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

const API_URL = "http://localhost:5126";  // ⬅️ DODANE

const AVATAR_MAP = {
  'snake.png': snake,
  'mouse.png': mouse,
  'racoon.png': racoon,
  'boar.png': boar,
  'owl.png': owl,
  'fox.png': fox,
};

const avatars = [snake, mouse, racoon, boar, owl, fox];

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
    id: null,      // ⬅️ DODANE
    name: "",
    email: "",
    userName: ""
  });

  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState(null);

  const handleAvatarSelect = (avatarSrc) => {
    setSelectedAvatar(avatarSrc);
    setPendingAvatar(getAvatarFilename(avatarSrc));
    setSaveStatus('Oczekuje na zapis...');
  };

  const handleAvatarSave = async () => {
    setSaveStatus('Zapisywanie...');
    try {
      const response = await fetch(`${API_URL}/api/user/avatar`, {
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

  const checkUsernameAvailability = async (username) => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    if (username === user.userName) {
      setUsernameAvailable(null);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/users/user-name/available/${username}`
      );
      const data = await response.json();
      setUsernameAvailable(data.available);
    } catch (error) {
      console.error('Error checking username availability:', error);
    }
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setNewUsername(value);

    clearTimeout(window.usernameCheckTimeout);
    window.usernameCheckTimeout = setTimeout(() => {
      checkUsernameAvailability(value);
    }, 500);
  };

  const handleUsernameSave = async () => {
    if (!newUsername || newUsername.length < 3) {
      setUsernameStatus('Username must be at least 3 characters');
      return;
    }

    if (newUsername === user.userName) {
      setIsEditingUsername(false);
      return;
    }

    setUsernameStatus('Saving...');

    try {
      const response = await fetch(
        `${API_URL}/users/${user.id}/user-name/${newUsername}`,
        { method: 'PUT' }
      );

      const data = await response.json();

      if (response.ok) {
        setUsernameStatus('Username changed successfully! ✅');
        setUser({ ...user, userName: newUsername });
        setIsEditingUsername(false);

        if (refreshUser) {
          refreshUser();
        }
      } else {
        setUsernameStatus(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error saving username:', error);
      setUsernameStatus('Connection error ❌');
    }
  };

  const handleUsernameCancel = () => {
    setIsEditingUsername(false);
    setNewUsername(user.userName);
    setUsernameStatus('');
    setUsernameAvailable(null);
  };

  const handleUsernameEdit = () => {
    setIsEditingUsername(true);
    setNewUsername(user.userName);
    setUsernameStatus('');
    setUsernameAvailable(null);
  };

  // Pobranie danych zalogowanego użytkownika
  useEffect(() => {
    fetch(`${API_URL}/api/auth/profile`, {
      method: "GET",
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        console.log("Profile API response:", data);
        setUser({
          id: data.userId,
          name: data.userName,
          email: data.email,
          userName: data.userNameTag
        });

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
      await fetch(`${API_URL}/api/auth/logout`, {
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

          {!isEditingUsername ? (
            <div className="username-display">
              <h3>@{user.userName}</h3>
              <button
                className="edit-username-btn-text"
                onClick={() => {
                  playClickSound();
                  handleUsernameEdit();
                }}
              >
                {t('profile_edit_username') || 'Edit'}
              </button>
            </div>
          ) : (
            <div className="username-edit">
              <input
                type="text"
                value={newUsername}
                onChange={handleUsernameChange}
                className="username-input"
                placeholder="Enter new username"
                maxLength={30}
                pattern="[a-zA-Z0-9_.]+"
              />

              {usernameAvailable !== null && (
                <span className={`availability-indicator ${usernameAvailable ? 'available' : 'taken'}`}>
                  {usernameAvailable ? '✅ Available' : '❌ Taken'}
                </span>
              )}

              <div className="username-edit-buttons">
                <button
                  className="save-username-btn"
                  onClick={() => {
                    playClickSound();
                    handleUsernameSave();
                  }}
                  disabled={!newUsername || newUsername.length < 3 || usernameAvailable === false}
                >
                  Save
                </button>
                <button
                  className="cancel-username-btn"
                  onClick={() => {
                    playClickSound();
                    handleUsernameCancel();
                  }}
                >
                  Cancel
                </button>
              </div>

              {usernameStatus && (
                <p className="username-status">{usernameStatus}</p>
              )}
            </div>
          )}

          <p className="user-email">{user.email}</p>
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
        {/* Karta 3: Zarządzanie kontem - POZA GRID (jak było wcześniej) */}
        <div className="dashboard-card profile-actions-card" style={{ marginTop: '24px' }}>
          <h4>{t('profile_account_manage')}</h4>
          <button className="logout-button" onClick={handleLogoutWithSound}>
            <i className="fa-solid fa-right-from-bracket"></i>
            {t('profile_logout')}
          </button>

          <div className="danger-zone">
            <h4>{t('profile_danger_zone')}</h4>
            <button
              className="danger-button"
              onClick={() => { playClickSound(); }}
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