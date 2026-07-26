import {
	useEffect,
	useRef,
	useState,
} from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import type { ApiError } from "../api/ApiRequest";
import {
	getPostsByUserId,
	type PostReactionState,
	type PostSummary,
} from "../api/Posts";
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
import { Button1 } from "../components/Button1";
import { NotFound } from "./NotFound";
import { AvatarEditorModal } from "../components/users/AvatarEditorModal";
import { BannerEditorModal } from "../components/users/BannerEditorModal";
import { PostImageModal } from "../components/posts/PostImageModal";
import { PostList } from "../components/posts/PostList";

function getImageSource(
	imagePath: string,
): string {
	return imagePath.startsWith("/")
		? imagePath
		: `/${imagePath}`;
}

function isApiError(
	error: unknown,
): error is ApiError {
	return (
		typeof error === "object" &&
		error !== null &&
		"status" in error &&
		typeof error.status === "number"
	);
}

function appendUniquePosts(
	currentPosts: PostSummary[],
	incomingPosts: PostSummary[],
): PostSummary[] {
	const knownPostIDs = new Set(
		currentPosts.map((post) => post.id),
	);

	return [
		...currentPosts,
		...incomingPosts.filter(
			(post) => !knownPostIDs.has(post.id),
		),
	];
}

export const Profile = () => {
	const { username } =
		useParams<{ username: string }>();

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

	const [profilePosts, setProfilePosts] =
		useState<PostSummary[]>([]);

	const [postsPage, setPostsPage] =
		useState(1);

	const [postsTotalPages, setPostsTotalPages] =
		useState(0);

	const [isLoadingPosts, setIsLoadingPosts] =
		useState(false);

	const [
		isLoadingMorePosts,
		setIsLoadingMorePosts,
	] = useState(false);

	const [postsError, setPostsError] =
		useState<string | null>(null);

	/*
	 * Permite ignorar respuestas de posts pertenecientes al perfil
	 * anterior cuando la ruta cambia mientras había una petición activa.
	 */
	const postsOwnerIDRef =
		useRef<number | null>(null);

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
	 * Carga la primera página del usuario visitado.
	 * Cada cambio de perfil limpia antes las tarjetas anteriores.
	 */
	useEffect(() => {
		const ownerID =
			profileUser?.id ?? null;

		postsOwnerIDRef.current = ownerID;

		setProfilePosts([]);
		setPostsPage(1);
		setPostsTotalPages(0);
		setPostsError(null);
		setIsLoadingMorePosts(false);

		if (ownerID === null) {
			setIsLoadingPosts(false);
			return;
		}

		let cancelled = false;

		const loadInitialPosts = async () => {
			try {
				setIsLoadingPosts(true);

				const response =
					await getPostsByUserId(
						ownerID,
						1,
						20,
					);

				if (
					cancelled ||
					postsOwnerIDRef.current !== ownerID
				) {
					return;
				}

				setProfilePosts(response.data);
				setPostsPage(
					response.pagination.page,
				);
				setPostsTotalPages(
					response.pagination.totalPages,
				);
			} catch {
				if (
					!cancelled &&
					postsOwnerIDRef.current === ownerID
				) {
					setPostsError(
						"The posts could not be loaded.",
					);
				}
			} finally {
				if (
					!cancelled &&
					postsOwnerIDRef.current === ownerID
				) {
					setIsLoadingPosts(false);
				}
			}
		};

		void loadInitialPosts();

		return () => {
			cancelled = true;
		};
	}, [profileUser?.id]);

	/*
	 * Consulta únicamente el estado almacenado en Redis.
	 * No vuelve a cargar el perfil completo y, por tanto,
	 * no incrementa artificialmente el contador de visitas.
	 */
	useEffect(() => {
		if (
			!profileUser?.login ||
			profileNotFound
		) {
			return;
		}

		const profileLogin =
			profileUser.login;

		let cancelled = false;
		let requestInFlight = false;

		const refreshPresence = async () => {
			if (requestInFlight) {
				return;
			}

			requestInFlight = true;

			try {
				const isOnline =
					await getUserPresence(
						profileLogin,
					);

				if (cancelled) {
					return;
				}

				setProfileUser(
					(currentProfile) => {
						if (
							!currentProfile ||
							currentProfile.login !==
								profileLogin ||
							currentProfile.isOnline ===
								isOnline
						) {
							return currentProfile;
						}

						return {
							...currentProfile,
							isOnline,
						};
					},
				);
			} catch {
				/*
				 * Si falla una comprobación puntual, se conserva
				 * el último estado conocido del usuario.
				 */
			} finally {
				requestInFlight = false;
			}
		};

		void refreshPresence();

		const intervalId =
			window.setInterval(() => {
				void refreshPresence();
			}, 30_000);

		return () => {
			cancelled = true;
			window.clearInterval(intervalId);
		};
	}, [
		profileUser?.login,
		profileNotFound,
	]);

	/*
	 * Los editores actualizan primero AuthContext. Cuando el perfil
	 * abierto es el propio, sincronizamos aquí las rutas nuevas sin
	 * tener que repetir la petición completa de perfil.
	 */
	useEffect(() => {
		if (
			!profileUser ||
			!authenticatedUser ||
			profileUser.login !==
				authenticatedUser.login
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
					authenticatedUser.avatarPath ??
					null,
				bannerPath:
					authenticatedUser.bannerPath ??
					null,
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

		image.src = getImageSource(
			profileUser.avatarPath,
		);

		return () => {
			active = false;
		};
	}, [profileUser?.avatarPath]);

	useEffect(() => {
		setBannerImageFailed(false);
	}, [profileUser?.bannerPath]);

	const handleLoadMorePosts = async () => {
		if (
			!profileUser ||
			isLoadingMorePosts ||
			postsPage >= postsTotalPages
		) {
			return;
		}

		const ownerID = profileUser.id;
		const nextPage = postsPage + 1;

		try {
			setIsLoadingMorePosts(true);
			setPostsError(null);

			const response =
				await getPostsByUserId(
					ownerID,
					nextPage,
					20,
				);

			if (
				postsOwnerIDRef.current !== ownerID
			) {
				return;
			}

			setProfilePosts((currentPosts) =>
				appendUniquePosts(
					currentPosts,
					response.data,
				),
			);

			setPostsPage(
				response.pagination.page,
			);

			setPostsTotalPages(
				response.pagination.totalPages,
			);
		} catch {
			if (
				postsOwnerIDRef.current === ownerID
			) {
				setPostsError(
					"More posts could not be loaded.",
				);
			}
		} finally {
			if (
				postsOwnerIDRef.current === ownerID
			) {
				setIsLoadingMorePosts(false);
			}
		}
	};

	const handlePostDeleted = (
		postId: number,
	) => {
		setProfilePosts((currentPosts) =>
			currentPosts.filter(
				(post) => post.id !== postId,
			),
		);
	};

	const handlePostReactionUpdated = (
		reactionState: PostReactionState,
	) => {
		setProfilePosts((currentPosts) =>
			currentPosts.map((post) =>
				post.id === reactionState.postId
					? {
							...post,
							likeCount:
								reactionState.likeCount,
							dislikeCount:
								reactionState.dislikeCount,
						}
					: post,
			),
		);
	};

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
		authenticatedUser.login ===
		profileUser.login;

	const profilePresence: UserPresence =
		profileUser.isOnline
			? "online"
			: "offline";

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
			{hasCustomBanner &&
			profileUser.bannerPath ? (
				<img
					className="profile__banner-image"
					src={getImageSource(
						profileUser.bannerPath,
					)}
					alt={
						`${profileUser.login} profile banner`
					}
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
						avatarPath={
							profileUser.avatarPath
						}
						username={
							profileUser.login
						}
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

					<Button1 label="Share" />
				</div>

				<div className="profile__feed">
					<p className="profile__status">
						{profileUser.status ||
							"Sin estado disponible"}
					</p>

					<div className="profile__posts">
						{isLoadingPosts && (
							<div className="profile__posts-state">
								Loading posts.
							</div>
						)}

						{!isLoadingPosts &&
							profilePosts.length === 0 &&
							postsError && (
								<div className="profile__posts-error">
									{postsError}
								</div>
							)}

						{!isLoadingPosts &&
							profilePosts.length === 0 &&
							!postsError && (
								<div className="profile__empty">
									This user has not posted
									anything yet.
								</div>
							)}

						{profilePosts.length > 0 && (
							<>
								{postsError && (
									<div className="profile__posts-error">
										{postsError}
									</div>
								)}

								<PostList
									posts={
										profilePosts
									}
									onPostDeleted={
										handlePostDeleted
									}
									onPostReactionUpdated={
										handlePostReactionUpdated
									}
								/>

								{postsPage <
									postsTotalPages && (
									<button
										className="post-list__load-more"
										type="button"
										disabled={
											isLoadingMorePosts
										}
										onClick={() =>
											void handleLoadMorePosts()
										}
									>
										{isLoadingMorePosts
											? "Loading..."
											: "Load more"}
									</button>
								)}
							</>
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

			{!isOwnProfile &&
				hasCustomAvatar && (
					<PostImageModal
						open={isAvatarViewerOpen}
						imageSrc={
							profileUser.avatarPath
								? getImageSource(
										profileUser.avatarPath,
									)
								: null
						}
						alt={
							`${profileUser.login} profile image`
						}
						onClose={() =>
							setIsAvatarViewerOpen(false)
						}
					/>
				)}
		</div>
	);
};
