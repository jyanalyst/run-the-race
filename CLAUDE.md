# CLAUDE.md

Guidance for future Claude sessions working in this repo.

## What this is

A single-evening event app for **NCC Care Group's "Run the Race" relay** (May 1, 2026, 100PLUS Promenade, Kallang). Families register on their phones, run a 4-station scavenger hunt with quizzes, and at the end get assigned to one of four teams (Eagles, Lions, Bears, Hawks) for a final relay race.

Live URL: **https://run-the-race-chi.vercel.app/**

## Station structure

The 4 quiz stations carry a thematic arc mirroring the medal card given out at the end:

| # | Gate | Theme | Activity |
|---|---|---|---|
| 1 | 20 | Loved, not earned | Take a sticker, wear it the rest of the evening |
| 2 | 17 | Look up (Titus 2:13) | Point at a balloon hanging high, recite the verse |
| 3 | 16 | A Person, not an Event | Family circle — name each face |
| 4 | 19 | Endurance (Heb 12:1) | Walk three laps around cones with call-and-response |
| 5 | 18 | Final relay | Zig-zag bean bag relay, 2 lanes, bracket format |

**Self-serve design — no per-station volunteers.** Each station has a printed A4 card mirroring the in-app instructions, plus at most one passive prop (sticker basket, balloon, cones). Parents lead their kids through. The activity definitions live in `STATION_TASKS` and `STATION_LOCATIONS` at the top of [src/App.js](src/App.js). Audience floor for content: 5 years old — activities are physical/sensory, not reading-heavy.

**Semi-final pairings are fixed:** Eagles vs Lions, Bears vs Hawks. Hardcoded in the app's Teams tab so teams know their opponent in advance.

## Stack

- **Frontend:** React 18 (Create React App), single file [src/App.js](src/App.js). All five screens (`home`, `register`, `race`, `leaderboard`, `admin`) live there as nested function components driven by a `screen` state variable. No router.
- **Backend:** Vercel serverless functions in [api/](api/). Four endpoints — `family`, `leaderboard`, `admin`, `teams`.
- **Storage:** Upstash Redis (`@upstash/redis`, `Redis.fromEnv()`). Keys: `family:<lowercase-hyphenated-name>` for each family, `teams` for the formed-team roster.
- **Hosting:** Vercel. Auto-deploys from `main`. Routing via [vercel.json](vercel.json) (rewrites `/api/*` to functions, everything else to `/index.html`).

## Environment variables

- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` — set on Vercel for prod. Not in any local `.env`.
- `ADMIN_PASSWORD` — set on Vercel; defaults to `"rtr2025"` in code if unset. **The current production value is different from the default** (the user has changed it). Ask before assuming.

## Local development

There is no local Redis. Three options to run locally:

1. **Bundle check only** — `npm install && npm run build`, then grep `build/static/js/*.js` for whatever string proves your change shipped. Fastest verification, no backend needed.
2. **Frontend with proxy to live backend** — temporarily add `"proxy": "https://run-the-race-chi.vercel.app"` to [package.json](package.json), run `npm start`. Lets you see UI changes without setting up Upstash. **Revert the proxy line before committing.** Test data hits production Redis.
3. **Full local stack** — `npx vercel dev`. Needs Vercel CLI and Upstash credentials in `.env.local`. Heaviest setup; only worth it for backend changes.

## Team formation algorithm

[api/teams.js](api/teams.js) — **Strategy B: race-time balancing**.

Each member has a leg time:
- Adult: 1 unit
- Kid age N: `max(1, 13 - N)` (so age 12 ≈ adult, age 4 takes 9 units)

Family time = sum of member leg times. Algorithm:
1. Filter to relay-flagged members. Drop families with zero relay members.
2. Sort families by familyTime **descending**, with name as a stable tiebreaker (so repeated runs are deterministic — `redis.keys()` returns in undefined order).
3. Greedy fill: each family goes to the team with the lowest current `totalTime`.

**Hard constraint:** families always stay together — never split across teams. This is a UX call, not a perf one.

**Visual fairness signal:** all four teams' total race times should come out within ~2 units of each other regardless of size. The Teams tab in [src/App.js](src/App.js) shows the per-team RACE TIME number explicitly so participants can verify at a glance.

The constants `KID_AGE_CUTOFF = 12`, `KID_TIME_OFFSET = 13`, and `TEAM_COUNT = 4` are at the top of [api/teams.js](api/teams.js). The mirroring `teamRaceTime()` helper in [src/App.js](src/App.js) must stay in sync.

## Family lifecycle

- `GET /api/family?name=X` creates a family record on first hit (with empty members + a 4-station shuffled `stationOrder`). Idempotent on repeat.
- `POST /api/family` with `{name, updates}` shallow-merges updates onto the family record. **Does not deep-merge** — passing `{members: [...]}` replaces the whole array.
- `App.handleRegister` in [src/App.js](src/App.js) is careful not to call `updateFamily` for a returning family (would clobber their member list).

## Browser persistence

`localStorage["rtr.familyName"]` — set after a successful register or auto-restore. On app mount, the `App` component reads it and routes the user directly to their race screen if they have a family with members on the server. The race-screen Exit button (with confirmation) clears it.

## Helper scripts

[scripts/](scripts/) contains throwaway Node scripts used during development:
- `seed-test-families.js` — registers 20 test families with mixed compositions.
- `preview-handicap.js`, `preview-per-member.js`, `preview-strategies.js` — preview team-formation algorithms locally before committing changes to the live one.

These are not deployed and not tracked in `.gitignore` either way; they're useful but not load-bearing.

## Conventions / gotchas

- **No router.** All navigation goes through `setScreen(...)`. Don't reach for `react-router` for what's currently a 5-screen state machine.
- **No build step besides CRA.** No TypeScript, no test suite. Verifications happen by running the dev server or by grepping the production bundle.
- **No `.env` in repo.** Never commit one.
- **Family cohesion** in team formation is non-negotiable. Don't propose algorithms that split families to improve balance.
- **Admin actions are one-key auth** — just the `x-admin-password` header. No sessions, no JWTs. Don't build that out unless the user asks.
- **The `legTime` formula in [api/teams.js](api/teams.js) and `teamRaceTime` in [src/App.js](src/App.js) must match.** If you change one, change the other in the same commit.
