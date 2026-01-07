import { useEffect, useRef } from 'react';
// Importujemy Twój globalny serwis audio
import audioService from '../../../services/audioService'; 
import cardSoundFile from "../../../assets/cards_thrown_2.mp3"; 

export const useCardSoundEffects = (playerCards, dealerCards, splitCards, gameStatus) => {
    const prevPlayerLen = useRef(0);
    const prevDealerLen = useRef(0);
    const prevSplitLen = useRef(0);
    const prevGameStatus = useRef(gameStatus);

    const playSound = () => {
        // --- SPRAWDZENIE GLOBALNYCH USTAWIEŃ ---
        // Jeśli w Resources wyłączono dźwięki, ta funkcja zwróci false i dźwięk się nie zagra
        if (!audioService.areSoundEffectsEnabled()) return;
        // ----------------------------------------

        const snd = new Audio(cardSoundFile);
        snd.volume = 0.5;
        snd.play().catch(e => console.error("Audio play error", e));
    };

    // 1. Dźwięk dla gracza (Hit)
    useEffect(() => {
        if (playerCards.length > prevPlayerLen.current && playerCards.length > 2) {
            playSound();
        }
        prevPlayerLen.current = playerCards.length;
    }, [playerCards]);

    // 2. Dźwięk dla krupiera
    useEffect(() => {
        const currentLen = dealerCards.length;
        const prevLen = prevDealerLen.current;

        // A. Flip
        if (prevGameStatus.current === 'InProgress' && gameStatus !== 'InProgress' && currentLen >= 2) {
             playSound();
        }

        // B. Dobieranie (Loop dla wielu kart)
        if (currentLen > prevLen) {
            const diff = currentLen - prevLen;
            for (let i = 0; i < diff; i++) {
                if ((prevLen + i + 1) > 2) {
                    setTimeout(() => {
                        playSound();
                    }, i * 400); 
                }
            }
        }

        prevDealerLen.current = currentLen;
        prevGameStatus.current = gameStatus; 
    }, [dealerCards, gameStatus]);

    // 3. Dźwięk dla splitu
    useEffect(() => {
        const currentLen = splitCards ? splitCards.length : 0;
        if (currentLen > prevSplitLen.current) {
            if (currentLen > 1) { 
                playSound();
            }
        }
        prevSplitLen.current = currentLen;
    }, [splitCards]);
};