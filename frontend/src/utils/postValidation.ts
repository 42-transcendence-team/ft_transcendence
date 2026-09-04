export const MAX_POST_CONTENT_LENGTH = 5000;
export const MAX_COMMENT_CONTENT_LENGTH = 1000;
export const MAX_POST_FILE_SIZE = 5 * 1024 * 1024;

export const ALLOWED_POST_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

export function validatePostFile(file: File): string | null {
  if (!ALLOWED_POST_FILE_TYPES.includes(file.type)) {
    return 'El archivo debe tener formato PNG, JPG, JPEG, WebP o PDF.';
  }

  if (file.size > MAX_POST_FILE_SIZE) {
    return 'El archivo no puede superar los 5 MB.';
  }

  return null;
}

export function validatePostDraft(
  content: string,
  file: File | null,
): string | null {
  const trimmedContent = content.trim();

  if (trimmedContent === '' && file === null) {
    return 'No puedes publicar una publicación vacía.';
  }

  if (trimmedContent.length > MAX_POST_CONTENT_LENGTH) {
    return `La publicación no puede superar los ${MAX_POST_CONTENT_LENGTH} caracteres.`;
  }

  if (file !== null) {
    return validatePostFile(file);
  }

  return null;
}

export function validateCommentContent(content: string): string | null {
  const trimmedContent = content.trim();

  if (trimmedContent === '') {
    return 'El comentario no puede estar vacío.';
  }

  if (trimmedContent.length > MAX_COMMENT_CONTENT_LENGTH) {
    return `El comentario no puede superar los ${MAX_COMMENT_CONTENT_LENGTH} caracteres.`;
  }

  return null;
}
