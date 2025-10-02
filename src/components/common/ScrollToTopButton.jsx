import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const ScrollToTopButton = () => {
  const { t } = useTranslation();

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setVisible(window.scrollY > 200);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <button className="floating-button" style={{ position: "fixed", bottom: "15px", right: "15px" }} onClick={scrollToTop} title={t("scrollToTop")}>
      🔝
    </button>
  );
};

export default ScrollToTopButton;
