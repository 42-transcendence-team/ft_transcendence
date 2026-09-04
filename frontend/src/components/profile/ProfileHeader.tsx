import { UserState } from '@components/UserState';
import { useState } from 'react';
import { FiEdit3, FiEye } from 'react-icons/fi';
import { TbUserShare } from 'react-icons/tb';
import { Link } from 'react-router';
import type { UserRelation } from '../../api/UserSearch';
import { Button1 } from '../Button1';
import { UserAvatar, type UserPresence } from '../users/UserAvatar';

type ProfileHeaderProps = {
  userId: number;
  username: string;
  name: string | null;
  surname: string | null;
  visits: number;
  avatarPath: string | null;
  presence: UserPresence;
  status: string | null;

  isOwnProfile: boolean;
  hasCustomAvatar: boolean;

  relation: UserRelation;
  canSendRequest: boolean;
  requestId: number | null;

  onAvatarClick?: () => void;

  onAddFriend?: () => void;
  onAcceptRequest?: () => void;
  onRejectRequest?: () => void;
  onRemoveFriend?: () => void;
  onBlockUser?: () => void;
  onUnblockUser?: () => void;
  onStatusUpdated?: (newStatus: string) => void;
};

export const ProfileHeader = ({
  username,
  name,
  surname,
  visits,
  avatarPath,
  presence,
  status,
  isOwnProfile,
  hasCustomAvatar,
  relation,
  canSendRequest,
  requestId,
  onAvatarClick,
  onAddFriend,
  onAcceptRequest,
  onRejectRequest,
  onRemoveFriend,
  onBlockUser,
  onUnblockUser,
  onStatusUpdated,
}: ProfileHeaderProps) => {
  const displayName = name && surname ? `${name} ${surname}` : username;

  const avatarOverlay = isOwnProfile ? (
    <i className="fas fa-camera" />
  ) : hasCustomAvatar ? (
    <i className="fas fa-expand" />
  ) : undefined;

  const renderRelationActions = () => {
    if (isOwnProfile) {
      return null;
    }

    switch (relation) {
      case 'none':
        return (
          <div className="profile__actions">
            {canSendRequest && (
              <Button1
                label="Añadir amigo"
                variant="primary"
                onClick={onAddFriend}
              />
            )}

            <Button1 label="Bloquear" variant="danger" onClick={onBlockUser} />
          </div>
        );

      case 'pending_sent':
        return (
          <div className="profile__actions">
            <Button1 label="Solicitud enviada" variant="disabled" disabled />

            <Button1 label="Bloquear" variant="danger" onClick={onBlockUser} />
          </div>
        );

      case 'pending_received':
        return (
          <div className="profile__actions">
            {requestId !== null && (
              <>
                <Button1
                  label="Aceptar"
                  variant="primary"
                  onClick={onAcceptRequest}
                />

                <Button1
                  label="Rechazar"
                  variant="secondary"
                  onClick={onRejectRequest}
                />
              </>
            )}

            <Button1 label="Bloquear" variant="danger" onClick={onBlockUser} />
          </div>
        );

      case 'friends':
        return (
          <div className="profile__actions">
            <Button1
              label="Eliminar amigo"
              variant="danger"
              onClick={onRemoveFriend}
            />

            <Button1 label="Bloquear" variant="danger" onClick={onBlockUser} />
          </div>
        );

      case 'blocked_by_me':
        return (
          <div className="profile__actions">
            <Button1
              label="Desbloquear"
              variant="secondary"
              onClick={onUnblockUser}
            />
          </div>
        );

      case 'blocked_me':
        return null;

      default:
        return null;
    }
  };

  const [showCopied, setShowCopied] = useState(false);

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);

    setShowCopied(true);

    setTimeout(() => {
      setShowCopied(false);
    }, 2000);
  };

  return (
    <div className="profile__header">
      <UserAvatar
        avatarPath={avatarPath}
        username={username}
        size="large"
        status={presence}
        className="profile__avatar"
        ariaLabel={
          isOwnProfile
            ? 'Editar imagen de perfil'
            : `Abrir la imagen de perfil de ${username}`
        }
        overlay={avatarOverlay}
        onClick={onAvatarClick}
      />

      <div className="profile__info">
        <div className="profile__state-overlay">
          <UserState
            userStatus={status}
            isOwnProfile={isOwnProfile}
            onStatusUpdated={onStatusUpdated}
          />

          <div className="profile__user-details">
            <h4 className="profile__user-name">{displayName}</h4>

            <span className="profile__username">@{username}</span>
          </div>
        </div>

        <div className="profile__acation-btn">
          <div className="profile__visits">
            <FiEye />
            <span>{visits} visitas</span>
          </div>

          {renderRelationActions()}

          {isOwnProfile && (
            <Link
              className="miniProfile__publishBtn"
              to="/app/posts/new"
              title="Nuevo post"
              aria-label="Nuevo post"
            >
              <FiEdit3 className="miniProfile__publishIcon" />
              <span className="miniProfile__publishText">Nuevo post</span>
            </Link>
          )}

          {relation !== 'blocked_by_me' && relation !== 'blocked_me' && (
            <div className="profile__share">
              {showCopied && (
                <div className="profile__share-toast">Enlace copiado</div>
              )}

              <Button1
                label="Compartir"
                variant="secondary"
                onClick={handleShare}
              >
                <TbUserShare className="profile__share-icon" />
              </Button1>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
