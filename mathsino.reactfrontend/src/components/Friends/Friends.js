import React, { useState } from 'react';
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
      <h1>Friends</h1>

      <div className="add-friend-section card-style">
        <h2>Add Friend</h2>
        <form onSubmit={handleAddFriend} className="add-friend-form">
          <input
            type="text"
            placeholder="Wpisz nazwę użytkownika..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="add-friend-input"
          />
          <button type="submit" className="add-friend-button">
            Add
          </button>
        </form>
      </div>

      {/* --- Nowa sekcja --- */}
      <div className="friend-requests-section card-style">
        <h2>Friend Requests ({requests.length})</h2>
        <div className="friends-list">
          {requests.length === 0 ? (
            <p>You have no new friend requests.</p>
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
                    Accept
                  </button>
                  <button
                    onClick={() => handleDeclineRequest(request.id)}
                    className="remove-btn"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {/* --- Koniec nowej sekcji --- */}

      <div className="friends-list-section card-style">
        <h2>Your Friends ({friends.length})</h2>
        <div className="friends-list">
          {friends.length === 0 ? (
            <p>You have no friends.</p>
          ) : (
            friends.map(friend => (
              <div key={friend.id} className="friend-item">
                <img src={friend.avatarUrl} alt="avatar" className="avatar" />
                <div className="friend-details">
                  <span className="friend-name">{friend.name}</span>
                  {}
                  <span className={`status ${friend.online ? 'online' : 'offline'}`}>
                    {friend.online ? 'Online' : 'Offline'}
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveFriend(friend.id)}
                  className="check-btn"
                >
                  Check Profile
                </button>
                <button
                  onClick={() => handleRemoveFriend(friend.id)}
                  className="remove-btn"
                >
                  Delete
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