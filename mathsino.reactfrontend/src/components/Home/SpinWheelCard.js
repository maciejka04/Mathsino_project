import React, { useState, useEffect, useMemo, useRef } from 'react';
import './SpinWheelCard.css';
import clickSound from '../../assets/mouse-click.mp3';
import { useTranslation } from 'react-i18next';

const API_URL = "http://localhost:5126";
const COOLDOWN_MINUTES = 1;

const playClickSound = () => {
  const audio = new Audio(clickSound);
  audio.play();
};

export default function SpinWheelCard({ user, refreshUser }) {
  const { t } = useTranslation();
  
  const [segments] = useState([10, 20, 25, 30, 40, 50, 100]);
  
  const [cooldown, setCooldown] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showWheel, setShowWheel] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winText, setWinText] = useState('');
  
  const rewardRef = useRef(0); 
  const requestRef = useRef();
  const startTimeRef = useRef();
  const startRotationRef = useRef(0);
  const targetRotationRef = useRef(0);

  useEffect(() => {
    const savedCooldown = localStorage.getItem('spinCooldownUntil');
    if (!savedCooldown) return;
    const nextAvailable = new Date(savedCooldown);
    const remaining = nextAvailable.getTime() - Date.now();
    if (remaining > 0) {
      setCooldown(remaining);
    } else {
      localStorage.removeItem('spinCooldownUntil');
    }
  }, []);

  useEffect(() => {
    if (cooldown === null) return;
    const timer = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1000) {
          clearInterval(timer);
          localStorage.removeItem('spinCooldownUntil');
          return null;
        }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const animate = (timestamp) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp;
    const elapsed = timestamp - startTimeRef.current;
    const duration = 4000; 
    const progress = Math.min(elapsed / duration, 1);
    
    const eased = 1 - Math.pow(1 - progress, 3);
    const currentRotation = startRotationRef.current + (targetRotationRef.current - startRotationRef.current) * eased;
    
    setRotation(currentRotation);

    if (progress < 1) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      setWinText(`${t('you_won')}\n${rewardRef.current} PLN`);
      refreshUser(); 
    }
  };

  const handleSpin = async () => {
    if (!user?.id || cooldown > 0 || isLoading) return;
    
    playClickSound();
    setIsLoading(true);
    setWinText('');
    setShowWheel(true);

    try {
      const response = await fetch(`${API_URL}/user/${user.id}/spin-wheel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      
      const data = await response.json();

    if (response.ok) {
        const rewardIndex = data.rewardIndex; 
        rewardRef.current = data.reward; 

        const numSegments = segments.length;
        const segmentAngle = 360 / numSegments;
        const extraRotations = 360 * 8; 
        
        const currentRotationBase = rotation - (rotation % 360);
        
        const targetAngle = 360 - (rewardIndex * segmentAngle) - (segmentAngle / 2) - 90;

        startRotationRef.current = rotation;
        targetRotationRef.current = currentRotationBase + extraRotations + targetAngle;

        startTimeRef.current = null;
        requestRef.current = requestAnimationFrame(animate);

        const lastSpin = new Date(data.lastSpinTime);
        const nextAvailable = new Date(lastSpin.getTime() + COOLDOWN_MINUTES * 60000);
        setCooldown(nextAvailable.getTime() - Date.now());
        localStorage.setItem('spinCooldownUntil', nextAvailable.toISOString());
        
      } else {
        alert(data.message || "Błąd losowania");
        setShowWheel(false);
      }
    } catch (err) {
      console.error('Spin error', err);
      setShowWheel(false);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = useMemo(() => {
    if (!cooldown || cooldown <= 0) return null;
    const totalSeconds = Math.floor(cooldown / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
  }, [cooldown]);

  return (
    <>
      <div className="dashboard-card spin-wheel-card" style={{ gridColumn: 'span 2' }}>
        <div className="dashboard-card-text">
          <h4>{t('spin_wheel_title')}</h4>
          <p>{t('spin_wheel_desc')}</p>
        </div>
        <div className="spin-controls">
          <button
            className={`spin-button ${cooldown === null ? 'active' : 'inactive'}`}
            onClick={handleSpin}
            disabled={cooldown !== null || isLoading}
          >
            {isLoading ? '...' : t('spin_button')}
          </button>
          {cooldown && <div className="cooldown-timer">{t('cooldown_time_left')} {formatTime}</div>}
        </div>
      </div>

      {showWheel && (
        <div className="wheel-modal">
          <div className="wheel-container">
            <button className="wheel-close" onClick={() => setShowWheel(false)}>×</button>
            
            <div className="wheel-pointer">▼</div>

            <div
                className="wheel"
                style={{ transform: `rotate(${rotation}deg)` }}
                >
                {segments.map((val, i) => {
                    const angle = i * (360 / segments.length);
                    return (
                    <div
                        key={i}
                        className="wheel-segment"
                        style={{
                        transform: `rotate(${angle}deg)`,
                        backgroundColor: i % 2 === 0 ? '#2e7d32' : '#1b5e20',
                        }}
                    >
                        <span className="segment-value">
                        {val}
                        </span>
                    </div>
                    );
                })}
                </div>

            {winText && (
              <div className="wheel-win-text">
                <div className="you-won">{t('you_won')}</div>
                <div className="reward">{winText.split('\n')[1]}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}