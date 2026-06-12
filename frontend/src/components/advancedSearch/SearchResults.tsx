import { type UserSearch } from "../../api/userSearch.tsx";


type SearchResultsProps = {
  results: UserSearch[];
  onSendFriendRequest: (userId: number) => void;
};

export const SearchResults = ({ results, onSendFriendRequest,}: SearchResultsProps) => {
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

          {user.can_send_request && (
            <button onClick={() => onSendFriendRequest(user.id)}>
                Añadir amigo
            </button>
            )}

          {user.relation === "friends" && (
            <button>
              Ver perfil
            </button>
          )}

          {user.relation === "pending_sent" && (
            <p>Solicitud enviada</p>
          )}

          {user.relation === "pending_received" && (
            <div>
              <button>Aceptar</button>
              <button>Rechazar</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};