# Paladin: Legacy of the White Rajah

A small HD-2D browser RPG set in a fictional alternate-history Sarawak. The current goal is a 5–10 minute playable prologue.

## Run
```bash
npm install
npm run dev        # dev server at http://localhost:5173
npm test           # unit tests
npm run build      # production build into dist/
npm run preview    # serve the production build
```

**Controls:** WASD or arrow keys to move · E to interact · E / Enter / Space to advance dialogue · in battle, ↑/↓ (or W/S) to pick a command and E / Enter / Space to confirm (mouse also works).

## Docs
- `docs/MASTER_PROMPT.md`: full project spec (authoritative)
- `docs/PROGRESS.md`: current phase, features, test status
- `docs/SESSION_HANDOFF.md`: last session and next exact task
- `docs/ROADMAP.md`, `docs/ARCHITECTURE.md`, `docs/GAME_DESIGN.md`, `docs/ASSET_REGISTER.md`

## Deploy
Netlify: build command `npm run build`, publish directory `dist` (see `netlify.toml`).
