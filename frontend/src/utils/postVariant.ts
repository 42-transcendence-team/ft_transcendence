import type { Post } from 'api/Posts';

export type PostVariant = 'text' | 'image' | 'mixed';

export function isPdfPostFile(filePath?: string | null): boolean {
  if (!filePath) {
    return false;
  }

  const normalizedPath = filePath
    .split('?', 1)[0]
    .split('#', 1)[0]
    .toLowerCase();

  return normalizedPath.endsWith('.pdf');
}

export function getPostVariant(post: Post): PostVariant {
  const hasText = Boolean(post.content?.trim());

  const hasImage = Boolean(post.imagePath && !isPdfPostFile(post.imagePath));

  if (hasText && hasImage) {
    return 'mixed';
  }

  if (hasImage) {
    return 'image';
  }

  return 'text';
}
