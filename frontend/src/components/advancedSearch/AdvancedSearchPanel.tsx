import { ConfirmModal } from '@components/ConfirmModal';
import { useEffect, useRef, useState } from 'react';
import { FiSliders } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { SearchFilters } from './SearchFilters';
import { SearchPagination } from './SearchPagination';
import { SearchResults } from './SearchResults';
import type { useAdvancedSearch } from './useAdvancedSearch';

type AdvancedSearchPanelProps = {
  search: ReturnType<typeof useAdvancedSearch>;
  onClose: () => void;
};

type ConfirmAction = 'remove-friend' | 'block' | 'unblock';

type PendingConfirmation = {
  action: ConfirmAction;
  userId: number;
  login: string;
};

export function AdvancedSearchPanel({
  search,
  onClose,
}: AdvancedSearchPanelProps) {
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (search.relations.length > 0) {
      setShowFilters(true);
    }
  }, [search.relations.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: PointerEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handleClickOutside);
    };
  }, [onClose]);

  const [pendingConfirmation, setPendingConfirmation] =
    useState<PendingConfirmation | null>(null);

  const [isConfirming, setIsConfirming] = useState(false);

  const handleOpenProfile = (login: string) => {
    onClose();
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
    <div className="advancedSearchOverlay">
      <div className="advancedSearchPanel" ref={panelRef}>
        <div className="advancedSearchPanel__header">
          <h3 className="advancedSearchPanel__title">Búsqueda avanzada</h3>

          <div className="advancedSearchPanel__actions">
            <button
              type="button"
              className={`advancedSearchPanel__toggle ${showFilters ? 'advancedSearchPanel__toggle--active' : ''}`}
              onClick={() => setShowFilters((current) => !current)}
              aria-label="Mostrar filtros"
              aria-expanded={showFilters}
              title="Filtros"
            >
              <FiSliders />
            </button>
            <button
              type="button"
              className="advancedSearchPanel__close"
              onClick={onClose}
              aria-label="Cerrar búsqueda avanzada"
            >
              ×
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="advancedSearchPanel__filters">
            <SearchFilters
              selectedRelations={search.relations}
              onRelationsChange={search.handleRelationsChange}
              selectedSort={search.sort}
              onSortChange={search.handleSortChange}
            />
          </div>
        )}

        {search.error ? (
          <p>{search.error}</p>
        ) : search.isLoading && search.searchResults.length === 0 ? (
          <p>Buscando...</p>
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
              onUnblockUser={(userId) => requestConfirmation('unblock', userId)}
            />

            <SearchPagination
              page={search.page}
              totalPages={search.totalPages}
              onPrevious={search.handlePreviousPage}
              onNext={search.handleNextPage}
            />
          </>
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
    </div>
  );
}
