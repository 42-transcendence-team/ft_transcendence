import "../styles/components/_chatPanel.scss"
import { useChat } from "../context/chatContext";
import {apiRequest} from "api/ApiRequest";

interface ChatPanelProps {
    onChatClick: (id: number) => void;
    activeChatId: number | null;
}

export function ChatPanel(props: ChatPanelProps) {

	const { rooms, addChat } = useChat();
	
    return (
		<>
        <aside className="chatPanel">
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
