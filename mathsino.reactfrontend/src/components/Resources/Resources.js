// src/components/Resources/Resources.js

import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTranslation as useI18n } from 'react-i18next';
import audioService from '../../services/audioService';
import musicService from '../../services/musicService';
import './Resources.css';
import './ResourcesMusic.css';
import clickSound from '../../assets/mouse-click.mp3';

const playClickSound = () => {
  audioService.playSoundEffect(clickSound);
};

function Resources() {
  const { user } = useOutletContext();
  const { t } = useTranslation();
  const { i18n } = useI18n();
  
  // Stany dla naszych ustawień
  const [soundEffects, setSoundEffects] = useState(true);
  const [music, setMusic] = useState(true);
  const [selectedMusic, setSelectedMusic] = useState(1);

  // Synchronizuj stan z audioService
  useEffect(() => {
    setSoundEffects(audioService.areSoundEffectsEnabled());
    setMusic(audioService.isMusicEnabled());
    setSelectedMusic(musicService.getCurrentMusic());
  }, []);

  // Obsługa zmiany efektów dźwiękowych
  const handleSoundEffectsChange = async () => {
    const newValue = !soundEffects;
    setSoundEffects(newValue);
    audioService.setSoundEffectsEnabled(newValue);
    
    // Zapisz ustawienie w backendzie
    if (user?.id) {
      try {
        await fetch(`http://localhost:5126/users/${user.id}/audio-settings`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            musicEnabled: music,
            soundEffectsEnabled: newValue 
          }),
        });
      } catch (e) {
        console.error('Failed to update audio settings', e);
      }
    }
  };

  // Obsługa zmiany muzyki
  const handleMusicChange = async () => {
    const newValue = !music;
    setMusic(newValue);
    audioService.setMusicEnabled(newValue);
    
    // Jeśli muzyka jest włączona, załaduj i odtwórz bieżący utwór
    if (newValue) {
      const currentMusicId = musicService.getCurrentMusic();
      audioService.changeBackgroundMusic(currentMusicId);
    }
    
    // Zapisz ustawienie w backendzie
    if (user?.id) {
      try {
        await fetch(`http://localhost:5126/users/${user.id}/audio-settings`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            musicEnabled: newValue,
            soundEffectsEnabled: soundEffects 
          }),
        });
      } catch (e) {
        console.error('Failed to update audio settings', e);
      }
    }
  };

  // Obsługa zmiany utworu muzycznego
  const handleMusicTrackChange = async (musicId) => {
    // Resetuj cały system audio przed zmianą
    audioService.resetAudioSystem();
    
    setSelectedMusic(musicId);
    audioService.changeBackgroundMusic(musicId);
    
    // Zapisz wybór w backendzie
    if (user?.id) {
      try {
        await fetch(`http://localhost:5126/users/${user.id}/music`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ musicId: musicId }),
        });
      } catch (e) {
        console.error('Failed to update music preference', e);
      }
    }
  };

  const changeLanguage = async (lng) => {
    i18n.changeLanguage(lng);
    if (user?.id) {
      try {
        await fetch(`http://localhost:5126/users/${user.id}/language`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language: lng }),
        });
      } catch (e) {
        console.error('Failed to update language', e);
      }
    }
  };

  return (
    <div className="settings-container">
      <header>
        <h1>{t('resources_title')}</h1>
        <p>{t('resources_subtitle')}</p>
      </header>

      <div className="settings-grid">

        {/* === Karta 1: Ustawienia === */}
        <div className="dashboard-card">
          <div className="setting-row">
            <div className="setting-label">
              <h4>{t('resources_sound_effects')}</h4>
              <p>{t('resources_sound_effects_desc')}</p>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={soundEffects}
                onChange={handleSoundEffectsChange}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-row">
            <div className="setting-label">
              <h4>{t('resources_music')}</h4>
              <p>{t('resources_music_desc')}</p>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={music}
                onChange={handleMusicChange}
              />
              <span className="slider"></span>
            </label>
          </div>

          
        </div>

        

        {/* === Karta 3: Wybór Muzyki === */}
        <div className="dashboard-card">
          <div className="setting-label">
            <h4>{t('resources_music_selection')}</h4>
            <p>{t('resources_music_selection_desc')}</p>
          </div>
          <div className="music-selection-buttons">
            <button 
              className={`music-btn ${selectedMusic === 1 ? 'active' : ''}`}
              onClick={() => { playClickSound(); handleMusicTrackChange(1); }}
            >
              1
            </button>
            <button 
              className={`music-btn ${selectedMusic === 2 ? 'active' : ''}`}
              onClick={() => { playClickSound(); handleMusicTrackChange(2); }}
            >
              2
            </button>
            <button 
              className={`music-btn ${selectedMusic === 3 ? 'active' : ''}`}
              onClick={() => { playClickSound(); handleMusicTrackChange(3); }}
            >
              3
            </button>
          </div>
        </div>

        {/* === Karta 4: Język === */}
        <div className="dashboard-card">
          <div className="setting-label">
            <h4>{t('resources_language')}</h4>
            <p>{t('resources_language_desc')}</p>
          </div>
          <div className="language-options">
            <button 
              className={`language-btn ${i18n.language === 'en' ? 'active' : ''}`}
              onClick={() => { playClickSound(); changeLanguage('en'); }}
            >
              EN
            </button>

            <button 
              className={`language-btn ${i18n.language === 'pl' ? 'active' : ''}`}
              onClick={() => { playClickSound(); changeLanguage('pl'); }}
            >
              PL
            </button>
          </div>
        </div>

        {/* === Karta 5: O Aplikacji === */}
        <div className="dashboard-card about-section">
           <div className="setting-label">
          <h4>{t('resources_about')}</h4>
          <p>
            Version 1.0.0 <br />
            
          </p>
          </div>
          <div className='about-links'>
            <a href="#">{t('resources_responsible_gaming')}</a> &middot; <a href="#">{t('resources_privacy_policy')}</a> &middot; <a href="#">{t('resources_terms_of_service')}</a>
          </div>
        </div>

        {/* === Karta 2: Zasoby === */}
        <div className="dashboard-card">
           <div className="setting-label">
          <h4>{t('resources_resources')}</h4>
          <p>{t('resources_resources_desc')}</p>
          </div>
          <a href="#" className="resource-link" onClick={playClickSound}>
            <span>{t('resources_how_to_play_blackjack')}</span>
            <i className="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
          <a href="#" className="resource-link" onClick={playClickSound}>
            <span>{t('resources_basic_strategy_chart')}</span>
            <i className="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
          <a href="#" className="resource-link" onClick={playClickSound}>
            <span>{t('resources_glossary_of_terms')}</span>
            <i className="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
        </div>

      </div>
    </div>
  );
}

export default Resources;