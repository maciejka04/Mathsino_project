import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './Friends.css';

import defaultAvatar from '../../assets/profilepic/snake.png';
import clickSound from '../../assets/mouse-click.mp3';
import { getAvatarUrl, DEFAULT_AVATAR } from '../../utils/avatarHelper';
import { useOutletContext, useNavigate } from 'react-router-dom';

const playClickSound = () => {
  const audio = new Audio(clickSound);
  audio.play();
}

const API_URL = "http://localhost:5126";

function Friends() {
  const { t } = useTranslation();
  const { user, refreshUser } = useOutletContext();
  const navigate = useNavigate();

  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const hasFetched = useRef(false);

  useEffect(() => {
    if (!user?.id || hasFetched.current) {
      return;
    }

    hasFetched.current = true;

    const loadAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchFriends(),
          fetchRequests(),
          fetchSentRequests()
        ]);
        setError(null);
      } catch (err) {
        console.error('Error loading friends data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, [user?.id]);

  const fetchFriends = async () => {
    if (!user?.id) return;

    const response = await fetch(`${API_URL}/friends/${user.id}`);
    if (!response.ok) throw new Error('Failed to fetch friends');

    const data = await response.json();
    const mappedFriends = data.map(friend => ({
      id: friend.id,
      name: `${friend.firstName} ${friend.lastName}`,
      online: false,
      avatarUrl: getAvatarUrl(friend.avatarPath)
    }));

    setFriends(mappedFriends);
  };

  const fetchRequests = async () => {
    if (!user?.id) return;

    const response = await fetch(`${API_URL}/friends/${user.id}/requests`);
    if (!response.ok) throw new Error('Failed to fetch requests');

    const data = await response.json();
    const mappedRequests = data.map(sender => ({
      id: sender.id,
      name: `${sender.firstName} ${sender.lastName}`,
      avatarUrl: getAvatarUrl(sender.avatarPath)
    }));

    setRequests(mappedRequests);
  };

  const fetchSentRequests = async () => {
    if (!user?.id) return;

    const response = await fetch(`${API_URL}/friends/${user.id}/sent`);
    if (!response.ok) throw new Error('Failed to fetch sent requests');

    const data = await response.json();
    const mappedSent = data.map(receiver => ({
      id: receiver.id,
      name: `${receiver.firstName} ${receiver.lastName}`,
      avatarUrl: getAvatarUrl(receiver.avatarPath)
    }));

    setSentRequests(mappedSent);
  };

  const handleAddFriend = async (e) => {
    e.preventDefault();
    if (!searchTerm || !user?.id) return;

    const cleanUsername = searchTerm.trim().startsWith('@')
      ? searchTerm.trim().substring(1)
      : searchTerm.trim();

    if (!cleanUsername) {
      alert(t('friends_enter_username') || 'Please enter a username');
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/friends/${user.id}/add-by-username/${cleanUsername}`,
        { method: 'POST' }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || t('friends_request_failed') || 'Failed to send friend request');
        return;
      }

      alert(data.message || t('friends_request_sent') || 'Friend request sent!');
      setSearchTerm('');
      await fetchSentRequests();

    } catch (err) {
      console.error('Error sending friend request:', err);
      alert(t('friends_error') || 'An error occurred');
    }
  };

  const handleRemoveFriend = async (id) => {
    if (!user?.id) return;

    const friendToRemove = friends.find(friend => friend.id === id);
    if (!friendToRemove) return;

    const isConfirmed = window.confirm(
      t('friends_remove_confirm', { name: friendToRemove.name }) ||
      `Do you really want to remove ${friendToRemove.name} from your friends?`
    );

    if (!isConfirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/friends/${user.id}/remove/${id}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('Failed to remove friend');
      }

      setFriends(currentFriends =>
        currentFriends.filter(friend => friend.id !== id)
      );
    } catch (err) {
      console.error('Error removing friend:', err);
      alert(t('friends_remove_error') || 'Failed to remove friend');
    }
  };

  const checkProfile = (id) => {
    const friend = friends.find(f => f.id === id);
    if (!friend) return;

    playClickSound();
    navigate(`/profile/${id}`);
  };

  const handleAcceptRequest = async (senderId) => {
    if (!user?.id) return;

    try {
      const response = await fetch(
        `${API_URL}/friends/${user.id}/accept/${senderId}`,
        { method: 'POST' }
      );

      if (!response.ok) {
        throw new Error('Failed to accept friend request');
      }

      await fetchFriends();
      await fetchRequests();

    } catch (err) {
      console.error('Error accepting friend request:', err);
      alert(t('friends_accept_error') || 'Failed to accept friend request');
    }
  };

  const handleDeclineRequest = async (senderId) => {
    if (!user?.id) return;

    try {
      const response = await fetch(
        `${API_URL}/friends/${user.id}/decline/${senderId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('Failed to decline friend request');
      }

      setRequests(currentRequests =>
        currentRequests.filter(req => req.id !== senderId)
      );

    } catch (err) {
      console.error('Error declining friend request:', err);
      alert(t('friends_decline_error') || 'Failed to decline friend request');
    }
  };

  const handleCancelSentRequest = async (receiverId) => {
    if (!user?.id) return;

    const requestToCancel = sentRequests.find(req => req.id === receiverId);
    if (!requestToCancel) return;

    const isConfirmed = window.confirm(
      t('friends_cancel_confirm', { name: requestToCancel.name }) ||
      `Cancel friend request to ${requestToCancel.name}?`
    );

    if (!isConfirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/friends/${user.id}/cancel/${receiverId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('Failed to cancel request');
      }

      setSentRequests(currentRequests =>
        currentRequests.filter(req => req.id !== receiverId)
      );

    } catch (err) {
      console.error('Error canceling sent request:', err);
      alert(t('friends_cancel_error') || 'Failed to cancel request');
    }
  };

  if (loading) {
    return (
      <div className="friends-page-container">
        <p>{t('loading') || 'Loading...'}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="friends-page-container">
        <p style={{ color: 'red' }}>
          {t('error')}: {error}
        </p>
        <button onClick={() => window.location.reload()}>
          {t('retry') || 'Retry'}
        </button>
      </div>
    );
  }

  return (
    <div className="friends-page-container">
      <h1>{t('friends_title')}</h1>

      {/* Sekcja dodawania przyjaciela */}
      <div className="add-friend-section card-style">
        <h2>{t('friends_add_friend')}</h2>
        <form onSubmit={handleAddFriend} className="add-friend-form">
          <input
            type="text"
            placeholder={t('friends_placeholder') || 'Enter @username'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="add-friend-input"
          />
          <button
            type="submit"
            className="add-friend-button"
            onClick={playClickSound}
          >
            {t('friends_add')}
          </button>
        </form>
      </div>

      {/* Sekcja wysłanych zaproszeń */}
      <div className="friend-requests-section card-style">
        <h2>{t('friends_sent_requests', { count: sentRequests.length })}</h2>
        <div className="friends-list">
          {sentRequests.length === 0 ? (
            <p>{t('friends_no_sent_requests')}</p>
          ) : (
            sentRequests.map(request => (
              <div key={request.id} className="friend-item">
                <img
                  src={request.avatarUrl}
                  alt="avatar"
                  className="avatar"
                />
                <div className="friend-details">
                  <span className="friend-name">{request.name}</span>
                </div>
                <div className="request-actions">
                  <button
                    onClick={() => {
                      playClickSound();
                      handleCancelSentRequest(request.id);
                    }}
                    className="remove-btn"
                  >
                    {t('friends_cancel')}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sekcja otrzymanych zaproszeń */}
      <div className="friend-requests-section card-style">
        <h2>{t('friends_requests', { count: requests.length })}</h2>
        <div className="friends-list">
          {requests.length === 0 ? (
            <p>{t('friends_no_requests')}</p>
          ) : (
            requests.map(request => (
              <div key={request.id} className="friend-item">
                <img
                  src={request.avatarUrl}
                  alt="avatar"
                  className="avatar"
                />
                <div className="friend-details">
                  <span className="friend-name">{request.name}</span>
                </div>
                <div className="request-actions">
                  <button
                    onClick={() => {
                      playClickSound();
                      handleAcceptRequest(request.id);
                    }}
                    className="check-btn"
                  >
                    {t('friends_accept')}
                  </button>
                  <button
                    onClick={() => {
                      playClickSound();
                      handleDeclineRequest(request.id);
                    }}
                    className="remove-btn"
                  >
                    {t('friends_decline')}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sekcja przyjaciół */}
      <div className="friends-list-section card-style">
        <h2>{t('friends_your', { count: friends.length })}</h2>
        <div className="friends-list">
          {friends.length === 0 ? (
            <p>{t('friends_no')}</p>
          ) : (
            friends.map(friend => (
              <div key={friend.id} className="friend-item">
                <img
                  src={friend.avatarUrl}
                  alt="avatar"
                  className="avatar"
                />
                <div className="friend-details">
                  <span className="friend-name">{friend.name}</span>
                  {friend.online !== undefined && (
                    <span className={`status ${friend.online ? 'online' : 'offline'}`}>
                      {friend.online ? t('friends_online') : t('friends_offline')}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    playClickSound();
                    checkProfile(friend.id);
                  }}
                  className="check-btn"
                >
                  {t('friends_check')}
                </button>
                <button
                  onClick={() => {
                    playClickSound();
                    handleRemoveFriend(friend.id);
                  }}
                  className="remove-btn"
                >
                  {t('friends_delete')}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Friends;