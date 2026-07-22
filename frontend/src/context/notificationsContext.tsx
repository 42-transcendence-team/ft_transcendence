import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiRequest } from "../api/ApiRequest";
import { useWebSocket } from "./webSocketContext";

export type NotificationType = 'FRIEND_REQUEST' | 'UNREAD_MESSAGES' | 'FRIEND_REQUEST_ACCEPTED';
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
  clearRoomNotifications: (roomId: number | string) => void;
  markAsRead: (notificationId: string | number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// El backend no envia un "id" en las notificaciones del fetch HTTP;
const normalizeNotifications = (data: any[]): Notification[] => {
	return data.map((n: any, i: number) => ({
		...n,
		id: n.id ?? `${n.type}_${n.payload?.id ?? n.payload?.room_id ?? i}`,
	}));
};

const getNotifications = async (updateNotifications: (data: Notification[]) => void) => {
	try {
		const data = await apiRequest({
		endpoint: 'notifications',
		method: 'GET',
		});
		if (data && Array.isArray(data)) {
			updateNotifications(normalizeNotifications(data));
		} else if (data) {
			const notifications = data.notifications || data.data || [];
			if (Array.isArray(notifications)) {
				updateNotifications(normalizeNotifications(notifications));
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

const updateChat = async (id: number | null) => {
	if (!id)
		return;
	try {
		await apiRequest({
			endpoint: 'chat/enter',
			method: "PUT",
			body: { room_id: id }
		});
	} catch (error) {}
};

export const useHandleNotification = (user: any, activeChat: number | null, subscribe: (type: string, handler: (message: any) => void) => () => void,) => {
	const [notifications, setNotifications] = useState<Notification[]>([]);

	useEffect(() => {
		if (!user?.id) {
			setNotifications([]);
			return;
		}
		getNotifications(setNotifications);
	}, [user?.id]);


	useEffect(() => {
		if (activeChat === null)
			return;

		updateChat(activeChat);
		setNotifications((prev) => {
			const currentNotis = Array.isArray(prev) ? prev : [];
			return currentNotis.filter(
				n => !(n.type === 'UNREAD_MESSAGES' && n.payload?.room_id === activeChat)
			);
		});
	}, [activeChat]);

	useEffect(() => {
		const handleMessage = (message: any) => {
			if (message.type !== 'message')
				return;

			const roomId = message.room_id;
			if (!roomId)
				return;
			if (roomId === activeChat) {
				updateChat(roomId);
				return;
			}

			setNotifications((prevNotis) => {
				const currentNotis = Array.isArray(prevNotis) ? prevNotis : [];
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
		};

		const handleFriendRequest = (message: any) => {
			// El payload WS es {sender_id, receiver_id} (sin "id"); el del fetch HTTP
			// es {id, user_id, ...}. Se dedup por el emisor para cubrir ambos casos.
			const senderIdOf = (p: any) => p?.sender_id ?? p?.user_id;
			setNotifications((prevNotis) => {
				const currentNotis = Array.isArray(prevNotis) ? prevNotis : [];
				const exists = currentNotis.some(
					n => n.type === 'FRIEND_REQUEST' && senderIdOf(n.payload) === senderIdOf(message.payload)
				);
				if (exists)
					return currentNotis;
				return [
					{
						id: message.payload?.id || `friend_req_${senderIdOf(message.payload) ?? Date.now()}`,
						type: 'FRIEND_REQUEST',
						payload: message.payload,
						createdAt: new Date().toISOString()
					},
					...currentNotis
				];
			});
		};

		const handleFriendRequestAccepted = (message: any) => {
			setNotifications((prevNotis) => {
				const currentNotis = Array.isArray(prevNotis) ? prevNotis : [];
				return currentNotis.filter(
					n => !(n.type === 'FRIEND_REQUEST' && n.payload?.id === message.payload?.id)
				);
			});
		};
		const unsubMessage = subscribe('message', handleMessage);
		const unsubFriendReq = subscribe('FRIEND_REQUEST', handleFriendRequest);
		const unsubFriendAccepted = subscribe('FRIEND_REQUEST_ACCEPTED', handleFriendRequestAccepted);

		return () => {
			unsubMessage();
			unsubFriendReq();
			unsubFriendAccepted();
		};
	}, [user?.id, subscribe, activeChat]);

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
		clearRoomNotifications,
		markAsRead
	};
};

export function NotificationProvider({ children, activeChat, user  }: { children: React.ReactNode; activeChat: number | null; user: any;}) {
	const { subscribe} = useWebSocket();
	const { notifications, clearRoomNotifications, markAsRead } = useHandleNotification( user, activeChat, subscribe,);

	const value = { notifications, clearRoomNotifications, markAsRead };

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
			clearRoomNotifications: () => {},
			markAsRead: () => {}
		};
	}
	return context;
};
