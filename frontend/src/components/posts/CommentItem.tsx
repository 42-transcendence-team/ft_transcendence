import { UserAvatar } from '@components/users/UserAvatar';
import type { Comment } from 'api/Comments';
import { FiTrash2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';

type CommentItemProps = {
  comment: Comment;
  isOwner: boolean;
  isDeleting: boolean;
  onRequestDelete: (commentId: number) => void;
};

function formatCommentDate(value: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export const CommentItem = ({
  comment,
  isOwner,
  isDeleting,
  onRequestDelete,
}: CommentItemProps) => {
  const authorProfilePath = `/app/profile/${encodeURIComponent(comment.author.login)}`;

  return (
    <article className="comment-item">
      <header className="comment-item__header">
        <div className="comment-item__author-block">
          <Link
            className="comment-item__avatar-link"
            to={authorProfilePath}
            aria-label={`Abrir el perfil de ${comment.author.login}`}
          >
            <UserAvatar
              avatarPath={comment.author.avatarPath}
              username={comment.author.login}
              size="small"
              status={null}
              className="comment-item__avatar"
            />
          </Link>

          <div className="comment-item__meta">
            <Link className="comment-item__author" to={authorProfilePath}>
              {comment.author.login}
            </Link>

            <time className="comment-item__date" dateTime={comment.createdAt}>
              {formatCommentDate(comment.createdAt)}
            </time>
          </div>
        </div>

        {isOwner && (
          <button
            className="comment-item__delete-button"
            type="button"
            onClick={() => onRequestDelete(comment.id)}
            disabled={isDeleting}
            aria-label={
              isDeleting ? 'Eliminando comentario' : 'Eliminar comentario'
            }
            title={isDeleting ? 'Eliminando comentario' : 'Eliminar comentario'}
          >
            <FiTrash2 size={16} aria-hidden="true" />
          </button>
        )}
      </header>

      <p className="comment-item__content">{comment.content}</p>
    </article>
  );
};
