import "../styles/components/_chat.scss"
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

type User = {
    id: number;
    name: string;
    statusColor: string;
    hasUnreadMessage: boolean;
};

type Message = {
    id: number;
    text: string;
    isMe: boolean;
};

const chatUsers = [
    { id: 1, name: "Alice", statusColor: "green", hasUnreadMessage: true },
    { id: 2, name: "asd", statusColor: "orange", hasUnreadMessage: false },
    { id: 3, name: "Charlie", statusColor: "red", hasUnreadMessage: false },
    { id: 4, name: "David", statusColor: "gray", hasUnreadMessage: false },
];

function ChatWindow({ 
    user, 
    messages, 
    onSendMessage, 
    onClose 
}: { 
    user: User; 
    messages: Message[]; 
    onSendMessage: (text: string) => void;
    onClose: () => void; 
}) {
    const navigate = useNavigate();
    const [inputValue, setInputValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        if (!inputValue.trim()) return;
        onSendMessage(inputValue);
        setInputValue("");
        inputRef.current?.focus();
    };

    return (
        <div className="active-chat-window">
            <div className="chat-header">
                <h3 
                    onClick={() => navigate(`/app/profile/${user.name}`)} 
                    className="chat-header__title"
                >
                    {user.name}
                </h3>
                <button onClick={onClose} className="close-btn">X</button>
            </div>
            
            <div className="chat-messages">
                {messages.map((msg) => (
                    <div 
                        key={msg.id} 
                        className={`message-bubble ${msg.isMe ? "me" : "other"}`}
                    >
                        {msg.text}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            
            <div className="chat-input-area">
                <input 
                    type="text" 
                    placeholder="Escribe un mensaje..." 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button onClick={handleSend}>Enviar</button>
            </div>
        </div>
    );
}

export function Chat() {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [chatHistories, setChatHistories] = useState<Record<number, Message[]>>({});
    const handleSendMessage = (text: string) => {
        if (!selectedUser) return;

        const newMessage: Message = {
            id: Date.now(),
            text,
            isMe: true
        };
        setChatHistories(prevHistories => {
            const currentUserMessages = prevHistories[selectedUser.id] || [];

            return {
                ...prevHistories,
                [selectedUser.id]: [...currentUserMessages, newMessage]
            };
        });
    };
    const currentMessages = selectedUser ? (chatHistories[selectedUser.id] || []) : [];

    return (
        <div className="chat-container">
            <aside className="sidebar">
                {chatUsers.map((user) => (
                    <div 
                        className={`avatar-container ${selectedUser?.id === user.id ? 'active' : ''}`} 
                        key={user.id} 
                        title={user.name}
                        onClick={() => setSelectedUser(user)} 
                    >
                        <div className="avatar dark-circle"></div>
                        <div className={`status-dot ${user.statusColor}-dot`}></div>
                        {user.hasUnreadMessage && (
                            <div className="msg-icon">...</div>
                        )}
                    </div>
                ))}
                <div className="action-circle add-contact">
                    <div className="plus-icon">+</div>
                </div>
            </aside>

            {selectedUser && (
                <ChatWindow 
                    user={selectedUser} 
                    messages={currentMessages}
                    onSendMessage={handleSendMessage}
                    onClose={() => setSelectedUser(null)} 
                />
            )}
        </div>
    );
}