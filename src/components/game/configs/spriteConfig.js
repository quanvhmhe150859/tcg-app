import { rawConfigs } from "../constants/sprites.js";

// Define the BACKEND_URL and base folder logic
const USE_LOCAL_SPRITES = import.meta.env.VITE_USE_LOCAL_SPRITES === "true";
const BASE_SPRITE_PATH = "/sprites/kgc/";
const BACKEND_URL = import.meta.env.VITE_API_BASE_URL;
const getSpriteFolder = (key, type) => {
  // Check if the public sprites folder exists; if not, fallback to BACKEND_URL
  // This is a simplified check; you might need a more robust check depending on your environment
  const basePath = USE_LOCAL_SPRITES
    ? BASE_SPRITE_PATH
    : `${BACKEND_URL}/sprites/kgc/`;
  return `${basePath}${key}/${type}/`;
};

export const ANIMATION_CONFIGS = Object.fromEntries(
  Object.entries(rawConfigs).map(([key, config]) => [
    key,
    {
      ...config,
      layers: [
        {
          name: "player",
          folder: getSpriteFolder(key, "player"),
          ...config.layers.player,
        },
        {
          name: "slash",
          folder: getSpriteFolder(key, "slash"),
          ...config.layers.slash,
        },
      ],
    },
  ])
);

export const ANIMATION_SELECT_CHARACTER_CONFIGS = Object.fromEntries(
  Object.entries(rawConfigs).map(([key, config]) => [
    key,
    {
      ...config,
      layers: [
        {
          name: "front",
          folder: getSpriteFolder(key, "front"),
          ...config.layers.front,
        },
      ],
    },
  ])
);
