import { buildApiError } from "./ApiError";

const apiUrl = import.meta.env.PUBLIC_API_URL;

export type LogoutResponse = {
	message?: string;
};

export async function Logout() {
    const res = await fetch(`${apiUrl}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
    });

    const data: LogoutResponse = await res.json().catch(() => null);

    if (!res.ok)
        throw buildApiError(res, data);
    
    return data;
}
