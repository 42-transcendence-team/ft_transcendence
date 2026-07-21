import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getUserPresence, getUserProfile } from "../api/UserProfile";
import type { UserProfile } from "../api/UserProfile";
import type { ApiError } from "../api/ApiRequest";

import { useAuth } from "../context/AuthContext";

import { ProfileBanner } from "../components/profile/ProfileBanner";
import { ProfileHeader } from "../components/profile/ProfileHeader";
import { ProfileContent } from "../components/profile/ProfileContent";

import type { UserPresence } from "../components/users/UserAvatar";
import { AvatarEditorModal } from "../components/users/AvatarEditorModal";
import { BannerEditorModal } from "../components/users/BannerEditorModal";
import { PostImageModal } from "../components/posts/PostImageModal";

import { NotFound } from "./NotFound";

import "../styles/pages/_profile.scss";

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
	* Actualiza únicamente la presencia del usuario sin
	* volver a cargar el perfil completo.
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

	return (
		<div className="profile">
			<div className="profile__container">
				<ProfileBanner
					bannerPath={profileUser.bannerPath}
					username={profileUser.login}
					isOwnProfile={isOwnProfile}
					hasCustomBanner={hasCustomBanner}
					onEdit={() =>
						setIsBannerEditorOpen(true)
					}
					onImageError={() =>
						setBannerImageFailed(true)
					}
				/>

				<ProfileHeader
					username={profileUser.login}
					name={profileUser.name}
					surname={profileUser.surname}
					avatarPath={profileUser.avatarPath}
					presence={profilePresence}
					isOwnProfile={isOwnProfile}
					hasCustomAvatar={hasCustomAvatar}
					onAvatarClick={handleAvatarClick}
				/>

				<ProfileContent
					status={profileUser.status}
					isOwnProfile={isOwnProfile}
				/>
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
