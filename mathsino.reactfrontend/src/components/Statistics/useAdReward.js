import { useState, useEffect, useRef } from 'react';

const API_URL = "http://localhost:5126";

export const useAdReward = (userId, onRewardClaimed, t) => {
    const [adToken, setAdToken] = useState(null);
    const [isDisabled, setIsDisabled] = useState(false);
    const [showAd, setShowAd] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [rewardAmount, setRewardAmount] = useState(0);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        if (showAd && timeLeft > 0 && !isPaused) {
            const id = setInterval(() => {
                setTimeLeft((prevTime) => prevTime - 1);
            }, 1000);
            intervalRef.current = id;
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [showAd, timeLeft, isPaused]);


    useEffect(() => {
        if (showAd && timeLeft === 0 && userId && adToken) {
            const giveReward = async () => {
                try {
                    const response = await fetch(`${API_URL}/user/${userId}/claim-ad-reward`, {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token: adToken }),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (onRewardClaimed) {
                            onRewardClaimed(data);
                        }
                    } else {
                        const errorData = await response.json();
                        alert(errorData.message || t('ad_error_reward'));
                    }
                } catch (error) {
                    console.error('Network error:', error);
                    alert(t('ad_error_network'));
                }

                setShowAd(false);
                setAdToken(null);
                setTimeout(() => setIsDisabled(false), 60000);
            };

            giveReward();
        }
    }, [showAd, timeLeft, userId, adToken, onRewardClaimed, t]);

    const handleWatchAd = async () => {
        if (isDisabled || showAd || !userId) return;

        try {
            const response = await fetch(`${API_URL}/user/${userId}/start-ad-view`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.message || 'Nie można rozpocząć oglądania reklamy');
                return;
            }

            const data = await response.json();

            setAdToken(data.token);
            setRewardAmount(data.rewardAmount);
            setTimeLeft(20);
            setShowAd(true);
            setIsDisabled(true);
            setIsPaused(false);
        } catch (error) {
            console.error('Error starting ad:', error);
            alert('Błąd połączenia z serwerem');
        }
    };

    const handleCloseAd = () => {
        setIsPaused(true);
        setShowConfirmModal(true);
    };

    const confirmCloseAd = () => {
        setShowConfirmModal(false);
        setShowAd(false);
        setTimeLeft(0);
        setIsPaused(false);
        setIsDisabled(false);
        setAdToken(null);
    };

    const cancelCloseAd = () => {
        setShowConfirmModal(false);
        setIsPaused(false);
    };

    return {
        isDisabled,
        showAd,
        timeLeft,
        rewardAmount,
        showConfirmModal,
        handleWatchAd,
        handleCloseAd,
        confirmCloseAd,
        cancelCloseAd,
    };
};