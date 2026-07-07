import { apiRequest } from "api/ApiRequest";
import { createContext, useContext, useCallback, useEffect, useState } from "react";
import { useWebSocket } from "./webSocketContext";

export interface AuthUser {
    id: string;
    login?: string;
}

// Estructura de los mensajes internos de cada sala
export interface ChatMessage {
    message_id: string;
    content: string;
    username: string;
    timestamp: string;
}

// Todos los tipos de mensajes posibles que vienen o van por el WebSocket
export type WebSocketMessage =
    | { type: "message"; room_id: number; username?: string; user_id?: string; content: string; message_id?: string; timestamp?: string }
    | { type: "join_room"; room_id: number }
    | { type: "join"; room_id: number; messages: ChatMessage[] }
    | { type: "CREATE_ROOM"; payload: { room_id: number } };

interface MessagesState {
    [roomId: number]: ChatMessage[]; 
}

interface ChatContextType {
    sendMessage: (roomId: number, content: string) => void;
    messagesByRoom: MessagesState;
    joinRoom: (roomId: number) => void;
    rooms: number[];
    addChat: () => Promise<void>;
    user: AuthUser | null;
}

const chatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children, user }: { children: React.ReactNode; user: AuthUser | null }) {
    const { send, subscribe } = useWebSocket();
    
    const [messagesByRoom, setMessagesByRoom] = useState<MessagesState>({});
    const [rooms, setRooms] = useState<number[]>([]);

    const sendMessage = useCallback((roomId: number, content: string) => {
        if (!user) return;
        send({
            type: "message",
            username: user.login,
            user_id: user.id,
            room_id: roomId,
            content: content
        });
    }, [user, send]);

    const joinRoom = useCallback((roomId: number) => {
		if (messagesByRoom[roomId] && messagesByRoom[roomId].length > 0) {
			console.log("Mensajes ya cacheados y válidos para la sala:", roomId);
			return;
		}
		
		console.log("Solicitando historial al servidor para la sala:", roomId);
		send({ type: "join_room", room_id: roomId });
	}, [messagesByRoom, send]);

    const addChat = async () => {
        const input = prompt("ID del usuario al que quieres enviar mensaje");
        if (!input) return;
        const user_id = parseInt(input, 10);
        if (isNaN(user_id)) return;

        try {
            const data = await apiRequest({
                endpoint: "websocket/rooms",
                method: "POST",
                body: { name: `Room ${Math.floor(Math.random() * 1000)}`, private: true, users: [user_id] },
            });
            
            console.log("Chat room created successfully");
            setRooms((prevRooms) => {
                if (!prevRooms.includes(data.ID)) return [...prevRooms, data.ID];
                return prevRooms;
            });
        } catch (error) {
            console.error("Error creating chat room:", error);
        }
    };

    useEffect(() => {
        if (!user?.id) return;
        
        const fetchRooms = async () => {
            try {
                const data = await apiRequest({ endpoint: "websocket/rooms", method: "GET" });
                setRooms(data.map((r: any) => r.ID));
            } catch (e) {
                console.error("Error fetching rooms:", e);
            }
        };
        fetchRooms();
    }, [user?.id]);


    useEffect(() => {
        if (!user) return;

        const unsubscribeJoin = subscribe("join", (message: any) => {
            const { room_id, messages } = message;
            setMessagesByRoom((prev) => ({
                ...prev,
                [room_id]: messages || []
            }));
        });

        const unsubscribeMessage = subscribe("message", (message: any) => {
            const { room_id, message_id, content, username, timestamp } = message;
            
            setMessagesByRoom((prev) => {
                const currentRoomMessages = prev[room_id] || [];
                const newMsg: ChatMessage = { message_id, content, username, timestamp };
                return {
                    ...prev,
                    [room_id]: [...currentRoomMessages, newMsg]
                };
            });
        });

        const unsubscribeCreateRoom = subscribe("CREATE_ROOM", (message: any) => {
            const roomId = message.payload?.room_id;
            if (roomId) {
                setRooms((prev) => (prev.includes(roomId) ? prev : [...prev, roomId]));
            }
        });

        return () => {
            unsubscribeJoin();
            unsubscribeMessage();
            unsubscribeCreateRoom();
        };
    }, [user, subscribe]);

    return (
        <chatContext.Provider value={{ messagesByRoom, joinRoom, sendMessage, rooms, addChat, user }}>
            {children}
        </chatContext.Provider>
    );
}

export const useChat = () => {
    const context = useContext(chatContext);
    if (!context) throw new Error("useChat debe usarse dentro de un ChatProvider");
    return context;
};