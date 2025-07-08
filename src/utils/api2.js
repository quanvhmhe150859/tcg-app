const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Gọi API sử dụng base URL từ .env
 * @param {string} path - đường dẫn (ví dụ: /sync-yugioh)
 * @param {RequestInit} options - các tùy chọn fetch (method, body, headers,...)
 * @returns {Promise<Response>}
 */
export async function apiFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  return fetch(url, options);
}
