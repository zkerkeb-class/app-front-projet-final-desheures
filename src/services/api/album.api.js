import { fetchAPI } from './service.api';

export const getAllAlbums = async () => {
  return await fetchAPI('/album');
};

export const getAlbumById = async (id) => {
  return await fetchAPI(`/album/${id}`);
};
