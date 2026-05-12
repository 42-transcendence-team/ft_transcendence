import { buildApiError } from "./ApiError";

const apiUrl = import.meta.env.PUBLIC_API_URL;

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
    const res = await fetch(`${apiUrl}/friends/requests/incoming`, {
        method: "GET",
        credentials: "include"
    })

    const data: FriendRequestResponse = await res.json().catch(() => null);

    if (!res.ok) {
        throw buildApiError(res, data);
    }

    return data;
}

export async function getOutcomingFriendRequests() {
    const res = await fetch(`${apiUrl}/friends/requests/outgoing`, {
        method: "GET",
        credentials: "include"
    })

    const data: FriendRequestResponse = await res.json().catch(() => null);

    if (!res.ok) {
        throw buildApiError(res, data);
    }

    return data;
}

export type DoSomethingFriendRequest = {
    id: number;
    senderID: number;
    userID: number;
}


export async function acceptFriendRequest(requestId: number) {
    const res = await fetch(`${apiUrl}/friends/requests/${requestId}/accept`, {
        method: "PATCH",
        credentials: "include"
    })

    const data: DoSomethingFriendRequest = await res.json().catch(() => null);

    if (!res.ok) {
        throw buildApiError(res, data);
    }

    return data;
}

export async function rejectFriendRequest(requestId: number) {
    const res = await fetch(`${apiUrl}/friends/requests/${requestId}/reject`, {
        method: "PATCH",
        credentials: "include"
    })

    const data: DoSomethingFriendRequest = await res.json().catch(() => null);

    if (!res.ok) {
        throw buildApiError(res, data);
    }

    return data;
}

export type Friend = {
    user_id: number;
    username: string;
}

type ListFriendsResponse = {
    data: Friend[];
}

export async function listFriendsRequest() {
    const res = await fetch(`${apiUrl}/friends`, {
        method: "GET",
        credentials: "include"
    })

    const data: ListFriendsResponse = await res.json().catch(() => null);

    if (!res.ok) {
        throw buildApiError(res, data);
    }

    return data;
}