
import { type UserSearch } from "../../api/userSearch.tsx";

type SearchResultsProps = {
    results: UserSearch[]
}

export const SearchResults = ({results}: SearchResultsProps) => {
    return results.map((user) => (
       <div key={user.id}>
            <p>{user.login}</p>
            <p>{user.status}</p>
            <p>{user.relation}</p>
        </div>
    ));
};