type ProfileBannerProps = {
  bannerPath: string | null;
  username: string;
  isOwnProfile: boolean;
  hasCustomBanner: boolean;
  onEdit: () => void;
  onImageError: () => void;
};

function getImageSource(imagePath: string): string {
  return imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
}

export const ProfileBanner = ({
  bannerPath,
  username,
  isOwnProfile,
  hasCustomBanner,
  onEdit,
  onImageError,
}: ProfileBannerProps) => {
  const bannerContent = (
    <>
      {hasCustomBanner && bannerPath ? (
        <img
          className="profile__banner-image"
          src={getImageSource(bannerPath)}
          alt={`${username} profile banner`}
          onError={onImageError}
        />
      ) : (
        <span className="profile__banner-placeholder" />
      )}

      {isOwnProfile && (
        <span className="profile__banner-overlay" aria-hidden="true">
          <i className="fas fa-camera" />
          <span>Edit banner</span>
        </span>
      )}
    </>
  );

  if (isOwnProfile) {
    return (
      <button
        className={['profile__banner', 'profile__banner--interactive'].join(
          ' ',
        )}
        type="button"
        aria-label="Edit profile banner"
        onClick={onEdit}
      >
        {bannerContent}
      </button>
    );
  }

  return <div className="profile__banner">{bannerContent}</div>;
};
