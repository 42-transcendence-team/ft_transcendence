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