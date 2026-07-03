import { createContext, useContext, useRef, useEffect, useState } from "react";

interface WebSocketContextType {
	websocket: any;
	messages:  any;
}

const WebSocketContext =  createContext<WebSocketContextType | undefined>(undefined)

const webSocketURL = "wss://localhost/api/v1/websocket/ws"


function useHandleWebsocket(user:any) {
    const websocket = useRef<WebSocket | null>(null);
	const [messages, setMessages] = useState<any>({});

	useEffect(() => {
        if (!user)
			return;
		let isConnected = true//cambiar esto. a lo mejor da problemas//cambiar a useRef

        const connect = () => {
            const ws = new WebSocket(webSocketURL);
			websocket.current = ws
			
			ws.onopen = () => {
				console.log("WebSocket conectado");
			}

            ws.onmessage = (event) => {
				const msg = JSON.parse(event.data);
				//console.log(msg)
				setMessages(msg)
			}

            ws.onclose = () => {
				if (isConnected){
                	console.log("WebSocket cerrado, reintentando...");
                	setTimeout(connect, 2000);
				}
            };
        };

        connect();

        return () => {
			isConnected = false
            websocket.current?.close();
        };
    }, [user?.id]);
	return { websocket, messages }
}

export function WebSocketProvider({ children, user }: { children: React.ReactNode; user: any }) {
	const { websocket, messages} = useHandleWebsocket(user)
	
	return (
		<WebSocketContext.Provider value={ {websocket, messages} }>
			{children}
		</WebSocketContext.Provider>
    );
}

export const useWebSocket = () => {
	const context = useContext(WebSocketContext);
	
	if (!context)
		throw new Error("useWebContext debe usarse dentro de un WebSocketProvider");
    return context;
}

