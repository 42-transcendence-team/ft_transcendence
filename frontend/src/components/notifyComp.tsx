import { useState, useEffect } from "react";
import "../styles/components/_notifyComp.scss"


type Notification = {
  id: string;
  message: string;
  isRead: boolean;
};

export const NotifyComp = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Aquí iría la peticion que tendreis montada (carva sara)
    setTimeout(() => {
      setNotifications([
        { id: "1", message: "Tienes una nueva solicitud de amistad", isRead: false },
        { id: "2", message: "asdasdasdasd", isRead: false },
        { id: "3", message: "zxczxczxc", isRead: true },
        { id: "4", message: "qweqweqweqweqwe", isRead: true },
        { id: "5", message: "123123123123123", isRead: true },
        { id: "6", message: "bnmbnmbnmbnmbnm", isRead: true },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="notifyComp">
      <h3 className="notifyComp__title">
        {notifications.length > 0 && (
          <span className="notifyComp__count">{notifications.length}</span>
        )} Notificaciones
      </h3>
      
      <div className="notifyComp__list">
        {loading ? (
          <p>Cargando...</p>
        ) : notifications.length === 0 ? (
          <p>No tienes notificaciones nuevas.</p>
        ) : (
          notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`notificationItem ${!notif.isRead ? 'notificationItem--unread' : ''}`}
            >
              {notif.message}
            </div>
          ))
        )}
      </div>
    </div>
  );
};