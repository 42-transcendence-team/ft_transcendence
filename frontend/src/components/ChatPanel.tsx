import "../styles/components/_chatPanel.scss"
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LuPlus } from "react-icons/lu";
import { useChat, type RoomMember } from "../context/chatContext";
import { AddChatModal } from "./AddChatModal";
import { UserAvatar } from "./users/UserAvatar";

interface ChatPanelProps {
    onChatClick: (id: number) => void;
    activeChatId: number | null;
}

function getOtherMember(currentUserId: number, members: RoomMember[] | undefined): RoomMember | null {
	if (!members || members.length === 0) return null;
	for (const m of members) {
		if (m.id !== currentUserId) return m;
	}
	return null;
}

export function ChatPanel(props: ChatPanelProps) {
	const { rooms, lastActivity, roomMembers, addChat, user: currentUser } = useChat();
	const { onChatClick, activeChatId } = props;

	const [showAddChat, setShowAddChat] = useState(false);
	const listRef = useRef<HTMLDivElement>(null);
	const lastActivityRef = useRef(lastActivity);

	const currentUserId = currentUser?.id ? parseInt(currentUser.id, 10) : 0;

	const displayRooms = useMemo(() => {
		return [...rooms].sort((a, b) => {
			const aActivity = lastActivity[a] ?? 0;
			const bActivity = lastActivity[b] ?? 0;
			return bActivity - aActivity;
		});
	}, [rooms, lastActivity]);

	// Auto-scroll: cuando llega/envía un mensaje (lastActivity cambia),
	// subimos la lista al primer chat para que la burbuja recién movida
	// a la primera posición sea visible.
	useEffect(() => {
		const prev = lastActivityRef.current;
		if (prev === lastActivity) return;
		lastActivityRef.current = lastActivity;
		listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
	}, [lastActivity]);

	const handleSelectUser = useCallback(async (userId: number, login: string, avatar: string) => {
		const newRoomId = await addChat(userId, login, avatar);
		setShowAddChat(false);
		if (newRoomId !== null) {
			onChatClick(newRoomId);
		}
	}, [addChat, onChatClick]);

	const renderBubble = (roomId: number) => {
		const other = getOtherMember(currentUserId, roomMembers[roomId]);
		return (
			<button
				type="button"
				key={roomId}
				className={`chatPanel__bubble ${activeChatId === roomId ? 'is-active' : ''}`}
				onClick={() => onChatClick(roomId)}
				title={other ? other.login : `Sala ${roomId}`}
				data-tooltip={other ? other.login : `Sala ${roomId}`}
			>
				{other ? (
					<UserAvatar
						avatarPath={other.avatar_url || null}
						username={other.login}
						size="medium"
					/>
				) : (
					<span className="chatPanel__bubbleId">{roomId}</span>
				)}
			</button>
		);
	};

	return (
		<>
			<aside className="chatPanel">
				<div className="chatPanel__list" ref={listRef}>
					{displayRooms.map(renderBubble)}
				</div>

			<div className="chatPanel__actions">
				<button
					type="button"
					className="chatPanel__add"
					aria-label="Nuevo chat"
					data-tooltip="Nuevo chat"
					onClick={() => setShowAddChat(true)}
				>
					<LuPlus />
				</button>
			</div>
        </aside>

		{showAddChat && (
			<AddChatModal
				onSelect={handleSelectUser}
				onClose={() => setShowAddChat(false)}
			/>
		)}
		</>
    );
}
