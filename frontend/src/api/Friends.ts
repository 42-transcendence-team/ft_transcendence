import { apiRequest } from "./ApiRequest";

export type FriendRequest = {
    id: number;
    user_id: number;
    username: string;
    status: "pending";
    type: "incoming" | "outgoing";
}

export type FriendRequestResponse = {
    data: FriendRequest[];
}

export async function getIncomingFriendRequests() {
	const data = await apiRequest({
		endpoint: "friends/requests/incoming",
	});

	return data;
}

export async function getOutcomingFriendRequests() {
	const data = await apiRequest({
		endpoint: "friends/requests/outgoing",
	});

	return data;
}

export type DoSomethingFriendRequest = {
    id: number;
    senderID: number;
    userID: number;
}


export async function acceptFriendRequest(requestId: number) {
	const data = await apiRequest({
		endpoint: `friends/requests/${requestId}/accept`,
		method: "PATCH",
	});

	return data;
}

export async function rejectFriendRequest(requestId: number) {
	const data = await apiRequest({
		endpoint: `friends/requests/${requestId}/reject`,
		method: "PATCH",
	});

	return data;
}

export type Friend = {
    user_id: number;
    username: string;
}

export async function listFriendsRequest() {
    const data = await apiRequest({
        endpoint: "friends",
    });

    return data;
}