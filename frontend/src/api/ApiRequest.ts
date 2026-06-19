export const API_BASE_URL = '/api/v1/';

interface ApiRequestProps {
    endpoint: string;
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    body?: unknown;
    includeCredentials?: boolean;
}

export async function apiRequest(props: ApiRequestProps): Promise<any> {
    const { endpoint, body, method = "GET", includeCredentials = true } = props;

    const config: RequestInit = {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: includeCredentials ? "include" : "same-origin",
        body: body ? JSON.stringify(body) : undefined,
    };
    const res = await fetch(`${API_BASE_URL}${endpoint}`, config);
	
    if (endpoint == "auth/me") {
        const data = await res.json();
        if (data.authenticated) {
            return data;
        }
        const errorData = data.catch(() => null)
        throw buildApiError(res, errorData);
    }

    if (!res.ok) {
		const errorData = await res.json().catch(() => null);
        throw buildApiError(res, errorData);
    }

    return res.json();
}

export type ApiError = {
	status: number;
	message: string;
	data?: any;
};

export function buildApiError(res: Response, data: any): ApiError {
	return {
		status: res.status,
		message: data?.message || data?.error?.message || "Unexpected error",
		data,
	};
}
