import { createContext, useContext, useEffect, useState } from "react";

interface NotificationContextType {
	notifications: any;
	//markChatAsRead : any;
	//handleFriendRequestAction : any;
}

const NotificationContext =  createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children, activeChat } : {children: React.ReactNode, activeChat : number | null} ) {
    const [notifications, setNotifications] = useState<any>(null);
    return (
        <NotificationContext.Provider value={{ notifications }}>
            {children}
        </NotificationContext.Provider>
    );
}
