# Froggy Crosser

A portrait React Native game built on the supplied Expo SDK 57 template for the STiMP midterm project.

## Run

Use Node.js 22.13+ (Node 24 recommended; the tests use native TypeScript support).

```sh
npm install
npm start
```

Open with an SDK 57-compatible Expo Go client or a development build. For the browser preview, run `npm run web`. If adding native libraries later, rebuild the development client. All gameplay assets are local, so an installed build does not need internet access to play.

## How to play

Enter a username (no password). Select **Play Game**, read the instructions, then choose **OK**. Swipe anywhere on the board to hop one cell up, down, left, or right. The arrow buttons provide an alternative; the web preview also accepts arrow keys or WASD.

- Each round lasts **90 seconds** of active play.
- Cross three road lanes: a medium-speed blue car, a slow delivery truck, and a fast red racing car.
- Rest on the central grass strip. Cross three river lanes by riding the moving logs.
- Reach any part of the far bank to save one frog and earn **100 points**.
- Bonus gifts appear in a random far-bank cell for **7 seconds**, starting after 4 seconds and then every 12 seconds. Cross at their location for **25 extra points**.
- Traffic, water, or drifting off a river edge returns the frog to the starting bank. The score is retained, the timer continues, and retries are unlimited.
- Pause freezes traffic and time. Backgrounding the app also pauses it; resume explicitly when ready. Leaving an unfinished round does not save its score.

## Assignment coverage

| Requirement | Implementation |
| --- | --- |
| Login and remembered user | `src/app/login.tsx`, `src/state/player-context.tsx` |
| Main menu, username drawer, high scores, logout | `src/app/(menu)/` |
| Instructions before play | Pixel-styled modal on Android, iOS, and web |
| Portrait play and four-way swipes | `app.json`, `src/app/game.tsx` |
| Three vehicle types and moving river logs | `src/game/engine.ts` |
| Timer, crossings, result navigation | `src/app/game.tsx` |
| Gift bonus | Random timed pickup on the far bank |
| Animation | Continuous traffic/log movement, frog hop scale, floating mascot, screen fades |
| Results, three actions, all six titles | `src/app/result.tsx` |
| Per-player best and top three ranking | `src/game/scores.ts`, `src/app/(menu)/high-scores.tsx` |

Results use the assignment titles exactly: 0 = Unlucky Amphibian, 1 = Daring Tadpole, 2 = Pond Explorer, 3 = Agile Hopper, 4 = Highway Navigator, 5 or more = Apex Amphibian.

## Storage and structure

AsyncStorage is the React Native local key/value persistence equivalent used in Week 5. `@froggy/username` holds the active username; `@froggy/scores-v1` holds JSON records. All players' personal bests are retained; only the top three are displayed. Usernames are trimmed and matched without case sensitivity. A lower or tied score never replaces a personal best. Tied leaderboard scores use the earlier achievement date, then username. Logging out removes only the active username, preserving high scores. This is the assignment's local username flow, not server authentication.

Routes live exclusively in `src/app/`. Shared UI, state, game rules, and score logic live outside the route directory. The pure game engine uses cell coordinates and simulation substeps, so collision behavior is independent of screen size and resilient to slow frames. Rendering is limited to 30 updates per second. Focus cleanup stops the loop and removes input listeners.

## Checks

```sh
npm run lint
npm run typecheck
npm test
npx expo export --platform all
```

Tests cover movement bounds, every vehicle type, log drift, drowning, edge resets, crossing and bonus scores, bonus expiration, timer completion, titles, high-score replacement, ranking, storage validation, and frame-rate independence.

For the device demo, verify four-way touch swipes, Android back/pause, background/resume, portrait orientation, a complete timed round, login persistence after restarting, and top-three rankings across several usernames. Browser validation and bundle export do not replace a physical Android/iOS test.

## Artwork and credits

Game artwork comes from the supplied frog and city packs:

- `frog_spritesheets.zip`: green frog idle/hop frames in four directions, green/blue/brown ranking portraits, and the app icon. The supplied guide documents the animation rows and columns. No creator or license text was included in this archive.
- `CP_V1.1.0_nyknck.zip`: nyknck city pack. Vehicles, road/grass/water tiles, shoreline, shop, trees, and gift pickup come from `CP_V1.0.4.png`. Floating timber uses its wooden cargo texture. No license text was included in this archive.

The UI uses the supplied Kenney Pixel UI Pack, cropped Noun Project icons by Mikkel Mikkelsen, and the bundled VT323 font. Licenses and attribution are included in `assets/game/CREDITS.md` and the asset directories.

Original sheets are retained in `assets/packs/`. Runtime PNG regions are in `assets/game/pixel/`, with source coordinates in `assets/packs/regions.json`. Regions are cropped and scaled using nearest-neighbor sampling; the hero scene composes only these pack assets. Rank numbers and interface text are native UI. Credits also live in `assets/game/CREDITS.md`.

The optional fly bonus has become a gift pickup to use an actual supplied sprite. It still gives 25 points and uses the same timing. Internal `fly`/`flies` storage fields remain compatible with previously saved scores.

## Submission note

The PDF requests a ZIP named `FroggyCrosser_NRP1_NRP2.zip` containing assets and app code. This template uses `src/app/` plus sibling components, constants, game, and state folders: preserve **all of `src/`**, `assets/`, `package.json`, `package-lock.json`, `app.json`, and `tsconfig.json` for a runnable copy. Do not submit only `src/app/` without its imports. Confirm how the lecturer wants this template structure packaged before preparing the final ZIP. No ZIP or ULS upload is performed automatically.
