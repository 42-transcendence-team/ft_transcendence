import { apiRequest } from "api/ApiRequest";
import { createContext, useContext, useCallback, useEffect, useState } from "react";
import { useWebSocket } from "./webSocketContext";

interface User {
	id: string;
	login: string;
}

type RoomId = number;

type Message = {
	message_id: number;
	content: string;
	username: string;
	timestamp: string;
};

type IncomingMessage = Message & {
	room_id: RoomId;
};

interface MessagesState {
	[roomId: number]: Message[];
}

interface ChatContextType {
	sendMessage: (roomId: number, content: string) => void;
	loadRoom: (roomId: number) => Promise<void>;
	messagesByRoom: MessagesState;
	rooms: RoomId[];
	addChat: () => void;
	user: User;
}

type RoomDTO = {
	ID: number;
};

const chatContext = createContext<ChatContextType | undefined>(undefined);

const useSendMessage = (user: User, send: any) => {
	return useCallback(
		(roomId: number, content: string) => {
			send({
				type: "message",
				username: user.login,
				user_id: user.id,
				room_id: roomId,
				content,
			});
		},
		[user.id, user.login, send]
	);
};

const useMessagesByRoom = (subscribe: any) => {
	const [messagesByRoom, setMessagesByRoom] = useState<MessagesState>({});

	console.log("hook mounted");

	useEffect(() => {
		console.log("subscribe registered");

		return subscribe("message", (msg: any) => {
			console.log("WS MESSAGE RECEIVED", msg);

			setMessagesByRoom(prev => {
				console.log("setting state");

				const roomId = Number(msg.room_id);
				const prevMsgs = prev[roomId] || [];

				return {
					...prev,
					[roomId]: [...prevMsgs, msg],
				};
			});
		});
	}, [subscribe]);

	return { messagesByRoom, setMessagesByRoom };
};

const useHandleRooms = (user: User, send: any) => {
	const [rooms, setRooms] = useState<RoomId[]>([]);

	useEffect(() => {
		if (!user?.id) return;

		const fetchRooms = async () => {
			const data: RoomDTO[] = await apiRequest({
				endpoint: "websocket/rooms",
				method: "GET",
			});

			setRooms(data.map((r) => r.ID));
		};

		fetchRooms();
	}, [user?.id]);

	const addChat = async () => {
		if (!user?.id) {
			console.error("No user ID available");
			return;
		}

		const data: RoomDTO = await apiRequest({
			endpoint: "websocket/rooms",
			method: "POST",
			body: {
				name: `Room ${Math.floor(Math.random() * 1000)}`,
				private: true,
				users: [user.id],
			},
		});

		setRooms((prev) =>
			prev.includes(data.ID) ? prev : [...prev, data.ID]
		);

		send({
			type: "join_room",
			room_id: data.ID,
		});
	};

	return { rooms, addChat };
};

const useLoadRoom = (
	setMessagesByRoom: React.Dispatch<React.SetStateAction<MessagesState>>,
	send: any
) => {
	return useCallback(async (roomId: number) => {
		send({
			type: "join_room",
			room_id: roomId,
		});

		const data: IncomingMessage[] = await apiRequest({
			endpoint: `websocket/rooms/${roomId}/messages`,
			method: "GET",
		});

		setMessagesByRoom(prev => ({
			...prev,
			[roomId]: data.map(m => ({
				message_id: m.message_id,
				content: m.content,
				username: m.username,
				timestamp: m.timestamp,
			})),
		}));
	}, [send]);
};

export function ChatProvider({ children, user }: { children: React.ReactNode; user: any }) {
	const { send, subscribe } = useWebSocket();

	const { messagesByRoom, setMessagesByRoom } =
		useMessagesByRoom(subscribe);

	const sendMessage = useSendMessage(user, send);
	const { rooms, addChat } = useHandleRooms(user, send);

	const loadRoom = useLoadRoom(setMessagesByRoom, send);

	useEffect(() => {
		console.log("messagesByRoom:", messagesByRoom);
	}, [messagesByRoom]);

	console.log("ChatProvider MOUNT");
	
	return (
		<chatContext.Provider
			value={{
				messagesByRoom,
				sendMessage,
				rooms,
				addChat,
				user,
				loadRoom,
			}}
		>
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