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
import { useEffect, useState } from "react";
import {apiRequest} from "api/ApiRequest";

function useHandleChat() {
	const [activeChat, setActiveChat] = useState<number | null>(null);

	const toggleChat = (id: number) => {
		setActiveChat((prev) => {console.log(prev);return (prev === id ? null : id)});
	};

	return { activeChat, toggleChat };
}

const sendFriendRequest = async () => {
	await apiRequest({
		endpoint: "friends/requests",
		//ReceiverID uint `json:"receiver_id" binding:"required"`
		method: "POST",
		body: { receiver_id: parseInt(prompt("Enter the user ID to send a friend request:") || "0") },
	})
}

export function PrivateLayout() {
	const data = useLoaderData();
	const {activeChat, toggleChat} = useHandleChat();

	useEffect(() => {console.log(activeChat)}, [activeChat]);
	return (
		<div className="privateLayout">
			<WebSocketProvider user={data.user}>
				<NotificationProvider activeChat={activeChat} user={data.user}> 
					<ChatProvider user={data.user}>
						<header className="privateLayout__header">
							<PrivHeader />
						</header>

						<aside className="privateLayout__leftPanel">
							<div className="leftPanel__content">
								<div className="leftPanel__actions">
									<Notification/>
								</div>
							</div>
							<button onClick={sendFriendRequest}>send req</button>
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
