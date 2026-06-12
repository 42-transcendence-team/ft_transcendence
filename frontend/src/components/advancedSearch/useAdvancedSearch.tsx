import { useState } from "react";
import { searchUsers, type UserSearch } from "../../api/userSearch.tsx";
import { sendFriendRequest } from "../../api/Friends";

export function useAdvancedSearch() {
    const [searchResults, setSearchResults] = useState<UserSearch[]>([]);
    const [hasSearched, setHasSearched] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (query: string) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await searchUsers(query);

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
          currentResults.map((user) => {
            if (user.id === userId) {
              return {
                ...user,
                relation: "pending_sent",
                can_send_request: false,
              };
            }

            return user;
          })
        );

      } catch (error) {
        console.log("ERROR SEND FRIEND REQUEST", error);
      }
    };

    return {
        searchResults,
        hasSearched,
        isLoading,
        error,
        handleSearch,
        handleSendFriendRequest,
    };
}