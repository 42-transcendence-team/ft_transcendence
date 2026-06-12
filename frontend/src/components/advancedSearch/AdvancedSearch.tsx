import { searchUsers, type UserSearch } from "../../api/userSearch.tsx";
import { useState } from 'react';
import { SearchResults } from "./SearchResults";
import { PrivHeader } from "@components/PrivHeader.tsx";
import { Outlet } from "react-router-dom";



export const AdvancedSearch = () => {

	const [searchResults, setSearchResults]	= useState<UserSearch[]>([]);

    const [hasSearched, setHasSearched] = useState<boolean>(false)

	const handleHeaderSearch = async (query: string) => {
		const response = await searchUsers(query);
		setSearchResults(response.items)
        setHasSearched(true)
		console.log(response.items);
	}

    return (
        <>
            <aside>

            </aside>
            <PrivHeader onSearch={handleHeaderSearch} />

            <main>
                {hasSearched && <SearchResults results={searchResults} />}

                <Outlet />
            </main>
            <footer>
                
            </footer>
        </>
    );
};