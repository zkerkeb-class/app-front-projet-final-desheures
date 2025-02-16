import { fetchAPI } from './service.api';

export const getAllSearch = async (content) => {
  return await fetchAPI(`/search?query=${content}`);
};
