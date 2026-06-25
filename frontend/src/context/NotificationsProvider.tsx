import { createContext, useEffect, useState } from "react";
import {apiRequest} from "../api/ApiRequest";

interface NotificationContextType {
	notifications: any;
}

const NotificationContext =  createContext<NotificationContextType | undefined>(undefined)
/*
 *interface ApiRequestProps {
    endpoint: string;
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    body?: unknown;
    includeCredentials?: boolean;
}
* */
// const getUnreadMessages = async (roomId : number | null) => {
// 	try {
// 		const data = await apiRequest({
// 			endpoint: `chat/unread/${roomId}`,
// 			method: "GET",
// 		});
// 		console.log('mesajes no leido desde', roomId, data)
// 		return data
// 	}catch(e){
// 		console.log(e)
// 	}
// }
//
const getNotifications = async () => {
	try {
		const data = await apiRequest({
			endpoint: 'notifications',
			method: 'GET',
		})
		console.log('notis: ', data)
	} catch(e){
		console.log(e)
	}
}

export function NotificationProvider({ children, activeChat, user} : {children: React.ReactNode, activeChat : number | null, user : any } ) {
	const [notifications, setNotifications] = useState<any>([])
	
	useEffect(() => {
		getNotifications()
	}, [user?.id]) 
	
	return (
        <NotificationContext.Provider value={{ notifications }}>
            {children}
        </NotificationContext.Provider>
    );
}
