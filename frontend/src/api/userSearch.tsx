import { apiRequest } from "./ApiRequest";


export type UserRelation = "friends" | "pending_sent" | "pending_received" 
    | "blocked_by_me" | "blocked_me" | "none";

export type UserSearch = {
    id: number;
    login: string;
    avatar_url: string;
    status: string;
    relation: UserRelation;
    can_send_request: boolean;
};

export type UserSearchResponse = {
  items: UserSearch[];
  page: number;
  limit: number;
  total: number;
  has_next: boolean;
};

export async function searchUsers(query: string): Promise<UserSearchResponse> {
    const data = await apiRequest({
		endpoint: `users/search?q=${query}`,
	});

	return data;
}
