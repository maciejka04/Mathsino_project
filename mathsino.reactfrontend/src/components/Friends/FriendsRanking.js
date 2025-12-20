import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getAvatarUrl } from '../../utils/avatarHelper'; 

const API_URL = "http://localhost:5126";

function FriendsRanking({ userId }) {
  const { t } = useTranslation();
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchRanking = async () => {
      try {
        const response = await fetch(`${API_URL}/users/${userId}/friends/ranking`);
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const data = await response.json();
        setRanking(data);
      } catch (err) {
        console.error("FriendsRanking error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, [userId]);

  if (loading) return <div className="ranking-loader">{t('loading')}...</div>;

  return (
    <div className="ranking-card-container">
      <div className="ranking-header">
        <i className="fa-solid fa-crown"></i>
        <h3>{t('friends_ranking_title', 'Top 10 Friends')}</h3>
      </div>

      <div className="ranking-list">
        {ranking.length === 0 && (
          <p className="no-data-text">{t('no_friends_data', 'No friends in ranking yet')}</p>
        )}

        {ranking.map((player, index) => {
          const name = player.userName || player.UserName || 'Unknown';
          const avatarPath = player.avatarPath || player.AvatarPath;
          const peak = player.peakBalance || player.PeakBalance || 5000;
          
          const finalAvatarUrl = getAvatarUrl(avatarPath);

          return (
            <div key={player.id || index} className={`ranking-item rank-${index + 1}`}>
              <div className="rank-badge">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
              </div>
              
              <div className="avatar-wrapper">
                <img 
                  src={finalAvatarUrl} 
                  className="rank-avatar" 
                  alt="avatar"
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = 'snake.png'; 
                  }}
                />
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

export default FriendsRanking;