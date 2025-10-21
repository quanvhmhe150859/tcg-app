import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import HamburgerMenu from "../components/common/HamburgerMenu";
import DarkModeToggle from "../components/common/DarkModeToggleButton";
import LanguageSwitcher from "../components/common/LanguageSwitcherButton";
import MusicToggleButton from "../components/common/MusicToggleButton";
import TicketCount from "../components/common/TicketCount";
import ScrollToTopButton from "../components/common/ScrollToTopButton";
import { useOrientation } from "../components/context/OrientationContext";

export default function MainLayout() {
  const { orientation } = useOrientation();

  const buttons = [
    { id: 1, component: <DarkModeToggle /> },
    { id: 2, component: <LanguageSwitcher /> },
    { id: 3, component: <MusicToggleButton /> },
    { id: 4, component: <TicketCount /> },
  ];

  return (
    <div className="app">
      <Toaster position="top-center" reverseOrder={false} />
      <HamburgerMenu />
      <ScrollToTopButton />

      {/* Các nút nổi */}
      {buttons.map((btn, i) => {
        const style =
          orientation === "vertical"
            ? { top: `${15 + i * 60}px`, right: "15px" }
            : { top: "15px", right: `${15 + i * 60}px` };
        return (
          <div key={btn.id} className="fixed z-999" style={style}>
            {btn.component}
          </div>
        );
      })}

      {/* Nội dung từng trang */}
      <Outlet />
    </div>
  );
}
