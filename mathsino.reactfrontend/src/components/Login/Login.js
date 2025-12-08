import React from 'react';
import { useTranslation } from 'react-i18next';
import './Login.css';
import audioService from '../../services/audioService';
import clickSound from '../../assets/mouse-click.mp3';

const playClickSound = () => {
  audioService.playSoundEffect(clickSound);
}

// Komponent Login przeznaczony do logowania przez OAuth (Google/Facebook)
function Login() {
  const { t } = useTranslation();
  // Funkcja, która docelowo przekieruje użytkownika do endpointu backendowego
  // np. /auth/google lub /auth/facebook, który rozpocznie proces OAuth.
 const handleLogin = (provider) => {
  console.log(`Rozpoczęto logowanie przez ${provider}`);
  
  // Zakładając, że Twój backend działa na https://localhost:5001 (lub http://localhost:5000)
  const BACKEND_URL = 'http://localhost:5126'; 
  
  // Przekierowanie użytkownika do endpointu backendowego
  // Backend obsłuży całą resztę OAuth i przekieruje z powrotem do frontendu
  window.location.href = `${BACKEND_URL}/api/auth/${provider}`;
};

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">{t('login_title')}</h2>
        <p className="login-subtitle">{t('login_subtitle')}</p>

        {/* Przycisk Logowania przez Google */}
        <button 
          className="social-button google-button" 
          onClick={() => { playClickSound(); handleLogin('google'); }}
        >
          <i className="fa-brands fa-google"></i>
          {t('login_google')}
        </button>

        {/* Przycisk Logowania przez Facebook */}
        <button 
          className="social-button facebook-button" 
          onClick={() => { playClickSound(); handleLogin('facebook'); }}
        >
          <i className="fa-brands fa-facebook-f"></i>
          {t('login_facebook')}
        </button>

        <p className="login-info">
          {t('login_info')}
        </p>
      </div>
    </div>
  );
}

export default Login;