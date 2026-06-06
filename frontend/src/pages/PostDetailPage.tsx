import { Link, useNavigate, useParams } from "react-router-dom";

import { PostModal } from "@components/posts/PostModal";

export const PostDetailPage = () => {
	const { postId } = useParams<{ postId: string }>();
	const navigate = useNavigate();

	const closeModal = () => {
		navigate("/app");
	};

	const handleDeleted = () => {
		navigate("/app", { replace: true });
	};

	return (
		<section className="post-detail-page post-detail-page--modal-route">
			<div className="post-detail-page__modal-route-content">
				<p>Post opened in modal.</p>

				<Link className="post-detail-page__back-link" to="/app">
					Back to home
				</Link>
			</div>

			<PostModal
				open={true}
				postId={postId ?? null}
				onClose={closeModal}
				onDeleted={handleDeleted}
			/>
		</section>
	);
};
