import {
	useEffect,
	useRef,
	useState,
} from "react";
import {
	useNavigate,
	useParams,
} from "react-router-dom";

import type { ApiError } from "../api/ApiRequest";
import {
	getPostsByUserId,
	type PostReactionState,
	type PostSummary,
} from "../api/Posts";
import {
	getUserPresence,
	getUserProfile,
} from "../api/UserProfile";
import type { UserProfile } from "../api/UserProfile";
import {
	acceptFriendRequest,
	blockUser,
	rejectFriendRequest,
	removeFriend,
	sendFriendRequest,
	unblockUser,
} from "../api/Friends";

import { useAuth } from "../context/AuthContext";

import { ProfileBanner } from "../components/profile/ProfileBanner";
import { ProfileHeader } from "../components/profile/ProfileHeader";
import { ProfileContent } from "../components/profile/ProfileContent";

import type { UserPresence } from "../components/users/UserAvatar";
import { AvatarEditorModal } from "../components/users/AvatarEditorModal";
import { BannerEditorModal } from "../components/users/BannerEditorModal";
import { PostImageModal } from "../components/posts/PostImageModal";
import { PostList } from "../components/posts/PostList";
import { ConfirmModal } from "../components/ConfirmModal";

import { NotFound } from "./NotFound";

import "../styles/pages/_profile.scss";

