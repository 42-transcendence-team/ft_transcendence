import { createContext, useContext, useEffect, useState } from "react";
import {apiRequest} from "../api/ApiRequest";
import {useWebSocket} from "./webSocketContext";
import content from "@reset";
import {updateData} from "api/Settings";

interface NotificationContextType {
	notifications : any;
}
//notificaiones de peticiones de amistad, mensajes no leidos, posts, likes\
const NotificationContext =  createContext<NotificationContextType | undefined>(undefined)
/*
 *interface ApiRequestProps {
    endpoint: string;
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    body?: unknown;
    includeCredentials?: boolean;
}
*/
export type NotificationType = 'FRIEND_REQUEST' | 'UNREAD_MESSAGES' | 'FRIEND_REQUEST_ACCEPTED';

export interface Notification {
  id: number;
  type: NotificationType;
  payload: any;
  createdAt: string;
}

const getNotifications = async (updateNotifications) => {
	try {
		const data = await apiRequest({
			endpoint: 'notifications',
			method: 'GET',
		})
		if (data) 
			updateNotifications(data)
	} catch(e){
		console.log(e)
		return {}
	}
}

export const useHandleNotification = (user: any, messages: any, activeChat: number | null) => {
	const [notifications, setNotifications] = useState<Notification[]>([]);

	useEffect(() => {
	if (!user?.id)
		return;
	getNotifications(setNotifications); 
	}, [user?.id]);

	useEffect(() => {
	if (!messages || !messages.type || messages.type !== 'message' || !messages.room_id)
		return;

	const roomId = messages.room_id;

	if (roomId === activeChat) {
	  updateChat(activeChat);
	} else {
	  setNotifications((prevNotis) => {
		const exists = prevNotis.some(n => n.type === 'UNREAD_MESSAGES' && n.payload.room_id === roomId);

		if (exists) {
		  return prevNotis.map(n => {
			if (n.type === 'UNREAD_MESSAGES' && n.payload.room_id === roomId) {
			  return {
				...n,
				payload: { ...n.payload, unread_count: n.payload.unread_count + 1 }
			  };
			}
			return n;
		  });
		} else {
		  return [
			{
			  id: `unread_room_${roomId}`,
			  type: 'UNREAD_MESSAGES',
			  payload: { room_id: roomId, unread_count: 1 }
			},
			...prevNotis
		  ];
		}
	  });
	}
	}, [messages, activeChat]);

	useEffect(() => {
	if (activeChat) {
	  updateChat(activeChat);
	  
	  setNotifications((prevNotis) => 
		prevNotis.filter(n => !(n.type === 'UNREAD_MESSAGES' && n.payload.room_id === activeChat))
	  );
	}
	}, [activeChat]);

	useEffect(() => {
	if (!messages?.type)
		return;

	switch (messages.type) {
	  case 'FRIEND_REQUEST':
		setNotifications((prevNotis) => [
		  {
			id: `friend_req_${messages.payload.id}`,
			type: 'FRIEND_REQUEST',
			payload: messages.payload // Los datos de la solicitud que envía Go
		  },
		  ...prevNotis
		]);
		break;

	  case 'FRIEND_REQUEST_ACCEPTED':
		setNotifications((prevNotis) => 
		  prevNotis.filter(n => n.id !== `friend_req_${messages.payload.id}`)
		);
		break;

	  default:
		console.log('Evento no manejado o desconocido: ', messages);
		break;
	}
	}, [messages]);

	return { notifications, setNotifications };
};

const updateChat = (id: number | null) => {
	try {
		apiRequest({
			endpoint: `chat/enter`,
			method: "PUT",
			body: {room_id: id}
		});
	}catch(e){
		console.log(e, 'no chat actualizado')
	}
}

//const getUnreadMessages = async (roomId : number | null) => {
//	try {
//		const data = await apiRequest({
//			endpoint: `chat/unread/${roomId}`,
//			method: "GET",
//		});
//		//console.log('mesajes no leido desde', roomId, data)
//		return data
//	}catch(e){
//		console.log(e)
//	}
//}

export function NotificationProvider({ children, activeChat, user} : {children: React.ReactNode, activeChat : number | null, user : any } ) {
	const { messages } = useWebSocket()
	const { notifications } = useHandleNotification(user, messages, activeChat)

	return (
        <NotificationContext.Provider value={{ notifications }}>
            {children}
        </NotificationContext.Provider>
    );
}

export const useNotification = () => {
	const context =  useContext(NotificationContext)

	if (!context) {
		throw new Error("useNotificationContext debe estar dentro de un NotificationProvider");
	}
	return context 
}
