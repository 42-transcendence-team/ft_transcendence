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
	// console.log("body", body)
    console.log(`[API REQ] Lanzando -> MÉTODOS: ${method} | RUTA: ${endpoint}`);
    console.log(`[API REQ] Cuerpo enviado para ${endpoint}:`, body);
    //esta llegando en undefined pero anteriormente llega bn (no se pq se borra)
    // body {code: '128243', tempToken: 'a3ae61a245cbdc05f5d18dd34e76c96be7a63de007ca23ea48306db0f1219cb2'}
    const res = await fetch(`${API_BASE_URL}${endpoint}`, config);
    // despues del fecht sale BsEvStation
    // res Response {type: 'basic', url: 'https://localhost/api/v1/2fa/login', redirected: false, 
    // status: 200, ok: true, …}
    // pero al segundo sale body undefined y da error
	// console.log("res", res)
    console.log(`[API RES] Respuesta de ${endpoint} -> STATUS:`, res);
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