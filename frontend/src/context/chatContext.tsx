import { apiRequest } from "api/ApiRequest";
import { useRef, createContext, useContext, useCallback, useEffect, useState } from "react";
import { useWebSocket } from "./webSocketContext";

export interface AuthUser {
	id: string;
	login?: string;
}

export interface ChatMessage {
	message_id: string;
	content: string;
	username: string;
	timestamp: string;
}

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
	bye: () => void;
	rooms: number[];
	addChat: () => Promise<void>;
	user: AuthUser | null;
}

const chatContext = createContext<ChatContextType | undefined>(undefined);

function useJoinRooms(rooms: Array<{ id: number | string }>) {
	const { send, isConnected } = useWebSocket();
	const joinedRoomsRef = useRef<Set<string | number>>(new Set());

	useEffect(() => {
		console.log('joinrooms')
		if (!isConnected || !rooms.length)
			return;

		rooms.forEach((room) => {
			const roomId = room.id;
			if (!joinedRoomsRef.current.has(roomId)) {
				send({ type: "join_room", room_id: roomId });
				joinedRoomsRef.current.add(roomId);
			}
		});
	}, [isConnected]);
}

export function ChatProvider({ children, user }: { children: React.ReactNode; user: AuthUser | null }) {
	const { send, subscribe } = useWebSocket();
	const [ messagesByRoom, setMessagesByRoom ] = useState<MessagesState>({});
	const [ rooms, setRooms ] = useState<number[]>([]);
	useJoinRooms(rooms.map(roomId => ({ id: roomId })));

	const sendMessage = useCallback((roomId: number, content: string) => {
		if (!user)
			return;
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
			return;
		}
		send({ type: "join_room", room_id: roomId });
		console.log(`Joining room ${roomId}`);
	}, [messagesByRoom, send]);

	const bye = () => {
		const roomId = parseInt(prompt("ID del usuario al que quieres enviar mensaje") || '0'); // TODO - Poner esto bonico
		send({ type: "destroy", room_id: roomId });
		setRooms((prevRooms) => prevRooms.filter((id) => id !== roomId));
	};

	const addChat = async () => {
		const input = prompt("ID del usuario al que quieres enviar mensaje"); // TODO - Poner esto bonico
		if (!input)
			return;
		const user_id = parseInt(input, 10);
		if (isNaN(user_id))
			return;

		try {
			const data = await apiRequest({
				endpoint: "websocket/rooms",
				method: "POST",
				body: { name: `Room ${Math.floor(Math.random() * 1000)}`, private: true, users: [user_id] },
			});

			setRooms((prevRooms) => {
				if (!prevRooms.includes(data.ID))
					return [...prevRooms, data.ID];
				return prevRooms;
			});
			joinRoom(data.ID)
		} catch (error) {
			console.error("Error creating chat room:", error);
		}
	};

	useEffect(() => {
		if (!user?.id)
			return;

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
        if (!user)
			return;

		const unsubscribeMessage = subscribe("message", (message: any) => {
			const { room_id } = message;
			if (!room_id)
				return;

			if (message.messages && Array.isArray(message.messages)) {
				setMessagesByRoom((prev) => ({
					...prev,
					[room_id]: message.messages
				}));
				return;
			}

			if (message.content) {
				const { message_id, content, username, timestamp } = message;
				const newMsg: ChatMessage = { message_id, content, username, timestamp };

				setMessagesByRoom((prev) => {
					const currentRoomMessages = prev[room_id] || [];
					const exists = currentRoomMessages.some(m => m.message_id === message_id);
					if (exists)
						return prev;

					return {
						...prev,
						[room_id]: [...currentRoomMessages, newMsg]
					};
				});
			}
		});

		const unsubscribeCreateRoom = subscribe("CREATE_ROOM", (message: any) => {
			const roomId = message.payload?.room_id;
			if (roomId) {
				setRooms((prev) => (prev.includes(roomId) ? prev : [...prev, roomId]));
				joinRoom(roomId);
			}
		});

		return () => {
			unsubscribeMessage();
			unsubscribeCreateRoom();
		};
	}, [subscribe]);


	return (
		<chatContext.Provider value={{ messagesByRoom, bye, joinRoom, sendMessage, rooms, addChat, user }}>
			{children}
		</chatContext.Provider>
	);
}

export const useChat = () => {
	const context = useContext(chatContext);
	if (!context)
		throw new Error("useChat debe usarse dentro de un ChatProvider");
	return context;
};
