import { type UserSearch } from "../../api/userSearch.tsx";
import "../../styles/components/_searchResults.scss";


type SearchResultsProps = {
  results: UserSearch[];
  onSendFriendRequest: (userId: number) => void;
  onAcceptFriendRequest: (requestId: number) => void;
  onRejectFriendRequest: (requestId: number) => void;
};

export const SearchResults = ({ results, onSendFriendRequest,  onAcceptFriendRequest,
  onRejectFriendRequest, }: SearchResultsProps) => {
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
         <div className="searchResults__card" key={user.id}>
          <div className="searchResults__info">
            <p className="searchResults__login">{user.login}</p>
            <p className="searchResults__status">{user.status}</p>
            <p className="searchResults__relation">{user.relation}</p>
          </div>
          <div className="searchResults__actions">
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
          {user.relation === "pending_received" && user.request_id && (
            <div>
              <button onClick={() => onAcceptFriendRequest(user.request_id!)}>
                Aceptar
              </button>

              <button onClick={() => onRejectFriendRequest(user.request_id!)}>
                Rechazar
              </button>
            </div>
          )}
        </div>
        </div>
      ))}
    </div>
  );
};