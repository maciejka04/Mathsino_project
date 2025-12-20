import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getAvatarUrl } from '../../utils/avatarHelper';
import clickSound from '../../assets/mouse-click.mp3';

const API_URL = "http://localhost:5126";

function GlobalRanking() {
  const { t } = useTranslation();
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all'); 

  const playClickSound = () => {
    const audio = new Audio(clickSound);
    audio.play().catch(err => console.error("Błąd odtwarzania dźwięku:", err));
  };

  const handleTabChange = (newPeriod) => {
    if (newPeriod !== period) {
      playClickSound();
      setPeriod(newPeriod);
    }
  };

  useEffect(() => {
    const fetchGlobalRanking = async () => {
      setLoading(true);
      try {
        let endpoint = "/users/ranking/global";
        if (period === 'weekly') endpoint = "/users/ranking/weekly";
        if (period === 'monthly') endpoint = "/users/ranking/monthly";

        const response = await fetch(`${API_URL}${endpoint}`);
        if (!response.ok) throw new Error(`Błąd: ${response.status}`);
        const data = await response.json();
        setRanking(data);
      } catch (err) {
        console.error("Global Ranking error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalRanking();
  }, [period]); 

  return (
    <div className="ranking-card-container global-rank">
      <div className="ranking-header">
        <div className="header-title-row">
          <i className="fa-solid fa-earth-americas"></i>
          <h3>{t('global_ranking_title', 'Global Top 10')}</h3>
        </div>
        
        <div className="ranking-tabs">
          <button 
            className={period === 'all' ? 'tab-btn active' : 'tab-btn'} 
            onClick={() => handleTabChange('all')}
          >
            {t('ranking_period_all', 'All')}
          </button>
          <button 
            className={period === 'weekly' ? 'tab-btn active' : 'tab-btn'} 
            onClick={() => handleTabChange('weekly')}
          >
            {t('ranking_period_weekly', 'Weekly')}
          </button>
          <button 
            className={period === 'monthly' ? 'tab-btn active' : 'tab-btn'} 
            onClick={() => handleTabChange('monthly')}
          >
            {t('ranking_period_monthly', 'Monthly')}
          </button>
        </div>
      </div>

      <div className="ranking-list">
        {loading ? (
          <div className="ranking-loader-small">{t('loading')}...</div>
        ) : ranking.length === 0 ? (
          <p className="no-data-text">{t('no_ranking_data', 'No data for this period')}</p>
        ) : (
          ranking.map((player, index) => {
            const name = player.userName || player.UserName || 'Unknown';
            const avatarPath = player.avatarPath || player.AvatarPath;
            const peak = player.peakBalance || player.PeakBalance || 5000;
            const avatarUrl = getAvatarUrl(avatarPath);

            return (
              <div key={player.id || index} className={`ranking-item rank-${index + 1}`}>
                <div className="rank-badge">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                </div>
                
                <div className="avatar-wrapper">
                  <img src={avatarUrl} className="rank-avatar" alt="avatar" onError={(e) => e.target.src = 'snake.png'} />
                </div>

                <div className="rank-info">
                  <span className="rank-username">{name}</span>
                  <span className="rank-peak-value">
                    {t('peak_label', 'Peak')}: <strong>{peak.toLocaleString()}</strong> <small>PLN</small>
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default GlobalRanking;