import { apiRequest } from "./ApiRequest";

export async function AddChat() {
	const data = await apiRequest({
		endpoint: "chat/rooms",
		method: "POST",
		body: { name: `Room ${Math.floor(Math.random() * 1000)}` },
	});
	return data;
}
