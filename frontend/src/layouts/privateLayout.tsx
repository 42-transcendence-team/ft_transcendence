import { Outlet } from "react-router-dom";
import { Footer } from "@components/Footer";
import { PrivHeader } from "@components/PrivHeader";
import { SearchResults } from "@components/advancedSearch/SearchResults";
import { useAdvancedSearch } from "@components/advancedSearch/useAdvancedSearch";
import { SearchFilters } from "@components/advancedSearch/SearchFilters";

import "../styles/components/_privateLayout.scss";

export function PrivateLayout() {
  const {
    searchResults,
    hasSearched,
	isLoading,
  	error,
    handleSearch,
	handleSendFriendRequest,
	handleAcceptFriendRequest,
  	handleRejectFriendRequest,
	relations,
	handleRelationsChange,
	sort,
	handleSortChange,
	totalResults,
  	} = useAdvancedSearch();
	return (
		<div className="privateLayout">
			<aside className="privateLayout__leftPanel">
				<SearchFilters
					selectedRelations={relations}
					onRelationsChange={handleRelationsChange}
					selectedSort={sort}
  					onSortChange={handleSortChange}
				/>
			</aside>

			<PrivHeader onSearch={handleSearch} />

			<main className="privateLayout__content">
				<div className="privateLayout__contentFrame">
				<div className="privateLayout__contentInner">
					{hasSearched ? (
						<>
							{isLoading && (
							<p>Buscando...</p>
							)}

							{error && (
							<p>{error}</p>
							)}

							{!isLoading && !error && (
								<>
									<p className="searchResults__count">
										{totalResults} usuarios encontrados
									</p>
									<SearchResults
										results={searchResults}
										onSendFriendRequest={handleSendFriendRequest}
										onAcceptFriendRequest={handleAcceptFriendRequest}
										onRejectFriendRequest={handleRejectFriendRequest}
									/>
								</>
							)}
						</>
						) : (
							<Outlet />
						)}
				</div>
				</div>
			</main>

			<footer className="privateLayout__footer">
				<Footer />
			</footer>

			<aside className="privateLayout__rightPanel">
				RIGHT PANEL
			</aside>
		</div>
  );
}
