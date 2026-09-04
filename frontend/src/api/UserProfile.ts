import { apiRequest } from './ApiRequest';
import type { UserRelation } from './UserSearch';

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

  relation: UserRelation;
  can_send_request: boolean;
  request_id: number | null;
};

type UserProfileApiResponse = {
  data: UserProfile;
};

export async function getUserProfile(
  username: string,
  options?: { noIncrement?: boolean },
): Promise<UserProfile> {
  let targetEndpoint = `users/profile/${encodeURIComponent(username)}`;
  if (options?.noIncrement) {
    targetEndpoint += '?no_increment=true';
  }
  const response = await apiRequest<UserProfileApiResponse>({
    endpoint: targetEndpoint,
    method: 'GET',
  });

  return response.data;
}

type UserPresenceApiResponse = {
  data: {
    isOnline: boolean;
  };
};

export async function getUserPresence(username: string): Promise<boolean> {
  const response = await apiRequest<UserPresenceApiResponse>({
    endpoint: `users/profile/${encodeURIComponent(username)}/presence`,
    method: 'GET',
  });

  return response.data.isOnline;
}
