import {
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import skullLogo from '../../assets/icons/skull_logo.png';
import '../../styles/components/_userAvatar.scss';

export type UserPresence = 'online' | 'offline' | 'hidden';

type UserAvatarSize = 'small' | 'medium' | 'large';

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

function getAvatarSource(avatarPath?: string | null): string {
  if (!avatarPath) {
    return skullLogo;
  }

  return avatarPath.startsWith('/')
    ? avatarPath
    : `/${avatarPath}`;
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
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [avatarPath]);

  const hasCustomAvatar = Boolean(avatarPath) && !imageFailed;

  const avatarSource = hasCustomAvatar
    ? getAvatarSource(avatarPath)
    : skullLogo;

  const avatarClasses = [
    'user-avatar',
    `user-avatar--${size}`,
    onClick ? 'user-avatar--interactive' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      <span className='user-avatar__frame'>
        <img
          src={avatarSource}
          alt={`${username} profile`}
          className={[
            'user-avatar__image',
            hasCustomAvatar
              ? ''
              : 'user-avatar__image--fallback',
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

      {overlay && (
        <span
          className='user-avatar__overlay'
          aria-hidden='true'
        >
          {overlay}
        </span>
      )}

      {status && (
        <span
          className={[
            'user-avatar__status',
            `user-avatar__status--${status}`,
          ].join(' ')}
          role='img'
          aria-label={presenceLabels[status]}
          title={presenceLabels[status]}
        />
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        className={avatarClasses}
        type='button'
        aria-label={
          ariaLabel ?? `Open ${username} profile`
        }
        onClick={onClick}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={avatarClasses}>
      {content}
    </div>
  );
}
