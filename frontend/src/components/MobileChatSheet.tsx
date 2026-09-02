import '../styles/components/_mobileChatSheet.scss';
import { useCallback, useMemo, useState } from 'react';
import { type RoomMember, useChat } from '../context/chatContext';
import { AddChatModal } from './AddChatModal';
import { UserAvatar } from './users/UserAvatar';

interface MobileChatSheetProps {
  onSelectRoom: (roomId: number) => void;
  onClose: () => void;
}

function getOtherMember(
  currentUserId: number,
  members: RoomMember[] | undefined,
): RoomMember | null {
  if (!members || members.length === 0) return null;
  for (const m of members) {
    if (m.id !== currentUserId) return m;
  }
  return null;
}

export function MobileChatSheet({
  onSelectRoom,
  onClose,
}: MobileChatSheetProps) {
  const {
    rooms,
    roomMembers,
    lastActivity,
    addChat,
    user: currentUser,
  } = useChat();
  const [showAddChat, setShowAddChat] = useState(false);

  const currentUserId = currentUser?.id ? parseInt(currentUser.id, 10) : 0;

  const sortedRooms = useMemo(() => {
    return [...rooms].sort((a, b) => {
      const aActivity = lastActivity[a] ?? 0;
      const bActivity = lastActivity[b] ?? 0;
      return bActivity - aActivity;
    });
  }, [rooms, lastActivity]);

  const handleSelectUser = useCallback(
    async (userId: number, login: string, avatar: string) => {
      const newRoomId = await addChat(userId, login, avatar);
      setShowAddChat(false);
      if (newRoomId !== null) {
        onSelectRoom(newRoomId);
      }
    },
    [addChat, onSelectRoom],
  );

  return (
    <div className="mobileChatSheet__backdrop" onClick={onClose}>
      <div className="mobileChatSheet" onClick={(e) => e.stopPropagation()}>
        <div className="mobileChatSheet__header">
          <span className="mobileChatSheet__title">Mensajes</span>
          <button
            type="button"
            className="mobileChatSheet__close"
            onClick={onClose}
            aria-label="Cerrar mensajes"
          >
            ✕
          </button>
        </div>

        <div className="mobileChatSheet__body">
          {sortedRooms.length === 0 ? (
            <div className="mobileChatSheet__empty">
              Aún no tienes conversaciones
            </div>
          ) : (
            sortedRooms.map((roomId) => {
              const other = getOtherMember(currentUserId, roomMembers[roomId]);
              return (
                <button
                  type="button"
                  key={roomId}
                  className="mobileChatSheet__room"
                  onClick={() => onSelectRoom(roomId)}
                >
                  <UserAvatar
                    avatarPath={other?.avatar_url || null}
                    username={other?.login ?? `Sala ${roomId}`}
                    size="small"
                  />
                  <span className="mobileChatSheet__login">
                    {other ? other.login : `Sala ${roomId}`}
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div className="mobileChatSheet__footer">
          <button
            type="button"
            className="mobileChatSheet__newChat"
            onClick={() => setShowAddChat(true)}
          >
            Nuevo chat
          </button>
        </div>
      </div>

      {showAddChat && (
        <AddChatModal
          onSelect={handleSelectUser}
          onClose={() => setShowAddChat(false)}
        />
      )}
    </div>
  );
}
