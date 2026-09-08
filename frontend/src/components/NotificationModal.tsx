import { useEffect, useRef } from 'react';
import type { Notification } from '../context/notificationsContext';
import { NotificationItem } from './NotificationItem';

export const NotificationModal: React.FC<{
  notifications: Notification[];
  onClose: () => void;
  onMarkAsRead: (id: string | number) => void;
  onChatOpen: (roomId: number) => void;
  onOpenReceivedRequests: () => void;
  style?: React.CSSProperties;
}> = ({
  notifications,
  onClose,
  onMarkAsRead,
  onChatOpen,
  onOpenReceivedRequests,
  style,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: PointerEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('pointerdown', handleClickOutside);
    return () =>
      document.removeEventListener('pointerdown', handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  return (
    <div className="notificationModal" ref={modalRef} style={style}>
      <div className="notificationModal__header">
        <span className="notificationModal__title">Notificaciones</span>
        <button
          type="button"
          className="notificationModal__close"
          aria-label="Cerrar notificaciones"
          onClick={onClose}
        >
          ×
        </button>
      </div>

      <div className="notificationModal__list">
        {safeNotifications.length === 0 ? (
          <div className="simple-notification-empty">
            <p>No hay notificaciones</p>
          </div>
        ) : (
          safeNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={onMarkAsRead}
              onChatOpen={onChatOpen}
              onOpenReceivedRequests={onOpenReceivedRequests}
              onNotificationClick={onClose}
            />
          ))
        )}
      </div>
    </div>
  );
};
