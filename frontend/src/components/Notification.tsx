import { useNavigate } from "react-router-dom"; // si usas React Router
import { useNotification, type Notification } from '../context/notificationsContext';
import "../styles/components/_notification.scss";

//TODO: revisar bien, hecho 100 con IA

// Componente item
const NotificationItem: React.FC<{ 
  notification: Notification; 
  onMarkAsRead: (id: string | number) => void;
}> = ({ notification, onMarkAsRead }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Marcar como leída
    onMarkAsRead(notification.id);

    // Si es un mensaje no leído, redirigir al chat correspondiente
    if (notification.type === 'UNREAD_MESSAGES' && notification.payload?.room_id) {
      navigate(`/chat/${notification.payload.room_id}`); // ajusta la ruta según tu app
    }
    // Para otros tipos, podrías redirigir a otra página
    // if (notification.type === 'FRIEND_REQUEST') navigate('/friends');
  };

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
                <span className="notification-room-id"> (ID: {notif.payload.room_id})</span>
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

// Componente principal
export const Notification: React.FC = () => {
  const { notifications, markAsRead } = useNotification();
  // Asegurar que notifications sea un array
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
	console.log(safeNotifications);
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
          key={notification.id} // ✅ Usamos el ID único
          notification={notification}
          onMarkAsRead={markAsRead}
        />
      ))}
    </div>
  );
};
