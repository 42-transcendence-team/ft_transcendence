import { useParams } from "react-router-dom";

type ProfileCreatePostTriggerProps = {
    onClick?: () => void;
    disabled?: boolean;
};

export const ProfileCreatePostTrigger = ({
    onClick,
    disabled = false,
}: ProfileCreatePostTriggerProps) => {
    return (
        <div className="profile__create-post">
            <button
                type="button"
                className="profile__create-post-button"
                onClick={onClick}
                disabled={disabled}
            >
                <i className="fas fa-plus" />
                <span>Añadir publicación</span>
            </button>
        </div>
    );
};
