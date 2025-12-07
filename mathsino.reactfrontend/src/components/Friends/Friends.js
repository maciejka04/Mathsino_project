import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './Friends.css';

import awatar from '../../assets/profilowe_smok.png';

const initialFriendsData = [
  { id: 1, name: 'Jan Kowalski', online: true, avatarUrl: awatar },
  { id: 2, name: 'Anna Nowak', online: false, avatarUrl: awatar },
  { id: 3, name: 'Marek Mostowiak', online: true, avatarUrl: awatar },
];
const initialRequestsData = [
  { id: 101, name: 'Zofia Brzezińska', avatarUrl: awatar },
  { id: 102, name: 'Krzysztof Konieczny', avatarUrl: awatar }
];

function Friends() {
  const { t } = useTranslation();
  const [friends, setFriends] = useState(initialFriendsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [requests, setRequests] = useState(initialRequestsData);

  const handleAddFriend = (e) => {
    e.preventDefault();
    if (!searchTerm) return;
    alert(`Send invitation to: ${searchTerm}`);
    setSearchTerm('');
  };

  const handleRemoveFriend = (id) => {
    const friendToRemove = friends.find(friend => friend.id === id);
    if (!friendToRemove) return;
    const isConfirmed = window.confirm(
      `Do you really want to remove ${friendToRemove.name} from your friends?`
    );
    if (isConfirmed) {
      setFriends(currentFriends =>
        currentFriends.filter(friend => friend.id !== id)
      );
    }
  };
const check_profile = (id) => {
    const friendToRemove = friends.find(friend => friend.id === id);
    if (!friendToRemove) return;
    const isConfirmed = window.confirm(
      `TRZEBA DODAĆ ABY SPRAWDZAŁO PROFIL UZYTKOWNIKA ${friendToRemove.name} `
    );
    
  };
  const handleAcceptRequest = (id) => {
    const requestToAccept = requests.find(req => req.id === id);
    if (!requestToAccept) return;

    const newFriend = {
      id: requestToAccept.id,
      name: requestToAccept.name,
      online: false,
      avatarUrl: requestToAccept.avatarUrl
    };

    setFriends(currentFriends => [...currentFriends, newFriend]);
    setRequests(currentRequests =>
      currentRequests.filter(req => req.id !== id)
    );
  };

  const handleDeclineRequest = (id) => {
    setRequests(currentRequests =>
      currentRequests.filter(req => req.id !== id)
    );
  };

  return (
    <div className="friends-page-container">
      <h1>{t('friends_title')}</h1>

      <div className="add-friend-section card-style">
        <h2>{t('friends_add_friend')}</h2>
        <form onSubmit={handleAddFriend} className="add-friend-form">
          <input
            type="text"
            placeholder={t('friends_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="add-friend-input"
          />
          <button type="submit" className="add-friend-button">
            {t('friends_add')}
          </button>
        </form>
      </div>

      {}
      <div className="friend-requests-section card-style">
        <h2>{t('friends_requests', { count: requests.length })}</h2>
        <div className="friends-list">
          {requests.length === 0 ? (
            <p>{t('friends_no_requests')}</p>
          ) : (
            requests.map(request => (
              <div key={request.id} className="friend-item">
                <img src={request.avatarUrl} alt="avatar" className="avatar" />
                <div className="friend-details">
                  <span className="friend-name">{request.name}</span>
                </div>
                <div className="request-actions">
                  <button
                    onClick={() => handleAcceptRequest(request.id)}
                    className="check-btn"
                  >
                    {t('friends_accept')}
                  </button>
                  <button
                    onClick={() => handleDeclineRequest(request.id)}
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
      {/* --- Koniec nowej sekcji --- */}

      <div className="friends-list-section card-style">
        <h2>{t('friends_your', { count: friends.length })}</h2>
        <div className="friends-list">
          {friends.length === 0 ? (
            <p>{t('friends_no')}</p>
          ) : (
            friends.map(friend => (
              <div key={friend.id} className="friend-item">
                <img src={friend.avatarUrl} alt="avatar" className="avatar" />
                <div className="friend-details">
                  <span className="friend-name">{friend.name}</span>
                  {}
                  <span className={`status ${friend.online ? 'online' : 'offline'}`}>
                    {friend.online ? t('friends_online') : t('friends_offline')}
                  </span>
                </div>
                <button
                  onClick={() => check_profile(friend.id)}
                  className="check-btn"
                >
                  {t('friends_check')}
                </button>
                <button
                  onClick={() => handleRemoveFriend(friend.id)}
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