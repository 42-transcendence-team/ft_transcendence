import "../styles/components/_addChatModal.scss";
import { searchUsers, type UserSearch } from "api/userSearch";
import skullLogo from "assets/icons/skull_logo.png";
import { useEffect, useState, useRef } from "react";

interface AddChatModalProps {
	onSelect: (userId: number, login: string, avatar_url: string) => void;
	onClose: () => void;
}

export function AddChatModal({ onSelect, onClose }: AddChatModalProps) {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<UserSearch[]>([]);
	const [loading, setLoading] = useState(false);
	const [hasSearched, setHasSearched] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	// Busqueda con debounce: 300ms despues de dejar de escribir
	useEffect(() => {
		let active = true;
		const q = query.trim();

		if (!q) {
			setResults([]);
			setHasSearched(false);
			return () => { active = false; };
		}

		const timer = setTimeout(async () => {
			setLoading(true);
			try {
				const data = await searchUsers({ query: q, limit: 15, relations: ["friends"] });
				if (active) {
					setResults(data.items);
					setHasSearched(true);
				}
			} catch {
				if (active) setResults([]);
			}
			if (active) setLoading(false);
		}, 300);

		return () => {
			active = false;
			clearTimeout(timer);
		};
	}, [query]);

	const handleSelect = (user: UserSearch) => {
		onSelect(user.id, user.login, user.avatar_url);
	};

	return (
		<div className="addChatModal__backdrop" onClick={onClose}>
			<div className="addChatModal" onClick={(e) => e.stopPropagation()}>
				<div className="addChatModal__header">
					<span>Nuevo chat</span>
					<button className="addChatModal__close" onClick={onClose}>
						✕
					</button>
				</div>

				<input
					ref={inputRef}
					className="addChatModal__search"
					type="text"
					placeholder="Buscar por nombre o login..."
					value={query}
					onChange={(e) => setQuery(e.target.value)}
				/>

				<div className="addChatModal__results">
					{loading && (
						<div className="addChatModal__loading">Buscando...</div>
					)}

					{!loading && results.map((user) => (
						<button
							key={user.id}
							className="addChatModal__userCard"
								onClick={() => handleSelect(user)}
						>
							<img
								src={user.avatar_url || skullLogo}
								alt={user.login}
								className="addChatModal__avatar"
							/>
							<div className="addChatModal__userInfo">
								<span className="addChatModal__name">
									{user.name || user.login} {user.surname}
								</span>
								<span className="addChatModal__login">
									@{user.login}
								</span>
							</div>
						</button>
					))}

					{!loading && hasSearched && results.length === 0 && (
						<div className="addChatModal__empty">
							Sin resultados
						</div>
					)}

					{!loading && !hasSearched && query.trim() === "" && (
						<div className="addChatModal__hint">
							Escribe para buscar usuarios
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
