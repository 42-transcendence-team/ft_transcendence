import type { ReactNode } from "react";

type ProfileContentProps = {
        status: string | null;
        isOwnProfile: boolean;
        canViewPrivateContent: boolean;
        children?: ReactNode;
};

export const ProfileContent = ({
        status,
        isOwnProfile,
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
                                                Añade a este usuario como amigo para ver
                                                su estado y sus publicaciones.
                                        </p>
                                </div>
                        </div>
                );
        }

        return (
                <div className="profile__feed">
                        <p className="profile__status">
                                {status || "Sin estado disponible"}
                        </p>

                        {isOwnProfile && (
                                <div className="profile__create-post">
                                        <button
                                                type="button"
                                                className="profile__create-post-button"
                                        >
                                                <i className="fas fa-plus" />
                                                <span>Añadir publicación</span>
                                        </button>
                                </div>
                        )}

                        {children ?? (
                                <div className="profile__posts-placeholder">
                                        Sección de publicaciones pendiente.
                                </div>
                        )}
                </div>
        );
};
