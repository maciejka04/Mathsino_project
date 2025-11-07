// src/components/Profile/Profile.js

import React, { useState } from 'react';
import './Profile.css';
// Zaimportuj swój domyślny awatar
import currentAvatar from '../../assets/profilowe_smok.png'; 

// === WAŻNE ===
// Musisz dodać 7 plików awatarów do folderu 'src/assets/avatars/'
// i odkomentować/dostosować te importy:

// import avatar1 from '../../assets/avatars/avatar1.png';
// import avatar2 from '../../assets/avatars/avatar2.png';
// import avatar3 from '../../assets/avatars/avatar3.png';
// import avatar4 from '../../assets/avatars/avatar4.png';
// import avatar5 from '../../assets/avatars/avatar5.png';
// import avatar6 from '../../assets/avatars/avatar6.png';
// import avatar7 from '../../assets/avatars/avatar7.png';

// Na razie, aby kod działał, użyjemy tablicy z domyślnym awatarem
// Zastąp ją, gdy dodasz prawdziwe awatary:
// const avatars = [currentAvatar, avatar1, avatar2, avatar3, avatar4, avatar5, avatar6, avatar7];
const avatars = [currentAvatar, currentAvatar, currentAvatar, currentAvatar, currentAvatar, currentAvatar, currentAvatar];


function Profile() {
  // Później ten stan będzie zapisywany na serwerze,
  // ale na razie zarządzamy nim lokalnie.
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);

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
          <h3>User</h3> {/* Docelowo z Google */}
          <p>user.email@gmail.com</p> {/* Docelowo z Google */}
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
          <button className="logout-button">
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