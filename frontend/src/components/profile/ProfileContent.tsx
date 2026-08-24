import { useState } from "react";
import { FiEdit2, FiEye, FiCheck, FiX } from "react-icons/fi";
import { updateData } from "../../api/Settings";
import type { ReactNode } from "react";

import { ProfileCreatePostTrigger } from "./ProfileCreatePostTrigger";

type ProfileContentProps = {
	status: string | null;
	visits: number;
	isOwnProfile: boolean;
	canViewPrivateContent: boolean;
	onStatusUpdated?: (newStatus: string) => void;
	onCreatePost?: () => void;
	children?: ReactNode;
};

export const ProfileContent = ({
	status,
	visits,
	isOwnProfile,
	canViewPrivateContent,
	onStatusUpdated,
	onCreatePost,
	children,
}: ProfileContentProps) => {
	const [isEditingStatus, setIsEditingStatus] =
		useState(false);

	const [newStatus, setNewStatus] = useState(
		status ?? "",
	);

	const [isSaving, setIsSaving] = useState(false);

	const handleEditStatus = () => {
		setNewStatus(status ?? "");
		setIsEditingStatus(true);
	};

	const handleCancelStatus = () => {
		setNewStatus(status ?? "");
		setIsEditingStatus(false);
	};

	const handleSaveStatus = async () => {
		if (isSaving) {
			return;
		}

		const trimmedStatus = newStatus.trim();

		if (trimmedStatus === (status ?? "")) {
			setIsEditingStatus(false);
			return;
		}

		setIsSaving(true);

		try {
			await updateData({
				status: trimmedStatus,
			});

			onStatusUpdated?.(trimmedStatus);
			setIsEditingStatus(false);
		} catch (error) {
			console.error(
				"No se ha podido actualizar el estado",
				error,
			);
		} finally {
			setIsSaving(false);
		}
	};

	const handleStatusKeyDown = (
		event: React.KeyboardEvent<HTMLInputElement>,
	) => {
		if (event.key === "Enter") {
			event.preventDefault();
			void handleSaveStatus();
		}

		if (event.key === "Escape") {
			handleCancelStatus();
		}
	};

	if (!canViewPrivateContent) {
		return (
			<div className="profile__feed">
				<div className="profile__private">
					<i className="fas fa-lock" />

					<h3>Este perfil es privado</h3>

					<p>
						Añade a este usuario como amigo para ver
						su estado y sus publicaciones.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="profile__feed">
			<div className="profile__status-container">
				{isEditingStatus ? (
					<div className="profile__status-edit">
						<input
							type="text"
							value={newStatus}
							onChange={(event) =>
								setNewStatus(event.target.value)
							}
							onKeyDown={handleStatusKeyDown}
							maxLength={100}
							autoFocus
							disabled={isSaving}
							placeholder="Escribe tu estado..."
						/>

						<button
							type="button"
							onClick={handleSaveStatus}
							disabled={isSaving}
							aria-label="Guardar estado"
						>
							<FiCheck />
						</button>

						<button
							type="button"
							onClick={handleCancelStatus}
							disabled={isSaving}
							aria-label="Cancelar"
						>
							<FiX />
						</button>
					</div>
				) : (
					<div className="profile__status">
						<span>
							{status || "Sin estado disponible"}
						</span>

						{isOwnProfile && (
							<button
								type="button"
								className="profile__status-edit-button"
								onClick={handleEditStatus}
								aria-label="Editar estado"
							>
								<FiEdit2 />
							</button>
						)}
					</div>
				)}

				<div className="profile__visits">
					<FiEye />
					<span>{visits} visitas</span>
				</div>
			</div>

			{isOwnProfile && (
				<ProfileCreatePostTrigger
					onClick={onCreatePost}
				/>
			)}

			{children ?? (
				<div className="profile__posts-placeholder">
					Sección de publicaciones pendiente.
				</div>
			)}
		</div>
	);
};
