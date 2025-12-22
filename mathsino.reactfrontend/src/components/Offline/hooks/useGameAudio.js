// src/pages/Offline/hooks/useGameAudio.js
import { useEffect, useRef } from 'react';
import shuffleSound from "../../../assets/shuffling-cards.mp3";
import winSound from "../../../assets/win.mp3";
import loseSound from "../../../assets/lose.mp3";
import pushSound from "../../../assets/push.mp3";
import blackjackSound from "../../../assets/blackjack.mp3";
import fireworksSound from "../../../assets/fireworks.mp3";
import clickSound from '../../../assets/mouse-click.mp3';
import audioService from "../../../services/audioService";

export const useGameAudio = () => {
  const shuffleAudio = useRef(null);
  const winAudio = useRef(null);
  const loseAudio = useRef(null);
  const pushAudio = useRef(null);
  const blackjackAudio = useRef(null);
  const fireworksAudio = useRef(null);

  useEffect(() => {
    shuffleAudio.current = new Audio(shuffleSound);
    winAudio.current = new Audio(winSound);
    loseAudio.current = new Audio(loseSound);
    pushAudio.current = new Audio(pushSound);
    blackjackAudio.current = new Audio(blackjackSound);
    fireworksAudio.current = new Audio(fireworksSound);

    shuffleAudio.current.volume = 0.8;
    winAudio.current.volume = 1.0;
    loseAudio.current.volume = 0.6;
    pushAudio.current.volume = 0.9;
    blackjackAudio.current.volume = 1.0;
    fireworksAudio.current.volume = 0.7;
  }, []);

  const playClick = () => {
    audioService.playSoundEffect(clickSound);
  };
  
  const playShuffle = () => audioService.playSoundEffect(shuffleSound);
  const playWin = () => audioService.playSoundEffect(winSound);
  const playLose = () => audioService.playSoundEffect(loseSound);
  const playPush = () => audioService.playSoundEffect(pushSound);
  const playBlackjack = () => {
      audioService.playSoundEffect(blackjackSound);
      audioService.playSoundEffect(fireworksSound);
  };

  return {
    playClick,
    playShuffle,
    playWin,
    playLose,
    playPush,
    playBlackjack
  };
};