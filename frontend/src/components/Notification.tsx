import { useNavigate } from "react-router-dom";
import { useNotification, type Notification as NotificationType } from '../context/notificationsContext';
import "../styles/components/_notification.scss";

const NotificationItem: React.FC<{
  notification: NotificationType;
  onMarkAsRead: (id: string | number) => void;
  onChatOpen: (roomId: number) => void;
  onOpenReceivedRequests: () => void;
}> = ({ notification, onMarkAsRead, onChatOpen, onOpenReceivedRequests }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    onMarkAsRead(notification.id);

    if (notification.type === 'UNREAD_MESSAGES' && notification.payload?.room_id) {
      onChatOpen(Number(notification.payload.room_id));
      return;
    }
    if (notification.type === 'FRIEND_REQUEST') {
      onOpenReceivedRequests();
      return;
    }
    if ((notification.type === 'POST' || notification.type === 'LIKE' || notification.type === 'COMMENT') && notification.payload?.post_id) {
      navigate(`/app/posts/${notification.payload.post_id}`);
    }
  };

  const getUsername = () => notification.payload.username || 'Alguien';

  const getNotificationContent = (notif: NotificationType) => {
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
                <span className="notification-comment-preview">: {notif.payload.content.slice(0, 50)}{notif.payload.content.length > 50 ? '...' : ''}</span>
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
    <div 
      className="notification-item"
      onClick={handleClick}
    >
      {getNotificationContent(notification)}
      <button 
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

export const Notification: React.FC = () => {
  const { notifications, markAsRead, openChat, openReceivedRequests } = useNotification();
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  if (safeNotifications.length === 0) {
    return (
      <div className="simple-notification-empty">
        <p>No hay notificaciones</p>
      </div>
    );
  }

  return (
    <div className="simple-notification-list">
      {safeNotifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={markAsRead}
          onChatOpen={openChat}
          onOpenReceivedRequests={openReceivedRequests}
        />
      ))}
    </div>
  );
};
