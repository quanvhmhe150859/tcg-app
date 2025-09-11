const SECRET = 12345; // giữ như hiện tại hoặc đổi chỗ khác nếu muốn
const MODULO = 999999;

function computeHash(value) {
  return (Math.floor(Number(value) || 0) * SECRET) % MODULO;
}

/**
 * Ghi tickets (số nguyên >= 0) vào localStorage dưới dạng { value, hash }
 */
export function setTickets(tickets) {
  const normalized = Math.max(0, Math.floor(Number(tickets) || 0));
  const hash = computeHash(normalized);
  localStorage.setItem("tickets", JSON.stringify({ value: normalized, hash }));

  // 🔔 phát sự kiện cho React biết
  window.dispatchEvent(
    new CustomEvent("ticketsUpdated", { detail: normalized })
  );
}

/**
 * Đọc tickets, trả về số (0 nếu lỗi hoặc phát hiện chỉnh sửa)
 */
export function getTickets() {
  const raw = localStorage.getItem("tickets");
  if (!raw) return 0;

  try {
    const parsed = JSON.parse(raw);
    const value = Number(parsed?.value);
    const hash = Number(parsed?.hash);

    if (!Number.isFinite(value) || !Number.isFinite(hash)) {
      // dữ liệu không đúng dạng
      return 0;
    }

    if (computeHash(value) !== hash) {
      console.warn("Phát hiện chỉnh sửa ticket! (tamper detected)");
      return 0;
    }

    return Math.max(0, Math.floor(value));
  } catch (err) {
    console.warn("ticketStorage: lỗi parse localStorage tickets", err);
    return 0;
  }
}

/**
 * Cộng thêm amount vé (amount có thể là số hoặc chuỗi số).
 * Trả về tổng mới.
 */
export function addTickets(amount) {
  const delta = Math.floor(Number(amount) || 0);
  if (delta === 0) {
    return getTickets();
  }
  const next = Math.max(0, getTickets() + delta);
  setTickets(next);
  return next;
}

/**
 * Xoá vé (dùng cho dev / reset)
 */
export function clearTickets() {
  localStorage.removeItem("tickets");
}
