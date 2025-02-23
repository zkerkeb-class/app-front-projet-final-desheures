import { fetchAPI } from './service.api';

export const getAudiosSortedByDuration = async (order = 'asc') => {
  return await fetchAPI(`/sort/audios/duration?order=${order}`);
};

export const getAlbumSortedByDate = async (order = 'asc') => {
  return await fetchAPI(`/sort/albums/date?order=${order}`);
};

export const getArtistsSortedByAlphabet = async (order = 'asc') => {
  return await fetchAPI(`/sort/artists/alphabetical?order=${order}`);
};

export const getPlaylistBySortedByNumberOfTracks = async (order = 'asc') => {
  return await fetchAPI(`/sort/playlist/tracks?order=${order}`);
};

export const getAudiosSortedByPopularity = async (order = 'asc') => {
  return await fetchAPI(`/sort/audios/popularity?order=${order}`);
};

export const getAlbumsSortedByPopularity = async (order = 'asc') => {
  return await fetchAPI(`/sort/albums/popularity?order=${order}`);
};

export const getArtistsSortedByPopularity = async (order = 'asc') => {
  return await fetchAPI(`/sort/artists/popularity?order=${order}`);
};

export const getAlbumsSortedByNumberOfTracks = async (order = 'asc') => {
  return await fetchAPI(`/sort/albums/tracks?order=${order}`);
};

export const getTracksSortedByAlphabetOfTheTitle = async (order = 'asc') => {
  return await fetchAPI(`/sort/audios/alphabetical?order=${order}`);
};

export const getAlbumsSortedByReleaseDate = async (order = 'asc') => {
  return await fetchAPI(`/sort/albums/released?order=${order}`);
};
