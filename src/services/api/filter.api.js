import { fetchAPI } from './service.api';

export const getAllGenres = async () => {
  return await fetchAPI('/filter/genres');
};

export const getArtistsByGenre = async (genre) => {
  return await fetchAPI(`/filter/artists/genre/${genre}`);
};

export const getAlbumsByArtist = async (artistId) => {
  return await fetchAPI(`/filter/albums/artist/${artistId}`);
};

export const getAlbumsByYear = async (year) => {
  return await fetchAPI(`/filter/albums/year/${year}`);
};

export const getAlbumsByGenre = async (genre) => {
  return await fetchAPI(`/filter/albums/genre/${genre}`);
};

export const getTracksByArtist = async (artistId) => {
  return await fetchAPI(`/filter/tracks/artist/${artistId}`);
};

export const getTracksByAlbum = async (albumId) => {
  return await fetchAPI(`/filter/tracks/album/${albumId}`);
};

export const getTracksByYear = async (year) => {
  return await fetchAPI(`/filter/tracks/year/${year}`);
};

export const getTracksByGenre = async (genre) => {
  return await fetchAPI(`/filter/tracks/genre/${genre}`);
};

export const getTracksByDuration = async (range) => {
  return await fetchAPI(`/filter/tracks/duration/${range}`);
};
