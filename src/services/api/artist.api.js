import { fetchAPI } from './service.api';

export const getAllArtists = async () => {
  return await fetchAPI('/artist');
};

export const getArtistById = async (id) => {
  return await fetchAPI(`/artist/${id}`);
};