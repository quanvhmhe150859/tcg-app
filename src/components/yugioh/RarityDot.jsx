import React from "react";

function getRarityColorStyle(setRarity, setRarityCode) {
  const rarity = setRarity?.toLowerCase() ?? "";
  const hasCode = !!setRarityCode?.trim();

  if (!setRarity && !setRarityCode) {
    return { backgroundColor: "purple" };
  }

  if (rarity === "common") {
    return { backgroundColor: "white", border: "1px solid #ccc" };
  }

  if (rarity.startsWith("super")) {
    return { backgroundColor: "orange" };
  }

  if (rarity.startsWith("ultra") || rarity.startsWith("ultimate")) {
    return { backgroundColor: "red" };
  }

  if (hasCode) {
    return { backgroundColor: "blue" };
  }

  return { backgroundColor: "purple" };
}

const RarityDot = ({ rarity, code, size = 10 }) => {
  const style = {
  display: "inline-block",
  width: size,
  height: size,
  borderRadius: "50%",
  margin: "0 6px",
  verticalAlign: "middle",
  ...getRarityColorStyle(rarity, code),
};


  return <span style={style} title={rarity || "Unknown rarity"} />;
};

export default RarityDot;
