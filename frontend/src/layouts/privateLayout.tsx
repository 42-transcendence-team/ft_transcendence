import "../styles/components/_privateLayout.scss"
import { Outlet, useLoaderData } from "react-router-dom";
import { Footer } from "@components/Footer";
import { PrivHeader } from "@components/PrivHeader";
import { ChatPanel } from "@components/ChatPanel";
import { useState } from "react";
import { ChatModal } from "@components/ChatModal";
import { Notification } from "@components/Notification";
import { ChatProvider } from "context/chatContext";
import { WebSocketProvider } from "context/webSocketContext";
import { NotificationProvider } from "context/NotificationsContext";
import { apiRequest } from "../api/ApiRequest";

function useHandleChat() {
	const [activeChat, setActiveChat] = useState<number | null>(null);

	const toggleChat = (id: number) => {
		setActiveChat((prev) => (prev === id ? null : id));
	};

	return { activeChat, toggleChat };
}

const sendFriendRequest = () => {
	const n = prompt("Enter the user id you want to send a friend request to: ");
	const n_number = parseInt(n || '');

	if (!isNaN(n_number)) {
		apiRequest({
			endpoint: 'friends/requests',
			method: 'POST',
			body: {
				receiver_id: n_number
			}
		});
	}
};

export function PrivateLayout() {
	const data = useLoaderData();
	const { activeChat, toggleChat } = useHandleChat();

	return (
		<div className="privateLayout">
			<WebSocketProvider user={data.user}>
				<NotificationProvider activeChat={activeChat} user={data.user}>
					<ChatProvider activeChat={activeChat} user={data.user}>
						<header className="privateLayout__header">
							<PrivHeader />
						</header>

						<aside className="privateLayout__leftPanel">
							<div className="leftPanel__content">
								<div className="leftPanel__actions">
								<button 
									className="btn-friend-request"
									onClick={sendFriendRequest}
								>
									Agregar Amigo
								</button>
								</div>

								<div className="leftPanel__notifications">
									<Notification />
								</div>
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
