import "../styles/components/_privateLayout.scss"
import { Outlet, useLoaderData } from "react-router-dom";
import { Footer } from "@components/Footer";
import { PrivHeader } from "@components/PrivHeader";
import { WebSocketProvider } from "context/webSocketContext";
import {ChatProvider} from "context/chatContext";
import { ChatPanel } from "@components/ChatPanel";
import { ChatModal } from "@components/ChatModal";
import { useState } from "react";

function useHandleChat() {
	const [activeChat, setActiveChat] = useState<number | null>(null);

	const toggleChat = (id: number) => {
		setActiveChat((prev) => (prev === id ? null : id));
	};

	return { activeChat, toggleChat };
}

export function PrivateLayout() {
	const data = useLoaderData();
	const {activeChat, toggleChat} = useHandleChat();

	return (
		<div className="privateLayout">
			<WebSocketProvider user={data.user}>
				<ChatProvider user={data.user}>
					<header className="privateLayout__header">
						<PrivHeader />
					</header>

					<aside className="privateLayout__leftPanel">
						<div className="leftPanel__content">
							<div className="leftPanel__actions">
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
			</WebSocketProvider>
		</div>
	);
}
