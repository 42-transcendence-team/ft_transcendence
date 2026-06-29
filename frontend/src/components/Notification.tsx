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
  const { notifications } = useNotification();

  const incomingRequests = notifications.filter((n) => n.type === "FRIEND_REQUEST").map((n) => n.payload);
  const unreadMessages = notifications.filter((n) => n.type === "UNREAD_MESSAGES").map((n) => n.payload);
  const totalUnreadRooms = unreadMessages.length;

  return (
    <div className="notification">
      
      <div className="notification-section">
        <h4>Solicitudes entrantes ({incomingRequests.length}):</h4>

        {incomingRequests.length === 0 ? (
          <p>No tienes solicitudes pendientes.</p>
        ) : (
          <ul>
            {incomingRequests.map((request, id) => (
              <li key={id} className="request-item">
                <span>
                  <strong>{request.username}</strong> te envió una solicitud.
                </span>
                <span className="status-badge">Estado: {request.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <hr />

      <div className="notification-section">
        <h4>Mensajes no leídos por sala ({totalUnreadRooms}):</h4>

        {totalUnreadRooms === 0 ? (
          <p>No tienes mensajes nuevos.</p>
        ) : (
          <ul>
            {unreadMessages.map((msg) => (
              <li key={msg.room_id}>
                <strong>Sala {msg.room_id}:</strong> {msg.unread_count}{" "}
                {msg.unread_count === 1 ? "mensaje" : "mensajes"}
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
}
