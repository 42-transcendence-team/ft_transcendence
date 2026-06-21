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
    request_id?: number;
};

export type UserSearchResponse = {
  items: UserSearch[];
  page: number;
  limit: number;
  total: number;
  has_next: boolean;
};

export type SearchUsersParams = {
  query: string;
  page?: number;
  limit?: number;
  sort?: string;
  relations?: UserRelation[];
};

export async function searchUsers(
  params: SearchUsersParams
): Promise<UserSearchResponse> {
  const queryParams = new URLSearchParams();

  queryParams.set("q", params.query);

  if (params.page) {
    queryParams.set("page", String(params.page));
  }

  if (params.limit) {
    queryParams.set("limit", String(params.limit));
  }

  if (params.sort) {
    queryParams.set("sort", params.sort);
  }

  if (params.relations && params.relations.length > 0) {
    queryParams.set("relations", params.relations.join(","));
  }

  const data = await apiRequest({
    endpoint: `users/search?${queryParams.toString()}`,
  });

  return data;
}
