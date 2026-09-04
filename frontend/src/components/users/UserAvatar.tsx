import { type ReactNode, useEffect, useState } from 'react';
import skullLogo from '../../assets/icons/skull_logo.png';
import '../../styles/components/_userAvatar.scss';

// Estados de presencia que puede representar el indicador del avatar.
export type UserPresence = 'online' | 'offline' | 'hidden';

type UserAvatarSize = 'small' | 'medium' | 'large';

// Componente visual reutilizable para mostrar avatares en perfiles,
// publicaciones, comentarios, búsquedas y conversaciones.
type UserAvatarProps = {
  avatarPath?: string | null;
  username: string;
  size?: UserAvatarSize;
  status?: UserPresence | null;
  onClick?: () => void;
  ariaLabel?: string;
  overlay?: ReactNode;
  className?: string;
};

const presenceLabels: Record<UserPresence, string> = {
  online: 'Online',
  offline: 'Offline',
  hidden: 'Hidden',
};

// Normaliza la ruta relativa enviada por el backend.
// Cuando no existe un avatar personalizado, devuelve la imagen predeterminada.
function getAvatarSource(avatarPath?: string | null): string {
  if (!avatarPath) {
    return skullLogo;
  }

  return avatarPath.startsWith('/') ? avatarPath : `/${avatarPath}`;
}

export function UserAvatar({
  avatarPath,
  username,
  size = 'medium',
  status = null,
  onClick,
  ariaLabel,
  overlay,
  className,
}: UserAvatarProps) {
  // Permite sustituir por el avatar predeterminado una imagen que no
  // exista o que el navegador no pueda cargar.
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    // Cada nueva ruta debe volver a intentar cargar la imagen personalizada.
    setImageFailed(false);
  }, [avatarPath]);

  const hasCustomAvatar = Boolean(avatarPath) && !imageFailed;

  const avatarSource = hasCustomAvatar
    ? getAvatarSource(avatarPath)
    : skullLogo;

  // Aplica el tamaño, el comportamiento interactivo y cualquier ajuste
  // visual añadido desde el componente que utiliza el avatar.
  const avatarClasses = [
    'user-avatar',
    `user-avatar--${size}`,
    onClick ? 'user-avatar--interactive' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  // Contenido compartido por las versiones interactiva y estática.
  const content = (
    <>
      <span className="user-avatar__frame">
        <img
          src={avatarSource}
          alt={`${username} profile`}
          className={[
            'user-avatar__image',
            hasCustomAvatar ? '' : 'user-avatar__image--fallback',
          ]
            .filter(Boolean)
            .join(' ')}
          onError={() => {
            if (hasCustomAvatar) {
              setImageFailed(true);
            }
          }}
        />
      </span>

      {/* Capa opcional para iconos o acciones visuales sobre la imagen. */}
      {overlay && (
        <span className="user-avatar__overlay" aria-hidden="true">
          {overlay}
        </span>
      )}

      {/* El indicador solo se muestra cuando se proporciona un estado. */}
      {status && (
        <span
          className={[
            'user-avatar__status',
            `user-avatar__status--${status}`,
          ].join(' ')}
          role="img"
          aria-label={presenceLabels[status]}
          title={presenceLabels[status]}
        />
      )}
    </>
  );

  // Cuando tiene una acción asociada se renderiza como botón accesible.
  if (onClick) {
    return (
      <button
        className={avatarClasses}
        type="button"
        aria-label={ariaLabel ?? `Open ${username} profile`}
        onClick={onClick}
      >
        {content}
      </button>
    );
  }

  // Sin acción asociada se utiliza como elemento únicamente visual.
  return <div className={avatarClasses}>{content}</div>;
}
