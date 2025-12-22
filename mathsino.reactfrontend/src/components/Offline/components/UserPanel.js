// src/pages/Offline/components/UserPanel.js
import React from "react";
import defaultAvatar from "../../../assets/profilepic/snake.png";

const UserPanel = ({ user, t, isTrainerEnabled, setIsTrainerEnabled, onExit }) => {
  return (
    <>
      <button
        className="back-button"
        onClick={onExit}
      >
        &#8592; {t('exit')}
      </button>

      <div className="user-info-panel">
        <img
          src={user.avatarUrl || defaultAvatar}
          alt={t('offline_avatar_alt')}
          className="user-avatar"
        />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="user-name">{user?.name || t('offline_guest')}</span>

          {/* --- PRZYCISK TRENERA (ON/OFF) --- */}
          <div
            onClick={() => setIsTrainerEnabled(!isTrainerEnabled)}
            style={{
              marginTop: '5px',
              padding: '4px 8px',
              borderRadius: '15px',
              background: isTrainerEnabled ? '#2ecc71' : '#e74c3c',
              color: 'white',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              textAlign: 'center',
              boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
              transition: 'all 0.3s'
            }}
          >
            {t('trainer') || "Trener"}: {isTrainerEnabled ? "ON" : "OFF"}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserPanel;