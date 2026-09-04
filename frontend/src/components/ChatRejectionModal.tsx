import { Modal } from '@components/Modal';
import { useChat } from 'context/chatContext';

// Popup que avisa al usuario cuando el servidor rechaza un mensaje de chat
// (bloqueo entre usuarios o amistad rota). El motivo lo envia el backend en
// el mensaje WS "message_rejected" y se expone via ChatContext (sendRejection).
export function ChatRejectionModal() {
  const { sendRejection, dismissSendRejection } = useChat();

  return (
    <Modal
      open={Boolean(sendRejection)}
      onClose={dismissSendRejection}
      title="Mensaje no enviado"
    >
      <p className="chatRejectionModal__message">
        No se pudo enviar el mensaje
      </p>
    </Modal>
  );
}