type ConfirmAction =
	| "remove-friend"
	| "block"
	| "unblock"
	| null;

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

	const navigate = useNavigate();

	console.log("PROFILE username:", username);
	console.log(
		"PROFILE SE HA RENDERIZADO:",
		username,
	);

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

	const [
		relationActionError,
		setRelationActionError,
	] = useState<string | null>(null);

	const [
		isAvatarEditorOpen,
		setIsAvatarEditorOpen,
	] = useState(false);

	const [
		isBannerEditorOpen,
		setIsBannerEditorOpen,
	] = useState(false);

	const [
		isAvatarViewerOpen,
		setIsAvatarViewerOpen,
	] = useState(false);

	const [
		avatarImageFailed,
		setAvatarImageFailed,
	] = useState(false);

	const [
		bannerImageFailed,
		setBannerImageFailed,
	] = useState(false);

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

	const [confirmAction, setConfirmAction] =
		useState<ConfirmAction>(null);

	const [isConfirming, setIsConfirming] =
		useState(false);

	useEffect(() => {
		console.log(
			"PROFILE useEffect:",
			username,
		);

		let cancelled = false;

		setProfileUser(null);
		setProfileError(null);
		setRelationActionError(null);
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
	 * Carga la primera página de publicaciones del perfil visitado.
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

		/*
		 * ProfileContent oculta el contenido privado a usuarios
		 * que no son amigos. Evitamos también solicitar sus posts.
		 */
		const canLoadPosts = Boolean(
			profileUser &&
				authenticatedUser &&
				(
					authenticatedUser.login ===
						profileUser.login ||
					profileUser.relation === "friends"
				),
		);

		if (
			ownerID === null ||
			!canLoadPosts
		) {
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
	}, [
		profileUser?.id,
		profileUser?.login,
		profileUser?.relation,
		authenticatedUser?.login,
	]);

	/*
	 * Actualiza únicamente la presencia del usuario sin
	 * volver a cargar el perfil completo.
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
				 * el último estado conocido.
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
	 * Sincroniza el perfil propio después de editar
	 * avatar, banner o datos personales.
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

	/*
	 * Ejecuta una acción de amistad y después vuelve a cargar
	 * el perfil para obtener relation y request_id actualizados.
	 */
	const executeRelationAction = async (
		action: () => Promise<unknown>,
	) => {
		if (!username) {
			return;
		}

		setRelationActionError(null);

		try {
			await action();

			const updatedProfile =
				await getUserProfile(username);

			setProfileUser(updatedProfile);
		} catch {
			setRelationActionError(
				"No se ha podido completar la acción.",
			);
		}
	};

	const handleAddFriend = () => {
		if (!profileUser) {
			return;
		}

		void executeRelationAction(() =>
			sendFriendRequest(profileUser.id),
		);
	};

	const handleAcceptRequest = () => {
		if (!profileUser?.request_id) {
			return;
		}

		void executeRelationAction(() =>
			acceptFriendRequest(
				profileUser.request_id!,
			),
		);
	};

	const handleRejectRequest = () => {
		if (!profileUser?.request_id) {
			return;
		}

		void executeRelationAction(() =>
			rejectFriendRequest(
				profileUser.request_id!,
			),
		);
	};

	const handleRemoveFriend = async () => {
		if (!profileUser) {
			return;
		}

		await executeRelationAction(() =>
			removeFriend(profileUser.id),
		);
	};

	const handleBlockUser = async () => {
		if (!profileUser) {
			return;
		}

		await executeRelationAction(() =>
			blockUser(profileUser.id),
		);
	};

	const handleUnblockUser = async () => {
		if (!profileUser) {
			return;
		}

		await executeRelationAction(() =>
			unblockUser(profileUser.id),
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

	const canViewPrivateContent =
		isOwnProfile ||
		profileUser.relation === "friends";

	const handleConfirmRelationAction =
		async () => {
			if (!confirmAction) {
				return;
			}

			setIsConfirming(true);

			try {
				switch (confirmAction) {
					case "remove-friend":
						await handleRemoveFriend();
						break;

					case "block":
						await handleBlockUser();
						break;

					case "unblock":
						await handleUnblockUser();
						break;
				}

				setConfirmAction(null);
			} finally {
				setIsConfirming(false);
			}
		};

	const confirmationConfig = {
		"remove-friend": {
			title: "Eliminar amigo",
			message:
				"¿Seguro que quieres eliminar a este usuario de tus amigos?",
			confirmLabel: "Eliminar",
			confirmingLabel: "Eliminando...",
		},
		block: {
			title: "Bloquear usuario",
			message:
				"¿Seguro que quieres bloquear a este usuario?",
			confirmLabel: "Bloquear",
			confirmingLabel: "Bloqueando...",
		},
		unblock: {
			title: "Desbloquear usuario",
			message:
				"¿Seguro que quieres desbloquear a este usuario?",
			confirmLabel: "Desbloquear",
			confirmingLabel: "Desbloqueando...",
		},
	};

	const currentConfirmation = confirmAction
		? confirmationConfig[confirmAction]
		: null;

	return (
		<div className="profile">
			<div className="profile__container">
				<ProfileBanner
					bannerPath={
						profileUser.bannerPath
					}
					username={profileUser.login}
					isOwnProfile={isOwnProfile}
					hasCustomBanner={
						hasCustomBanner
					}
					onEdit={() =>
						setIsBannerEditorOpen(
							true,
						)
					}
					onImageError={() =>
						setBannerImageFailed(
							true,
						)
					}
				/>

				<ProfileHeader
					userId={profileUser.id}
					username={profileUser.login}
					name={profileUser.name}
					surname={profileUser.surname}
					avatarPath={
						profileUser.avatarPath
					}
					presence={profilePresence}
					isOwnProfile={isOwnProfile}
					hasCustomAvatar={
						hasCustomAvatar
					}
					relation={profileUser.relation}
					canSendRequest={
						profileUser.can_send_request
					}
					requestId={
						profileUser.request_id
					}
					onAvatarClick={
						handleAvatarClick
					}
					onAddFriend={handleAddFriend}
					onAcceptRequest={
						handleAcceptRequest
					}
					onRejectRequest={
						handleRejectRequest
					}
					onRemoveFriend={() =>
						setConfirmAction(
							"remove-friend",
						)
					}
					onBlockUser={() =>
						setConfirmAction("block")
					}
					onUnblockUser={() =>
						setConfirmAction(
							"unblock",
						)
					}
				/>

				{relationActionError && (
					<p className="profile__action-error">
						{relationActionError}
					</p>
				)}

				<ProfileContent
					status={profileUser.status}
					isOwnProfile={isOwnProfile}
					canViewPrivateContent={
						canViewPrivateContent
					}
					onCreatePost={() =>
						navigate("/app/posts/new")
					}
				>
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
				</ProfileContent>
			</div>

			{isOwnProfile && (
				<>
					<AvatarEditorModal
						open={
							isAvatarEditorOpen
						}
						currentAvatarPath={
							profileUser.avatarPath
						}
						onClose={() =>
							setIsAvatarEditorOpen(
								false,
							)
						}
						onUpdated={refreshUser}
					/>

					<BannerEditorModal
						open={
							isBannerEditorOpen
						}
						currentBannerPath={
							profileUser.bannerPath
						}
						onClose={() =>
							setIsBannerEditorOpen(
								false,
							)
						}
						onUpdated={refreshUser}
					/>
				</>
			)}

			{!isOwnProfile &&
				hasCustomAvatar && (
					<PostImageModal
						open={
							isAvatarViewerOpen
						}
						imageSrc={
							profileUser.avatarPath
								? getImageSource(
										profileUser.avatarPath,
									)
								: null
						}
						alt={`${profileUser.login} profile image`}
						onClose={() =>
							setIsAvatarViewerOpen(
								false,
							)
						}
					/>
				)}

			{currentConfirmation && (
				<ConfirmModal
					open={
						confirmAction !== null
					}
					title={
						currentConfirmation.title
					}
					message={
						currentConfirmation.message
					}
					confirmLabel={
						currentConfirmation.confirmLabel
					}
					confirmingLabel={
						currentConfirmation.confirmingLabel
					}
					cancelLabel="Cancelar"
					isConfirming={isConfirming}
					onConfirm={
						handleConfirmRelationAction
					}
					onClose={() =>
						setConfirmAction(null)
					}
				/>
			)}
		</div>
	);
};
