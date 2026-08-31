import { useState } from "react";
import { useChat } from "../context/chatContext";
import { useNavigate } from "react-router-dom";
import "@styles/components/_mobileChat.scss";

export function MobileChat() {
    const { rooms, roomMembers, lastActivity, user, messagesByRoom, sendMessage } = useChat();
    const [activeRoomId, setActiveRoomId] = useState<number | null>(null);
    const [inputText, setInputText] = useState("");
    const navigate = useNavigate();

    const currentMembers = activeRoomId ? roomMembers[activeRoomId] || [] : [];
    const otherUser = currentMembers.find(m => m.id !== Number(user?.id));
    const currentMessages = activeRoomId ? messagesByRoom[activeRoomId] || [] : [];

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !activeRoomId) return;
        sendMessage(activeRoomId, inputText.trim());
        setInputText("");
    };

    if (activeRoomId) {
        return (
            <div className="mobile-chat-room">
                <header className="mobile-chat-room__header">
                    <button 
                        className="mobile-chat-room__back-btn" 
                        onClick={() => setActiveRoomId(null)}
                    >
                        ←
                    </button>
                    <img 
                        src={otherUser?.avatar_url || "/default-avatar.png"} 
                        alt="Avatar" 
                        className="mobile-chat-room__avatar"
                    />
                    <div className="mobile-chat-room__user-info">
                        <h3>{otherUser?.login || "Chat"}</h3>
                    </div>
                </header>

                <div className="mobile-chat-room__messages-container">
                    {currentMessages.length === 0 ? (
                        <div className="mobile-chat-room__empty">
                            <p>No hay mensajes aún. ¡Di hola!</p>
                        </div>
                    ) : (
                        currentMessages.map((msg, index) => {
                            const isMe = msg.username === user?.login;
                            return (
                                <div 
                                    key={msg.message_id || index} 
                                    className={`mobile-chat-bubble ${isMe ? "mobile-chat-bubble--sent" : "mobile-chat-bubble--received"}`}
                                >
                                    <p>{msg.content}</p>
                                    <span className="mobile-chat-bubble__time">
                                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                    </span>
                                </div>
                            );
                        })
                    )}
                </div>

                <form className="mobile-chat-room__input-form" onSubmit={handleSend}>
                    <input 
                        type="text" 
                        placeholder="Escribe un mensaje..." 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                    />
                    <button type="submit" disabled={!inputText.trim()}>
                        Enviar
                    </button>
                </form>
            </div>
        );
    }

    const sortedRooms = [...rooms].sort((a, b) => {
        const timeA = lastActivity[a] || 0;
        const timeB = lastActivity[b] || 0;
        return timeB - timeA;
    });

    return (
        <div className="mobile-chat-list">
            <header className="mobile-chat-list__header">
                <button onClick={() => navigate("/app")} className="mobile-chat-list__home-btn">
                    🏠
                </button>
                <h1>Mensajes</h1>
            </header>

            <div className="mobile-chat-list__container">
                {sortedRooms.length === 0 ? (
                    <div className="mobile-chat-list__empty">
                        <p>No tienes chats activos todavía.</p>
                        <span>Inicia una conversación desde el perfil de tus amigos.</span>
                    </div>
                ) : (
                    sortedRooms.map(roomId => {
                        const members = roomMembers[roomId] || [];
                        const chatUser = members.find(m => m.id !== Number(user?.id));
                        const messages = messagesByRoom[roomId] || [];
                        const lastMsg = messages[messages.length - 1];

                        return (
                            <div 
                                key={roomId} 
                                onClick={() => setActiveRoomId(roomId)}
                                className="mobile-chat-card"
                            >
                                <img 
                                    src={chatUser?.avatar_url || "/default-avatar.png"} 
                                    alt="Avatar" 
                                    className="mobile-chat-card__avatar"
                                />
                                <div className="mobile-chat-card__content">
                                    <div className="mobile-chat-card__top">
                                        <span className="mobile-chat-card__name">
                                            {chatUser?.login || "Usuario"}
                                        </span>
                                        {lastMsg?.timestamp && (
                                            <span className="mobile-chat-card__time">
                                                {new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        )}
                                    </div>
                                    <p className="mobile-chat-card__preview">
                                        {lastMsg ? lastMsg.content : "Toca para chatear"}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}