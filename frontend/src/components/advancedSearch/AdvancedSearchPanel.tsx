import { SearchResults } from "./SearchResults";
import { SearchPagination } from "./SearchPagination";
import { useAdvancedSearch } from "./useAdvancedSearch";

type AdvancedSearchPanelProps = {
  search: ReturnType<typeof useAdvancedSearch>;
};

export function AdvancedSearchPanel({ search }: AdvancedSearchPanelProps) {
  if (search.isLoading) {
    return <p>Buscando...</p>;
  }

  if (search.error) {
    return <p>{search.error}</p>;
  }

  return (
    <>
      <p className="searchResults__count">
        {search.totalResults} usuarios encontrados
      </p>

      <SearchResults
        results={search.searchResults}
        onSendFriendRequest={search.handleSendFriendRequest}
        onAcceptFriendRequest={search.handleAcceptFriendRequest}
        onRejectFriendRequest={search.handleRejectFriendRequest}
        onRemoveFriend={search.handleRemoveFriend}
        onBlockUser={search.handleBlockUser}
        onUnblockUser={search.handleUnblockUser}
      />

      <SearchPagination
        page={search.page}
        totalPages={search.totalPages}
        onPrevious={search.handlePreviousPage}
        onNext={search.handleNextPage}
      />
    </>
  );
}