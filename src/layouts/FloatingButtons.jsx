// FloatingButtons.jsx
import { useState } from "react";
import DarkModeToggle from "../components/ui/DarkModeToggleButton";
import LanguageSwitcher from "../components/ui/LanguageSwitcherButton";
import MusicToggleButton from "../components/ui/MusicToggleButton";
import TicketCount from "../components/ui/TicketCount";
import { useOrientation } from "../context/OrientationContext";

// Icon đơn giản (bạn có thể thay bằng icon thật từ lucide-react, heroicons, v.v.)
const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Nút Toggle chính
const ToggleButton = ({ isOpen, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="floating-button w-12 h-12 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform duration-200"
    >
      {isOpen ? "🤮" : "🤢"}
    </button>
  );
};

const buttons = [
  { id: 1, component: ToggleButton },        // sẽ được xử lý riêng
  { id: 2, component: <DarkModeToggle /> },
  { id: 3, component: <LanguageSwitcher /> },
  { id: 4, component: <MusicToggleButton /> },
  { id: 5, component: <TicketCount /> },
];

export default function FloatingButtons() {
  const { orientation } = useOrientation();
  const [isOpen, setIsOpen] = useState(true);

  const toggle = () => setIsOpen(prev => !prev);

  const isVertical = orientation === "vertical";

  return (
    <>
      {/* Các nút từ 2 -> 5 – chỉ hiển thị khi isOpen = true */}
      {buttons.slice(1).map((btn, i) => {
        // i = 0 → nút thứ 2, i = 1 → nút thứ 3, ...
        const delay = isOpen ? (i + 1) * 0.08 : (buttons.slice(1).length - i) * 0.06;

        const baseStyle = isVertical
          ? { top: `${15 + (i + 1) * 70 }px`, right: "15px" }
          : { top: "15px", right: `${15 + (i + 1) * 70}px` };

        return (
          <div
            key={btn.id}
            className="fixed z-999 transition-all duration-500 ease-out"
            style={{
              ...baseStyle,
              opacity: isOpen ? 1 : 0,
              transform: isOpen
                ? "translateY(0) scale(1)"
                : isVertical
                  ? "translateY(-80px) scale(0.6)"
                  : "translateX(80px) scale(0.6)",
              transitionDelay: `${delay}s`,
            }}
          >
            {btn.component}
          </div>
        );
      })}

      {/* Nút Toggle chính – luôn hiển thị */}
      <div
        className="fixed z-999 transition-all duration-300"
        style={
          isVertical
            ? { top: "15px", right: "15px" }
            : { top: "15px", right: "15px" }
        }
      >
        <ToggleButton isOpen={isOpen} onToggle={toggle} />
      </div>
    </>
  );
}