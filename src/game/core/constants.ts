/** Shared tuning values. Change these rather than hunting for magic numbers. */

/** Pixel-art reference grid (16:9). Sprites and UI are designed against it. */
export const REFERENCE_WIDTH = 320;
export const REFERENCE_HEIGHT = 180;

/** World units are metres-ish. One tile = 1 unit. */
export const PLAYER_SPEED = 3.2; // units per second
export const PLAYER_RADIUS = 0.3; // collision circle radius

/** Camera: fixed elevated orthographic view. */
export const CAMERA_PITCH_DEG = 42; // downward tilt
export const CAMERA_DISTANCE = 20; // distance from the look-at target
export const CAMERA_VIEW_HEIGHT = 11; // world units visible vertically
export const CAMERA_FOLLOW_SHARPNESS = 6; // higher = snappier follow

/** Sprites: 16x24 pixel frames rendered 1 unit wide. */
export const SPRITE_FRAME_W = 16;
export const SPRITE_FRAME_H = 24;
export const SPRITE_WORLD_WIDTH = 1.0;
export const WALK_FPS = 8;
export const IDLE_FPS = 2;
