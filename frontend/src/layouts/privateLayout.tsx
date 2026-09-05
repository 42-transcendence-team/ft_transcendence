import '../styles/components/_privateLayout.scss';
import { AdvancedSearchPanel } from '@components/advancedSearch/AdvancedSearchPanel';
import { SearchBar } from '@components/advancedSearch/SearchBar';
import { useAdvancedSearch } from '@components/advancedSearch/useAdvancedSearch';
import { ChatModal } from '@components/ChatModal';
import { ChatPanel } from '@components/ChatPanel';
import { ChatRejectionModal } from '@components/ChatRejectionModal';
import { Footer } from '@components/Footer';
import { PrivateLeftPanel } from '@components/layout/PrivateLeftPanel';
import { PrivateMainContent } from '@components/layout/PrivateMainContent';
import { MobileBottomNav } from '@components/MobileBottomNav';
import { MiniProfile } from '@components/miniProfile';
import { Notification } from '@components/Notification';
import { PrivHeader } from '@components/PrivHeader';
import { ChatProvider } from 'context/chatContext';
import { NotificationProvider } from 'context/notificationsContext';
import { WebSocketProvider } from 'context/webSocketContext';
import { LuChevronsLeft, LuHouse, LuPlus, LuSearch, LuUsers } from 'react-icons/lu';
import { useState } from 'react';
import { Link, Outlet, useLoaderData, useLocation, useNavigate } from 'react-router-dom';

function useHandleChat() {
  const [activeChat, setActiveChat] = useState<number | null>(null);
  const toggleChat = (id: number) => {
    setActiveChat((prev) => {
      return prev === id ? null : id;
    });
  };
  return { activeChat, toggleChat };
}

export function PrivateLayout() {
  const data = useLoaderData();
  const { activeChat, toggleChat } = useHandleChat();
  const search = useAdvancedSearch();
  const location = useLocation();
  const navigate = useNavigate();
  const handleBrandActivate = () => {
    search.handleCloseSearch();
  };
  const handleRailSearch = () => {
    document.querySelector<HTMLButtonElement>('.searchBar__button')?.click();
  };
  const handleFriendsClick = () => {
    if (location.pathname.startsWith('/app/friends/')) {
      navigate(-1);
    } else {
      navigate(`/app/friends/${data.user.login}`);
    }
  };

  return (
    <div className="privateLayout privateLayout--panelCollapsed">
      <WebSocketProvider user={data.user}>
        <NotificationProvider
          activeChat={activeChat}
          user={data.user}
          onChatOpen={toggleChat}
          onOpenReceivedRequests={() =>
            search.openWithRelations(['pending_received'])
          }
        >
          <ChatProvider user={data.user}>
            {/* ESTRUCTURA DEL PANEL IZQUIERDO (DISEÑO ANTIGUO + LÓGICA NUEVA) */}
            <PrivateLeftPanel>
              <div className="leftPanel__wrapper">
                <div className="panelRail">
                  <Link
                    to="/app"
                    className="panelRail__btn panelRail__btn--link"
                    aria-label="Inicio"
                    title="Inicio"
                    data-tooltip="Inicio"
                  >
                    <LuHouse />
                  </Link>
                  <button
                    type="button"
                    className="panelRail__btn"
                    onClick={handleRailSearch}
                    aria-label="Buscar usuarios"
                    title="Buscar"
                    data-tooltip="Buscar"
                  >
                    <LuSearch />
                  </button>
                  <Notification />
                  <button
                    type="button"
                    className="panelRail__btn"
                    onClick={handleFriendsClick}
                    aria-label="Amigos"
                    title="Amigos"
                    data-tooltip="Amigos"
                  >
                    <LuUsers />
                  </button>
                  <div className="panelRail__spacer" />
                  <Link
                    to="/app/posts/new"
                    className="panelRail__btn panelRail__btn--link"
                    aria-label="Nuevo post"
                    title="Nuevo post"
                    data-tooltip="Nuevo post"
                  >
                    <LuPlus />
                  </Link>
                  <div className="panelRail__profile">
                    <MiniProfile
                      avatarHref={`/app/profile/${data.user.login}`}
                      hidePublish
                    />
                  </div>
                </div>

                {/*
                  PANEL EXPANDIDO (deshabilitado)
                  Para reactivarlo:
                  1. Añadir el estado: const [panelCollapsed, setPanelCollapsed] = useState(true);
                  2. Cambiar la raíz por:
                     <div className={`privateLayout ${panelCollapsed ? 'privateLayout--panelCollapsed' : ''}`}>
                  3. Descomentar este bloque y envolverlo en:
                     {panelCollapsed ? ( <div className="panelRail">...rail actual...</div> ) : ( ...este bloque... )}
                  4. Añadir el botón ">>" (LuChevronsRight) al inicio del rail con
                     onClick={() => setPanelCollapsed(false)}.

                  <div className="leftPanel__panelHeader">
                    <span className="leftPanel__panelHeader-title">Menú</span>
                    <button
                      type="button"
                      className="leftPanel__panelHeader-collapse"
                      onClick={() => setPanelCollapsed(true)}
                      aria-label="Comprimir panel"
                      title="Comprimir panel"
                    >
                      <LuChevronsLeft />
                    </button>
                  </div>

                  <div className="leftPanel__section leftPanel__section--search">
                    <SearchBar onSearch={search.handleSearch} />
                  </div>

                  <div className="leftPanel__section leftPanel__section--notifications">
                    <Notification />
                  </div>

                  <div className="leftPanel__section leftPanel__section--bottom">
                    <MiniProfile />
                  </div>
                */}
              </div>
            </PrivateLeftPanel>

            <header className="privateLayout__header">
              <PrivHeader
                onSearch={search.handleSearch}
                onBrandActivate={handleBrandActivate}
              />
            </header>

            <main className="privateLayout__content">
              <div className="privateLayout__contentFrame">
                <div className="privateLayout__contentInner">
                    <Outlet context={{ user: data.user }} />
                </div>

                {search.hasSearched && (
                  <AdvancedSearchPanel
                    search={search}
                    onClose={search.handleCloseSearch}
                  />
                )}
              </div>

              {activeChat && (
                <ChatModal
                  id={activeChat}
                  onClose={() => toggleChat(activeChat)}
                />
              )}
            </main>
            <div className="privateLayout__rightPanel">
              <ChatPanel onChatClick={toggleChat} activeChatId={activeChat} />
            </div>
            <footer className="privateLayout__footer">
              <Footer onBrandActivate={handleBrandActivate} />
            </footer>

            <ChatRejectionModal />

            <MobileBottomNav
              onChatClick={toggleChat}
              activeChatId={activeChat}
            />
          </ChatProvider>
        </NotificationProvider>
      </WebSocketProvider>
    </div>
  );
}
