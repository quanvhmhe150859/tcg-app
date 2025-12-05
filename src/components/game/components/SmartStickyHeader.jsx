import React, { useEffect, useState, useRef } from "react";

export default function SmartStickyHeader({ children }) {
  const [isSticky, setIsSticky] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!headerRef.current) return;

      const rect = headerRef.current.getBoundingClientRect();

      // Nếu top của header < 0 nghĩa là nó đã cuộn lên khỏi viewport
      if (rect.top <= 0) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative w-full">
      {/* Header gốc */}
      <div
        ref={headerRef}
        className="w-full flex justify-center py-4 text-lg font-bold"
      >
        {children}
      </div>

      {/* Sticky Header nhân bản khi cuộn */}
      {isSticky && (
        <div
          className="header-page fixed top-0 left-0 right-0 pl-16 pr-16 pt-1 text-center text-lg font-bold z-500"
        >
          {children}
        </div>
      )}
    </div>
  );
}
