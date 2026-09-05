import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { FiUpload } from "react-icons/fi";

type ImageUploadFieldVariant = "avatar" | "banner";

type ImageUploadFieldProps = {
	id: string;
	label: string;
	file: File | null;
	accept: string;
	disabled?: boolean;
	previewAlt: string;
	variant?: ImageUploadFieldVariant;
	validate: (file: File) => string | null;
	onChange: (file: File | null) => void;
	onError: (message: string | null) => void;
};

// Campo reutilizable para seleccionar, validar y previsualizar imágenes.
// La validación concreta se recibe desde el componente que lo utiliza.
// Los archivos que no son imágenes, como los PDF de posts, muestran su nombre
// en lugar de intentar generar una previsualización con <img>.
export const ImageUploadField = ({
	id,
	label,
	file,
	accept,
	disabled = false,
	previewAlt,
	variant,
	validate,
	onChange,
	onError,
}: ImageUploadFieldProps) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const [previewUrl, setPreviewUrl] =
		useState<string | null>(null);

	const isImage = Boolean(file?.type.startsWith("image/"));

	useEffect(() => {
		if (!file || !file.type.startsWith("image/")) {
			setPreviewUrl(null);
			return;
		}

		// Creamos una URL temporal para mostrar el archivo local sin subirlo.
		// Solo se genera para imágenes: un PDF no debe renderizarse con <img>.
		const objectUrl = URL.createObjectURL(file);
		setPreviewUrl(objectUrl);

		// Liberamos la URL cuando cambia el archivo o se desmonta el componente.
		return () => {
			URL.revokeObjectURL(objectUrl);
		};
	}, [file]);

	const handleFileChange = (
		event: ChangeEvent<HTMLInputElement>,
	) => {
		const selectedFile =
			event.target.files?.[0] ?? null;

		onError(null);

		if (!selectedFile) {
			onChange(null);
			return;
		}

		const validationError = validate(selectedFile);

		if (validationError) {
			// Limpiamos el input para permitir volver a seleccionar
			// el mismo archivo después de corregir el error.
			event.target.value = "";
			onChange(null);
			onError(validationError);
			return;
		}

		onChange(selectedFile);
	};

	const handleRemove = () => {
		if (inputRef.current) {
			// El estado se limpia mediante onChange, pero también debemos
			// vaciar el input nativo para poder seleccionar el mismo archivo.
			inputRef.current.value = "";
		}

		onError(null);
		onChange(null);
	};

	// La variante añade un modificador BEM únicamente visual.
	const fieldClassName = [
		"image-upload-field",
		variant
			? `image-upload-field--${variant}`
			: "",
	]
		.filter(Boolean)
		.join(" ");

	return (
		<div className={fieldClassName}>
			<label
				className="image-upload-field__label"
				htmlFor={id}
			>
				{label}
			</label>

			<input
				ref={inputRef}
				id={id}
				className="image-upload-field__input"
				type="file"
				accept={accept}
				disabled={disabled}
				onChange={handleFileChange}
			/>

			<button
				type="button"
				className="image-upload-field__button"
				disabled={disabled}
				onClick={() => inputRef.current?.click()}
			>
				<FiUpload aria-hidden="true" />
				<span>Elegir archivo</span>
			</button>

			{file && (
				<div className="image-upload-field__preview">
					{previewUrl ? (
						<img
							className="image-upload-field__image"
							src={previewUrl}
							alt={previewAlt}
						/>
					) : (
						// Los documentos no tienen previsualización visual:
						// únicamente se muestra el nombre seleccionado.
						<div className="image-upload-field__file">
							<span className="image-upload-field__file-name">
								{file.name}
							</span>
						</div>
					)}

					<button
						className="image-upload-field__remove"
						type="button"
						disabled={disabled}
						onClick={handleRemove}
					>
						{isImage ? "Eliminar imagen" : "Eliminar archivo"}
					</button>
				</div>
			)}
		</div>
	);
};
