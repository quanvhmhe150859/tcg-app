import { OrientationProvider } from "./OrientationContext";
import { BgmProvider } from "./BgmContext";

export function AppProviders({ children }) {
  return (
    <OrientationProvider>
      <BgmProvider>
        {children}
      </BgmProvider>
    </OrientationProvider>
  );
}
