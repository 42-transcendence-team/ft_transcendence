import "../styles/components/_chatModal.scss";

import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useChat } from "../context/chatContext";
import { UserAvatar } from "./users/UserAvatar";

interface ChatModalProps {
    id: number;
    onClose: () => void;
}

export function ChatModal({ id, onClose }: ChatModalProps) {
    const { messagesByRoom, sendMessage, user, roomMembers, joinRoom } = useChat();
    const messagesRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const otherMember = (roomMembers[id] || []).find(m => m.id !== parseInt(user?.id || '0', 10));
    const isAtBottomRef = useRef(true);
    const lastMessageFromMeRef = useRef(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (id){
			joinRoom(id);
		}
    }, [id, joinRoom]);

    useEffect(() => {
        const handleClickOutside = (e: PointerEvent) => {
            const target = e.target;
            if (target instanceof Element) {
                // Estas zonas gestionan su propio toggle del chat (burbuja activa,
                // notificaciones de mensajes, hoja móvil). Si cerramos aquí,
                // el click posterior reabriría el chat (doble toggle).
                if (target.closest('.chatPanel__bubble, .notification-item, .mobileChatSheet, .chatPanel__actions, .addChatModal__backdrop, .mobileChatSheet__backdrop')) {
                    return;
                }
            }
            if (modalRef.current && !modalRef.current.contains(target as Node)) {
                onClose();
            }
        };

        document.addEventListener("pointerdown", handleClickOutside);
        return () => document.removeEventListener("pointerdown", handleClickOutside);
    }, [onClose]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

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
        <div className="chatModal" ref={modalRef}>
            <div className="chatModal__header">
                {otherMember ? (
					<button
						type="button"
						className="chatModal__headerUser"
						title={`Ver perfil de ${otherMember.login}`}
						onClick={() => {
							navigate(`/app/profile/${encodeURIComponent(otherMember.login)}`);
							onClose();
						}}
					>
						<UserAvatar avatarPath={otherMember.avatar_url || null} username={otherMember.login} size="small" />
						<span>{otherMember.login}</span>
					</button>
				) : (
                	<span>Sala {id}</span>
				)}
                <button type="button" className="chatModal__close" aria-label="Cerrar chat" onClick={onClose}>×</button>
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
					maxLength="512"
                />
                <button type="submit" className="chatModal__form--btn">Enviar</button>
            </form>
        </div> 
    );
}
