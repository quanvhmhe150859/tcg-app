import axios from 'axios';

// const apiKey = import.meta.env.VITE_TCG_API_KEY;

const api = axios.create({
  // baseURL: 'https://api.pokemontcg.io/v2',
  baseURL: import.meta.env.VITE_API_BASE_URL,
  // headers: {
  //   'X-Api-Key': apiKey,
  // },
});

export default api;
