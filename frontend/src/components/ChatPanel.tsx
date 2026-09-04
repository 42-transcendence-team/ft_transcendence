import "../styles/components/_chatPanel.scss"
import { useCallback, useMemo, useState } from "react";
import { LuPlus, LuSearch, LuX } from "react-icons/lu";
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

	const [searchOpen, setSearchOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [showAddChat, setShowAddChat] = useState(false);

	const currentUserId = currentUser?.id ? parseInt(currentUser.id, 10) : 0;

	const displayRooms = useMemo(() => {
		const sorted = Object.entries(lastActivity)
			.filter(([id]) => rooms.includes(Number(id)))
			.sort(([, a], [, b]) => b - a)
			.map(([id]) => Number(id));

		const active = activeChatId;
		const result: number[] = [];

		if (active !== null) {
			result.push(active);
			for (const r of sorted) {
				if (r !== active) result.push(r);
				if (result.length >= 6) break;
			}
		} else {
			result.push(...sorted.slice(0, 6));
		}

		return result;
	}, [lastActivity, rooms, activeChatId]);

	const allRoomsSorted = useMemo(() => [...rooms].sort((a, b) => a - b), [rooms]);

	const searchResults = useMemo(() => {
		if (!searchQuery.trim()) return null;
		const num = parseInt(searchQuery, 10);
		if (isNaN(num)) return [];
		return rooms
			.filter(r => String(r).startsWith(searchQuery))
			.slice(0, 15);
	}, [searchQuery, rooms]);

	const openRoom = useCallback((roomId: number) => {
		onChatClick(roomId);
		setSearchOpen(false);
		setSearchQuery("");
	}, [onChatClick]);

	const handleSelectUser = useCallback(async (userId: number, login: string, avatar: string) => {
		const newRoomId = await addChat(userId, login, avatar);
		if (newRoomId !== null) {
			onChatClick(newRoomId);
		}
	}, [addChat, onChatClick]);

	const handleSearchToggle = useCallback(() => {
		setSearchOpen(prev => !prev);
		setSearchQuery("");
	}, []);

	const renderBubble = (roomId: number) => {
		const other = getOtherMember(currentUserId, roomMembers[roomId]);
		return (
			<button
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
		<>{/* linea vacia obligatoria para que no explote el linter */}
        <aside className="chatPanel">
			{searchOpen ? (
				<>
					<input
						className="chatPanel__searchInput"
						type="text"
						inputMode="numeric"
						placeholder="ID sala..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						autoFocus
					/>
					<div className="chatPanel__list">
						{(searchResults !== null ? searchResults : allRoomsSorted).map(roomId => {
							const other = getOtherMember(currentUserId, roomMembers[roomId]);
							return (
								<button
									key={roomId}
									className={`chatPanel__bubble ${activeChatId === roomId ? 'is-active' : ''}`}
									onClick={() => openRoom(roomId)}
									title={other ? other.login : `Sala ${roomId}`}
									data-tooltip={other ? other.login : `Sala ${roomId}`}
								>
							{other ? (
								<>
									<UserAvatar
										avatarPath={other.avatar_url || null}
										username={other.login}
										size="medium"
									/>
								</>
							) : (
								<span className="chatPanel__bubbleId">{roomId}</span>
							)}
						</button>
					);
				})}
						{searchResults !== null && searchResults.length === 0 && (
							<span className="chatPanel__noResults">Sin resultados</span>
						)}
					</div>
				</>
			) : (
				<>
					{displayRooms.map(renderBubble)}
				</>
			)}

			<div className="chatPanel__actions">
				<button
					type="button"
					className="chatPanel__searchBtn"
					title={searchOpen ? "Cerrar busqueda" : "Buscar sala"}
					data-tooltip={searchOpen ? "Cerrar búsqueda" : "Buscar sala"}
					onClick={handleSearchToggle}
				>
					{searchOpen ? <LuX /> : <LuSearch />}
				</button>
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
