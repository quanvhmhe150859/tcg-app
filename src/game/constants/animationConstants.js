const rawConfigs = {
  "agathe": {
    width: 128,
    height: 128,
    layers: {
      player: {
        frameCount: 3,
        speed: 240,
        delay: 0,
        flip: true,
        moving: false,
      },
      front: {
        frameCount: 5,
        speed: 240,
      },
      slash: {
        frameCount: 4,
        speed: 120,
        delay: 480,
        flip: true,
        moving: false,
        movingFrameCount: 5,
        moveStopDistance: 250,
      },
    },
  },
  "bardrey": {
    width: 128,
    height: 128,
    layers: {
      player: {
        frameCount: 3,
        speed: 240,
        delay: 0,
        flip: true,
        moving: false,
        stopMovingAtFrame: 3,
      },
      front: {
        frameCount: 5,
        speed: 240,
      },
      slash: {
        frameCount: 8,
        speed: 120,
        delay: 180,
        flip: false,
        moving: true,
        movingFrameCount: 5,
        moveStopDistance: 250,
      },
    },
  },
  "alberon": {
    width: 128,
    height: 128,
    layers: {
      player: {
        frameCount: 3,
        speed: 240,
        delay: 0,
        flip: true,
        moving: false,
        stopMovingAtFrame: 3,
      },
      front: {
        frameCount: 5,
        speed: 240,
      },
      slash: {
        frameCount: 5,
        speed: 120,
        delay: 180,
        flip: false,
        moving: true,
        movingFrameCount: 1,
        moveStopDistance: 250,
      },
    },
  },
  "alberon/holy_king": {
    width: 128,
    height: 128,
    layers: {
      player: {
        frameCount: 3,
        speed: 240,
        delay: 0,
        flip: true,
        moving: false,
        stopMovingAtFrame: 3,
      },
      front: {
        frameCount: 5,
        speed: 240,
      },
      slash: {
        frameCount: 7,
        speed: 120,
        delay: 180,
        flip: false,
        moving: true,
        movingFrameCount: 1,
        moveStopDistance: 250,
      },
    },
  },
  "esthea": {
    width: 128,
    height: 128,
    layers: {
      player: {
        frameCount: 3,
        speed: 240,
        delay: 0,
        flip: true,
        moving: false,
        stopMovingAtFrame: 3,
      },
      front: {
        frameCount: 5,
        speed: 240,
      },
      slash: {
        frameCount: 10,
        speed: 120,
        delay: 180,
        flip: false,
        moving: true,
        movingFrameCount: 4,
        moveStopDistance: 250,
      },
    },
  },
  "gidnil": {
    width: 128,
    height: 128,
    layers: {
      player: {
        frameCount: 3,
        speed: 240,
        delay: 0,
        flip: true,
        moving: false,
        stopMovingAtFrame: 3,
      },
      front: {
        frameCount: 6,
        speed: 240,
      },
      slash: {
        frameCount: 4,
        speed: 120,
        delay: 480,
        flip: false,
        moving: false,
        movingFrameCount: 4,
        moveStopDistance: 250,
      },
    },
  },
  "haerang": {
    width: 128,
    height: 128,
    layers: {
      player: {
        frameCount: 3,
        speed: 240,
        delay: 0,
        flip: true,
        moving: false,
        stopMovingAtFrame: 3,
      },
      front: {
        frameCount: 5,
        speed: 240,
      },
      slash: {
        frameCount: 7,
        speed: 120,
        delay: 180,
        flip: false,
        moving: true,
        movingFrameCount: 1,
        moveStopDistance: 250,
      },
    },
  },
  "hansi": {
    width: 128,
    height: 128,
    layers: {
      player: {
        frameCount: 4,
        speed: 180,
        delay: 0,
        flip: true,
        moving: false,
        stopMovingAtFrame: 3,
      },
      front: {
        frameCount: 5,
        speed: 180,
      },
      slash: {
        frameCount: 8,
        speed: 120,
        delay: 480,
        flip: false,
        moving: true,
        movingFrameCount: 3,
        moveStopDistance: 250,
      },
    },
  },
  "ian": {
    width: 128,
    height: 128,
    layers: {
      player: {
        frameCount: 4,
        speed: 240,
        delay: 0,
        flip: true,
        moving: false,
      },
      front: {
        frameCount: 7,
        speed: 240,
      },
      slash: {
        frameCount: 4,
        speed: 120,
        delay: 480,
        flip: true,
        moving: false,
        movingFrameCount: 5,
        moveStopDistance: 250,
      },
    },
  },
};

export const ANIMATION_CONFIGS = Object.fromEntries(
  Object.entries(rawConfigs).map(([key, config]) => [
    key,
    {
      ...config,
      layers: [
        {
          name: "player",
          folder: `/sprites/${key}/player/`,
          ...config.layers.player,
        },
        {
          name: "slash",
          folder: `/sprites/${key}/slash/`,
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
          folder: `/sprites/${key}/front/`,
          ...config.layers.front,
        },
      ],
    },
  ])
);

// const BACKEND_URL = import.meta.env.VITE_API_BASE_URL

// export const ANIMATION_CONFIGS = Object.fromEntries(
//   Object.entries(rawConfigs).map(([key, config]) => [
//     key,
//     {
//       ...config,
//       layers: [
//         {
//           name: "player",
//           folder: `${BACKEND_URL}/sprites/${key}/player/`,
//           ...config.layers.player,
//         },
//         {
//           name: "slash",
//           folder: `${BACKEND_URL}/sprites/${key}/slash/`,
//           ...config.layers.slash,
//         },
//       ],
//     },
//   ])
// );

// export const ANIMATION_SELECT_CHARACTER_CONFIGS = Object.fromEntries(
//   Object.entries(rawConfigs).map(([key, config]) => [
//     key,
//     {
//       ...config,
//       layers: [
//         {
//           name: "front",
//           folder: `${BACKEND_URL}/sprites/${key}/front/`,
//           ...config.layers.front,
//         },
//       ],
//     },
//   ])
// );