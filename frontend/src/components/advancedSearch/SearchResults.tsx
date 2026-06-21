import { type UserSearch } from "../../api/userSearch.tsx";
import skullLogo from "../../assets/icons/skull_logo.png";
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
    <div className="searchResults">
      {results.map((user) => (
         <div className="searchResults__card" key={user.id}>
          <div className="searchResults__left">
            <div className="searchResults__avatar">
              <img
                src={user.avatar_url || skullLogo}
                alt={`${user.login} avatar`}
              />
            </div>

            <div className="searchResults__userInfo">
              <p className="searchResults__login">{user.login}</p>
              <p className="searchResults__status">{user.status}</p>
            </div>
          </div>

          <div className="searchResults__actions">
            {user.can_send_request && (
              <button onClick={() => onSendFriendRequest(user.id)}>
                Mandar solicitud de amistad
              </button>
            )}

            {user.relation === "friends" && (
              <button>Ver perfil</button>
            )}

            {user.relation === "pending_sent" && (
              <p className="searchResults__pending">Solicitud enviada</p>
            )}

            {user.relation === "pending_received" && user.request_id && (
              <>
                <button onClick={() => onAcceptFriendRequest(user.request_id!)}>
                  Aceptar
                </button>

                <button onClick={() => onRejectFriendRequest(user.request_id!)}>
                  Rechazar
                </button>
              </>
            )}

            {user.relation === "blocked_by_me" && (
              <button>Desbloquear</button>
            )}

            {user.relation === "blocked_me" && (
              <p className="searchResults__blocked">No disponible</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};