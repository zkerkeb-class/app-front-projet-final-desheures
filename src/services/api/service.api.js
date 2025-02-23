import logger from '@/utils/logger';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL; // Remplace par l'URL de ton API

export const fetchAPI = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    logger.error('Erreur lors de la requête API:', error);
    throw error;
  }
};
