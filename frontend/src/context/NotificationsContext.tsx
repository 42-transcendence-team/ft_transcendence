import { createContext, useContext, useEffect, useState } from "react";
import {apiRequest} from "../api/ApiRequest";
import {useWebSocket} from "./webSocketContext";
import content from "@reset";
import {updateData} from "api/Settings";

interface NotificationContextType {
	generalNotifications : any;
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
const getNotifications = async (updateNotifications) => {
	try {
		const data = await apiRequest({//esto creo que no hace falta que sea await
			endpoint: 'notifications',
			method: 'GET',
		})
		updateNotifications(data)
	} catch(e){
		console.log(e)
		return {}
	}
}

const useHandleNotis = (user:any, messages:any) => {
	const [notificationLikes, setNotificationLikes] = useState([])
	const [notificationPosts, setNotificationPosts] = useState([])
	const [notificationMessages, setNotificationMessages] = useState([])
	const [notificationFriendReq, setNotificationFriendReq] = useState([])
	const [generalNotifications, setGeneralNotifications] = useState([])//hace falta esto? como solo se pide una vez al iniciar la app...
	
	useEffect(() => {//solo para pedir las notificaciones una vez al entrar en la app
		getNotifications(setGeneralNotifications)
	}, [user?.id])
	
	useEffect(()=>{
		if (!messages?.type)
			return
		const type = messages.type
		switch(type){//para actualizar las notis si hay algun evento
			case 'message':
				getNotifications(setGeneralNotifications)
			case 'notification':
				getNotifications(setGeneralNotifications)
		}
	}, [messages])
	
	return {generalNotifications} 
}

export function NotificationProvider({ children, activeChat, user} : {children: React.ReactNode, activeChat : number | null, user : any } ) {
	const { messages } = useWebSocket()
	const { generalNotifications } = useHandleNotis(user, messages)

	return (
        <NotificationContext.Provider value={{ generalNotifications }}>
            {children}
        </NotificationContext.Provider>
    );
}


export const useNotification = () => {
	const context =  useContext(NotificationContext)

	if (!context) {
		throw new Error("useNotificationContext must be used within a NotificationProvider");
	}
	return context 
}
