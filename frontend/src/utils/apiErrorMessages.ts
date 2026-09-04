type ApiErrorShape = {
  status?: number;
  message?: string;
  data?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function getApiErrorStatus(error: unknown): number | null {
  if (isRecord(error) && typeof error.status === 'number') {
    return error.status;
  }

  return null;
}

function pushString(values: string[], value: unknown): void {
  if (typeof value === 'string' && value.trim() !== '') {
    values.push(value);
  }
}

function collectDetails(values: string[], details: unknown): void {
  if (!isRecord(details)) {
    return;
  }

  for (const [key, value] of Object.entries(details)) {
    pushString(values, key);
    pushString(values, value);
  }
}

function getApiErrorValues(error: unknown): string[] {
  const values: string[] = [];

  if (!isRecord(error)) {
    return values;
  }

  const apiError = error as ApiErrorShape;

  pushString(values, apiError.message);

  const data = apiError.data;

  if (isRecord(data)) {
    pushString(values, data.code);
    pushString(values, data.message);
    pushString(values, data.error);

    if (isRecord(data.error)) {
      pushString(values, data.error.code);
      pushString(values, data.error.message);
      collectDetails(values, data.error.details);
    }

    collectDetails(values, data.details);
  }

  return values;
}

function hasApiErrorValue(error: unknown, expected: string): boolean {
  return getApiErrorValues(error).includes(expected);
}

export function getPostLoadErrorMessage(error: unknown): string {
  const status = getApiErrorStatus(error);

  if (status === 400 || hasApiErrorValue(error, 'invalid_post_id')) {
    return 'El identificador de la publicación no es válido.';
  }

  if (status === 404 || hasApiErrorValue(error, 'post_not_found')) {
    return 'Esta publicación no existe o ha sido eliminada.';
  }

  return 'Se ha producido un error al cargar la publicación.';
}

export function getPostCreateErrorMessage(error: unknown): string {
  if (hasApiErrorValue(error, 'content_or_image_required')) {
    return 'No puedes publicar una publicación vacía.';
  }

  if (hasApiErrorValue(error, 'invalid_image_upload')) {
    return 'No se ha podido subir la imagen.';
  }

  if (hasApiErrorValue(error, 'invalid_type')) {
    return 'La imagen debe ser un archivo PNG, JPG, JPEG o WebP.';
  }

  if (hasApiErrorValue(error, 'max_size')) {
    return 'La imagen no puede superar los 5 MB.';
  }

  if (hasApiErrorValue(error, 'max')) {
    return 'La publicación no puede superar los 5000 caracteres.';
  }

  return 'Se ha producido un error al crear la publicación.';
}

export function getPostDeleteErrorMessage(error: unknown): string {
  const status = getApiErrorStatus(error);

  if (
    status === 403 ||
    hasApiErrorValue(error, 'cannot_delete_other_user_post')
  ) {
    return 'No tienes permiso para eliminar esta publicación.';
  }

  if (status === 404 || hasApiErrorValue(error, 'post_not_found')) {
    return 'Esta publicación ya no existe.';
  }

  return 'Se ha producido un error al eliminar la publicación.';
}

export function getCommentCreateErrorMessage(error: unknown): string {
  if (hasApiErrorValue(error, 'required')) {
    return 'El comentario no puede estar vacío.';
  }

  if (hasApiErrorValue(error, 'max')) {
    return 'El comentario no puede superar los 1000 caracteres.';
  }

  if (hasApiErrorValue(error, 'post_not_found')) {
    return 'Esta publicación no existe o ha sido eliminada.';
  }

  return 'Se ha producido un error al crear el comentario.';
}

export function getCommentDeleteErrorMessage(error: unknown): string {
  const status = getApiErrorStatus(error);

  if (
    status === 403 ||
    hasApiErrorValue(error, 'cannot_delete_other_user_comment')
  ) {
    return 'No tienes permiso para eliminar este comentario.';
  }

  if (status === 404 || hasApiErrorValue(error, 'comment_not_found')) {
    return 'Este comentario ya no existe.';
  }

  return 'Se ha producido un error al eliminar el comentario.';
}

export function getGenericApiErrorMessage(error: unknown): string {
  const status = getApiErrorStatus(error);

  if (status === 401) {
    return 'Debes iniciar sesión para realizar esta acción.';
  }

  if (status === 403) {
    return 'No tienes permiso para realizar esta acción.';
  }

  if (status === 404) {
    return 'El recurso solicitado no existe o ha sido eliminado.';
  }

  return 'Se ha producido un error. Inténtalo de nuevo.';
}
