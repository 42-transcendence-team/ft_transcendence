import type { ReactNode } from 'react';

type ProfileContentProps = {
  status: string | null;
  visits: number;
  isOwnProfile: boolean;
  canViewPrivateContent: boolean;
  onStatusUpdated?: (newStatus: string) => void;
  children?: ReactNode;
};

export const ProfileContent = ({
  canViewPrivateContent,
  children,
}: ProfileContentProps) => {
  if (!canViewPrivateContent) {
    return (
      <div className="profile__feed">
        <div className="profile__private">
          <i className="fas fa-lock" />

          <h3>Este perfil es privado</h3>

          <p>
            Añade a este usuario como amigo para ver su estado y sus
            publicaciones.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile__feed">
      {children ?? (
        <div className="profile__posts-placeholder">
          Sección de publicaciones pendiente.
        </div>
      )}
    </div>
  );
};
