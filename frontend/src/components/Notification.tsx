import { useEffect, useRef, useState } from 'react';
import { useNotification } from '../context/notificationsContext';
import { NotificationModal } from './NotificationModal';
import '../styles/components/_notification.scss';

export const Notification: React.FC = () => {
  const { notifications, markAsRead, openChat, openReceivedRequests } =
    useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const [modalPos, setModalPos] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const bellRef = useRef<HTMLButtonElement>(null);
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const count = safeNotifications.length;

  useEffect(() => {
    if (!isOpen) return;

    const update = () => {
      if (window.matchMedia('(min-width: 901px)').matches) {
        const el = bellRef.current;
        if (el) {
          const rect = el.getBoundingClientRect();
          setModalPos({ top: rect.top - 10, left: rect.right + 10 });
        }
      } else {
        setModalPos(null);
      }
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [isOpen]);

  return (
    <>
      <div className="notification-bellWrap">
        <button
          ref={bellRef}
          type="button"
          className="notification-bell"
          onClick={() => setIsOpen((prev) => !prev)}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label="Abrir notificaciones"
          aria-expanded={isOpen}
        >
          🔔
        </button>
        {count > 0 && (
          <span className="notification-badge">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </div>

      {isOpen && (
        <NotificationModal
          notifications={safeNotifications}
          onClose={() => setIsOpen(false)}
          onMarkAsRead={markAsRead}
          onChatOpen={openChat}
          onOpenReceivedRequests={openReceivedRequests}
          style={modalPos ?? undefined}
        />
      )}
    </>
  );
};
