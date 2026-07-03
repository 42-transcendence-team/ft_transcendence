import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiRequest } from "../api/ApiRequest";
import { useWebSocket } from "./webSocketContext";

export type NotificationType = 'FRIEND_REQUEST' | 'UNREAD_MESSAGES' | 'FRIEND_REQUEST_ACCEPTED';
//posts, likes, typing, status
export interface NotificationPayload {
	id?: number | string;
	username?: string;
	room_id?: number | string;
	unread_count?: number;
	status?: string;
	[key: string]: any;
}

export interface Notification {
	id: string | number;
	type: NotificationType;
	payload: NotificationPayload;
	createdAt?: string;
}

interface NotificationContextType {
	notifications: Notification[];
	//setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
	clearRoomNotifications: (roomId: number | string) => void;
	markAsRead: (notificationId: string | number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const getNotifications = async (updateNotifications: (data: Notification[]) => void) => {
	try {
		const data = await apiRequest({
			endpoint: 'notifications',
			method: 'GET',
		});

		if (data && Array.isArray(data)) {
			updateNotifications(data);
		} else if (data) {
			const notifications = data.notifications || data.data || [];
			if (Array.isArray(notifications)) {
				updateNotifications(notifications);
			} else {
				updateNotifications([]);
			}
		} else {
			updateNotifications([]);
		}
	} catch (error) {
		updateNotifications([]);
	}
};

export const useHandleNotification = (user: any, messages: any, activeChat: number | null) => {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	//const previousActiveChat = useRef<number | null>(null);

	useEffect(() => {
		if (!user?.id) {
			setNotifications([]);
			return;
		}
		getNotifications(setNotifications);
	}, [user?.id]);

	useEffect(() => {
		updateChat(activeChat);

		setNotifications((prev) => {
			const currentNotis = Array.isArray(prev) ? prev : [];

			const filtered = currentNotis.filter(
				n => !(n.type === 'UNREAD_MESSAGES' && n.payload?.room_id === activeChat)
			);

			return filtered;
		});
		//previousActiveChat.current = activeChat;
	}, [activeChat]);

	useEffect(() => {
		if (!messages?.type || messages.type !== 'message' || !messages.room_id) {
			return;
		}

		const roomId = messages.room_id;

		// if (activeChat == messages.room_id)  
		// 	updateChat(roomId);

		setNotifications((prevNotis) => {
			const currentNotis = Array.isArray(prevNotis) ? prevNotis : [];

			if (roomId === activeChat) {
				updateChat(roomId);//no deberia dar problemas
				return currentNotis;
			}
			//esto no incrementa el contador de notificaciones si ya existe una notificación
			//consular si dejar o no
			const existingIndex = currentNotis.findIndex(
				n => n.type === 'UNREAD_MESSAGES' && n.payload?.room_id === roomId
			);

			if (existingIndex !== -1) {
				const updatedNotis = [...currentNotis];
				const existing = updatedNotis[existingIndex];
				const currentCount = existing.payload?.unread_count || 0;

				updatedNotis[existingIndex] = {
					...existing,
					payload: {
						...existing.payload,
						unread_count: currentCount + 1,
						room_id: roomId
					}
				};

				return updatedNotis;
			} else {
				return [
					{
						id: `unread_room_${roomId}_${Date.now()}`,
						type: 'UNREAD_MESSAGES',
						payload: {
							room_id: roomId,
							unread_count: 1,
							created_at: new Date().toISOString()
						}
					},
					...currentNotis
				];
			}
		});
	}, [messages]);

	useEffect(() => {
		if (!messages?.type || !messages?.payload) {
			return;
		}

		switch (messages.type) {
			case 'FRIEND_REQUEST':
				setNotifications((prevNotis) => {
					const currentNotis = Array.isArray(prevNotis) ? prevNotis : [];

					const exists = currentNotis.some(
						n => n.type === 'FRIEND_REQUEST' && n.payload?.id === messages.payload.id
					);//esto no creo que haga falta porque el back ya lo comprueba

					if (exists)
						return currentNotis;

					return [
						{
							id: messages.payload.id || `friend_req_${Date.now()}`,
							type: 'FRIEND_REQUEST',
							payload: messages.payload,
							createdAt: new Date().toISOString()
						},
						...currentNotis
					];
				});
			break;

			case 'FRIEND_REQUEST_ACCEPTED':
				setNotifications((prevNotis) => {
					const currentNotis = Array.isArray(prevNotis) ? prevNotis : [];
					return currentNotis.filter(
						n => !(n.type === 'FRIEND_REQUEST' && n.payload?.id === messages.payload?.id)
					);
				});
			break;

			default:
			break;
		}
	}, [messages]);

	const markAsRead = useCallback((notificationId: string | number) => {
		setNotifications((prevNotis) => {
			const currentNotis = Array.isArray(prevNotis) ? prevNotis : [];
			return currentNotis.filter(n => n.id !== notificationId);
		});
	}, []);

	const clearRoomNotifications = useCallback((roomId: number | string) => {
		setNotifications((prevNotis) => {
			const currentNotis = Array.isArray(prevNotis) ? prevNotis : [];
			return currentNotis.filter(
				n => !(n.type === 'UNREAD_MESSAGES' && n.payload?.room_id === roomId)
			);
		});
	}, []);

	return {
		notifications: Array.isArray(notifications) ? notifications : [],
		//setNotifications,
		clearRoomNotifications,
		markAsRead
	};
};

const updateChat = async (id: number | null) => {
	if (!id)
		return;

	try {
		await apiRequest({
			endpoint: 'chat/enter',
			method: "PUT",
			body: { room_id: id }
		});
	} catch (error) {
	}
};

export function NotificationProvider({children,activeChat,user}: {children: React.ReactNode; activeChat: number | null; user: any;}) {
	const { messages } = useWebSocket();
	const { notifications, /*setNotifications,*/ clearRoomNotifications, markAsRead } = useHandleNotification(user, messages, activeChat);

	const value = { notifications, /*setNotifications,*/ clearRoomNotifications, markAsRead };

	return (
		<NotificationContext.Provider value={value}>
			{children}
		</NotificationContext.Provider>
	);
}

export const useNotification = () => {
	const context = useContext(NotificationContext);

	if (!context) {
		console.warn('useNotification debe usarse dentro de un NotificationProvider');
		return {
			notifications: [],
			setNotifications: () => {},
			clearRoomNotifications: () => {},
			markAsRead: () => {}
		};
	}

	return context;
};
