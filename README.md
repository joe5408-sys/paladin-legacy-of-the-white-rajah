# Paladin: Legacy of the White Rajah

A small HD-2D browser RPG set in a fictional alternate-history Sarawak.

**Play: https://legacyofwhiterajah.netlify.app**: Chapter 0 (The Forgotten Heir), complete, and the opening of Chapter 1 (The Capital's Shadow).

## Run
```bash
npm install
npm run dev        # dev server at http://localhost:5173
npm test           # unit tests
npm run build      # production build into dist/
npm run preview    # serve the production build
npm run e2e        # build + Playwright browser tests (uses your installed Microsoft Edge)
```

**Controls:** Esc opens the pause menu (Resume, Save, Settings, Main Menu) · WASD or arrow keys to move · E to interact · E / Enter / Space to advance dialogue · in battle, ↑/↓ (or W/S) to pick a command and E / Enter / Space to confirm (mouse also works).

**Phones and tablets:** play with the phone held sideways (a phone held upright shows a "turn sideways" notice, with "Play anyway"). Drag the on-screen pad to walk, tap the round button (or the prompt) to interact, tap the dialogue box to go on, tap replies, menu items and battle commands, and use **☰ Menu** to pause. On Android, **Full Screen** on the title menu hides the browser bars; adding the game to the home screen also opens it full screen in landscape.

## Docs
- `docs/MASTER_PROMPT.md`: full project spec (authoritative)
- `docs/PROGRESS.md`: current phase, features, test status
- `docs/SESSION_HANDOFF.md`: last session and next exact task
- `docs/ROADMAP.md`, `docs/ARCHITECTURE.md`, `docs/GAME_DESIGN.md`, `docs/ASSET_REGISTER.md`

## Deploy (Netlify)
Everything Netlify needs is in `netlify.toml` (build `npm run build`, publish `dist`, Node 22).
1. Push this repository to GitHub.
2. In Netlify: **Add new site → Import an existing project → GitHub**, pick the repo. The build settings are read from `netlify.toml`.
3. After the first deploy, open the site and play the prologue end to end, including Save → refresh → Continue.

To test the production build locally first:
```bash
npm run build
npm run preview    # http://localhost:4173
```

Saves and settings live in the browser's localStorage (`paladin.save`, `paladin.settings`).
