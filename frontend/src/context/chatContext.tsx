import content from "@reset";
import { apiRequest } from "api/ApiRequest";
import { useWebSocket } from "./webSocketContext";
import { useContext, useRef, createContext, useCallback, useEffect, useState } from "react";

interface ChatContextType {
	sendMessage: (roomId: number, content: string) => void;
	messagesByRoom: any;
	joinRoom: any;
	rooms : any;
	addChat : any;
	user:any;
}

const chatContext = createContext<ChatContextType | undefined>(undefined);

const useSendMessage = (user : any, wsRef : any) => {
	 return useCallback((roomId: number, content: string) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: "message",
                username: user?.login,
                user_id: user?.id,
                room_id: roomId,
                content: content
            }));
        }
    }, [user]);
}

interface MessagesState {
    [roomId: number]: any[]; 
}


const useJoinRoom = (websocket: any, messagesByRoom:any) => {
	return useCallback((roomId : number) => {
		if (messagesByRoom[roomId]){
			console.log('mensajes ya cacheados ')
			return
		}
		if (websocket.current?.readyState === WebSocket.OPEN) {
	 		websocket.current.send(
	 			JSON.stringify(
	 				{ type: "join_room", room_id: roomId }
	 			)
	 		)
		}
	}, [messagesByRoom])
}


const getUnreadMessages = async (roomId : number | null) => {
	try {
		const data = await apiRequest({
			endpoint: `chat/unread/${roomId}`,
			method: "GET",
		});
		console.log('mesajes no leido desde', roomId, data)
		return data
	}catch(e){
		console.log(e)
	}
}

const useMessagesByRoom=(messages:any) => {
	const [messagesByRoom, setMessagesByRoom] = useState<MessagesState>({})
	
	useEffect(() => {
		if (messages && messages.type) {
			const {room_id} = messages
			if (messages.type == 'join'){
				setMessagesByRoom((prevHistory) => {
					return {
						...prevHistory,
						[room_id]: [...messages.messages]
					};
				});
			} else if (messages.type == 'message') {
				setMessagesByRoom( (prev) => {
					const messagesOfRoom = prev[room_id] || []
					const newMsg = {message_id: messages.message_id, content: messages.content, username: messages.username, timestamp: messages.timestamp}
					return {...prev, [room_id]: [...messagesOfRoom, newMsg]}
				})
			}
	}}, [messages])

	return messagesByRoom
}

const updateChat = async (id: number | null) => {
	try {
		const data = await apiRequest({
			endpoint: `chat/enter`,
			method: "PUT",
			body: {room_id: id}
		});
		console.log('last read actualizado', id)
		return data
	}catch(e){
		console.log(e, 'no chat actualizado')
	}
}
/*
*CreateRoomRequest struct {
Name    string `json:"name"`
Private bool   `json:"private" default:"false"`
Users   []uint `json:"users"`
}
* */
const useHandleRooms = (user, websocket) => {
	const [rooms, setRooms] = useState<any>([])

	const addChat = async () => {
		const user_id = prompt('id del usuario al que quieres enviar mensaje');
		const user_id_number = parseInt(user_id, 10);
	
		try {	
			const data = await apiRequest({
				endpoint: "chat/rooms",
				method: "POST",
				body: { name: `Room ${Math.floor(Math.random() * 1000)}`, private : true, users : [user_id_number] },
			});
			console.log("Chat room created successfully");
			setRooms((prevRooms) => {
				if (!prevRooms.includes(data.ID)) {
					return [...prevRooms, data.ID];
				}
				return prevRooms;
       	 	});
			//anadir al context algo para guardar la nueva sala de chat
		} catch (error) {
			console.error("Error creating chat room:", error);
		}
	}
	
	useEffect(() => {
		const fetchRooms = async () => {
			try {
				const data = await apiRequest({
					endpoint: "chat/rooms",
					method: "GET",
				});
				setRooms(data.map(r => r.ID))
			} catch (e) {
				console.log(e);
			}
		};
		fetchRooms();
	}, [user?.id]);


	useEffect(() => {
		if (!websocket.current || rooms.length === 0)
			return;
		
		const ws = websocket.current;

		const joinAllRooms = () => {
			rooms.forEach(room => {
				ws.send(
					JSON.stringify({ type: "join_room", room_id: room})
				);
			});
		};
		if (ws.readyState === WebSocket.OPEN) {
			console.log('websocket ya abierto, uniendo a las salas')
			joinAllRooms();
		}
		ws.addEventListener("open", joinAllRooms);
		return () => {
			ws.removeEventListener("open", joinAllRooms);
		};
	}, [rooms, websocket.current]);
	
	useEffect(() => {
		if (rooms.length > 0) {
			rooms.forEach(room => {
				getUnreadMessages(room)
			})
		}
	},[rooms]) 

	return { addChat, rooms}
}
//enviar por ws un mensaje tipo add_chat para que el usuario al que se le envia el mensaje reciba la notificacion de que tiene un nuevo chat, y se una a la sala.v
//cuandor se vuelve a conectar el websocket el chat no se recarga, implementar
export function ChatProvider({ children, activeChat, user } : {children : React.ReactNode, activeChat: number | null , user : any } ) {
	const { websocket, messages } = useWebSocket();
	const messagesByRoom = useMessagesByRoom(messages);
	const sendMessage = useSendMessage(user, websocket);
	const joinRoom = useJoinRoom(websocket, messagesByRoom);
	const {rooms, addChat} = useHandleRooms(user, websocket)

	useEffect (() => {
		if (!messages || !messages.type || messages.type != 'message' || !messages.room_id)
			return;
		if (messages.room_id != activeChat){
			getUnreadMessages(messages.room_id)
		}
		console.log(messages.room_id, activeChat)
		if (messages.room_id == activeChat) {
			updateChat(activeChat)
		}
	}, [messages])
	
	useEffect(() => {
		if (activeChat){
			updateChat(activeChat)
		}
	},[activeChat])

	return (
		<chatContext.Provider value={ { messagesByRoom, joinRoom, sendMessage, rooms, addChat, user} }>
			{children}
		</chatContext.Provider>
	);
}

export const useChat = () => {
    const context = useContext(chatContext);
    if (!context)
		throw new Error("useChat debe usarse dentro de un ChatProvider");
    return context;
};

