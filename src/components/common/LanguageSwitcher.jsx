import { useTranslation } from "react-i18next";
import { useState } from "react";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [lang, setLang] = useState(i18n.language || "en");

  const toggleLang = () => {
    const newLang = lang === "en" ? "vi" : "en";
    setLang(newLang);
    i18n.changeLanguage(newLang);
    localStorage.setItem("lang", newLang);
  };

  return (
    <button
      onClick={toggleLang}
      className="floating-button"
      style={{ top: "75px" }}
      title={lang === "en" ? "Vietnamese" : "English"}
    >
      <img
        src={lang === "en" ? "/flags/en.png" : "/flags/vi.png"}
        alt={lang === "en" ? "English" : "Vietnamese"}
        className="transform scale-250"
      />
    </button>
  );
}
