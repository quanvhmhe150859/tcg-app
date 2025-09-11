import { createContext, useContext, useState, useEffect } from "react";
import { getTickets, setTickets, addTickets } from "../../utils/ticketStorage";

const TicketContext = createContext();

export function TicketProvider({ children }) {
  const [tickets, setTicketsState] = useState(0);

  // Load vé từ localStorage khi app khởi động
  useEffect(() => {
    setTicketsState(getTickets());
  }, []);

  // Hàm cộng vé
  const earnTickets = (amount) => {
    const next = addTickets(amount); // addTickets đã lưu localStorage
    setTicketsState(next);
  };

  // Hàm set vé trực tiếp (ít dùng)
  const updateTickets = (value) => {
    setTickets(value);
    setTicketsState(value);
  };

  return (
    <TicketContext.Provider value={{ tickets, earnTickets, updateTickets }}>
      {children}
    </TicketContext.Provider>
  );
}

export function useTickets() {
  return useContext(TicketContext);
}
