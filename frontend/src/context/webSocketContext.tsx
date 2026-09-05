import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import '@styles/components/_sessionTakenOver.scss';

const SESSION_TAKEOVER_CODE = 4001;

interface WebSocketContextType {
	send: (message: any) => void;
	subscribe: (type: string, handler: (message: unknown) => void) => () => void;
	isConnected: boolean;
	sessionTakenOver: boolean;
}

interface AuthUser {
	id: string;
	login?: string;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
	undefined,
);

const getWebSocketURL = () => {
	const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
	return `${protocol}//${window.location.host}/api/v1/websocket/ws`;
};

type MessageHandler = (message: any) => void;

export function useHandleWebsocket(user: AuthUser | null) {
	const websocket = useRef<WebSocket | null>(null);
	const listeners = useRef(new Map<string, Set<MessageHandler>>());
	const reconnectTimeout = useRef<number | null>(null);
	const shouldReconnect = useRef(true);
	const [isConnected, setIsConnected] = useState(false);
	const [sessionTakenOver, setSessionTakenOver] = useState(false);

	const send = useCallback((message: any): boolean => {
		if (websocket.current?.readyState !== WebSocket.OPEN) return false;

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
		if (!user) {
			return;
		}

		shouldReconnect.current = true;

		const connect = () => {
			if (!shouldReconnect.current) {
				return;
			}

			const ws = new WebSocket(getWebSocketURL());

			websocket.current = ws;

			ws.onopen = () => {
				if (websocket.current === ws) {
					setIsConnected(true);
				}
			};

			ws.onmessage = (event) => {
				const message = JSON.parse(event.data);
				const { type } = message;
				const typeListeners = listeners.current.get(type);

				console.log("WS MESSAGE", { type, message });

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
				console.log('WS CLOSE', { code: e.code, reason: e.reason });

				if (websocket.current !== ws) {
					return;
				}

				websocket.current = null;
				setIsConnected(false);

				if (e.code === SESSION_TAKEOVER_CODE) {
					// Otra ventana tomó la sesión del usuario: no reconectar
					// y bloquear esta ventana para evitar el ping-pong de
					// conexiones entre dos pestañas.
					shouldReconnect.current = false;
					setSessionTakenOver(true);
					return;
				}

				if (!shouldReconnect.current) {
					return;
				}

				if (reconnectTimeout.current !== null) {
					return;
				}

				reconnectTimeout.current = window.setTimeout(() => {
					reconnectTimeout.current = null;
					if (!shouldReconnect.current) {
						return;
					}
					connect();
				}, 2000);
			};

			ws.onerror = (error) => {
				console.error(error);
			};
		};

		connect();

		return () => {
			shouldReconnect.current = false;

			if (reconnectTimeout.current !== null) {
				clearTimeout(reconnectTimeout.current);
				reconnectTimeout.current = null;
			}

			const ws = websocket.current;

			if (ws && ws.readyState !== WebSocket.CONNECTING) {
				ws.onerror = null;
				ws.close();
			}
			websocket.current = null;

			setIsConnected(false);
		};
	}, [user?.id]);

	return { send, subscribe, isConnected, sessionTakenOver };
}

function SessionTakenOverOverlay() {
	return (
		<div className="session-taken-over">
			<div className="session-taken-over__card">
				<h2 className="session-taken-over__title">Sesión activa en otra ventana</h2>
				<p className="session-taken-over__text">
					Has iniciado sesión en una ventana nueva. Esta ventana quedará
					bloqueada y la partida continuará en la ventana reciente.
				</p>
			</div>
		</div>
	);
}

export function WebSocketProvider({
	children,
	user,
}: {
	children: React.ReactNode;
	user: AuthUser | null;
}) {
	const { send, subscribe, isConnected, sessionTakenOver } = useHandleWebsocket(user);

	return (
		<WebSocketContext.Provider value={{ send, subscribe, isConnected, sessionTakenOver }}>
			{children}
			{sessionTakenOver && <SessionTakenOverOverlay />}
		</WebSocketContext.Provider>
	);
}

export const useWebSocket = () => {
	const context = useContext(WebSocketContext);

	if (!context)
		throw new Error('useWebContext debe usarse dentro de un WebSocketProvider');
	return context;
};
