import {
	UserAvatar,
	type UserPresence,
} from "../users/UserAvatar";

import { Button1 } from "../Button1";

type ProfileHeaderProps = {
	username: string;
	name: string | null;
	surname: string | null;
	avatarPath: string | null;
	presence: UserPresence;

	isOwnProfile: boolean;
	hasCustomAvatar: boolean;

	onAvatarClick?: () => void;
};

export const ProfileHeader = ({
	username,
	name,
	surname,
	avatarPath,
	presence,
	isOwnProfile,
	hasCustomAvatar,
	onAvatarClick,
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

			<Button1 label="Share" />
		</div>
	);
};