// Cấu hình
const USE_LOCAL_SPRITES = import.meta.env.VITE_USE_LOCAL_SPRITES === 'true';
const LOCAL_PATH = '/consumables/';
const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || '';
const BACKEND_PATH = `${BACKEND_URL}/consumables/`.replace(/\/+$/, '/');

/**
 * Lấy đường dẫn icon consumable
 * @param {string} id - Ví dụ: "health_500_fixed"
 * @returns {string} - Đường dẫn đầy đủ: "/consumables/health_500_fixed.png" hoặc backend
 */
export const getConsumableIconPath = (id) => {
  if (!id) return '/default.jpg';

  // Chuẩn hóa ID: health500Fixed → health_500_fixed
  const filename = id
    .replace(/([A-Z])/g, '_$1') // Thêm _ trước chữ hoa
    .toLowerCase()
    .replace(/^_+/, ''); // Xóa _ đầu nếu có

  const base = USE_LOCAL_SPRITES ? LOCAL_PATH : BACKEND_PATH;
  return `${base}${filename}.png`;
};