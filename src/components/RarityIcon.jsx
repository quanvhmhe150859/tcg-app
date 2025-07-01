import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

const rarityConfig = {
  common: {
    color: "#999",
    icon: (
      <svg width="16" height="16" fill="#999" viewBox="0 0 16 16">
        <circle cx="8" cy="8" r="5" />
      </svg>
    ),
    tooltip: "Thẻ phổ biến, dễ tìm thấy.",
  },
  uncommon: {
    color: "#4caf50",
    icon: (
      <svg width="16" height="16" fill="#4caf50" viewBox="0 0 16 16">
        <polygon points="8,2 14,8 8,14 2,8" />
      </svg>
    ),
    tooltip: "Thẻ hiếm hơn Common, có kỹ năng tốt hơn.",
  },
  rare: {
    color: "#1976d2",
    icon: (
      <svg width="16" height="16" fill="#1976d2" viewBox="0 0 24 24">
        <path d="M12 17.27L18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 7.45 13.97 5.82 21z" />
      </svg>
    ),
    tooltip: "Thẻ khó kiếm, thường có giá trị cao hơn.",
  },
  ultra: {
    color: "#f50057",
    icon: (
      <svg width="16" height="16" fill="url(#ultraGradient)" viewBox="0 0 24 24">
        <defs>
          <linearGradient id="ultraGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f50057" />
            <stop offset="100%" stopColor="#ff9800" />
          </linearGradient>
        </defs>
        <path d="M12 2L15 8l6 .5-4.5 4 1.5 6L12 15l-6 3.5 1.5-6L3 8.5 9 8z" />
      </svg>
    ),
    tooltip: "Thẻ siêu hiếm, thường có hiệu ứng đặc biệt hoặc hologram.",
  },
  unknown: {
    color: "#ccc",
    icon: (
      <svg width="16" height="16" fill="#ccc" viewBox="0 0 16 16">
        <text x="2" y="12" fontSize="12">?</text>
      </svg>
    ),
    tooltip: "Độ hiếm không xác định.",
  },
};

const RarityIcon = ({ rarity }) => {
  const r = (rarity || "").toLowerCase();
  const config =
    r.includes("ultra") || r.includes("holo")
      ? rarityConfig.ultra
      : rarityConfig[r] || rarityConfig.unknown;

  return (
    <span data-tooltip-id={`rarity-${rarity}`} style={{ marginRight: "4px", verticalAlign: "middle" }}>
      {config.icon}
      <Tooltip id={`rarity-${rarity}`} content={config.tooltip} place="top" />
    </span>
  );
};

export default RarityIcon;
