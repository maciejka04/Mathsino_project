import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { getAvatarUrl } from '../../utils/avatarHelper'; 
import './FriendProfile.css';
import FriendStatistics from './FriendStatistics';
import clickSound from '../../assets/mouse-click.mp3';

const API_URL = "http://localhost:5126";

const playClickSound = () => {
  const audio = new Audio(clickSound);
  audio.play();
}

function FriendProfile() {
    const { t } = useTranslation();
    const { friendId } = useParams();
    const { user } = useOutletContext();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFriendProfile = async () => {
            if (!friendId) {
                navigate('/friends'); 
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`${API_URL}/users/${friendId}`); 
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || t('profile_not_found') || 'User profile not found');
                }

                const data = await response.json();
                
                setProfile({
                    id: data.id,
                    displayName: `${data.firstName} ${data.lastName}`, 
                    userName: `@${data.userName}`,
                    avatarUrl: getAvatarUrl(data.avatarPath),
                });
            } catch (err) {
                console.error('Error fetching friend profile:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFriendProfile();
    }, [friendId, navigate, t]);

    if (loading) {
        return (
            <div className="profile-container">
                <p>{t('loading_profile') || 'Loading profile...'}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-container">
                <p style={{ color: 'red' }}>
                    {t('error') || 'Error'}: {error}
                </p>
                <button onClick={() => navigate('/friends')}>
                    {t('back_to_friends') || 'Back to Friends'}
                </button>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="profile-container">
                <p>{t('profile_not_found')}</p>
            </div>
        );
    }

    return (
        <div className="profile-container card-style">
            
            <button 
                onClick={() => { playClickSound(); navigate('/friends'); }}
                className="back-button"
            >
                &larr; {t('back_to_friends') || 'Back to Friends'}
            </button>

            <div className="profile-header">
                <img
                    src={profile.avatarUrl}
                    alt={`${profile.displayName} avatar`}
                    className="large-avatar"
                />
                
                <div> 
                    <h1 className="profile-name">{profile.displayName}</h1>
                    <p className="profile-username">{profile.userName}</p>
                </div>
            </div>
            
            <div className="profile-details">
                {user?.id && profile && (
                    <FriendStatistics 
                        friendId={friendId} 
                        currentUserId={user.id} 
                        profile={profile}
                    />
                )}
            </div>
        </div>
    );
}

export default FriendProfile;