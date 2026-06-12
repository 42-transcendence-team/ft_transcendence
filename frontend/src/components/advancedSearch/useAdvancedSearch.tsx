import { useState } from "react";
import { searchUsers, type UserSearch } from "../../api/userSearch.tsx";

export function useAdvancedSearch() {
  const [searchResults, setSearchResults] = useState<UserSearch[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const handleSearch = async (query: string) => {
    console.log("Buscando:", query)

    const response = await searchUsers(query);

    setSearchResults(response.items);
    setHasSearched(true);
  };

  return {
    searchResults,
    hasSearched,
    handleSearch,
  };
}