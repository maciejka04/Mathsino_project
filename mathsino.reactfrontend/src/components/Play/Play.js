// src/components/Play/Play.js (PEŁNY, POPRAWNY KOD)

import React, { useEffect, useRef } from 'react';
import './Play.css';
import offline from '../../assets/singleplayer.png';
import online from '../../assets/multiplayer.png';
import { Link } from 'react-router-dom';

function Play() {
  // 1. Hook useRef jest potrzebny
  const cardContainerRef = useRef(null);

  // 2. Cała logika animacji kart musi być tutaj, wewnątrz useEffect
  useEffect(() => {
    // Sprawdzenie, czy ref już istnieje
    if (!cardContainerRef.current) {
      return;
    }
    
    const cards = cardContainerRef.current.querySelectorAll('.card');

    const mouseMoveHandler = (e) => {
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateY = (x / rect.width - 0.5) * 10;
      const rotateX = (y / rect.height - 0.5) * -10;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
      card.style.transition = 'transform 0s';
    };

    const mouseLeaveHandler = (e) => {
      const card = e.currentTarget;
      card.style.transform = 'translateY(0) scale(1)';
      card.style.transition = 'transform 0.5s ease';
    };

    cards.forEach(card => {
      card.addEventListener('mousemove', mouseMoveHandler);
      card.addEventListener('mouseleave', mouseLeaveHandler);
    });

    // Funkcja czyszcząca
    return () => {
      cards.forEach(card => {
        card.removeEventListener('mousemove', mouseMoveHandler);
        card.removeEventListener('mouseleave', mouseLeaveHandler);
      });
    };
  }, []); // Pusta tablica = uruchom tylko raz

return (
    // 3. 'ref' musi być podpięty do kontenera
    <div className="card-container" ref={cardContainerRef}>
      
      {/* === 1. Karta Offline (Używamy <Link> zamiast <div> i onClick) === */}
      <Link to="/offline" className="card-link">
        <div className="card">
          <div className="card-info">
            <img src={offline} alt="Play Offline" />
          </div>
        </div>
      </Link>
      
      {/* === 2. Karta Online (Używamy <Link> zamiast <div> i onClick) === */}
      <Link to="/online" className="card-link">
        <div className="card">
          <div className="card-info">
            <img src={online} alt="Play Online" />
          </div>
        </div>
      </Link>
      
    </div>
  );
}

export default Play;
