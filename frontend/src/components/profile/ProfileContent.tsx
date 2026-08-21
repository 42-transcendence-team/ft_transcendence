import type { ReactNode } from "react";

import { ProfileCreatePostTrigger } from "./ProfileCreatePostTrigger";

type ProfileContentProps = {
	status: string | null;
	isOwnProfile: boolean;
	canViewPrivateContent: boolean;
	onCreatePost?: () => void;
	children?: ReactNode;
};

export const ProfileContent = ({
	status,
	isOwnProfile,
	canViewPrivateContent,
	onCreatePost,
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
				<ProfileCreatePostTrigger
					onClick={onCreatePost}
				/>
			)}

			{children ?? (
				<div className="profile__posts-placeholder">
					Sección de publicaciones pendiente.
				</div>
			)}
		</div>
	);
};
