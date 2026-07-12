import { useEffect, useState } from "react";
import { deleteAvatar, updateAvatar } from "../../api/UserAvatar";
import skullLogo from "../../assets/icons/skull_logo.png";
import { ImageUploadField } from "../ImageUploadField";
import { Modal } from "../Modal";
import { validateImageFile } from "../../utils/imageValidation";
import "../../styles/components/_avatarEditorModal.scss";

const MAX_AVATAR_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_AVATAR_IMAGE_TYPES = [
	"image/jpeg",
	"image/png",
	"image/webp",
] as const;

type AvatarEditorModalProps = {
	open: boolean;
	currentAvatarPath: string | null;
	onClose: () => void;
	onUpdated: () => Promise<void>;
};

// Adapta la validación reutilizable de imágenes a las restricciones
// concretas de los avatares.
function validateAvatarImage(file: File): string | null {
	return validateImageFile(file, {
		allowedTypes: ALLOWED_AVATAR_IMAGE_TYPES,
		maxSize: MAX_AVATAR_IMAGE_SIZE,
		invalidTypeMessage:
			"The image must be a JPEG, PNG or WebP file.",
		maxSizeMessage:
			"The image cannot be larger than 5 MB.",
	});
}

// Extrae el código de validación aunque la respuesta de error llegue
// directamente en data.details o envuelta dentro de data.error.details.
function getAvatarErrorCode(error: unknown): string | null {
	if (
		typeof error !== "object" ||
		error === null ||
		!("data" in error)
	) {
		return null;
	}

	const data = (
		error as {
			data?: {
				details?: Record<string, string>;
				error?: {
					details?: Record<string, string>;
				};
			};
		}
	).data;

	return (
		data?.details?.image ??
		data?.error?.details?.image ??
		null
	);
}

// Convierte los códigos devueltos por el backend en mensajes comprensibles
// para el usuario. Los errores desconocidos utilizan el mensaje alternativo.
function getAvatarErrorMessage(
	error: unknown,
	fallbackMessage: string,
): string {
	switch (getAvatarErrorCode(error)) {
	case "required":
		return "Please select an image.";
	case "invalid_type":
		return "The image must be a JPEG, PNG or WebP file.";
	case "max_size":
		return "The image cannot be larger than 5 MB.";
	default:
		return fallbackMessage;
	}
}

function getAvatarSource(avatarPath: string | null): string {
	if (!avatarPath) {
		return skullLogo;
	}

	return `/${avatarPath}`;
}

export function AvatarEditorModal({
	open,
	currentAvatarPath,
	onClose,
	onUpdated,
}: AvatarEditorModalProps) {
	const [file, setFile] = useState<File | null>(null);
	const [validationError, setValidationError] =
		useState<string | null>(null);
	const [requestError, setRequestError] =
		useState<string | null>(null);

	// Un único estado evita ejecutar guardado y borrado al mismo tiempo
	// y permite mostrar qué operación está en curso.
	const [operation, setOperation] =
		useState<"save" | "delete" | null>(null);

	const isBusy = operation !== null;

	useEffect(() => {
		if (!open) {
			return;
		}

		// Cada apertura comienza limpia para no conservar archivos,
		// errores u operaciones de la apertura anterior.
		setFile(null);
		setValidationError(null);
		setRequestError(null);
		setOperation(null);
	}, [open]);

	const handleClose = () => {
		// Evita cerrar la modal mientras una petición sigue en curso.
		if (!isBusy) {
			onClose();
		}
	};

	const handleFileChange = (nextFile: File | null) => {
		setFile(nextFile);
		setRequestError(null);
	};

	const handleSave = async () => {
		if (!file || isBusy) {
			if (!file) {
				setValidationError("Please select an image.");
			}

			return;
		}

		setValidationError(null);
		setRequestError(null);
		setOperation("save");

		try {
			await updateAvatar(file);

			// Recarga el usuario del contexto para mostrar inmediatamente
			// la nueva ruta del avatar.
			await onUpdated();

			onClose();
		} catch (error) {
			setRequestError(
				getAvatarErrorMessage(
					error,
					"The profile image could not be updated.",
				),
			);
		} finally {
			setOperation(null);
		}
	};

	const handleDelete = async () => {
		if (!currentAvatarPath || isBusy) {
			return;
		}

		setValidationError(null);
		setRequestError(null);
		setOperation("delete");

		try {
			await deleteAvatar();

			// Recarga el usuario para que el perfil vuelva a mostrar
			// la imagen predeterminada.
			await onUpdated();

			onClose();
		} catch (error) {
			setRequestError(
				getAvatarErrorMessage(
					error,
					"The profile image could not be removed.",
				),
			);
		} finally {
			setOperation(null);
		}
	};

	return (
		<Modal
			open={open}
			onClose={handleClose}
			onSubmit={handleSave}
			submitDisabled={!file || isBusy}
			closeOnEscape={!isBusy}
			title="Edit profile image"
			modalClassName="avatar-editor-modal"
			contentClassName="avatar-editor-modal__content"
		>
			{/* La imagen actual se oculta cuando existe una nueva previsualización. */}
			{!file && (
				<div className="avatar-editor-modal__current-preview">
					<img
						className={[
							"avatar-editor-modal__avatar",
							currentAvatarPath
								? ""
								: "avatar-editor-modal__avatar--fallback",
						]
							.filter(Boolean)
							.join(" ")}
						src={getAvatarSource(currentAvatarPath)}
						alt="Current profile"
					/>
				</div>
			)}

			<ImageUploadField
				id="profile-avatar"
				label="Choose an image"
				file={file}
				accept="image/jpeg,image/png,image/webp"
				disabled={isBusy}
				previewAlt="New profile preview"
				variant="avatar"
				validate={validateAvatarImage}
				onChange={handleFileChange}
				onError={setValidationError}
			/>

			{validationError && (
				<p className="avatar-editor-modal__error">
					{validationError}
				</p>
			)}

			{requestError && (
				<p className="avatar-editor-modal__error">
					{requestError}
				</p>
			)}

			<div className="modal__footer avatar-editor-modal__actions">
				<button
					className="modal__button modal__button--cancel"
					type="button"
					disabled={isBusy}
					onClick={handleClose}
				>
					Cancel
				</button>

				{currentAvatarPath && (
					<button
						className="modal__button modal__button--disable"
						type="button"
						disabled={isBusy}
						onClick={handleDelete}
					>
						{operation === "delete"
							? "Removing..."
							: "Remove image"}
					</button>
				)}

				<button
					className="modal__button modal__button--enable"
					type="button"
					disabled={!file || isBusy}
					onClick={handleSave}
				>
					{operation === "save"
						? "Saving..."
						: "Save image"}
				</button>
			</div>
		</Modal>
	);
}
