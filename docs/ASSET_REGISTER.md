# Asset Register

Every asset in the game must be original, properly licensed, or explicitly authorised by the project owner. Record each one here.

| Asset | Type | Source | Author | License | Notes |
|---|---|---|---|---|---|
| Adrian Vale placeholder sprite sheet | Pixel art (generated at runtime) | `src/game/player/pixelSprite.ts` | Original, project code | Project-owned | 16×24 frames, 4×4 sheet |
| Uncle Lim placeholder sprite sheet | Pixel art (generated at runtime) | `pixelSprite.ts` + palette in `src/data/characters.ts` | Original, project code | Project-owned | Same frame layout as hero |
| Aunt Mara placeholder sprite sheet | Pixel art (generated at runtime) | `pixelSprite.ts` + `characters.ts` | Original, project code | Project-owned | Bun and long-skirt features |
| Paladin sign (sword over river) | Pixel-art symbol (generated at runtime) | `src/game/scenes/insignia.ts` | Original design | Project-owned | Fictional order; deliberately not based on any real religious or royal emblem |
| Family portrait | Pixel art (generated at runtime) | `FamilyHome.tsx` | Original, project code | Project-owned | |
| Home interior and chamber geometry | Procedural low-poly | `FamilyHome.tsx`, `AncientChamber.tsx` | Original, project code | Project-owned | |
| Adrian battle poses with blade of light | Pixel art (generated at runtime, 40×32 ×4) | `src/game/combat/heroBattleSprite.ts` | Original, project code | Project-owned | Ready / wind-up / strike |
| Covenant Guardian battle sprite | Pixel art (generated at runtime, 32×40) | `src/game/combat/guardianSprite.ts` | Original design | Project-owned | |
| Daniel Rengas placeholder sprite sheet | Pixel art (generated at runtime) | `pixelSprite.ts` + `characters.ts` | Original, project code | Project-owned | |
| Chamber inscription script | Abstract pixel glyphs (generated at runtime) | `AncientChamber.tsx` | Original | Project-owned | Not a real writing system |
| All music, ambience and sound effects | Synthesized at runtime (Web Audio oscillators and noise) | `src/game/audio/audio.ts` | Original, project code | Project-owned | No audio files are bundled |
| Favicon | SVG | `public/favicon.svg` | Original | Project-owned | Simplified Paladin sign |
| Title screen backdrop | CSS gradients | `src/styles/global.css` | Original | Project-owned | |
| Kak Jamilah placeholder sprite sheet | Pixel art (generated at runtime) | `pixelSprite.ts` + `characters.ts` | Original, project code | Project-owned | Headscarf and long skirt via palette and features |
| Kuching waterfront (shophouses, Archives, Palace, fort, stall, bandstand, pier, boat) | Procedural low-poly | `src/chapters/chapter1/Waterfront.tsx` | Original, project code | Project-owned | Fictional, alternate-history versions of recognisable waterfront features |
| The Archivist placeholder sprite sheet | Pixel art (generated at runtime) | `pixelSprite.ts` + `characters.ts` | Original, project code | Project-owned | Glasses, bun, long skirt |
| Royal Archives interior (bookcases, desk, iron door, light shafts) | Procedural low-poly | `src/chapters/chapter1/Archives.tsx` | Original, project code | Project-owned | |
| Dialogue text | Writing | `src/data/dialogue.ts` | Original | Project-owned | |
| Village buildings, props, terrain | Procedural low-poly geometry | `src/game/scenes/environment.tsx` | Original, project code | Project-owned | Three.js primitives only |
| UI font | System monospace (`Courier New` / `ui-monospace`) | User's OS | — | System font, not bundled | Replace with a licensed pixel font later |

**Third-party code libraries** (MIT unless noted): react, react-dom, three, @react-three/fiber, @react-three/drei, zustand, vite, vitest, typescript.

No third-party art, audio or fonts are bundled.
