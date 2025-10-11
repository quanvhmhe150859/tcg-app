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
        flip: false,
        moving: false,
        stopMovingAtFrame: 3,
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
        flip: false,
        moving: false,
        stopMovingAtFrame: 3,
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
  "esthea": {
    width: 128,
    height: 128,
    layers: {
      player: {
        frameCount: 3,
        speed: 240,
        delay: 0,
        flip: false,
        moving: false,
        stopMovingAtFrame: 3,
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