import { useNavigate } from "react-router-dom";

import { Modal } from "@components/Modal";
import { PostForm } from "@components/posts/PostForm";
import type { Post } from "../api/Posts";

export const CreatePostPage = () => {
	const navigate = useNavigate();

	const handlePostCreated = (post: Post) => {
		navigate(`/app/posts/${post.id}`);
	};

	const handleClose = () => {
		navigate(-1);
	};

	return (
		<section className="post-create-page post-create-page--modal-route">
			<Modal
				open={true}
				onClose={handleClose}
				title="Nuevo post"
				overlayClassName="post-create-page__overlay"
				modalClassName="post-create-shell"
				contentClassName="post-create-shell__content"
			>
				<PostForm onCreated={handlePostCreated} />
			</Modal>
		</section>
	);
};
