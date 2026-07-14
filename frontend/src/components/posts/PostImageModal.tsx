import { Modal } from "@components/Modal";

type PostImageModalProps = {
	open: boolean;
	imageSrc: string | null;
	onClose: () => void;
};

export const PostImageModal = ({
	open,
	imageSrc,
	onClose,
}: PostImageModalProps) => {
	if (!imageSrc) {
		return null;
	}

	return (
		<Modal
			open={open}
			onClose={onClose}
			overlayClassName="post-image-modal-overlay"
			modalClassName="post-image-modal"
			contentClassName="post-image-modal__content"
		>
			<img
				className="post-image-modal__image"
				src={imageSrc}
				alt="Post full size"
			/>
		</Modal>
	);
};
