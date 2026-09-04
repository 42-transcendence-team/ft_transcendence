import { SearchFilters } from '@components/advancedSearch/SearchFilters';
import { SearchPagination } from '@components/advancedSearch/SearchPagination';
import { SearchResults } from '@components/advancedSearch/SearchResults';
import { useAdvancedSearch } from '@components/advancedSearch/useAdvancedSearch';
import { ConfirmModal } from '@components/ConfirmModal';
import { Notification } from '@components/Notification';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import '../styles/pages/_mobileSearchAndNotify.scss';

type ConfirmAction = 'remove-friend' | 'block' | 'unblock';

type PendingConfirmation = {
  action: ConfirmAction;
  userId: number;
  login: string;
};

export const MobileSearchAndNotify: React.FC = () => {
  const search = useAdvancedSearch();
  const navigate = useNavigate();

  const [pendingConfirmation, setPendingConfirmation] =
    useState<PendingConfirmation | null>(null);

  const [isConfirming, setIsConfirming] = useState(false);

  const handleOpenProfile = (login: string) => {
    navigate(`/app/profile/${login}`);
  };

  const requestConfirmation = (action: ConfirmAction, userId: number) => {
    const user = search.searchResults.find((result) => result.id === userId);

    if (!user) {
      return;
    }

    setPendingConfirmation({
      action,
      userId,
      login: user.login,
    });
  };

  const handleConfirm = async () => {
    if (!pendingConfirmation) {
      return;
    }

    setIsConfirming(true);

    try {
      switch (pendingConfirmation.action) {
        case 'remove-friend':
          await search.handleRemoveFriend(pendingConfirmation.userId);
          break;

        case 'block':
          await search.handleBlockUser(pendingConfirmation.userId);
          break;

        case 'unblock':
          await search.handleUnblockUser(pendingConfirmation.userId);
          break;
      }

      setPendingConfirmation(null);
    } finally {
      setIsConfirming(false);
    }
  };

  const confirmationConfig = pendingConfirmation
    ? {
        'remove-friend': {
          title: 'Eliminar amigo',
          message: `¿Seguro que quieres eliminar a @${pendingConfirmation.login} de tus amigos?`,
          confirmLabel: 'Eliminar',
          confirmingLabel: 'Eliminando...',
        },

        block: {
          title: 'Bloquear usuario',
          message: `¿Seguro que quieres bloquear a @${pendingConfirmation.login}?`,
          confirmLabel: 'Bloquear',
          confirmingLabel: 'Bloqueando...',
        },

        unblock: {
          title: 'Desbloquear usuario',
          message: `¿Seguro que quieres desbloquear a @${pendingConfirmation.login}?`,
          confirmLabel: 'Desbloquear',
          confirmingLabel: 'Desbloqueando...',
        },
      }[pendingConfirmation.action]
    : null;

  return (
    <div className="mobileSearchAndNotify">
      <div className="mobileSearchAndNotify__section mobileSearchAndNotify__section--notifications">
        <Notification />
      </div>

      <div className="mobileSearchAndNotify__section mobileSearchAndNotify__section--filters">
        <SearchFilters
          selectedRelations={search.relations}
          onRelationsChange={search.handleRelationsChange}
          selectedSort={search.sort}
          onSortChange={search.handleSortChange}
        />
      </div>

      {search.hasSearched && (
        <div className="mobileSearchAndNotify__section mobileSearchAndNotify__section--results">
          {search.error ? (
            <p className="mobileSearchAndNotify__error">{search.error}</p>
          ) : search.isLoading && search.searchResults.length === 0 ? (
            <p className="mobileSearchAndNotify__loading">Buscando...</p>
          ) : (
            <>
              <p className="searchResults__count">
                {search.totalResults} usuarios encontrados
              </p>

              <SearchResults
                results={search.searchResults}
                onOpenProfile={handleOpenProfile}
                onSendFriendRequest={search.handleSendFriendRequest}
                onAcceptFriendRequest={search.handleAcceptFriendRequest}
                onRejectFriendRequest={search.handleRejectFriendRequest}
                onRemoveFriend={(userId) =>
                  requestConfirmation('remove-friend', userId)
                }
                onBlockUser={(userId) => requestConfirmation('block', userId)}
                onUnblockUser={(userId) =>
                  requestConfirmation('unblock', userId)
                }
              />

              <SearchPagination
                page={search.page}
                totalPages={search.totalPages}
                onPrevious={search.handlePreviousPage}
                onNext={search.handleNextPage}
              />
            </>
          )}
        </div>
      )}

      {confirmationConfig && (
        <ConfirmModal
          open={pendingConfirmation !== null}
          title={confirmationConfig.title}
          message={confirmationConfig.message}
          confirmLabel={confirmationConfig.confirmLabel}
          confirmingLabel={confirmationConfig.confirmingLabel}
          cancelLabel="Cancelar"
          isConfirming={isConfirming}
          onConfirm={handleConfirm}
          onClose={() => setPendingConfirmation(null)}
        />
      )}
    </div>
  );
};
