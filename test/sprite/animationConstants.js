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
        moving: false,
        movingFrameCount: 5, // Number of moving frames (1-5)
        moveStopDistance: 250, // Stop after moving 100 pixels, adjusting moving speed accordingly
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
        flip: false, // Faces right, moves left
        moving: false,
        stopMovingAtFrame: 3, // Stop moving at frame 3
      },
      {
        name: "slash",
        folder: "/sprites/bardrey/slash/",
        frameCount: 8,
        speed: 120,
        delay: 480,
        flip: false, // Faces right, moves left
        moving: true,
        movingFrameCount: 5, // Number of moving frames (1-5)
        moveStopDistance: 250, // Stop after moving 100 pixels, adjusting moving speed accordingly
      },
    ],
  },
};

{/* <div className="flex justify-between items-center gap-4">
        <MultiSpriteAnimation name="agathe" />
        <MultiSpriteAnimation name="bardrey" />
      </div> 
      
      moveStopDistance: 435, 768px
      moveStopDistance: 690, 1024px
      */}