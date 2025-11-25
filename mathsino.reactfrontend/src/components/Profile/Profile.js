// src/components/Profile/Profile.js

import React, { useState, useEffect } from 'react';
import './Profile.css';
// Zaimportuj swój domyślny awatar
import smok from '../../assets/profilowe_smok.png'; 
import panda from '../../assets/profilowe_panda.png'; 

const avatars = [smok, panda, panda, panda, panda, panda, panda];




function Profile() {

   const [selectedAvatar, setSelectedAvatar] = useState(panda);
  const [user, setUser] = useState({
    name: "",
    email: ""
  });

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

  return (
    <div className="profile-page-container">
      <header>
        <h1>Twój Profil</h1>
        <p>Zarządzaj swoim kontem i preferencjami.</p>
      </header>
      
      <div className="profile-grid">
        
        {/* Karta 1: Informacje o koncie */}
        <div className="dashboard-card profile-info-card">
          <h4>Informacje o koncie</h4>
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
          <h4>Wybierz awatar</h4>
          <p>Ten awatar będzie widoczny dla Ciebie i Twoich znajomych.</p>
          <div className="avatar-grid">
            {avatars.map((avatarSrc, index) => (
              <img 
                key={index}
                src={avatarSrc}
                alt={`Awatar ${index + 1}`}
                className={selectedAvatar === avatarSrc ? 'avatar-option active' : 'avatar-option'}
                onClick={() => setSelectedAvatar(avatarSrc)}
              />
            ))}
          </div>
        </div>

        {/* Karta 3: Zarządzanie kontem */}
        <div className="dashboard-card profile-actions-card">
          <h4>Zarządzanie kontem</h4>
          <button className="logout-button" onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket"></i>
            Wyloguj się
          </button>
          
          <div className="danger-zone">
            <h4>Strefa zagrożenia</h4>
            <button className="danger-button">
              Zresetuj postępy
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Profile;