import { apiRequest } from "./ApiRequest";

export type UpdateAvatarResponse = {
	message: string;
	data: {
		avatarPath: string;
	};
};

export async function updateAvatar(
	file: File,
): Promise<UpdateAvatarResponse> {
	const formData = new FormData();

	formData.append("image", file);

	return apiRequest<UpdateAvatarResponse>({
		endpoint: "users/avatar",
		method: "PATCH",
		body: formData,
	});
}

export async function deleteAvatar(): Promise<void> {
	return apiRequest<void>({
		endpoint: "users/avatar",
		method: "DELETE",
	});
}
