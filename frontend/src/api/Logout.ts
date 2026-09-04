import { apiRequest } from './ApiRequest';

export type LogoutResponse = {
  message?: string;
};

export async function Logout() {
  const data = await apiRequest({
    endpoint: 'auth/logout',
    method: 'POST',
  });

  return data;
}
