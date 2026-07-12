import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";

type ImageUploadFieldVariant = 'avatar';

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
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);

	useEffect(() => {
		if (!file) {
			setPreviewUrl(null);
			return;
		}

		const objectUrl = URL.createObjectURL(file);
		setPreviewUrl(objectUrl);

		return () => {
			URL.revokeObjectURL(objectUrl);
		};
	}, [file]);

	const handleFileChange = (
		event: ChangeEvent<HTMLInputElement>,
	) => {
		const selectedFile = event.target.files?.[0] ?? null;

		onError(null);

		if (!selectedFile) {
			onChange(null);
			return;
		}

		const validationError = validate(selectedFile);

		if (validationError) {
			event.target.value = "";
			onChange(null);
			onError(validationError);
			return;
		}

		onChange(selectedFile);
	};

	const handleRemove = () => {
		if (inputRef.current) {
			inputRef.current.value = "";
		}

		onError(null);
		onChange(null);
	};

	const fieldClassName = [
		'image-upload-field',
		variant ? `image-upload-field--${variant}` : '',
	]
		.filter(Boolean)
		.join(' ');

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

			{previewUrl && (
				<div className="image-upload-field__preview">
					<img
						className="image-upload-field__image"
						src={previewUrl}
						alt={previewAlt}
					/>

					<button
						className="image-upload-field__remove"
						type="button"
						disabled={disabled}
						onClick={handleRemove}
					>
						Remove image
					</button>
				</div>
			)}
		</div>
	);
};
