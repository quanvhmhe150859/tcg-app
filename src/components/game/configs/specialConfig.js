const USE_LOCAL_SPRITES = import.meta.env.VITE_USE_LOCAL_SPRITES === 'true';
const BASE_LOCAL_PATH = '/specials/';
const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || '';
const BASE_BACKEND_PATH = `${BACKEND_URL}/specials/`.replace(/\/+$/, '/'); // đảm bảo 1 slash

export const getSpecialIconPath = (filename) => {
  const base = USE_LOCAL_SPRITES ? BASE_LOCAL_PATH : BASE_BACKEND_PATH;
  return `${base}${filename}`;
};