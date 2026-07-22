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
	rooms: number[];
	lastActivity: Record<number, number>;
	addChat: () => Promise<number | null>;
	user: AuthUser | null;
}

const chatContext = createContext<ChatContextType | undefined>(undefined);

function useJoinRooms(rooms: number[]) {
	const { send, isConnected } = useWebSocket();
	const joinedRoomsRef = useRef<Set<number>>(new Set());

	useEffect(() => {
		if (!isConnected) {
			joinedRoomsRef.current.clear();
			return;
		}
		rooms.forEach((roomId) => {
			if (!joinedRoomsRef.current.has(roomId)) {
				send({ type: "join_room", room_id: roomId });
				joinedRoomsRef.current.add(roomId);
			}
		});
	}, [isConnected, rooms, send]);
}

export function ChatProvider({ children, user }: { children: React.ReactNode; user: AuthUser | null }) {
	const { send, subscribe } = useWebSocket();
	const [ messagesByRoom, setMessagesByRoom ] = useState<MessagesState>({});
	const [ rooms, setRooms ] = useState<number[]>([]);
	const [ lastActivity, setLastActivity ] = useState<Record<number, number>>({});
	useJoinRooms(rooms);

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
		setLastActivity(prev => {
			if (prev[roomId] !== undefined && prev[roomId] >= Date.now())
				return prev;
			return {...prev, [roomId]: Date.now()};
		});
	}, [user, send]);

    const joinRoom = useCallback((roomId: number) => {
		if (messagesByRoom[roomId] && messagesByRoom[roomId].length > 0) {
			return;
		}
		send({ type: "join_room", room_id: roomId });
		console.log(`Joining room ${roomId}`);
	}, [messagesByRoom, send]);


	const addChat = async (): Promise<number | null> => {
		const input = prompt("ID del usuario al que quieres enviar mensaje"); // TODO - Poner esto bonico
		if (!input)
			return null;
		const user_id = parseInt(input, 10);
		if (isNaN(user_id))
			return null;

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
			return data.ID;
		} catch (error) {
			console.error("Error creating chat room:", error);
			return null;
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


		const unsubscribeJoin = subscribe("join", (message: any) => {
			const {room_id} = message
			setMessagesByRoom((prev) => {
				return {
					...prev,
					[room_id]: [...message.messages]
				};
			});
			const msgs = message.messages;
			if (msgs && msgs.length > 0) {
				const lastMsg = msgs[msgs.length - 1];
				if (lastMsg.timestamp) {
					const ts = new Date(lastMsg.timestamp).getTime();
					if (!isNaN(ts)) {
						setLastActivity(prev => ({...prev, [room_id]: ts}));
					}
				}
			}
			console.log('mensaje aqui: ', message)
		});
		const unsubscribeMessage = subscribe("message", (message: any) => {
			const { room_id } = message;
			if (!room_id)
				return;

			if (message.messages && Array.isArray(message.messages)) {
				setMessagesByRoom((prev) => ({
					...prev,
					[room_id]: message.messages
				}));
				const msgs = message.messages;
				if (msgs.length > 0) {
					const lastTs = msgs[msgs.length - 1].timestamp;
					if (lastTs) {
						const ts = new Date(lastTs).getTime();
						if (!isNaN(ts)) setLastActivity(prev => ({...prev, [room_id]: ts}));
					}
				}
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

				let msgTs = Date.now();
				if (timestamp) {
					const parsed = new Date(timestamp).getTime();
					if (!isNaN(parsed)) msgTs = parsed;
				}
				setLastActivity(prev => ({...prev, [room_id]: msgTs}));
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
			unsubscribeJoin();
		};
	}, [subscribe]);


	return (
		<chatContext.Provider value={{ messagesByRoom, joinRoom, sendMessage, rooms, lastActivity, addChat, user }}>
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
