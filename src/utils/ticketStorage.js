// utils/ticketStorage.js
const SECRET = 12345; // số bí mật để tính hash
const MODULO = 999999; // số mod để hash không quá dài

export function setTickets(tickets) {
  const hash = (tickets * SECRET) % MODULO;
  localStorage.setItem("tickets", JSON.stringify({ value: tickets, hash }));
}

export function getTickets() {
  const raw = localStorage.getItem("tickets");
  if (!raw) return 0;

  try {
    const { value, hash } = JSON.parse(raw);
    if ((value * SECRET) % MODULO !== hash) {
      console.warn("Phát hiện chỉnh sửa ticket!");
      return 0; // reset về 0 nếu bị hack
    }
    return value;
  } catch {
    return 0;
  }
}
