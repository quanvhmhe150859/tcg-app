import { useState, useEffect } from "react";
import { useTickets } from "../../context/TicketContext";
import { useTranslation } from "react-i18next";

export default function TicketButton() {
  const { t } = useTranslation();

  const { tickets } = useTickets();
  
  return (
    <button
      disabled
      className="floating-button-no-bg !p-0 !text-xs"
      title={t("canEarnMoreByPlayingTheGame")}
    >
      {tickets} 🎫
    </button>
  );
}
