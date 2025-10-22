import { createContext, useContext, useState, useEffect } from "react";
import { getTickets, setTickets, addTickets } from "../utils/ticketStorage";

const TicketContext = createContext();

export function TicketProvider({ children }) {
  const [tickets, setTicketsState] = useState(0);

  // Load vé từ localStorage khi app khởi động
  useEffect(() => {
    setTicketsState(getTickets());
  }, []);

  // Hàm cộng vé
  const earnTickets = (level) => {
    const gained = Math.floor(calculateTickets(level));
    const next = addTickets(gained); // addTickets đã lưu localStorage
    setTicketsState(next);
    return gained;
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

function calculateTickets(level) {
  if (level < 20) {
    return level * 0.9;
  } else if (level < 30) {
    return Math.floor(level * 1.2);
  } else if (level < 40) {
    return Math.floor(level * 1.5);
  } else if (level < 50) {
    return Math.floor(level * 1.8);
  } else {
    return Math.floor(level * 2.1);
  }
}
