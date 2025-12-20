import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getAvatarUrl } from '../../utils/avatarHelper';

const API_URL = "http://localhost:5126";

function GlobalRanking() {
  const { t } = useTranslation();
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGlobalRanking = async () => {
      try {
        const response = await fetch(`${API_URL}/users/ranking/global`);
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
  }, []);

  if (loading) return <div className="ranking-loader">{t('loading')}...</div>;

  return (
    <div className="ranking-card-container global-rank">
      <div className="ranking-header">
        <i className="fa-solid fa-earth-americas"></i>
        <h3>{t('global_ranking_title', 'Global Top 10')}</h3>
      </div>

      <div className="ranking-list">
        {ranking.map((player, index) => {
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
                  Peak: <strong>{peak.toLocaleString()}</strong> <small>PLN</small>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default GlobalRanking;