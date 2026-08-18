import "../styles/components/_privateLayout.scss"
import { Outlet, useLoaderData } from "react-router-dom";
import { Footer } from "@components/Footer";
import { PrivHeader } from "@components/PrivHeader";
import { WebSocketProvider } from "context/webSocketContext";
import {ChatProvider} from "context/chatContext";
import {NotificationProvider} from "context/notificationsContext";
import { ChatPanel } from "@components/ChatPanel";
import { ChatModal } from "@components/ChatModal";
import { Notification } from "@components/Notification";
import { useState } from "react";
import { SearchFilters } from "@components/advancedSearch/SearchFilters";
import { useAdvancedSearch } from "@components/advancedSearch/useAdvancedSearch";
import { AdvancedSearchPanel } from "@components/advancedSearch/AdvancedSearchPanel";

import { PrivateLeftPanel } from "@components/layout/PrivateLeftPanel";
import { PrivateMainContent } from "@components/layout/PrivateMainContent";

import "../styles/components/_privateLayout.scss";
function useHandleChat() {
	const [activeChat, setActiveChat] = useState<number | null>(null);

	const toggleChat = (id: number) => {
		setActiveChat((prev) => {return (prev === id ? null : id)});
	};

	return { activeChat, toggleChat };
}

export function PrivateLayout() {
	const data = useLoaderData();
	const {activeChat, toggleChat} = useHandleChat();
	const search = useAdvancedSearch();

	return (
		<div className="privateLayout">

			<WebSocketProvider user={data.user}>
				<NotificationProvider activeChat={activeChat} user={data.user} onChatOpen={toggleChat}>
					<ChatProvider user={data.user}>
						<header className="privateLayout__header">
      						<PrivHeader onSearch={search.handleSearch} />
						</header>

						<aside className="privateLayout__leftPanel">
							<div className="leftPanel__content">
								<div className="leftPanel__actions">
									<Notification/>
									<PrivateLeftPanel>
										<SearchFilters
										  selectedRelations={search.relations}
										  onRelationsChange={search.handleRelationsChange}
										  selectedSort={search.sort}
										  onSortChange={search.handleSortChange}
										/>
								  	</PrivateLeftPanel>
								</div>
							</div>
						</aside>

						<main className="privateLayout__content">
							<div className="privateLayout__contentFrame">
								<div className="privateLayout__contentInner">
									<PrivateMainContent>
										 <Outlet />
										{search.hasSearched && (
										<AdvancedSearchPanel
											search={search}
											onClose={search.handleCloseSearch}
										/>
										)}
									</PrivateMainContent>
								</div>
							</div>
							{activeChat && (
								<ChatModal id={activeChat} onClose={() => toggleChat(activeChat)} />
							)}
						</main>

						<ChatPanel onChatClick={toggleChat} activeChatId={activeChat} />
						
						<footer className="privateLayout__footer">
							<Footer />
						</footer>
					</ChatProvider>
				</NotificationProvider>
			</WebSocketProvider>
		</div>
	);
}

