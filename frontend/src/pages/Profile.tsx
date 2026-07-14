import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/pages/_profile.scss";
import {
	UserAvatar,
	type UserPresence,
} from "../components/users/UserAvatar";
import photo1 from "../assets/img/choni1.png";
import photo2 from "../assets/img/choni2.png";
import photo3 from "../assets/img/choni3.png";
import { Post } from "../components/Post";
import { Button1 } from "../components/Button1";
import { AvatarEditorModal } from "../components/users/AvatarEditorModal";
import { BannerEditorModal } from "../components/users/BannerEditorModal";

// Todo cambiar los datos y que lleguen de la BD.
const postsData = [
	{
		id: 1,
		username: "lore",
		time: "Ahora mismo",
		message: " TODO BORRAR",
		isHighlighted: false,
	},
	{
		id: 2,
		username: "yoni",
		time: "2 min",
		message: "Listo pal roneitoooo",
		images: [photo1, photo2, photo3, photo3],
		isHighlighted: true,
	},
	{
		id: 3,
		username: "lore",
		time: "Ahora mismo",
		message: " TODO BORRAR",
		isHighlighted: false,
	},
	{
		id: 4,
		username: "lore",
		time: "Ahora mismo",
		message: " TODO BORRAR",
		isHighlighted: false,
	},
	{
		id: 5,
		username: "lore",
		time: "Ahora mismo",
		message: " TODO BORRAR",
		isHighlighted: false,
	},
];

function getBannerSource(
	bannerPath: string,
): string {
	return bannerPath.startsWith("/")
		? bannerPath
		: `/${bannerPath}`;
}

export const Profile = () => {
	const { user, loading, refreshUser } = useAuth();

	const [isAvatarEditorOpen, setIsAvatarEditorOpen] =
		useState(false);
	const [isBannerEditorOpen, setIsBannerEditorOpen] =
		useState(false);
	const [bannerImageFailed, setBannerImageFailed] =
		useState(false);

	useEffect(() => {
		// Cada ruta nueva debe volver a intentar cargar el banner.
		setBannerImageFailed(false);
	}, [user?.bannerPath]);

	if (loading) {
		return (
			<div className="loading-screen">
				Cargando el roneito...
			</div>
		);
	}

	if (!user) {
		return (
			<div className="error-screen">
				No se ha podido cargar tu sesión.
			</div>
		);
	}

	// Temporal hasta que exista el sistema real de presencia/status.
	const profilePresence: UserPresence = "online";

	const hasCustomBanner =
		Boolean(user.bannerPath) && !bannerImageFailed;

	return (
		<div className="profile">
			<div className="profile__container">
				<button
					className="profile__banner profile__banner--interactive"
					type="button"
					aria-label="Edit profile banner"
					onClick={() =>
						setIsBannerEditorOpen(true)
					}
				>
					{hasCustomBanner && user.bannerPath ? (
						<img
							className="profile__banner-image"
							src={getBannerSource(
								user.bannerPath,
							)}
							alt={`${user.login} profile banner`}
							onError={() =>
								setBannerImageFailed(true)
							}
						/>
					) : (
						<span className="profile__banner-placeholder" />
					)}

					<span
						className="profile__banner-overlay"
						aria-hidden="true"
					>
						<i className="fas fa-camera" />
						<span>Edit banner</span>
					</span>
				</button>

				<div className="profile__header">
					<UserAvatar
						avatarPath={user.avatarPath}
						username={user.login}
						size="large"
						status={profilePresence}
						className="profile__avatar"
						ariaLabel="Edit profile image"
						overlay={
							<i className="fas fa-camera" />
						}
						onClick={() =>
							setIsAvatarEditorOpen(true)
						}
					/>

					<div className="profile__user-details">
						<div className="profile__visits">
							<i className="fas fa-chart-line profile__visits-icon" />

							<span>
								Nº Visitas al perfil{" "}
								{user.visits || 0}
							</span>
						</div>

						<h4 className="profile__user-name">
							{user.name && user.surname
								? `${user.name} ${user.surname}`
								: user.login}
						</h4>
					</div>

					<Button1 label="Share" />
				</div>

				<div className="profile__feed">
					<p className="profile__status">
						{user.status ||
							"Sin estado disponible"}
					</p>

					<div className="profile__posts">
						{postsData.length > 0 ? (
							postsData.map((post) => (
								<Post
									key={post.id}
									username={post.username}
									time={post.time}
									message={post.message}
									images={post.images}
									isHighlighted={
										post.isHighlighted
									}
								/>
							))
						) : (
							<div className="profile__empty">
								Aún no hay roneos por
								aquí...
							</div>
						)}
					</div>
				</div>
			</div>

			<AvatarEditorModal
				open={isAvatarEditorOpen}
				currentAvatarPath={
					user.avatarPath ?? null
				}
				onClose={() =>
					setIsAvatarEditorOpen(false)
				}
				onUpdated={refreshUser}
			/>

			<BannerEditorModal
				open={isBannerEditorOpen}
				currentBannerPath={
					user.bannerPath ?? null
				}
				onClose={() =>
					setIsBannerEditorOpen(false)
				}
				onUpdated={refreshUser}
			/>
		</div>
	);
};
