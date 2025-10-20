import { toast } from "react-hot-toast";

export function spendTicketsIfNeeded(count, spinMode, tickets, updateTickets, t) {
  if (spinMode === null) {
    localStorage.setItem("spinMode", "free");
  }

  if (spinMode !== "ticket") return true; // free mode -> luôn ok

  if (tickets < count) {
    toast.error(t("notEnoughTicketsToRoll")+"!");
    return false;
  }

  updateTickets(tickets - count); // trừ vé
  return true;
}

export function refundTickets(amount, spinMode, tickets, updateTickets) {
  if (spinMode !== "ticket") return; // chỉ hoàn vé khi ở chế độ vé
  
  updateTickets(tickets + amount); // hoàn vé
}