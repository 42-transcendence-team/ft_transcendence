import { createContext, useContext, useCallback, useEffect, useState } from "react";
import { apiRequest } from "../api/ApiRequest";
import { useWebSocket } from "./webSocketContext";

// TODO - Darle una gran vuelta, esta hecho con chtGPT y no ha habido revision para que se furulase front

export type NotificationType =
	| "FRIEND_REQUEST"
	| "UNREAD_MESSAGES"
	| "FRIEND_REQUEST_ACCEPTED";

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

const getNotifications = async (update: (data: Notification[]) => void) => {
	try {
		const data = await apiRequest({
			endpoint: "notifications",
			method: "GET",
		});

		if (Array.isArray(data)) {
			update(data);
			return;
		}

		const notifications = data?.notifications || data?.data || [];
		update(Array.isArray(notifications) ? notifications : []);
	} catch {
		update([]);
	}
};

export const useHandleNotification = ( user: any, subscribe: any, activeChat: number | null ) => {
	const [notifications, setNotifications] = useState<Notification[]>([]);

	useEffect(() => {
		if (!user?.id) {
			setNotifications([]);
			return;
		}

		getNotifications(setNotifications);
	}, [user?.id]);

	const updateChat = useCallback(async (id: number | null) => {
		if (!id) return;

		await apiRequest({
			endpoint: "chat/enter",
			method: "PUT",
			body: { room_id: id },
		});
	}, []);

	useEffect(() => {
		return subscribe("UNREAD_MESSAGES", (msg: any) => {
			const roomId = msg.room_id;

			setNotifications((prev) => {
				if (roomId === activeChat) {
					updateChat(roomId);
					return prev;
				}

				const idx = prev.findIndex(
					(n) =>
						n.type === "UNREAD_MESSAGES" &&
						n.payload?.room_id === roomId
				);

				if (idx !== -1) {
					const updated = [...prev];
					const current = updated[idx];
					const count = current.payload?.unread_count || 0;

					updated[idx] = {
						...current,
						payload: {
							...current.payload,
							unread_count: count + 1,
							room_id: roomId,
						},
					};

					return updated;
				}

				return [
					{
						id: `unread_${roomId}_${Date.now()}`,
						type: "UNREAD_MESSAGES",
						payload: {
							room_id: roomId,
							unread_count: 1,
						},
						createdAt: new Date().toISOString(),
					},
					...prev,
				];
			});
		});
	}, [subscribe, activeChat, updateChat]);

	useEffect(() => {
		return subscribe("FRIEND_REQUEST", (msg: any) => {
			setNotifications((prev) => {
				const exists = prev.some(
					(n) => n.type === "FRIEND_REQUEST" && n.payload?.id === msg.payload?.id
				);

				if (exists) return prev;

				return [
					{
						id: msg.payload?.id || `friend_${Date.now()}`,
						type: "FRIEND_REQUEST",
						payload: msg.payload,
						createdAt: new Date().toISOString(),
					},
					...prev,
				];
			});
		});
	}, [subscribe]);

	useEffect(() => {
		return subscribe("FRIEND_REQUEST_ACCEPTED", (msg: any) => {
			setNotifications((prev) =>
				prev.filter(
					(n) => !( n.type === "FRIEND_REQUEST" && n.payload?.id === msg.payload?.id )
				)
			);
		});
	}, [subscribe]);

	const markAsRead = useCallback((id: string | number) => {
		setNotifications((prev) =>
			prev.filter((n) => n.id !== id)
		);
	}, []);

	const clearRoomNotifications = useCallback((roomId: number | string) => {
		setNotifications((prev) =>
			prev.filter(
				(n) => !( n.type === "UNREAD_MESSAGES" && n.payload?.room_id === roomId )
			)
		);
	}, []);

	return {
		notifications,
		markAsRead,
		clearRoomNotifications,
	};
};

export function NotificationProvider({ children, activeChat, user }:
{ children: React.ReactNode; activeChat: number | null; user: any }) {
	const { subscribe } = useWebSocket();

	const { notifications, markAsRead, clearRoomNotifications } =
		useHandleNotification(user, subscribe, activeChat);

	return (
		<NotificationContext.Provider
			value={{
				notifications,
				markAsRead,
				clearRoomNotifications,
			}}
		>
			{children}
		</NotificationContext.Provider>
	);
}

export const useNotification = () => {
	const context = useContext(NotificationContext);

	if (!context) {
		throw new Error(
			"useNotification debe usarse dentro de NotificationProvider"
		);
	}

	return context;
};