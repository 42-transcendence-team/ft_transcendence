import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import type { ApiError } from "../api/ApiRequest";
import {
	getUserPresence,
	getUserProfile,
	type UserProfile,
} from "../api/UserProfile";

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
import { NotFound } from "./NotFound";
import { AvatarEditorModal } from "../components/users/AvatarEditorModal";
import { BannerEditorModal } from "../components/users/BannerEditorModal";
import { PostImageModal } from "../components/posts/PostImageModal";

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

function getImageSource(imagePath: string): string {
	return imagePath.startsWith("/")
		? imagePath
		: `/${imagePath}`;
}

function isApiError(error: unknown): error is ApiError {
	return (
		typeof error === "object" &&
		error !== null &&
		"status" in error &&
		typeof error.status === "number"
	);
}

export const Profile = () => {
	const { username } = useParams<{ username: string }>();

	const {
		user: authenticatedUser,
		loading: authLoading,
		refreshUser,
	} = useAuth();

	const [profileUser, setProfileUser] =
		useState<UserProfile | null>(null);
	const [isLoadingProfile, setIsLoadingProfile] =
		useState(true);
	const [profileError, setProfileError] =
		useState<string | null>(null);
	const [profileNotFound, setProfileNotFound] =
		useState(false);

	const [isAvatarEditorOpen, setIsAvatarEditorOpen] =
		useState(false);
	const [isBannerEditorOpen, setIsBannerEditorOpen] =
		useState(false);
	const [isAvatarViewerOpen, setIsAvatarViewerOpen] =
		useState(false);

	const [avatarImageFailed, setAvatarImageFailed] =
		useState(false);
	const [bannerImageFailed, setBannerImageFailed] =
		useState(false);

	/*
	 * Carga inicial del perfil indicado en la ruta.
	 * Esta petición incrementa el contador de visitas una sola vez.
	 */
	useEffect(() => {
		let cancelled = false;

		setProfileUser(null);
		setProfileError(null);
		setProfileNotFound(false);
		setIsLoadingProfile(true);

		setIsAvatarEditorOpen(false);
		setIsBannerEditorOpen(false);
		setIsAvatarViewerOpen(false);

		setAvatarImageFailed(false);
		setBannerImageFailed(false);

		if (!username) {
			setProfileNotFound(true);
			setIsLoadingProfile(false);
			return;
		}

		getUserProfile(username)
			.then((profile) => {
				if (!cancelled) {
					setProfileUser(profile);
					window.dispatchEvent(new CustomEvent('updateVisits', { detail: profile.visits }));
				}
			})
			.catch((error: unknown) => {
				if (cancelled) {
					return;
				}

				if (
					isApiError(error) &&
					error.status === 404
				) {
					setProfileNotFound(true);
					return;
				}

				setProfileError(
					"The profile could not be loaded.",
				);
			})
			.finally(() => {
				if (!cancelled) {
					setIsLoadingProfile(false);
				}
			});

		return () => {
			cancelled = true;
		};
	}, [username]);

	/*
	 * Consulta únicamente el estado almacenado en Redis.
	 * No vuelve a cargar el perfil completo y, por tanto,
	 * no incrementa artificialmente el contador de visitas.
	 */
	useEffect(() => {
		if (!profileUser?.login || profileNotFound) {
			return;
		}

		const profileLogin = profileUser.login;

		let cancelled = false;
		let requestInFlight = false;

		const refreshPresence = async () => {
			if (requestInFlight) {
				return;
			}

			requestInFlight = true;

			try {
				const isOnline =
					await getUserPresence(profileLogin);

				if (cancelled) {
					return;
				}

				setProfileUser((currentProfile) => {
					if (
						!currentProfile ||
						currentProfile.login !== profileLogin ||
						currentProfile.isOnline === isOnline
					) {
						return currentProfile;
					}

					return {
						...currentProfile,
						isOnline,
					};
				});
			} catch {
				/*
				 * Si falla una comprobación puntual, se conserva
				 * el último estado conocido del usuario.
				 */
			} finally {
				requestInFlight = false;
			}
		};

		// Actualiza inmediatamente tras cargar el perfil.
		void refreshPresence();

		const intervalId = window.setInterval(() => {
			void refreshPresence();
		}, 30_000);

		return () => {
			cancelled = true;
			window.clearInterval(intervalId);
		};
	}, [profileUser?.login, profileNotFound]);

	/*
	 * Los editores actualizan primero AuthContext. Cuando el perfil
	 * abierto es el propio, sincronizamos aquí las rutas nuevas sin
	 * tener que repetir la petición completa de perfil.
	 */
	useEffect(() => {
		if (
			!profileUser ||
			!authenticatedUser ||
			profileUser.login !== authenticatedUser.login
		) {
			return;
		}

		setProfileUser((currentProfile) => {
			if (!currentProfile) {
				return currentProfile;
			}

			return {
				...currentProfile,
				name:
					authenticatedUser.name ??
					currentProfile.name,
				surname:
					authenticatedUser.surname ??
					currentProfile.surname,
				avatarPath:
					authenticatedUser.avatarPath ?? null,
				bannerPath:
					authenticatedUser.bannerPath ?? null,
			};
		});
	}, [
		authenticatedUser?.name,
		authenticatedUser?.surname,
		authenticatedUser?.avatarPath,
		authenticatedUser?.bannerPath,
	]);

	/*
	 * UserAvatar ya gestiona su propio fallback, pero Profile también
	 * necesita saber si la imagen existe para no abrir un visor roto.
	 */
	useEffect(() => {
		setAvatarImageFailed(false);

		if (!profileUser?.avatarPath) {
			return;
		}

		let active = true;
		const image = new Image();

		image.onerror = () => {
			if (active) {
				setAvatarImageFailed(true);
			}
		};

		image.src = getImageSource(profileUser.avatarPath);

		return () => {
			active = false;
		};
	}, [profileUser?.avatarPath]);

	useEffect(() => {
		setBannerImageFailed(false);
	}, [profileUser?.bannerPath]);

	if (authLoading || isLoadingProfile) {
		return (
			<div className="loading-screen">
				Cargando el roneito...
			</div>
		);
	}

	if (!authenticatedUser) {
		return (
			<div className="error-screen">
				No se ha podido cargar tu sesión.
			</div>
		);
	}

	if (profileNotFound) {
		return <NotFound />;
	}

	if (profileError || !profileUser) {
		return (
			<div className="error-screen">
				{profileError ??
					"The profile could not be loaded."}
			</div>
		);
	}

	const isOwnProfile =
		authenticatedUser.login === profileUser.login;

	const profilePresence: UserPresence =
		profileUser.isOnline ? "online" : "offline";

	const hasCustomAvatar =
		Boolean(profileUser.avatarPath) &&
		!avatarImageFailed;

	const hasCustomBanner =
		Boolean(profileUser.bannerPath) &&
		!bannerImageFailed;

	const handleAvatarClick = isOwnProfile
		? () => setIsAvatarEditorOpen(true)
		: hasCustomAvatar
			? () => setIsAvatarViewerOpen(true)
			: undefined;

	const avatarOverlay = isOwnProfile ? (
		<i className="fas fa-camera" />
	) : hasCustomAvatar ? (
		<i className="fas fa-expand" />
	) : undefined;

	const bannerContent = (
		<>
			{hasCustomBanner && profileUser.bannerPath ? (
				<img
					className="profile__banner-image"
					src={getImageSource(
						profileUser.bannerPath,
					)}
					alt={`${profileUser.login} profile banner`}
					onError={() =>
						setBannerImageFailed(true)
					}
				/>
			) : (
				<span className="profile__banner-placeholder" />
			)}

			{isOwnProfile && (
				<span
					className="profile__banner-overlay"
					aria-hidden="true"
				>
					<i className="fas fa-camera" />
					<span>Edit banner</span>
				</span>
			)}
		</>
	);

	return (
		<div className="profile">
			<div className="profile__container">
				{isOwnProfile ? (
					<button
						className={[
							"profile__banner",
							"profile__banner--interactive",
						].join(" ")}
						type="button"
						aria-label="Edit profile banner"
						onClick={() =>
							setIsBannerEditorOpen(true)
						}
					>
						{bannerContent}
					</button>
				) : (
					<div className="profile__banner">
						{bannerContent}
					</div>
				)}

				<div className="profile__header">
					<UserAvatar
						avatarPath={profileUser.avatarPath}
						username={profileUser.login}
						size="large"
						status={profilePresence}
						className="profile__avatar"
						ariaLabel={
							isOwnProfile
								? "Edit profile image"
								: `Open ${profileUser.login} profile image`
						}
						overlay={avatarOverlay}
						onClick={handleAvatarClick}
					/>

					<div className="profile__user-details">
						<div className="profile__visits">
							<i className="fas fa-chart-line profile__visits-icon" />

							<span>
								Nº Visitas al perfil{" "}
								{profileUser.visits}
							</span>
						</div>

						<h4 className="profile__user-name">
							{profileUser.name &&
							profileUser.surname
								? `${profileUser.name} ${profileUser.surname}`
								: profileUser.login}
						</h4>
					</div>
					<Button1 label="New Post" to="/app/posts/new" />
				</div>

				<div className="profile__feed">
					<p className="profile__status">
						{profileUser.status ||
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
								Aún no hay roneos por aquí...
							</div>
						)}
					</div>
				</div>
			</div>

			{isOwnProfile && (
				<>
					<AvatarEditorModal
						open={isAvatarEditorOpen}
						currentAvatarPath={
							profileUser.avatarPath
						}
						onClose={() =>
							setIsAvatarEditorOpen(false)
						}
						onUpdated={refreshUser}
					/>

					<BannerEditorModal
						open={isBannerEditorOpen}
						currentBannerPath={
							profileUser.bannerPath
						}
						onClose={() =>
							setIsBannerEditorOpen(false)
						}
						onUpdated={refreshUser}
					/>
				</>
			)}

			{!isOwnProfile && hasCustomAvatar && (
				<PostImageModal
					open={isAvatarViewerOpen}
					imageSrc={
						profileUser.avatarPath
							? getImageSource(
									profileUser.avatarPath,
								)
							: null
					}
					alt={`${profileUser.login} profile image`}
					onClose={() =>
						setIsAvatarViewerOpen(false)
					}
				/>
			)}
		</div>
	);
};
