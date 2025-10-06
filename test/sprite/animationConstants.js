export const ANIMATION_CONFIGS = {
  "agathe": {
    width: 128,
    height: 128,
    layers: [
      {
        name: "player",
        folder: "/sprites/agathe/player/",
        frameCount: 3,
        speed: 240,
        delay: 0,
        flip: true,
        moving: false,
      },
      {
        name: "slash",
        folder: "/sprites/agathe/slash/",
        frameCount: 4,
        speed: 120,
        delay: 480,
        flip: true,
        moving: true,
        stopMovingAtFrame: 3, // Stop moving at frame 3 (index 2)
      },
    ],
  },
  "bardrey": {
    width: 128,
    height: 128,
    layers: [
      {
        name: "player",
        folder: "/sprites/bardrey/player/",
        frameCount: 3,
        speed: 240,
        delay: 0,
        flip: true,
        moving: false,
      },
      {
        name: "slash",
        folder: "/sprites/bardrey/slash/",
        frameCount: 8,
        speed: 120,
        delay: 480,
        flip: true,
        moving: true,
        stopMovingAtFrame: 4, // Stop moving at frame 3 (index 2)
      },
    ],
  },
};