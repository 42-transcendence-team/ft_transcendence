import { useNavigate } from 'react-router-dom';
import type { Notification } from '../context/notificationsContext';

export const NotificationItem: React.FC<{
  notification: Notification;
  onMarkAsRead: (id: string | number) => void;
  onChatOpen: (roomId: number) => void;
  onOpenReceivedRequests: () => void;
  onNotificationClick?: () => void;
}> = ({
  notification,
  onMarkAsRead,
  onChatOpen,
  onOpenReceivedRequests,
  onNotificationClick,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    onMarkAsRead(notification.id);
    onNotificationClick?.();

    if (
      notification.type === 'UNREAD_MESSAGES' &&
      notification.payload?.room_id
    ) {
      onChatOpen(Number(notification.payload.room_id));
      return;
    }
    if (notification.type === 'FRIEND_REQUEST') {
      onOpenReceivedRequests();
      return;
    }
    if (notification.type === 'FRIEND_REQUEST_ACCEPTED') {
      const username = notification.payload.username;
      if (username) {
        navigate(`/app/profile/${encodeURIComponent(username)}`);
      }
      return;
    }
    if (
      (notification.type === 'POST' ||
        notification.type === 'LIKE' ||
        notification.type === 'COMMENT') &&
      notification.payload?.post_id
    ) {
      navigate(`/app/posts/${notification.payload.post_id}`);
    }
  };

  const getUsername = () => notification.payload.username || 'Alguien';

  const getNotificationContent = (notif: Notification) => {
    switch (notif.type) {
      case 'FRIEND_REQUEST':
        return (
          <div className="notification-friend-request">
            <span className="notification-icon">👤</span>
            <div className="notification-content">
              <strong>{getUsername()}</strong>
              <span> te ha enviado una solicitud de amistad</span>
            </div>
          </div>
        );

      case 'FRIEND_REQUEST_ACCEPTED':
        return (
          <div className="notification-friend-accepted">
            <span className="notification-icon">✅</span>
            <div className="notification-content">
              <strong>{getUsername()}</strong>
              <span> ha aceptado tu solicitud de amistad</span>
            </div>
          </div>
        );

      case 'UNREAD_MESSAGES':
        return (
          <div className="notification-unread-messages">
            <span className="notification-icon">💬</span>
            <div className="notification-content">
              <span>Tienes </span>
              <strong>{notif.payload.unread_count || 0}</strong>
              <span> mensajes sin leer</span>
            </div>
          </div>
        );

      case 'POST':
        return (
          <div className="notification-post">
            <span className="notification-icon">📝</span>
            <div className="notification-content">
              <strong>{getUsername()}</strong>
              <span> ha creado un nuevo post</span>
            </div>
          </div>
        );

      case 'LIKE':
        return (
          <div className="notification-like">
            <span className="notification-icon">❤️</span>
            <div className="notification-content">
              <strong>{getUsername()}</strong>
              <span> le ha gustado tu post</span>
            </div>
          </div>
        );

      case 'COMMENT':
        return (
          <div className="notification-comment">
            <span className="notification-icon">💭</span>
            <div className="notification-content">
              <strong>{getUsername()}</strong>
              <span> ha comentado tu post</span>
              {notif.payload.content && (
                <span className="notification-comment-preview">
                  : {notif.payload.content.slice(0, 50)}
                  {notif.payload.content.length > 50 ? '...' : ''}
                </span>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="notification-default">
            <span>Nueva notificación</span>
          </div>
        );
    }
  };

  return (
    <div className="notification-item" onClick={handleClick}>
      {getNotificationContent(notification)}
      <button
        type="button"
        className="notification-close"
        onClick={(e) => {
          e.stopPropagation();
          onMarkAsRead(notification.id);
        }}
        aria-label="Cerrar notificación"
      >
        ×
      </button>
    </div>
  );
};
