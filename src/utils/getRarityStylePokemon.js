export const getRarityStylePokemon = (rarity) => {
  const baseStyle = {
    padding: "2px 6px",
    borderRadius: "999px",
    color: "#fff",
  };

  const r = (rarity || "").toLowerCase();

  if (r.includes("common")) return { ...baseStyle, background: "#e0e0e0", color: "#000", className: "" };
  if (r.includes("uncommon")) return { ...baseStyle, background: "#4caf50", className: "" };
  if (r === "rare") return { ...baseStyle, background: "#1976d2", className: "" };
  if (r.includes("promo")) return { ...baseStyle, background: "#607d8b", className: "card-glow" };
  if (r.includes("legend")) return { ...baseStyle, background: "#9c27b0", className: "card-purple-glow" };
  if (r.includes("ultra rare")) return { ...baseStyle, background: "#000", className: "card-rainbow-border" };
  if (r.includes("rare holo vstar")) return { ...baseStyle, background: "#e91e63", className: "card-glow" };
  if (r.includes("rare holo vmax")) return { ...baseStyle, background: "#c2185b", className: "card-glow" };
  if (r.includes("rare holo v")) return { ...baseStyle, background: "#7b1fa2", className: "card-glow" };
  if (r.includes("rare holo ex")) return { ...baseStyle, background: "#8e24aa", className: "card-purple-glow" };
  if (r.includes("rare holo gx")) return { ...baseStyle, background: "#6a1b9a", className: "card-purple-glow" };
  if (r.includes("rare holo lv.x")) return { ...baseStyle, background: "#4527a0", className: "card-purple-glow" };
  if (r.includes("rare holo")) return { ...baseStyle, background: "#f50057", className: "card-glow" };
  if (r.includes("rare ace")) return { ...baseStyle, background: "#795548", className: "card-glow" };
  if (r.includes("rare prism star")) return { ...baseStyle, background: "#3f51b5", className: "card-pulse-glow" };
  if (r.includes("rare secret")) return { ...baseStyle, background: "#ffd600", className: "card-pulse-glow" };
  if (r.includes("rare rainbow")) return { ...baseStyle, background: "#00bcd4", className: "card-rainbow-border" };
  if (r.includes("rare shining")) return { ...baseStyle, background: "#ffc107", className: "card-pulse-glow" };
  if (r.includes("shiny ultra rare")) return { ...baseStyle, background: "#ff9800", className: "card-rainbow-border" };
  if (r.includes("shiny rare")) return { ...baseStyle, background: "#ff5722", className: "card-glow" };
  if (r.includes("rare shiny gx")) return { ...baseStyle, background: "#ef5350", className: "card-glow" };
  if (r.includes("amazing rare")) return { ...baseStyle, background: "#00acc1", className: "card-rainbow-border" };
  if (r.includes("radiant rare")) return { ...baseStyle, background: "#d32f2f", className: "card-pulse-glow" };
  if (r.includes("illustration rare")) return { ...baseStyle, background: "#fbc02d", className: "card-glow" };
  if (r.includes("special illustration rare")) return { ...baseStyle, background: "#ff7043", className: "card-glow" };
  if (r.includes("double rare")) return { ...baseStyle, background: "#009688", className: "card-glow" };
  if (r.includes("rare break")) return { ...baseStyle, background: "#f57c00", className: "card-pulse-glow" };
  if (r.includes("trainer gallery")) return { ...baseStyle, background: "#607d8b", className: "card-glow" };
  if (r.includes("classic collection")) return { ...baseStyle, background: "#3e2723", className: "card-glow" };
  if (r.includes("rare prime")) return { ...baseStyle, background: "#303f9f", className: "card-glow" };

  return { ...baseStyle, background: "#ccc", color: "#000", className: "" };
};
