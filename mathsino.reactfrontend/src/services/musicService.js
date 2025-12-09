// src/services/musicService.js

class MusicService {
  constructor() {
    this.currentMusic = null;
    this.tracks = {
      1: 'casino.mp3',
      2: 'gejowski_blues.mp3', 
      3: 'Trzy.mp3'
    };
  }

  getMusicTracks() {
    return this.tracks;
  }

  getCurrentMusic() {
    return this.currentMusic;
  }

  setMusic(musicId) {
    if (this.tracks[musicId]) {
      this.currentMusic = musicId;
      return true;
    }
    return false;
  }

  getMusicFile() {
    return this.tracks[this.currentMusic];
  }
}

// Singleton instance
const musicService = new MusicService();
export default musicService;
