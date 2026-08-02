import { useState } from "react";
import {
  searchUsers,
  type UserSearch,
  type UserRelation,
  type UserSearchSort,
} from "../../api/userSearch.tsx";
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  blockUser,
  unblockUser,
} from "../../api/Friends";

export function useAdvancedSearch() {
  const [searchResults, setSearchResults] = useState<UserSearch[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [currentQuery, setCurrentQuery] = useState<string>("");
  const [relations, setRelations] = useState<UserRelation[]>([]);
  const [sort, setSort] = useState<UserSearchSort>("username_asc");

  const [totalResults, setTotalResults] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const limit = 5;

  const executeSearch = async (
    query: string,
    searchRelations: UserRelation[],
    searchSort: UserSearchSort,
    searchPage: number
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await searchUsers({
        query,
        relations: searchRelations,
        sort: searchSort,
        page: searchPage,
        limit,
      });

      setSearchResults(response.items);
      setPage(response.page);
      setTotalResults(response.total);
      setTotalPages(Math.max(1, Math.ceil(response.total / response.limit)));
      setHasSearched(true);
    } catch (err) {
      setError("No se pudo hacer la búsqueda");
      setSearchResults([]);
      setTotalResults(0);
      setTotalPages(1);
      setHasSearched(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setCurrentQuery(query);
    await executeSearch(query, relations, sort, 1);
  };

  const handleRelationsChange = async (newRelations: UserRelation[]) => {
    setRelations(newRelations);

    await executeSearch(currentQuery, newRelations, sort, 1);
  };

  const handleSortChange = async (newSort: UserSearchSort) => {
    setSort(newSort);

    await executeSearch(currentQuery, relations, newSort, 1);
  };

  const handleNextPage = async () => {
    if (isLoading || page >= totalPages) {
      return;
    }

    await executeSearch(currentQuery, relations, sort, page + 1);
  };

  const handlePreviousPage = async () => {
    if (isLoading || page <= 1) {
      return;
    }

    await executeSearch(currentQuery, relations, sort, page - 1);
  };

  const handleSendFriendRequest = async (userId: number) => {
    try {
      await sendFriendRequest(userId);

      setSearchResults((currentResults) =>
        currentResults.map((user) =>
          user.id === userId
            ? {
                ...user,
                relation: "pending_sent",
                can_send_request: false,
              }
            : user
        )
      );
    } catch (error) {
      console.log("ERROR SEND FRIEND REQUEST", error);
    }
  };

  const handleAcceptFriendRequest = async (requestId: number) => {
    try {
      await acceptFriendRequest(requestId);

      setSearchResults((currentResults) =>
        currentResults.map((user) =>
          user.request_id === requestId
            ? {
                ...user,
                relation: "friends",
                can_send_request: false,
                request_id: undefined,
              }
            : user
        )
      );
    } catch (error) {
      console.log("ERROR ACCEPT FRIEND REQUEST", error);
    }
  };

  const handleRejectFriendRequest = async (requestId: number) => {
    try {
      await rejectFriendRequest(requestId);

      setSearchResults((currentResults) =>
        currentResults.map((user) =>
          user.request_id === requestId
            ? {
                ...user,
                relation: "none",
                can_send_request: true,
                request_id: undefined,
              }
            : user
        )
      );
    } catch (error) {
      console.log("ERROR REJECT FRIEND REQUEST", error);
    }
  };

  const handleRemoveFriend = async (userId: number) => {
    try {
      await removeFriend(userId);

      setSearchResults((currentResults) =>
        currentResults.map((user) =>
          user.id === userId
            ? {
                ...user,
                relation: "none",
                can_send_request: true,
              }
            : user
        )
      );
    } catch (error) {
      console.log("ERROR REMOVE FRIEND", error);
    }
  };

  const handleBlockUser = async (userId: number) => {
    try {
      await blockUser(userId);

      setSearchResults((currentResults) =>
        currentResults.map((user) =>
          user.id === userId
            ? {
                ...user,
                relation: "blocked_by_me",
                can_send_request: false,
                request_id: undefined,
              }
            : user
        )
      );
    } catch (error) {
      console.log("ERROR BLOCK USER", error);
    }
  };

  async function handleUnblockUser(userId: number) {
    try {
      await unblockUser(userId);

      setSearchResults((currentResults) =>
        currentResults.map((user) =>
          user.id === userId
            ? {
                ...user,
                relation: "none",
                can_send_request: true,
                request_id: undefined,
              }
            : user
        )
      );
    } catch (error) {
      console.log("ERROR UNBLOCK USER", error);
    }
  }

    /*
   * Cierra la vista de búsqueda y limpia únicamente sus resultados.
   * Se conservan los filtros de relación y orden seleccionados.
   */
  const resetSearch = () => {
    setSearchResults([]);
    setHasSearched(false);
    setError(null);

    setCurrentQuery("");

    setTotalResults(0);
    setPage(1);
    setTotalPages(1);
  };

  return {
    searchResults,
    hasSearched,
    isLoading,
    error,

    currentQuery,
    relations,
    sort,

    totalResults,
    page,
    totalPages,

    handleSearch,
    handleRelationsChange,
    handleSortChange,
    handleNextPage,
    handlePreviousPage,

    handleSendFriendRequest,
    handleAcceptFriendRequest,
    handleRejectFriendRequest,
    handleRemoveFriend,
    handleBlockUser,
    handleUnblockUser,

	resetSearch,
  };
}