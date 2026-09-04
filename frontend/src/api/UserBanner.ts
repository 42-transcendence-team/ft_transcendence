import { apiRequest } from './ApiRequest';

export type UpdateBannerResponse = {
  message: string;
  data: {
    bannerPath: string;
  };
};

export async function updateBanner(file: File): Promise<UpdateBannerResponse> {
  const formData = new FormData();

  // El backend recupera el archivo mediante c.FormFile("image").
  formData.append('image', file);

  return apiRequest<UpdateBannerResponse>({
    endpoint: 'users/banner',
    method: 'PATCH',
    body: formData,
  });
}

export async function deleteBanner(): Promise<void> {
  return apiRequest<void>({
    endpoint: 'users/banner',
    method: 'DELETE',
  });
}
