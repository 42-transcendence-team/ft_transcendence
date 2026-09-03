import { useEffect, useState } from "react";
import {
	deleteBanner,
	updateBanner,
} from "../../api/UserBanner";
import { ImageUploadField } from "../ImageUploadField";
import { Modal } from "../Modal";
import { validateImageFile } from "../../utils/imageValidation";
import "../../styles/components/_bannerEditorModal.scss";

const MAX_BANNER_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_BANNER_IMAGE_TYPES = [
	"image/jpeg",
	"image/png",
	"image/webp",
] as const;

type BannerEditorModalProps = {
	open: boolean;
	currentBannerPath: string | null;
	onClose: () => void;
	onUpdated: () => Promise<void>;
};

function validateBannerImage(
	file: File,
): string | null {
	return validateImageFile(file, {
		allowedTypes: ALLOWED_BANNER_IMAGE_TYPES,
		maxSize: MAX_BANNER_IMAGE_SIZE,
		invalidTypeMessage:
			"La imagen debe ser un archivo JPEG, PNG o WebP.",
		maxSizeMessage:
			"La imagen no puede superar los 5 MB.",
	});
}

function getBannerErrorCode(
	error: unknown,
): string | null {
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

function getBannerErrorMessage(
	error: unknown,
	fallbackMessage: string,
): string {
	switch (getBannerErrorCode(error)) {
	case "required":
		return "Selecciona una imagen.";
	case "invalid_type":
		return "La imagen debe ser un archivo JPEG, PNG o WebP.";
	case "max_size":
		return "La imagen no puede superar los 5 MB.";
	default:
		return fallbackMessage;
	}
}

function getBannerSource(
	bannerPath: string,
): string {
	return bannerPath.startsWith("/")
		? bannerPath
		: `/${bannerPath}`;
}

export function BannerEditorModal({
	open,
	currentBannerPath,
	onClose,
	onUpdated,
}: BannerEditorModalProps) {
	const [file, setFile] = useState<File | null>(null);
	const [validationError, setValidationError] =
		useState<string | null>(null);
	const [requestError, setRequestError] =
		useState<string | null>(null);
	const [currentPreviewFailed, setCurrentPreviewFailed] =
		useState(false);

	// Un único estado impide guardar y eliminar simultáneamente.
	const [operation, setOperation] =
		useState<"save" | "delete" | null>(null);

	const isBusy = operation !== null;

	useEffect(() => {
		if (!open) {
			return;
		}

		setFile(null);
		setValidationError(null);
		setRequestError(null);
		setCurrentPreviewFailed(false);
		setOperation(null);
	}, [open, currentBannerPath]);

	const handleClose = () => {
		if (!isBusy) {
			onClose();
		}
	};

	const handleFileChange = (
		nextFile: File | null,
	) => {
		setFile(nextFile);
		setRequestError(null);
	};

	const handleSave = async () => {
		if (!file || isBusy) {
			if (!file) {
				setValidationError(
					"Selecciona una imagen.",
				);
			}

			return;
		}

		setValidationError(null);
		setRequestError(null);
		setOperation("save");

		try {
			await updateBanner(file);
			await onUpdated();
			onClose();
		} catch (error) {
			setRequestError(
				getBannerErrorMessage(
					error,
					"No se ha podido actualizar la imagen de cabecera.",
				),
			);
		} finally {
			setOperation(null);
		}
	};

	const handleDelete = async () => {
		if (!currentBannerPath || isBusy) {
			return;
		}

		setValidationError(null);
		setRequestError(null);
		setOperation("delete");

		try {
			await deleteBanner();
			await onUpdated();
			onClose();
		} catch (error) {
			setRequestError(
				getBannerErrorMessage(
					error,
					"No se ha podido eliminar la imagen de cabecera.",
				),
			);
		} finally {
			setOperation(null);
		}
	};

	const showCurrentBanner =
		!file &&
		Boolean(currentBannerPath) &&
		!currentPreviewFailed;

	return (
		<Modal
			open={open}
			onClose={handleClose}
			onSubmit={handleSave}
			submitDisabled={!file || isBusy}
			closeOnEscape={!isBusy}
			title="Editar imagen de cabecera"
			modalClassName="banner-editor-modal"
			contentClassName="banner-editor-modal__content"
		>
			{!file && (
				<div className="banner-editor-modal__current-preview">
					{showCurrentBanner &&
					currentBannerPath ? (
						<img
							className="banner-editor-modal__banner"
							src={getBannerSource(
								currentBannerPath,
							)}
							alt="Imagen de cabecera actual"
							onError={() =>
								setCurrentPreviewFailed(true)
							}
						/>
					) : (
						<div className="banner-editor-modal__placeholder">
							<i className="fas fa-image" />
							<span>
								No hay ninguna imagen de cabecera seleccionada
							</span>
						</div>
					)}
				</div>
			)}

			<ImageUploadField
				id="profile-banner"
				label="Selecciona una imagen"
				file={file}
				accept="image/jpeg,image/png,image/webp"
				disabled={isBusy}
				previewAlt="Vista previa de la nueva imagen de cabecera"
				variant="banner"
				validate={validateBannerImage}
				onChange={handleFileChange}
				onError={setValidationError}
			/>

			{validationError && (
				<p className="banner-editor-modal__error">
					{validationError}
				</p>
			)}

			{requestError && (
				<p className="banner-editor-modal__error">
					{requestError}
				</p>
			)}

			<div className="modal__footer banner-editor-modal__actions">
				<button
					className="modal__button modal__button--cancel"
					type="button"
					disabled={isBusy}
					onClick={handleClose}
				>
					Cancelar
				</button>

				{currentBannerPath && (
					<button
						className="modal__button modal__button--disable"
						type="button"
						disabled={isBusy}
						onClick={handleDelete}
					>
						{operation === "delete"
							? "Eliminando..."
							: "Eliminar imagen de cabecera"}
					</button>
				)}

				<button
					className="modal__button modal__button--enable"
					type="button"
					disabled={!file || isBusy}
					onClick={handleSave}
				>
					{operation === "save"
						? "Guardando..."
						: "Guardar imagen de cabecera"}
				</button>
			</div>
		</Modal>
	);
}
