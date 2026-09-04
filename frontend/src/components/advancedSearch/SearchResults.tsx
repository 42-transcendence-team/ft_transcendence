import { RelationsActionsMenu } from '@components/RelationsActionsMenu.tsx';
import { UserAvatar } from '@components/users/UserAvatar.tsx';
import type { UserSearch } from '../../api/UserSearch.tsx';

import '../../styles/components/advancedSearch/_searchResults.scss';
import '../../styles/components/_relationsActionsMenu.scss';

type SearchResultsProps = {
  results: UserSearch[];
  onOpenProfile: (login: string) => void;
  onSendFriendRequest: (userId: number) => void;
  onAcceptFriendRequest: (requestId: number) => void;
  onRejectFriendRequest: (requestId: number) => void;
  onRemoveFriend: (userId: number) => void;
  onBlockUser: (userId: number) => void;
  onUnblockUser: (userId: number) => void;
};

export const SearchResults = ({
  results,
  onOpenProfile,
  onSendFriendRequest,
  onAcceptFriendRequest,
  onRejectFriendRequest,
  onRemoveFriend,
  onBlockUser,
  onUnblockUser,
}: SearchResultsProps) => {
  return (
    <div className="searchResults">
      {results.map((user) => (
        <div className="searchResults__card" key={user.id}>
          <div className="searchResults__left">
            <div className="searchResults__avatar">
              <UserAvatar
                avatarPath={user.avatar_url}
                username={user.login}
                size="medium"
              />
            </div>

            <div className="searchResults__userInfo">
              <p className="searchResults__fullName">
                {user.name} {user.surname}
              </p>

              <p className="searchResults__login">@{user.login}</p>

              <p className="searchResults__status">{user.status}</p>
            </div>
          </div>

          <div className="searchResults__actions">
            <div className="searchResults__relation-actions">
              {user.can_send_request && (
                <button
                  type="button"
                  onClick={() => onSendFriendRequest(user.id)}
                >
                  Agregar amigo
                </button>
              )}

              {user.relation === 'pending_sent' && (
                <p className="searchResults__pending">Solicitud enviada</p>
              )}

              {user.relation === 'pending_received' && user.request_id && (
                <>
                  <button
                    type="button"
                    onClick={() => onAcceptFriendRequest(user.request_id!)}
                  >
                    Aceptar
                  </button>

                  <button
                    type="button"
                    onClick={() => onRejectFriendRequest(user.request_id!)}
                  >
                    Rechazar
                  </button>
                </>
              )}

              {user.relation === 'blocked_by_me' && (
                <button type="button" onClick={() => onUnblockUser(user.id)}>
                  Desbloquear
                </button>
              )}

              {user.relation === 'blocked_me' && (
                <p className="searchResults__blocked">No disponible</p>
              )}
            </div>

            <div className="searchResults__profile-actions">
              {user.relation !== 'blocked_by_me' &&
                user.relation !== 'blocked_me' && (
                  <button
                    type="button"
                    onClick={() => onOpenProfile(user.login)}
                  >
                    Ver perfil
                  </button>
                )}

              <RelationsActionsMenu
                relation={user.relation}
                onRemoveFriend={() => onRemoveFriend(user.id)}
                onBlockUser={() => onBlockUser(user.id)}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
