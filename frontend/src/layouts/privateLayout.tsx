import "../styles/components/_privateLayout.scss"
import { apiRequest } from "../api/ApiRequest"
import { Outlet, useLoaderData } from "react-router-dom";
import { Footer } from "@components/Footer";
import { PrivHeader } from "@components/PrivHeader";
import { ChatPanel } from "@components/ChatPanel";
import { useState } from "react";
import { ChatModal } from "@components/ChatModal";
import { ChatProvider } from "context/chatContext";
import {WebSocketProvider} from "context/webSocketContext";
import {NotificationProvider} from "context/NotificationsProvider";

function useHandleChat() {
	const [activeChat, setActiveChat] = useState<number | null>(null);
	
	const toggleChat = (id: number) => {
		setActiveChat((prev) => (prev === id ? null : id));
	};
	
	return {activeChat, toggleChat}
}

export function PrivateLayout() {
	// Layout común para todas las páginas privadas (footer, header, chat...)
	// Es en las páginas donde se modifica el body dependiendo de que se muestre en estas.
	// Hay que crear y modificar el header y footer dependiendo de la ruta, por ahora uso generico
	const data = useLoaderData();
	const {activeChat, toggleChat} = useHandleChat()

	return (
		<div className="privateLayout">
			<WebSocketProvider user={data.user}>
				<NotificationProvider activeChat={activeChat} >
					<ChatProvider activeChat={activeChat} user={data.user}>
						<header>
							<PrivHeader />
						</header>	
						
						<aside className="privateLayout__leftPanel">
							LEFT PANEL
						</aside>

						<main className="privateLayout__content">
							<div className="privateLayout__contentFrame">
								<div className="privateLayout__contentInner">
									<Outlet />
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
