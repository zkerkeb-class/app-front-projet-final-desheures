import { fetchAPI } from './service.api';

export const getAllAudios = async () => {
  return await fetchAPI('/audio');
};

export const getAudioById = async (id) => {
  return await fetchAPI(`/audio/${id}`);
};
