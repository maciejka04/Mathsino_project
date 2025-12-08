import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './Play.css';
import online from '../../assets/singleplayer.png';
import { Link } from 'react-router-dom';
import audioService from '../../services/audioService';
import clickSound from '../../assets/mouse-click.mp3';

const playClickSound = () => {
  audioService.playSoundEffect(clickSound);
}

function Play() {
  const { t } = useTranslation();
  const cardContainerRef = useRef(null);

  useEffect(() => {
    if (!cardContainerRef.current) return;

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

    return () => {
      cards.forEach(card => {
        card.removeEventListener('mousemove', mouseMoveHandler);
        card.removeEventListener('mouseleave', mouseLeaveHandler);
      });
    };
  }, []);

  return (
    <div className="card-container" ref={cardContainerRef}>
      <Link 
        to="/online" 
        className="card-link"
        onClick={playClickSound}
      >
        <div className="card">
          <div className="card-info">
            <img src={online} alt={t('play_online_alt')} />
          </div>
        </div>
      </Link>
    </div>
  );
}

export default Play;
