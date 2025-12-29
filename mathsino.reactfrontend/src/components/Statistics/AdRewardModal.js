import React from 'react';

export const AdRewardModal = ({
    showAd,
    showConfirmModal,
    timeLeft,
    rewardAmount,
    onClose,
    onConfirmClose,
    onCancelClose,
    t,
}) => {
    if (!showAd) return null;

    return (
        <>
            {showConfirmModal && (
                <div className="modal-overlay">
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 style={{ color: '#ff4d4d' }}>{t('ad_warning_title')}</h2>
                        <p style={{ color: '#DDD', fontSize: '1.1rem' }}>
                            {t('ad_warning_desc', { amount: rewardAmount })}
                            <br />
                            {t('ad_warning_question')}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px' }}>
                            <button
                                className="danger-button"
                                onClick={onConfirmClose}
                                style={{ border: 'none' }}
                            >
                                {t('ad_exit_button')}
                            </button>
                            <button
                                className="logout-button"
                                onClick={onCancelClose}
                                style={{ marginLeft: '10px' }}
                            >
                                {t('ad_continue_button')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {!showConfirmModal && (
                <div className="ad-overlay">
                    <div className="ad-content">
                        <button className="ad-close-button" onClick={onClose}>
                            x
                        </button>
                        <p>{t('ad_reward_info', { amount: rewardAmount })}</p>
                        <p>{t('ad_timer', { seconds: timeLeft })}</p>

                        <div className="fake-ad-box">
                            <i className="fa-solid fa-gem" style={{ fontSize: '3rem', color: '#ffd700' }} />
                            <h2>{t('ad_promo_title')}</h2>
                            <p>{t('ad_promo_desc')}</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};