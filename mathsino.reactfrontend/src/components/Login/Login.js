import React from 'react';
import './Login.css';

// Komponent Login przeznaczony do logowania przez OAuth (Google/Facebook)
function Login() {
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
        <h2 className="login-title">Zaloguj się, aby kontynuować</h2>
        <p className="login-subtitle">Osiągaj postępy i zapisuj swoje wyniki.</p>

        {/* Przycisk Logowania przez Google */}
        <button 
          className="social-button google-button" 
          onClick={() => handleLogin('google')}
        >
          <i className="fa-brands fa-google"></i>
          Zaloguj się z Google
        </button>

        {/* Przycisk Logowania przez Facebook */}
        <button 
          className="social-button facebook-button" 
          onClick={() => handleLogin('facebook')}
        >
          <i className="fa-brands fa-facebook-f"></i>
          Zaloguj się z Facebook
        </button>

        <p className="login-info">
          Kontynuując, zgadzasz się na naszą Politykę Prywatności.
        </p>
      </div>
    </div>
  );
}

export default Login;