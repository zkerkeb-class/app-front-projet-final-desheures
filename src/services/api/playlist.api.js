import { fetchAPI } from './service.api';

export const getAllPlaylists = async () => {
  return await fetchAPI('/playlist');
};

export const getPlaylistById = async (id) => {
  return await fetchAPI(`/playlist/${id}`);
};

export const createPlaylist = async (playlist) => {
  return await fetchAPI('/playlist', {
    method: 'POST',
    body: JSON.stringify(playlist),
  });
};

export const updatePlaylist = async (playlist) => {
  return await fetchAPI(`/playlist/${playlist.id}`, {
    method: 'PUT',
    body: JSON.stringify(playlist),
  });
};

export const removeTrack = async (playlistId, trackId) => {
  return await fetchAPI(`/playlist/${playlistId}/removeTrack`, {
    method: 'PUT',
    body: JSON.stringify({ trackId }),
  });
};

export const deletePlaylist = async (id) => {
  return await fetchAPI(`/playlist/${id}`, {
    method: 'DELETE',
  });
};

export const getRecentlyPlayedPlaylist = async () => {
  return await fetchAPI('/playlist/recently-played');
};

export const getMostPlayedPlaylist = async () => {
  return await fetchAPI('/playlist/most-played');
};
