import axios from 'axios';

const apiKey = import.meta.env.VITE_TCG_API_KEY;
// console.log("Loaded API key:", apiKey); // Debug log

const api = axios.create({
  // baseURL: 'https://api.pokemontcg.io/v2',
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'X-Api-Key': apiKey,
  },
});

export default api;
