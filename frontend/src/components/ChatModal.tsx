import "../styles/components/_chatModal.scss";

import { useEffect, useRef } from "react";
import { useChat } from "../context/chatContext";

interface ChatModalProps {
    id: number;
    onClose: () => void;
}

export function ChatModal({ id, onClose }: ChatModalProps) {
    const { messagesByRoom, sendMessage, user, joinRoom} = useChat();
    const messagesRef = useRef<HTMLDivElement>(null);
    const isAtBottomRef = useRef(true);
    const lastMessageFromMeRef = useRef(false);

    useEffect(() => {
        if (id){
			joinRoom(id);
		}
    }, [id, joinRoom]);

   const handleScroll = () => {
        const el = messagesRef.current;
        if (!el) return;
        const offset = 100;
        
        isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight <= offset;
    };

    useEffect(() => {
        const el = messagesRef.current;
        if (!el) return;

        const timeoutId = setTimeout(() => {
            if (isAtBottomRef.current || lastMessageFromMeRef.current) {
                el.scrollTo({
                    top: el.scrollHeight,
                    behavior: 'smooth'
                });
            }
            lastMessageFromMeRef.current = false;
        }, 30);

        return () => clearTimeout(timeoutId);
    }, [messagesByRoom, id]);

    const handleSend = (formData: FormData) => {
        const val = formData.get("input") as string;
        if (!val?.trim()) return;

        lastMessageFromMeRef.current = true;

        sendMessage(id, val);

        const inputEl = document.getElementsByName("input")[0] as HTMLInputElement;
        if (inputEl) inputEl.value = "";
    };

    return (
        <div className="chatModal">
            <div className="chatModal__header">
                <span>Sala {id}</span>
                <button onClick={onClose}>X</button>
            </div>
            
            <div 
                className="chatModal__messages"
                ref={messagesRef}
                onScroll={handleScroll}
            >
                {(messagesByRoom[id] || []).map((msg, i) => (
                    <div 
                        key={msg.message_id || i}
                        className={`chatModal__msg ${msg.username === user?.login ? "chatModal__msg-own" : ""}`}
                    >
                        <div className="chatModal__msg-header">
                            <small>{msg.username}</small>
                        </div>
                        <p className="chatModal__msg-content">{msg.content}</p>
                    </div>
                ))}
            </div>

            <form autoComplete="off" action={handleSend} className="chatModal__form">
                <input
                    name="input"
                    placeholder="Escribe un mensaje..."
                    className="chatModal__form--input"
                />
                <button type="submit" className="chatModal__form--btn">Enviar</button>
            </form>
        </div> 
    );
}
