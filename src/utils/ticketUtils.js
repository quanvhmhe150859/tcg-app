export function spendTicketsIfNeeded(count, spinMode, tickets, updateTickets, t) {
  if (spinMode === null) {
    localStorage.setItem("spinMode", "free");
  }

  if (spinMode !== "ticket") return true; // free mode -> luôn ok

  if (tickets < count) {
    alert(t("notEnoughTicketsToRoll")+"!");
    return false;
  }

  updateTickets(tickets - count); // trừ vé
  return true;
}
