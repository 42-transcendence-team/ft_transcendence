import { useState } from "react";
import { searchUsers, type UserSearch } from "../../api/userSearch.tsx";
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
  const [currentQuery, setCurrentQuery] = useState("");

  const handleSearch = async (query: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setCurrentQuery(query);

      const response = await searchUsers({
        query,
      });

      setSearchResults(response.items);
      setHasSearched(true);
    } catch (err) {
      setError("No se pudo hacer la búsqueda");
      setSearchResults([]);
      setHasSearched(true);
    } finally {
      setIsLoading(false);
    }
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

  return {
    searchResults,
    hasSearched,
    isLoading,
    error,
    currentQuery,
    handleSearch,
    handleSendFriendRequest,
    handleAcceptFriendRequest,
    handleRejectFriendRequest,
  };
}