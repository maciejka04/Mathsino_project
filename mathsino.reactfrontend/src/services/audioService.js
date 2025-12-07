// src/services/audioService.js
import musicService from './musicService';

class AudioService {
  constructor() {
    this.backgroundMusic = null;
    this.soundEffectsEnabled = true;
    this.musicEnabled = true;
    this.isInitialized = false;
    this.initBackgroundMusic();
  }

  initBackgroundMusic() {
    if (this.isInitialized) return; // Zapobiegaj wielokrotnej inicjalizacji
    
    // Import muzyki tła z musicService
    const musicFile = musicService.getMusicFile();
    import(`../assets/${musicFile}`).then(module => {
      this.backgroundMusic = new Audio(module.default);
      this.backgroundMusic.loop = true;
      this.backgroundMusic.volume = 0.3;
      this.isInitialized = true;
      
      
    }).catch(err => {
      console.log("Background music file not found:", err);
    });
  }

  playBackgroundMusic() {
    if (this.musicEnabled && this.backgroundMusic) {
      this.backgroundMusic.play().catch(e => console.log("Music play blocked", e));
    }
  }

  pauseBackgroundMusic() {
    this.stopAllMusic();
  }

  setMusicEnabled(enabled) {
    this.musicEnabled = enabled;
    if (enabled) {
      this.playBackgroundMusic();
    } else {
      this.pauseBackgroundMusic();
    }
  }

  setSoundEffectsEnabled(enabled) {
    this.soundEffectsEnabled = enabled;
  }

  playSoundEffect(soundFile) {
    if (!this.soundEffectsEnabled) return;
    
    const audio = new Audio(soundFile);
    audio.volume = 0.5;
    audio.play().catch(e => console.log("Sound effect play blocked", e));
  }

  isMusicEnabled() {
    return this.musicEnabled;
  }

  areSoundEffectsEnabled() {
    return this.soundEffectsEnabled;
  }

  // Inicjalizuj stan audio z backendu
  initializeAudioSettings(musicEnabled, soundEffectsEnabled) {
    this.musicEnabled = musicEnabled;
    this.soundEffectsEnabled = soundEffectsEnabled;
    
    // Jeśli muzyka jest włączona i załadowana, odtwórz
    if (musicEnabled && this.backgroundMusic) {
      this.backgroundMusic.play().catch(e => console.log("Music play blocked", e));
    } else if (!musicEnabled && this.backgroundMusic) {
      // Zatrzymaj tylko jeśli muzyka ma być wyłączona
      this.stopAllMusic();
    }
  }

  // Resetuj cały system audio - używane przy zmianach z Resources
resetAudioSystem() {
    // Zatrzymaj WSZYSTKIE instancje audio agresywnie
    this.stopAllMusic();
    
    // Wyczyść główną instancję
    if (this.backgroundMusic) {
      this.backgroundMusic.src = '';
      this.backgroundMusic = null;
    }
    
    // Znajdź i zniszcz wszelkie ukryte instancje
    const allAudio = document.querySelectorAll('audio');
    allAudio.forEach(audio => {
      if (audio.src && (audio.src.includes('mp3') || audio.src.includes('audio'))) {
        audio.pause();
        audio.currentTime = 0;
        audio.src = '';
        audio.remove(); // Usuń element z DOM
      }
    });
    
    // NIE resetuj isInitialized - pozwól na ponowne załadowanie muzyki
  }

  stopAllMusic() {
    // Zatrzymaj główną muzykę
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
    }
    
    // Zatrzymaj wszelkie inne instancje audio
    const allAudio = document.querySelectorAll('audio');
    allAudio.forEach(audio => {
      if (audio.src && (audio.src.includes('mp3') || audio.src.includes('audio'))) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
  }

  changeBackgroundMusic(musicId) {
  // Nie czekaj na inicjalizację - system powinien być już gotowy
  const shouldPlay = this.musicEnabled; // Sprawdzaj ustawienie zamiast stanu starej muzyki
  
  // Zatrzymaj i wyczyść aktualną muzykę
  this.stopAllMusic();
  this.backgroundMusic = null;

  // Ustaw nową muzykę w musicService
  if (musicService.setMusic(musicId)) {
    // Załaduj nową muzykę
    const musicFile = musicService.getMusicFile();
    import(`../assets/${musicFile}`).then(module => {
      this.backgroundMusic = new Audio(module.default);
      this.backgroundMusic.loop = true;
      this.backgroundMusic.volume = 0.3;
      
      if (shouldPlay) {
        this.backgroundMusic.play().catch(e => console.log("Music play blocked", e));
      }
    }).catch(err => {
      console.log("Background music file not found:", err);
    });
  }
}
}

// Singleton instance
const audioService = new AudioService();
export default audioService;
