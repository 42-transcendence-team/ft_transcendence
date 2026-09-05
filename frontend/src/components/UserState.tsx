import { useState } from "react";
import { updateData } from "../api/Settings";
import { FiCheck, FiEdit2, FiX } from "react-icons/fi";

type UserStateProps = {
	userStatus: string | null;
	isOwnProfile: boolean;
	onStatusUpdated?: (newStatus: string) => void;
};

export function UserState({ userStatus, isOwnProfile, onStatusUpdated }: UserStateProps) {
	const [isEditingStatus, setIsEditingStatus] = useState(false);
	const [newStatus, setNewStatus] = useState( userStatus ?? "", );
	const [isSaving, setIsSaving] = useState(false);


	const handleEditStatus = () => {
		setNewStatus(userStatus ?? "");
		setIsEditingStatus(true);
	};

	const handleCancelStatus = () => {
		setNewStatus(userStatus ?? "");
		setIsEditingStatus(false);
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

	const handleSaveStatus = async () => {
			if (isSaving) {
				return;
			}
	
			const trimmedStatus = newStatus.trim();
	
			if (trimmedStatus === (userStatus ?? "")) {
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

	return (
		<div className="profile__status-container">
			<div className="profile__status-content">
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
							{userStatus || "Sin estado disponible"}
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
			</div>
		</div>
	)
}