import {useNotification} from '../context/notificationsContext';
import "../styles/components/_notification.scss"

//TODO CAMBIAR Y HACER BIEN, HECHO 100% CON IA

const NotificationItem: React.FC<{ 
  notification: Notification; 
  onMarkAsRead: (id: string | number) => void;
}> = ({ notification, onMarkAsRead }) => {
  
  const getNotificationContent = (notif: Notification) => {
    switch (notif.type) {
      case 'FRIEND_REQUEST':
        return (
          <div className="notification-friend-request">
            <span className="notification-icon">👤</span>
            <div className="notification-content">
              <strong>{notif.payload.username || 'Alguien'}</strong>
              <span> te ha enviado una solicitud de amistad</span>
            </div>
          </div>
        );
      
      case 'FRIEND_REQUEST_ACCEPTED':
        return (
          <div className="notification-friend-accepted">
            <span className="notification-icon">✅</span>
            <div className="notification-content">
              <strong>{notif.payload.username || 'Alguien'}</strong>
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
              <span> mensajes sin leer en el chat</span>
              {notif.payload.room_id && (
                <span > {notif.payload.room_id}</span>
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

  const handleClick = () => {
    onMarkAsRead(notification.id);
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
      >
        ×
      </button>
    </div>
  );
};

export const Notification: React.FC = () => {
  const { notifications, markAsRead } = useNotification();

  if (notifications.length === 0) {
    return (
      <div className="simple-notification-empty">
        <p>No hay notificaciones</p>
      </div>
    );
  }

  return (
    <div className="simple-notification-list">
      {notifications.map((notification, id) => (
        <NotificationItem
          key={id}
          notification={notification}
          onMarkAsRead={markAsRead}
        />
      ))}
    </div>
  );
};
