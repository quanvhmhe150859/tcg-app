import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function DarkModeToggle() {
  const { t } = useTranslation();

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    document.body.classList.toggle("dark-container", isDarkMode);
    document.body.classList.toggle("light-container", !isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <button
      className="floating-button"
      onClick={toggleDarkMode}
      title={isDarkMode ? t("switchToLight") : t("switchToDark")}
    >
      {isDarkMode ? "🌙" : "☀️"}
    </button>
  );
}
