import { OrientationProvider } from "./OrientationContext";
import { BgmProvider } from "./BgmContext";
import { TicketProvider } from "./TicketContext";

export function AppProviders({ children }) {
  return (
    <TicketProvider>
      <OrientationProvider>
        <BgmProvider>{children}</BgmProvider>
      </OrientationProvider>
    </TicketProvider>
  );
}
