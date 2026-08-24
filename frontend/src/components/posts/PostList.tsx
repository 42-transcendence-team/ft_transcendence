import { useState } from "react";

import type {
	PostReactionState,
	PostSummary,
} from "api/Posts";

import { PostCard } from "@components/posts/PostCard";
import { PostModal } from "@components/posts/PostModal";

type PostListProps = {
	posts: PostSummary[];
	onPostDeleted: (postId: number) => void;
	onPostReactionUpdated: (
		reactionState: PostReactionState,
	) => void;
};

export const PostList = ({
	posts,
	onPostDeleted,
	onPostReactionUpdated,
}: PostListProps) => {
	const [selectedPostId, setSelectedPostId] =
		useState<number | null>(null);

	const handleSelectedPostUnavailable = () => {
		if (selectedPostId !== null) {
			onPostDeleted(selectedPostId);
		}

		setSelectedPostId(null);
	};

	return (
		<div className="post-list">
			<div className="post-list__items">
				{posts.map((post) => (
					<PostCard
						key={post.id}
						post={post}
						onOpen={setSelectedPostId}
					/>
				))}
			</div>

			{/*
			 * Solo existe una modal para todo el listado.
			 * Cada tarjeta se limita a seleccionar el ID que debe abrirse.
			 */}
			<PostModal
				open={selectedPostId !== null}
				postId={selectedPostId}
				onClose={() =>
					setSelectedPostId(null)
				}
				onDeleted={
					handleSelectedPostUnavailable
				}
				onNotFound={
					handleSelectedPostUnavailable
				}
				onReactionUpdated={
					onPostReactionUpdated
				}
			/>
		</div>
	);
};
