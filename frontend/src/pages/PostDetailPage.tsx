import { PostModal } from '@components/posts/PostModal';
import { NotFound } from '@pages/NotFound';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function isValidRoutePostId(postId: string | undefined): postId is string {
  if (!postId || !/^\d+$/.test(postId)) {
    return false;
  }

  const numericPostId = Number(postId);

  return (
    Number.isSafeInteger(numericPostId) &&
    numericPostId > 0 &&
    numericPostId <= 4_294_967_295
  );
}

export const PostDetailPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();

  const [notFound, setNotFound] = useState(false);

  // Si React Router reutiliza esta página para otro post, limpiamos
  // el estado de error asociado al identificador anterior.
  useEffect(() => {
    setNotFound(false);
  }, [postId]);

  const closeModal = () => {
    navigate('/app');
  };

  const handleDeleted = () => {
    navigate('/app', { replace: true });
  };

  const handleNotFound = useCallback(() => {
    setNotFound(true);
  }, []);

  if (!isValidRoutePostId(postId) || notFound) {
    return <NotFound />;
  }

  return (
    <section className="post-detail-page post-detail-page--modal-route">
      <PostModal
        open={true}
        postId={postId}
        onClose={closeModal}
        onDeleted={handleDeleted}
        onNotFound={handleNotFound}
      />
    </section>
  );
};
