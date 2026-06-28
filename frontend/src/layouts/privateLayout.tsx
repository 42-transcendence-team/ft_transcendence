import "../styles/components/_privateLayout.scss"
import { Outlet, useLoaderData } from "react-router-dom";
import { Footer } from "@components/Footer";
import { PrivHeader } from "@components/PrivHeader";
import { ChatPanel } from "@components/ChatPanel";
import { useState } from "react";
import { ChatModal } from "@components/ChatModal";
import { Notification } from "@components/Notification";
import { ChatProvider } from "context/chatContext";
import {WebSocketProvider} from "context/webSocketContext";
import {NotificationProvider} from "context/NotificationsContext";
import { apiRequest } from "../api/ApiRequest";

function useHandleChat() {
	const [activeChat, setActiveChat] = useState<number | null>(null);
	
	const toggleChat = (id: number) => {
		setActiveChat((prev) => (prev === id ? null : id));
	};
	
	return {activeChat, toggleChat}
}

const sendFriendRequest = () => {
	const n = prompt("Enter the user id you want to send a friend request to: ");

	const n_number = parseInt(n);
	apiRequest( {
		endpoint: 'friends/requests',
		method: 'POST',
		body: {
			receiver_id : n_number
		}
	})
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
				<NotificationProvider activeChat={activeChat} user={data.user}> 
					<ChatProvider activeChat={activeChat} user={data.user}>
						<header>
							<PrivHeader />
						</header>	
						
						<aside className="privateLayout__leftPanel">
							LEFT PANEL
							<button onClick={sendFriendRequest}>
								friend request
							</button>
							<h2>notifications</h2>
							<div>
								<Notification/>
							</div>
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
