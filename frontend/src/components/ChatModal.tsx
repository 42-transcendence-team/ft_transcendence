import "../styles/components/_chatModal.scss"

import { useEffect, useRef } from "react";
import { useChat } from "../context/chatContext";
import content from "@reset";

interface ChatModalProps {
    id: number;
    onClose: () => void;
}

const useJoinRoom = (joinRoom:any, id:number) => {
	useEffect(()=>{
		joinRoom(id)
	}, [id])
}

export function ChatModal({ id, onClose }: ChatModalProps) {
    const {messagesByRoom, joinRoom, sendMessage, user} = useChat();
	useJoinRoom(joinRoom, id)
    const messagesRef = useRef<HTMLDivElement>(null);
    const isAtBottomRef = useRef(true);
    const lastMessageFromMeRef = useRef(false);

    const handleScroll = () => {
        const el = messagesRef.current;
        if (!el) return;
        const offset = 50;
        isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < offset;
    };

    useEffect(() => {
        const el = messagesRef.current;
        if (!el) return;

        if (isAtBottomRef.current || lastMessageFromMeRef.current) {
            el.scrollTo({
                top: el.scrollHeight,
                behavior: 'auto'
            });
        }

        lastMessageFromMeRef.current = false;
    }, [messagesByRoom, id]);
	

    const handleSend = (e: any) => {
		const val = e.get("input")
        if (!val.trim())
			return;
        sendMessage(id, val);
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
					    <div key={i} className={`chatModal__msg ${(msg.username == user.login) ? "chatModal__msg-own" : ""}`}>
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
