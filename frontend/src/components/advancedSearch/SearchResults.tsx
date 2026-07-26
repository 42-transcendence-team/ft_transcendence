import { type UserSearch } from "../../api/UserSearch.tsx";
import skullLogo from "../../assets/icons/skull_logo.png";
import "../../styles/components/advancedSearch/_searchResults.scss";
import { RelationsActionsMenu } from "@components/RelationsActionsMenu.tsx";
import "../../styles/components/_relationsActionsMenu.scss";


type SearchResultsProps = {
  results: UserSearch[];
  onSendFriendRequest: (userId: number) => void;
  onAcceptFriendRequest: (requestId: number) => void;
  onRejectFriendRequest: (requestId: number) => void;
  onRemoveFriend: (userId: number) => void;
  onBlockUser: (userId: number) => void;
  onUnblockUser: (userId: number) => void;
};

export const SearchResults = ({ results, onSendFriendRequest,  onAcceptFriendRequest,
  onRejectFriendRequest, onRemoveFriend, onBlockUser, onUnblockUser,}: SearchResultsProps) => {
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
              <p className="searchResults__fullName">
                {user.name} {user.surname}
              </p>
              <p className="searchResults__login">
                  @{user.login}
              </p>
              <p className="searchResults__status">{user.status}</p>
            </div>
          </div>

          <div className="searchResults__actions">
            {user.can_send_request && (
              <button onClick={() => onSendFriendRequest(user.id)}>
                Agregar amigo
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
              <button onClick={() => onUnblockUser(user.id)}>
                Desbloquear
              </button>
            )}

            {user.relation === "blocked_me" && (
              <p className="searchResults__blocked">No disponible</p>
            )}

            <RelationsActionsMenu
              relation={user.relation}
              onRemoveFriend={() => onRemoveFriend(user.id)}
              onBlockUser={() => onBlockUser(user.id)}
            />
          </div>
        </div>
      ))}
    </div>
  );
};