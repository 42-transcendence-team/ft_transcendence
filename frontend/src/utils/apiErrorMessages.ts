type ApiErrorShape = {
	status?: number;
	message?: string;
	data?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

export function getApiErrorStatus(error: unknown): number | null {
	if (
		isRecord(error) &&
		typeof error.status === "number"
	) {
		return error.status;
	}

	return null;
}

function pushString(values: string[], value: unknown): void {
	if (typeof value === "string" && value.trim() !== "") {
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

	if (status === 400 || hasApiErrorValue(error, "invalid_post_id")) {
		return "Invalid post ID.";
	}

	if (status === 404 || hasApiErrorValue(error, "post_not_found")) {
		return "This post does not exist or has been deleted.";
	}

	return "Something went wrong while loading the post.";
}

export function getPostCreateErrorMessage(error: unknown): string {
	if (hasApiErrorValue(error, "content_or_image_required")) {
		return "You cannot publish an empty post.";
	}

	if (hasApiErrorValue(error, "invalid_image_upload")) {
		return "The image could not be uploaded.";
	}

	if (hasApiErrorValue(error, "invalid_type")) {
		return "The image must be a PNG, JPG, JPEG or WebP file.";
	}

	if (hasApiErrorValue(error, "max_size")) {
		return "The image cannot be larger than 5 MB.";
	}

	if (hasApiErrorValue(error, "max")) {
		return "The post cannot exceed 5000 characters.";
	}

	return "Something went wrong while creating the post.";
}

export function getPostDeleteErrorMessage(error: unknown): string {
	const status = getApiErrorStatus(error);

	if (status === 403 || hasApiErrorValue(error, "cannot_delete_other_user_post")) {
		return "You do not have permission to delete this post.";
	}

	if (status === 404 || hasApiErrorValue(error, "post_not_found")) {
		return "This post no longer exists.";
	}

	return "Something went wrong while deleting the post.";
}

export function getCommentCreateErrorMessage(error: unknown): string {
	if (hasApiErrorValue(error, "required")) {
		return "The comment cannot be empty.";
	}

	if (hasApiErrorValue(error, "max")) {
		return "The comment cannot exceed 1000 characters.";
	}

	if (hasApiErrorValue(error, "post_not_found")) {
		return "This post does not exist or has been deleted.";
	}

	return "Something went wrong while creating the comment.";
}

export function getCommentDeleteErrorMessage(error: unknown): string {
	const status = getApiErrorStatus(error);

	if (
		status === 403 ||
		hasApiErrorValue(error, "cannot_delete_other_user_comment")
	) {
		return "You do not have permission to delete this comment.";
	}

	if (status === 404 || hasApiErrorValue(error, "comment_not_found")) {
		return "This comment no longer exists.";
	}

	return "Something went wrong while deleting the comment.";
}

export function getGenericApiErrorMessage(error: unknown): string {
	const status = getApiErrorStatus(error);

	if (status === 401) {
		return "You must be logged in to perform this action.";
	}

	if (status === 403) {
		return "You do not have permission to perform this action.";
	}

	if (status === 404) {
		return "The requested resource does not exist or has been deleted.";
	}

	return "Something went wrong. Please try again.";
}
