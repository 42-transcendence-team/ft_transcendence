import { NavLink } from 'react-router-dom';
import '@styles/components/_mobileBottomNav.scss';
import { useState } from 'react';
import chat from '../assets/icons/chat.png';
import home from '../assets/icons/home.png';
import new_post from '../assets/icons/new_post.png';
import search from '../assets/icons/search.png';
import skull from '../assets/icons/skull_logo.png';
import { useAuth as useAuthProfile } from '../context/AuthContext';
import { MobileChatSheet } from './MobileChatSheet';

interface MobileBottomNavProps {
  onChatClick: (roomId: number) => void;
  activeChatId: number | null;
}

export const MobileBottomNav = ({
  onChatClick,
  activeChatId,
}: MobileBottomNavProps) => {
  const { user: authenticatedUser } = useAuthProfile();
  const [chatSheetOpen, setChatSheetOpen] = useState(false);

  const handleChatClick = () => {
    setChatSheetOpen(true);
  };

  const handleSelectRoom = (roomId: number) => {
    setChatSheetOpen(false);
    onChatClick(roomId);
  };

  return (
    <>
      <nav className="mobileBottomNav">
        {/* 1. Inicio / Feed */}
        <NavLink
          to="/app"
          end
          className={({ isActive }) =>
            isActive ? 'mobileBottomNav__link active' : 'mobileBottomNav__link'
          }
        >
          <img src={home} alt="Home" className="mobileBottomNav__icon-img" />
        </NavLink>

        {/* 2. Búsqueda avanzada */}
        <NavLink
          to="/app/mobile-search-notify"
          className={({ isActive }) =>
            isActive ? 'mobileBottomNav__link active' : 'mobileBottomNav__link'
          }
        >
          <img
            src={search}
            alt="Buscar"
            className="mobileBottomNav__icon-img"
          />
        </NavLink>

        {/* 3. Botón Central (Crear post) */}
        <NavLink
          to="/app/posts/new"
          className={({ isActive }) =>
            isActive ? 'mobileBottomNav__link active' : 'mobileBottomNav__link'
          }
        >
          <img
            src={new_post}
            alt="Nuevo post"
            className="mobileBottomNav__icon-img"
          />
        </NavLink>

        {/* 4. Mensajes */}
        <button
          type="button"
          className={`mobileBottomNav__link mobileBottomNav__link--button${
            chatSheetOpen || activeChatId !== null ? ' active' : ''
          }`}
          onClick={handleChatClick}
          aria-label="Mensajes"
        >
          <img
            src={chat}
            alt="Mensajes"
            className="mobileBottomNav__icon-img"
          />
        </button>

        {/* 5. Perfil */}
        <NavLink
          to={
            authenticatedUser?.login
              ? `/app/profile/${authenticatedUser.login}`
              : '/app'
          }
          className={({ isActive }) =>
            isActive ? 'mobileBottomNav__link active' : 'mobileBottomNav__link'
          }
        >
          <img src={skull} alt="Perfil" className="mobileBottomNav__icon-img" />
        </NavLink>
      </nav>

      {chatSheetOpen && (
        <MobileChatSheet
          onSelectRoom={handleSelectRoom}
          onClose={() => setChatSheetOpen(false)}
        />
      )}
    </>
  );
};
