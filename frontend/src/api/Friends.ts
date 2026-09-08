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

export async function listBlocksRequest() {
    const data = await apiRequest({
        endpoint: "friends/blocks",
    });

    return data;
}

export async function sendFriendRequest(userId: number) {
  const data = await apiRequest({
    endpoint: "friends/requests",
    method: "POST",
    body: {
      receiver_id: userId,
    },
  });

  return data;
}

export async function removeFriend(userId: number) {
    const data = await apiRequest({
        endpoint: `friends/${userId}`,
        method: "DELETE",
    });

  return data
};

export async function blockUser(userId: number) {
  const data = await apiRequest({
    endpoint: "friends/blocks",
    method: "POST",
    body: {
      blocked_id: userId,
    }
  });

  return data;
}

export async function unblockUser(userId: number) {
  const data = await apiRequest({
    endpoint: `friends/blocks/${userId}`,
    method: "DELETE",
  });

  return data;
}