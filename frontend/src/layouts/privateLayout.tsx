import '../styles/components/_privateLayout.scss';
import { AdvancedSearchPanel } from '@components/advancedSearch/AdvancedSearchPanel';
import { SearchFilters } from '@components/advancedSearch/SearchFilters';
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
import { useState } from 'react';
import { Outlet, useLoaderData } from 'react-router-dom';

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
  const handleBrandActivate = () => {
    search.handleCloseSearch();
  };

  return (
    <div className="privateLayout">
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
                {/* TOP: Buscador */}
                <div className="leftPanel__section leftPanel__section--top">
                  <SearchFilters
                    selectedRelations={search.relations}
                    onRelationsChange={search.handleRelationsChange}
                    selectedSort={search.sort}
                    onSortChange={search.handleSortChange}
                  />
                </div>

                {/* MIDDLE: Notificaciones (usando tu nuevo componente) */}
                <div className="leftPanel__section leftPanel__section--middle">
                  <Notification />
                </div>

                {/* BOTTOM: Perfil (Lo tenías en el diseño antiguo, lo dejo para que el CSS no se rompa) */}
                <div className="leftPanel__section leftPanel__section--bottom">
                  <MiniProfile />
                </div>
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
                  <PrivateMainContent>
                    <Outlet context={{ user: data.user }} />
                  </PrivateMainContent>
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
