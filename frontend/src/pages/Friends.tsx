import skullLogo from '../assets/icons/skull_logo.png';
import '../styles/pages/_friends.scss';
import { useEffect, useState } from 'react';
import type { Friend, FriendRequest } from '../api/Friends';
import {
  acceptFriendRequest,
  getIncomingFriendRequests,
  getOutcomingFriendRequests,
  listFriendsRequest,
  rejectFriendRequest,
} from '../api/Friends';
import { EmptyFriendsState } from '../components/EmptyFriendsState';

export const Friends = () => {
  const [activeTab, setActiveTab] = useState<'friends' | 'sent' | 'received'>(
    'friends',
  );
  const [friendsRequests, setFriendsRequest] = useState<Friend[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequest] = useState<FriendRequest[]>([]);

  useEffect(() => {
    async function loadFriends() {
      try {
        const response = await listFriendsRequest();

        setFriendsRequest(response.data ?? []);
      } catch (error) {
        console.error('ERROR LOADING FRIENDS:', error);
      }
    }

    async function loadReceiverRequest() {
      try {
        const response = await getIncomingFriendRequests();

        setReceivedRequests(response.data ?? []);
      } catch (error) {
        console.error('ERROR LOADING RECEIVER FRIEND REQUESTS:', error);
      }
    }

    async function loadSentRequest() {
      try {
        const response = await getOutcomingFriendRequests();

        setSentRequest(response.data ?? []);
      } catch (error) {
        console.error('ERROR LOADING SENT FRIEND REQUESTS:', error);
      }
    }

    if (activeTab === 'friends') {
      loadFriends();
    }
    if (activeTab === 'sent') {
      loadSentRequest();
    }
    if (activeTab === 'received') {
      loadReceiverRequest();
    }
  }, [activeTab]);

  const handleAcceptFriendRequestClick = async (id: number) => {
    try {
      await acceptFriendRequest(id);
      console.log('accept request click');
    } catch (error) {
      console.log('accept request ERROR', error);
    }
  };

  const handleRejectFriendRequestClick = async (id: number) => {
    try {
      await rejectFriendRequest(id);
      console.log('reject request click');
    } catch (error) {
      console.log('reject request ERROR', error);
    }
  };

  const renderSentRequests = () => {
    if (sentRequests.length === 0) {
      return <EmptyFriendsState />;
    }
    return sentRequests.map((request) => (
      <div className="request-container" key={request.id}>
        <div className="request-info">
          <div className="small-logo">
            <img src={skullLogo} alt="Avatar del usuario" />
          </div>
          <p>{request.username}</p>
        </div>
        <div className="request-actions">
          <div className="request-actions">
            <p className="pending-text">Solicitud pendiente...</p>
          </div>
        </div>
      </div>
    ));
  };

  const renderReceivedRequests = () => {
    if (receivedRequests.length === 0) {
      return <EmptyFriendsState />;
    }
    return receivedRequests.map((request) => (
      <div className="request-container" key={request.id}>
        <div className="request-info">
          <div className="small-logo">
            <img src={skullLogo} alt="Avatar del usuario" />
          </div>
          <p>{request.username}</p>
        </div>
        <div className="request-actions">
          <button
            className="accept-button"
            type="button"
            onClick={() => handleAcceptFriendRequestClick(request.id)}
          >
            Aceptar
          </button>
          <button
            className="reject-button"
            type="button"
            onClick={() => handleRejectFriendRequestClick(request.id)}
          >
            Rechazar
          </button>
        </div>
      </div>
    ));
  };

  const renderFriends = () => {
    if (friendsRequests.length === 0) {
      return <EmptyFriendsState />;
    }
    return friendsRequests.map((request) => (
      <div className="request-container" key={request.user_id}>
        <div className="request-info">
          <div className="small-logo">
            <img src={skullLogo} alt="Avatar del usuario" />
          </div>
          <p>{request.username}</p>
        </div>
        <div className="request-actions">
          <div className="request-actions">
            <p className="friends">Somos familiaaaa</p>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <>
      <h2>AMIGOS</h2>

      <nav className="friends-tabs">
        <button
          type="button"
          className={activeTab === 'friends' ? 'active' : ''}
          onClick={() => setActiveTab('friends')}
        >
          Amigos
        </button>
        <button
          type="button"
          className={activeTab === 'sent' ? 'active' : ''}
          onClick={() => setActiveTab('sent')}
        >
          Solicitudes enviadas
        </button>
        <button
          type="button"
          className={activeTab === 'received' ? 'active' : ''}
          onClick={() => setActiveTab('received')}
        >
          Solicitudes recibidas
        </button>
      </nav>

      {activeTab === 'friends' && renderFriends()}

      {activeTab === 'sent' && renderSentRequests()}

      {activeTab === 'received' && renderReceivedRequests()}
    </>
  );
};