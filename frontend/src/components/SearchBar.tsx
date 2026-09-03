import {
	type FormEvent,
	useEffect,
	useState,
} from "react";
import { FiSearch } from "react-icons/fi";

import "../styles/components/advancedSearch/_searchBar.scss";

type SearchBarProps = {
	onSearch: (
		query: string,
	) => void | Promise<void>;

	/*
	 * PrivateLayout incrementa esta clave cuando se pulsa AppBrand.
	 * No contiene datos de búsqueda; solo sirve para solicitar que
	 * este componente limpie su estado local.
	 */
	resetKey?: number;
};

export const SearchBar = ({
	onSearch,
	resetKey = 0,
}: SearchBarProps) => {
	const [query, setQuery] = useState("");

	useEffect(() => {
		setQuery("");
	}, [resetKey]);

	const handleSubmit = (
		event: FormEvent<HTMLFormElement>,
	) => {
		event.preventDefault();

		/*
		 * No bloqueamos una cadena vacía porque la búsqueda avanzada
		 * puede seguir utilizando únicamente los filtros laterales.
		 */
		void onSearch(query.trim());
	};

	return (
		<form
			className="searchBar"
			role="search"
			onSubmit={handleSubmit}
		>
			<input
				className="searchBar__input"
				type="search"
				value={query}
				placeholder="Buscar..."
				aria-label="Buscar usuarios"
				onChange={(event) =>
					setQuery(event.target.value)
				}
			/>

			<button
				className="searchBar__button"
				type="submit"
				aria-label="Buscar"
			>
				<FiSearch
					className="searchBar__icon"
					aria-hidden="true"
				/>
			</button>
		</form>
	);
};
