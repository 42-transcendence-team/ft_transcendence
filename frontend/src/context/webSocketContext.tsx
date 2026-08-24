import { createContext, useContext, useRef, useEffect, useState, useCallback } from "react";

interface WebSocketContextType {
	send: (message: any) => void;
	subscribe: (type: string, handler: (message: unknown) => void) => () => void;
	isConnected: boolean;
}

interface AuthUser {
	id: string;
	login?: string;
}

const WebSocketContext =  createContext<WebSocketContextType | undefined>(undefined)

const webSocketURL = "wss://localhost/api/v1/websocket/ws"

type MessageHandler = (message: any) => void;

export function useHandleWebsocket(user: AuthUser | null) {
	const websocket = useRef<WebSocket | null>(null);
	const listeners = useRef(new Map<string, Set<MessageHandler>>());
	const reconnectTimeout = useRef<number | null>(null);
	const shouldReconnect = useRef(true);
	const [isConnected, setIsConnected] = useState(false);

	const send = useCallback((message: any): boolean => {
		if (websocket.current?.readyState !== WebSocket.OPEN)
			return false;

		websocket.current.send(JSON.stringify(message));
		return true;
	}, []);

	const subscribe = useCallback((type: string, handler: MessageHandler) => {
		if (!listeners.current.has(type)) {
			listeners.current.set(type, new Set());
		}

		listeners.current.get(type)!.add(handler);

		return () => {
			listeners.current.get(type)?.delete(handler);
		};
	}, []);

	useEffect(() => {
		if (!user){
			return;
		}

		shouldReconnect.current = true;

		const connect = () => {
			const ws = new WebSocket(webSocketURL);
			websocket.current = ws;

			ws.onopen = () => {
				if (websocket.current?.readyState === WebSocket.OPEN) {
					setIsConnected(true);
				}
			};

			ws.onmessage = (event) => {
				const message = JSON.parse(event.data);
				const { type } = message;
				const typeListeners = listeners.current.get(type);

				console.log("Mensaje recibido:", message);

				if (typeListeners) {
					typeListeners.forEach(listener => {
						try {
							listener(message);
						} catch (e) {
							console.error(e);
						}
					});
				}
			};

			ws.onclose = (e) => {
				console.log("WebSocket cerrado");
				setIsConnected(false);
				console.log("WS close:", {
					code: e.code,
					reason: e.reason,
					wasClean: e.wasClean,
				});
				if (websocket.current) {
					websocket.current?.close();
				}
				if (!shouldReconnect.current){
					return
				}

				reconnectTimeout.current = window.setTimeout(connect, 2000);
			};

			ws.onerror = (error) => {
				console.error("WebSocket error:", error);
			}
		};

		connect();

		return () => {
			shouldReconnect.current = false;
			listeners.current.clear();

			if (reconnectTimeout.current)
				clearTimeout(reconnectTimeout.current);

			websocket.current?.close();
		};
	}, [user?.id]);

	return { send, subscribe, isConnected};
}

export function WebSocketProvider({ children, user }: { children: React.ReactNode; user: AuthUser | null }) {
	const { send, subscribe, isConnected} = useHandleWebsocket(user)
	
	return (
		<WebSocketContext.Provider value={ {send, subscribe, isConnected} }>
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
