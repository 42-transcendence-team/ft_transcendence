type ProfileContentProps = {
	status: string | null;
	isOwnProfile: boolean;
};

export const ProfileContent = ({
	status,
	isOwnProfile,
}: ProfileContentProps) => {
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

			<div className="profile__posts-placeholder">
				Sección de publicaciones pendiente.
			</div>
		</div>
	);
};