import { useNotification } from "context/NotificationsContext";

/*
 *	response := gin.H{
		"incoming_requests": incomingRequests,
		"unread_messages":   messagesNotReadByRoom,
	}
* */
//{incoming_requests: null, unread_messages: {…}}
//unread_messages: {1: 0, 2: 1, 3: 0}
export function Notification() {
    const { generalNotifications } = useNotification();

    const incomingRequests = generalNotifications?.incoming_requests || [];
    const unreadMessages = generalNotifications?.unread_messages || {};

    return (
        <div className="notification">
            
            <div className="notification-section">
                <h4>Solicitudes entrantes ({incomingRequests.length}):</h4>
                
                {incomingRequests.length === 0 ? (
                    <p>No tienes solicitudes pendientes.</p>
                ) : (
                    <ul>
                        {incomingRequests.map((request) => (
                            <li key={request.id} className="request-item">
                                <span><strong>{request.username}</strong> te envió una solicitud.</span>
                                <span className="status-badge">Estado: {request.status}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <hr />

            <div className="notification-section">
                <h4>Mensajes no leídos por sala:</h4>
                <ul>
                    {Object.entries(unreadMessages).map(([roomId, count]) => (
                        <li key={roomId}>
                            <strong>Sala {roomId}:</strong> {count} {count === 1 ? 'mensaje' : 'mensajes'}
                        </li>
                    ))}
                </ul>
            </div>

        </div>
    );
}
