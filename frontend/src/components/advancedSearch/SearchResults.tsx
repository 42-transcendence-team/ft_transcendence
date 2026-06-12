
import { type UserSearch } from "../../api/userSearch.tsx";

type SearchResultsProps = {
  results: UserSearch[];
};

export const SearchResults = ({ results }: SearchResultsProps) => {
  if (results.length <= 0) {
    return (
      <p>
        Esto que usted anda buscando no se encuentra por ningún sitio
      </p>
    );
  }

  return (
    <div>
      {results.map((user) => (
        <div key={user.id}>
          <p>{user.login}</p>
          <p>{user.status}</p>
          <p>{user.relation}</p>
        </div>
      ))}
    </div>
  );
};