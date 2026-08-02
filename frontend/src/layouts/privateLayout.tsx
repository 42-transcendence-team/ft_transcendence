import { useState } from "react";
import { Outlet } from "react-router-dom";

import { Footer } from "@components/Footer";
import { PrivHeader } from "@components/PrivHeader";
import { SearchFilters } from "@components/advancedSearch/SearchFilters";
import { useAdvancedSearch } from "@components/advancedSearch/useAdvancedSearch";
import { AdvancedSearchPanel } from "@components/advancedSearch/AdvancedSearchPanel";

import { PrivateLeftPanel } from "@components/layout/PrivateLeftPanel";
import { PrivateRightPanel } from "@components/layout/PrivateRightPanel";
import { PrivateMainContent } from "@components/layout/PrivateMainContent";

import "../styles/components/_privateLayout.scss";

export function PrivateLayout() {
	const search = useAdvancedSearch();

	/*
	 * SearchBar mantiene el texto escrito en estado local.
	 * Incrementar esta clave le indica que debe vaciarlo.
	 */
	const [
		searchResetKey,
		setSearchResetKey,
	] = useState(0);

	const handleBrandActivate = () => {
		/*
		 * resetSearch cambia hasSearched a false, haciendo que
		 * PrivateLayout vuelva a renderizar el Outlet y, por tanto,
		 * la Home situada en /app.
		 */
		search.resetSearch();

		setSearchResetKey(
			(currentKey) => currentKey + 1,
		);
	};

	return (
		<div className="privateLayout">
			<PrivateLeftPanel>
				<SearchFilters
					selectedRelations={search.relations}
					onRelationsChange={
						search.handleRelationsChange
					}
					selectedSort={search.sort}
					onSortChange={
						search.handleSortChange
					}
				/>
			</PrivateLeftPanel>

			<PrivHeader
				onSearch={search.handleSearch}
				onBrandActivate={
					handleBrandActivate
				}
				searchResetKey={searchResetKey}
			/>

			<PrivateMainContent>
				{search.hasSearched ? (
					<AdvancedSearchPanel
						search={search}
					/>
				) : (
					<Outlet />
				)}
			</PrivateMainContent>

			<footer className="privateLayout__footer">
				{/*
				 * El Footer privado utiliza el mismo callback.
				 * Así no reaparece el bug si se pulsa la marca inferior.
				 */}
				<Footer
					onBrandActivate={
						handleBrandActivate
					}
				/>
			</footer>

			<PrivateRightPanel />
		</div>
	);
}
