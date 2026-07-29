import {
	UserAvatar,
	type UserPresence,
} from "../users/UserAvatar";

import { Button1 } from "../Button1";
import type { UserRelation } from "../../api/UserSearch";

type ProfileHeaderProps = {
	userId: number;
	username: string;
	name: string | null;
	surname: string | null;
	avatarPath: string | null;
	presence: UserPresence;

	isOwnProfile: boolean;
	hasCustomAvatar: boolean;

	relation: UserRelation;
	canSendRequest: boolean;
	requestId: number | null;

	onAvatarClick?: () => void;

	onAddFriend?: () => void;
	onAcceptRequest?: () => void;
	onRejectRequest?: () => void;
	onRemoveFriend?: () => void;
	onBlockUser?: () => void;
	onUnblockUser?: () => void;
	onShare?: () => void;
};

export const ProfileHeader = ({
	username,
	name,
	surname,
	avatarPath,
	presence,
	isOwnProfile,
	hasCustomAvatar,
	relation,
	canSendRequest,
	requestId,
	onAvatarClick,
	onAddFriend,
	onAcceptRequest,
	onRejectRequest,
	onRemoveFriend,
	onBlockUser,
	onUnblockUser,
	onShare,
}: ProfileHeaderProps) => {
	const displayName =
		name && surname
			? `${name} ${surname}`
			: username;

	const avatarOverlay = isOwnProfile ? (
		<i className="fas fa-camera" />
	) : hasCustomAvatar ? (
		<i className="fas fa-expand" />
	) : undefined;

	const renderRelationActions = () => {
		if (isOwnProfile) {
			return null;
		}

		switch (relation) {
			case "none":
				return (
					<div className="profile__actions">
						{canSendRequest && (
							<Button1
								label="Añadir amigo"
								variant="primary"
								onClick={onAddFriend}
							/>
						)}

						<Button1
							label="Bloquear"
							variant="danger"
							onClick={onBlockUser}
						/>
					</div>
				);

			case "pending_sent":
				return (
					<div className="profile__actions">
						<Button1
							label="Solicitud enviada"
							variant="disabled"
							disabled
						/>

						<Button1
							label="Bloquear"
							variant="danger"
							onClick={onBlockUser}
						/>
					</div>
				);

			case "pending_received":
				return (
					<div className="profile__actions">
						{requestId !== null && (
							<>
								<Button1
									label="Aceptar"
									variant="primary"
									onClick={onAcceptRequest}
								/>

								<Button1
									label="Rechazar"
									variant="secondary"
									onClick={onRejectRequest}
								/>
							</>
						)}

						<Button1
							label="Bloquear"
							variant="danger"
							onClick={onBlockUser}
						/>
					</div>
				);

			case "friends":
				return (
					<div className="profile__actions">
						<Button1
							label="Eliminar amigo"
							variant="danger"
							onClick={onRemoveFriend}
						/>

						<Button1
							label="Bloquear"
							variant="danger"
							onClick={onBlockUser}
						/>
					</div>
				);

			case "blocked_by_me":
				return (
					<div className="profile__actions">
						<Button1
							label="Desbloquear"
							variant="secondary"
							onClick={onUnblockUser}
						/>
					</div>
				);

			case "blocked_me":
				return null;

			default:
				return null;
		}
	};

	return (
		<div className="profile__header">
			<UserAvatar
				avatarPath={avatarPath}
				username={username}
				size="large"
				status={presence}
				className="profile__avatar"
				ariaLabel={
					isOwnProfile
						? "Edit profile image"
						: `Open ${username} profile image`
				}
				overlay={avatarOverlay}
				onClick={onAvatarClick}
			/>

			<div className="profile__user-details">
				<h4 className="profile__user-name">
					{displayName}
				</h4>

				<span className="profile__username">
					@{username}
				</span>
			</div>

			{renderRelationActions()}

			{relation !== "blocked_by_me" &&
				relation !== "blocked_me" && (
					<Button1
						label="Compartir"
						variant="secondary"
						onClick={onShare}
					/>
			)}
		</div>
	);
};