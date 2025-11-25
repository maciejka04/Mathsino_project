// src/components/PrivacyPolicy/PrivacyPolicy.js
import React from 'react';

function PrivacyPolicy() {
  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', color: '#f0f0f0', backgroundColor: '#1e1e1e', minHeight: '100vh' }}>
      <h1>Polityka Prywatności Mathsino</h1>
      <p>Data wejścia w życie: 21 listopada 2025 r.</p>
      
      <h2>1. Jakie dane zbieramy?</h2>
      <p>Korzystając z logowania przez Google lub Facebook, zbieramy następujące dane osobowe:</p>
      <ul>
        <li>**Adres e-mail** (do celów identyfikacji konta).</li>
        <li>**Imię i nazwisko** lub nazwa użytkownika (do personalizacji konta).</li>
        <li>**Unikalny identyfikator** nadany przez dostawcę (Google ID lub Facebook ID).</li>
      </ul>

      <h2>2. Jak wykorzystujemy Twoje dane?</h2>
      <p>Dane są używane wyłącznie w celu:</p>
      <ul>
        <li>Uwierzytelnienia Cię w aplikacji Mathsino.</li>
        <li>Utrzymania Twojego stanu logowania i zapisywania postępów.</li>
        <li>Personalizacji doświadczeń w aplikacji (np. wyświetlania Twojego imienia).</li>
      </ul>

      <h2>3. Usunięcie Danych</h2>
      <p>Jeśli chcesz usunąć swoje dane, postępuj zgodnie z instrukcjami dostępnymi pod poniższym linkiem:</p>
      <p><a href="/data-deletion" style={{ color: '#1877f2' }}>Instrukcje usunięcia danych</a></p>
    </div>
  );
}

export default PrivacyPolicy;