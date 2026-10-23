# Asset Register

Every asset in the game must be original, properly licensed, or explicitly authorised by the project owner. Record each one here.

| Asset | Type | Source | Author | License | Notes |
|---|---|---|---|---|---|
| Adrian Vale placeholder sprite sheet | Pixel art (generated at runtime) | `src/game/player/pixelSprite.ts` | Original, project code | Project-owned | 16×24 frames, 4×4 sheet |
| Village buildings, props, terrain | Procedural low-poly geometry | `src/game/scenes/environment.tsx` | Original, project code | Project-owned | Three.js primitives only |
| UI font | System monospace (`Courier New` / `ui-monospace`) | User's OS | — | System font, not bundled | Replace with a licensed pixel font later |

**Third-party code libraries** (MIT unless noted): react, react-dom, three, @react-three/fiber, @react-three/drei, zustand, vite, vitest, typescript.

No third-party art, audio or fonts are bundled yet.
