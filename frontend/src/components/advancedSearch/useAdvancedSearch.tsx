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
} from "../../api/Friends";

export function useAdvancedSearch() {
  const [searchResults, setSearchResults] = useState<UserSearch[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState<string>("");
  const [relations, setRelations] = useState<UserRelation[]>([]);
  const [sort, setSort] = useState<UserSearchSort>("username_asc");
  const [totalResults, setTotalResults] = useState(0);

  const executeSearch = async (
    query: string,
    searchRelations: UserRelation[],
    searchSort: UserSearchSort
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await searchUsers({
        query,
        relations: searchRelations,
        sort: searchSort,
      });

      setSearchResults(response.items);
      setHasSearched(true);
      setTotalResults(response.total);
    } catch (err) {
      setError("No se pudo hacer la búsqueda");
      setSearchResults([]);
      setHasSearched(true);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setCurrentQuery(query);

    await executeSearch(query, relations, sort);
  };

  const handleRelationsChange = async (newRelations: UserRelation[]) => {
    setRelations(newRelations);

    if (currentQuery.trim() === "") {
      return;
    }

    await executeSearch(currentQuery, newRelations, sort);
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

  const handleSortChange = async (
    newSort: UserSearchSort
  ) => {

    setSort(newSort);

    if (currentQuery.trim() === "") {
      return;
    }

    await executeSearch(
      currentQuery,
      relations,
      newSort
    );
  };

  return {
    searchResults,
    hasSearched,
    isLoading,
    error,
    currentQuery,
    relations,
    handleRelationsChange,
    handleSearch,
    handleSendFriendRequest,
    handleAcceptFriendRequest,
    handleRejectFriendRequest,
    sort,
    handleSortChange,
    totalResults,
  };
}