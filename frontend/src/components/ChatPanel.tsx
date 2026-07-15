import "../styles/components/_chatPanel.scss"
import { useChat } from "../context/chatContext";

interface ChatPanelProps {
    onChatClick: (id: number) => void;
    activeChatId: number | null;
}

export function ChatPanel(props: ChatPanelProps) {
	const { rooms, addChat, bye } = useChat();

	return (
		<>
        <aside className="chatPanel">
			<button onClick={bye}>bye room</button>
            {rooms.map(roomId => (
                <button 
                    key={roomId}
                    className={`chatPanel__bubble ${props.activeChatId === roomId ? 'is-active' : ''}`}
                    onClick={() => props.onChatClick(roomId)}
                >
                    {roomId}
                </button>
            ))}
            <button className="chatPanel__add" onClick={() => addChat()}>+</button>
        </aside>
		</>
    );
}
