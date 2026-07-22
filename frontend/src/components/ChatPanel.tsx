import "../styles/components/_chatPanel.scss"
import { useCallback, useMemo, useState } from "react";
import { useChat } from "../context/chatContext";

interface ChatPanelProps {
    onChatClick: (id: number) => void;
    activeChatId: number | null;
}

export function ChatPanel(props: ChatPanelProps) {
	const { rooms, lastActivity, addChat } = useChat();
	const { onChatClick, activeChatId } = props;

	const [searchOpen, setSearchOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

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

	// Todas las salas ordenadas por ID (para la vista de busqueda sin filtro)
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

	const handleAddChat = useCallback(async () => {
		const newRoomId = await addChat();
		if (newRoomId !== null) {
			onChatClick(newRoomId);
		}
	}, [addChat, onChatClick]);

	const handleSearchToggle = useCallback(() => {
		setSearchOpen(prev => !prev);
		setSearchQuery("");
	}, []);

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
						{(searchResults !== null ? searchResults : allRoomsSorted).map(roomId => (
							<button
								key={roomId}
								className={`chatPanel__bubble ${activeChatId === roomId ? 'is-active' : ''}`}
								onClick={() => openRoom(roomId)}
							>
								{roomId}
							</button>
						))}
						{searchResults !== null && searchResults.length === 0 && (
							<span className="chatPanel__noResults">Sin resultados</span>
						)}
					</div>
				</>
			) : (
				<>
					{displayRooms.map(roomId => (
						<button
							key={roomId}
							className={`chatPanel__bubble ${activeChatId === roomId ? 'is-active' : ''}`}
							onClick={() => onChatClick(roomId)}
						>
							{roomId}
						</button>
					))}
				</>
			)}

			<div className="chatPanel__actions">
				<button
					className="chatPanel__searchBtn"
					title={searchOpen ? "Cerrar busqueda" : "Buscar sala"}
					onClick={handleSearchToggle}
				>
					{searchOpen ? "✕" : "⌕"}
				</button>
				<button className="chatPanel__add" onClick={handleAddChat}>+</button>
			</div>
        </aside>
		</>
    );
}
