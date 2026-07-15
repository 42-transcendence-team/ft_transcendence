import { apiRequest } from "./ApiRequest";

export type UserProfile = {
	id: number;
	login: string;
	name: string;
	surname: string;
	avatarPath: string | null;
	bannerPath: string | null;
	status: string;
	isOnline: boolean;
	visits: number;
};

type UserProfileApiResponse = {
	data: UserProfile;
};

export async function getUserProfile(
	username: string,
): Promise<UserProfile> {
	const response = await apiRequest<UserProfileApiResponse>({
		endpoint: `users/profile/${encodeURIComponent(username)}`,
		method: "GET",
	});

	return response.data;
}
