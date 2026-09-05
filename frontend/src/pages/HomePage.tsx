import { PostList } from '@components/posts/PostList';
import {
  getFeedPosts,
  type PostReactionState,
  type PostSummary,
} from 'api/Posts';
import { useEffect, useState } from 'react';

function appendUniquePosts(
  currentPosts: PostSummary[],
  incomingPosts: PostSummary[],
): PostSummary[] {
  const knownPostIDs = new Set(currentPosts.map((post) => post.id));

  return [
    ...currentPosts,
    ...incomingPosts.filter((post) => !knownPostIDs.has(post.id)),
  ];
}

export const HomePage = () => {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadInitialFeed = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await getFeedPosts(1, 20);
        if (cancelled) return;

        setPosts(response.data);
        setPage(response.pagination.page);
        setTotalPages(response.pagination.totalPages);
      } catch {
        if (!cancelled) {
          setPosts([]);
          setError('No se ha podido cargar el contenido.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void loadInitialFeed();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLoadMore = async () => {
    if (isLoadingMore || page >= totalPages) return;

    const nextPage = page + 1;

    try {
      setIsLoadingMore(true);
      setError(null);

      const response = await getFeedPosts(nextPage, 20);
      setPosts((currentPosts) =>
        appendUniquePosts(currentPosts, response.data),
      );
      setPage(response.pagination.page);
      setTotalPages(response.pagination.totalPages);
    } catch {
      setError('No se han podido cargar más publicaciones.');
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handlePostDeleted = (postId: number) => {
    setPosts((currentPosts) =>
      currentPosts.filter((post) => post.id !== postId),
    );
  };

  const handlePostReactionUpdated = (reactionState: PostReactionState) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === reactionState.postId
          ? {
              ...post,
              likeCount: reactionState.likeCount,
              dislikeCount: reactionState.dislikeCount,
            }
          : post,
      ),
    );
  };

  return (
    <section className="home-page">
      <header className="home-page__header">
        <h2></h2>{/* no borra es para el diseño */}
        </header>

      <div className="home-page__feed">
        {isLoading && <p className="home-page__state">Cargando publicaciones.</p>}

        {!isLoading && error && posts.length === 0 && (
          <p className="home-page__error">{error}</p>
        )}

        {!isLoading && posts.length === 0 && !error && (
          <p className="home-page__state">
            Todavía no hay publicaciones en tu inicio.
          </p>
        )}

        {posts.length > 0 && (
          <>
            {error && <p className="home-page__error">{error}</p>}

            <PostList
              posts={posts}
              onPostDeleted={handlePostDeleted}
              onPostReactionUpdated={handlePostReactionUpdated}
            />

            {page < totalPages && (
              <button
                className="post-list__load-more"
                type="button"
                disabled={isLoadingMore}
                onClick={() => void handleLoadMore()}
              >
                {isLoadingMore ? 'Cargando...' : 'Cargar más'}
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
};
