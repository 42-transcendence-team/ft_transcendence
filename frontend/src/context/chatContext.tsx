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

export interface RoomMember {
	id: number;
	login: string;
	avatar_url: string;
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
	roomMembers: Record<number, RoomMember[]>;
	lastActivity: Record<number, number>;
	addChat: (otherUserId: number, otherLogin?: string, otherAvatar?: string) => Promise<number | null>;
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
	const [ roomMembers, setRoomMembers ] = useState<Record<number, RoomMember[]>>({});
	const blockedRoomIdsRef = useRef<Set<number>>(new Set());
	const fetchRoomsRef = useRef<() => Promise<void>>();
	useJoinRooms(rooms);

	const sendMessage = useCallback((roomId: number, content: string) => {
		if (!user || !user.login)
			return;
		// Insercion optimista: el mensaje aparece inmediatamente en la UI
		// con un ID temporal. Cuando el servidor devuelve el eco, el handler
		// reemplaza el temp por el mensaje real (coincidiendo por contenido+usuario).
		const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
		const now = new Date().toISOString();
		const optimisticMsg = { message_id: tempId, content, username: user.login, timestamp: now, _pending: true } as ChatMessage & { _pending?: boolean };

		setMessagesByRoom(prev => ({
			...prev,
			[roomId]: [...(prev[roomId] || []), optimisticMsg],
		}));
		setLastActivity(prev => ({...prev, [roomId]: Date.now()}));
		send({
			type: "message",
			username: user.login,
			user_id: user.id,
			room_id: roomId,
			content: content
		});
	}, [user, send]);

    const joinRoom = useCallback((roomId: number) => {
		if (messagesByRoom[roomId] !== undefined) {
			return;
		}
		send({ type: "join_room", room_id: roomId });
		console.log(`Joining room ${roomId}`);
	}, [messagesByRoom, send]);


	const addChat = async (otherUserId: number, otherLogin?: string, otherAvatar?: string): Promise<number | null> => {
		const currentUserId = parseInt(user!.id, 10);
		if (isNaN(currentUserId)) return null;

		// Si ya existe una sala entre estos dos usuarios, devolver esa en vez de crear otra
		try {
			const existing = await apiRequest({ endpoint: "websocket/rooms", method: "GET" });
			for (const r of (existing || [])) {
				const ids: number[] = (r.Members || r.members || []).map(
					(m: any) => m.ID ?? m.id ?? 0
				);
				if (ids.includes(currentUserId) && ids.includes(otherUserId)) {
					const roomId: number = r.ID ?? r.id;
					// Si la sala estaba bloqueada, la desbloqueamos al re-abrirla explicitamente
					blockedRoomIdsRef.current.delete(roomId);
					setLastActivity(prev => ({...prev, [roomId]: Date.now()}));
					joinRoom(roomId);
					return roomId;
				}
			}
		} catch {
			// Si falla la consulta, continuamos e intentamos crear igualmente
		}

		try {
			const data = await apiRequest({
				endpoint: "websocket/rooms",
				method: "POST",
				body: { name: `Room ${Math.floor(Math.random() * 1000)}`, private: true, users: [otherUserId] },
			});

			setRooms((prevRooms) => {
				if (!prevRooms.includes(data.ID))
					return [...prevRooms, data.ID];
				return prevRooms;
			});
			setRoomMembers(prev => {
				if (prev[data.ID]) return prev;
				return {
					...prev,
					[data.ID]: [
						{ id: currentUserId, login: user!.login!, avatar_url: '' },
						{ id: otherUserId, login: otherLogin ?? '', avatar_url: otherAvatar ?? '' },
					],
				};
			});
			setLastActivity(prev => ({...prev, [data.ID]: Date.now()}));
			joinRoom(data.ID);
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
				const allIds = data.map((r: any) => r.ID ?? r.id);
				setRooms(allIds.filter((id: number) => !blockedRoomIdsRef.current.has(id)));
				const members: Record<number, RoomMember[]> = {};
				for (const r of (data || [])) {
					const roomId = r.ID ?? r.id;
					members[roomId] = (r.Members || r.members || []).map((m: any) => ({
						id: m.ID ?? m.id ?? 0,
						login: m.Login ?? m.login ?? '',
						avatar_url: m.AvatarPath ?? m.avatarPath ?? m.Avatar ?? m.avatar ?? m.avatar_url ?? '',
					}));
				}
				setRoomMembers(members);
			} catch (e) {
				console.error("Error fetching rooms:", e);
			}
		};
		fetchRoomsRef.current = fetchRooms;
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
					const msgs = prev[room_id] || [];
					// ¿Ya tenemos este mensaje real?
					if (msgs.some(m => m.message_id === message_id))
						return prev;

					// Reemplazar el mensaje optimista pendiente que coincida en contenido+usuario
					const pendingIdx = msgs.findIndex(m =>
						(m as any)._pending && m.username === username && m.content === content
					);
					if (pendingIdx !== -1) {
						const updated = [...msgs];
						updated[pendingIdx] = newMsg;
						return {...prev, [room_id]: updated};
					}

					return {
						...prev,
						[room_id]: [...msgs, newMsg]
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
				// No reincorporar salas bloqueadas por WS
				if (blockedRoomIdsRef.current.has(roomId)) return;
				setRooms((prev) => (prev.includes(roomId) ? prev : [...prev, roomId]));
				joinRoom(roomId);
				fetchRoomsRef.current?.();
			}
		});

		// El servidor rechazo el mensaje (no eres amigo o hay bloqueo):
		// eliminar el mensaje optimista pendiente.
		const unsubscribeRejected = subscribe("message_rejected", (message: any) => {
			const { room_id, content } = message;
			if (!room_id) return;
			setMessagesByRoom(prev => {
				const msgs = prev[room_id] || [];
				// Quitar el temp que coincida en contenido (el optimistic tiene mismo content)
				const cleaned = msgs.filter(m =>
					!(m as any)._pending || m.content !== content
				);
				if (cleaned.length === msgs.length) return prev;
				return {...prev, [room_id]: cleaned};
			});
		});

		// Fin de amistad o bloqueo: ocultar la sala compartida del panel
		const unsubscribeBlocked = subscribe("ROOM_BLOCKED", (message: any) => {
			const roomId = message.payload?.room_id;
			if (!roomId) return;
			blockedRoomIdsRef.current.add(roomId);
			setRooms(prev => prev.filter(r => r !== roomId));
			setLastActivity(prev => {
				const copy = {...prev};
				delete copy[roomId];
				return copy;
			});
		});

		return () => {
			unsubscribeMessage();
			unsubscribeCreateRoom();
			unsubscribeJoin();
			unsubscribeRejected();
			unsubscribeBlocked();
		};
	}, [subscribe]);


	return (
		<chatContext.Provider value={{ messagesByRoom, joinRoom, sendMessage, rooms, roomMembers, lastActivity, addChat, user }}>
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
