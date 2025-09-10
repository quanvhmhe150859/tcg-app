import { useState, useEffect } from "react";
import { getTickets, setTickets } from "../../utils/ticketStorage";

export default function TicketButton() {
  const [tickets, setTicketsState] = useState(0);

  useEffect(() => {
    // nếu chưa có thì set 10 ticket mặc định
    let current = getTickets();
    if (current === 0) {
      setTickets(10);
      current = 10;
    }
    setTicketsState(current);
  }, []);

  return (
    <button
      disabled
      className="floating-button !p-0 !text-xs !hover:text-transparent !bg-transparent"
      title="Số vé hiện tại của bạn"
    >
        {tickets} 🎟️
    </button>
  );
}
