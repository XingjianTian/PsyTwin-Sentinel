# Demo Pet Live Sync Implementation Plan

**Goal:** Make the `stu-test` pet page observe the Pocket local server's fixed `demo_pet` state and render Pocket's pet and scene assets in real time.

**Architecture:** Keep the existing database snapshot as the page fallback. Add a tested Pocket-status adapter plus a client WebSocket hook, then merge valid `pet_status` fields into the `stu-test` presentation without persisting them to Sentinel.

**Tech Stack:** Next.js 16, React 19, TypeScript, browser WebSocket, Node test runner through `tsx`, Tailwind CSS 4.

## Global Constraints

- Do not modify Pocket or Unity protocol behavior.
- Do not commit, push, or create a branch without user confirmation.
- Do not kill Node processes; release only a specific port with `npx kill-port <port>` if required.
- Preserve the existing student page URL, navigation, database fallback, and read-only semantics.
- Fixed demo mapping applies only to Sentinel student id `stu-test` and Pocket user id `demo_pet`.

### Task 1: Tested Pocket status adapter

**Files:**
- Create: `lib/pet-live-sync.ts`
- Create: `lib/pet-live-sync.test.ts`

- [x] Write failing tests for message parsing, `social` to `sociability`, clamping, partial invalid fields, version ordering, scene labels, and fallback background.
- [x] Run `npx tsx --test lib/pet-live-sync.test.ts` and confirm the tests fail because the module does not exist.
- [x] Implement the minimal types and pure functions required by the tests.
- [x] Re-run the focused test and confirm it passes.

### Task 2: WebSocket lifecycle hook

**Files:**
- Create: `hooks/use-pet-live-sync.ts`
- Modify: `.env.example`

- [x] Implement a disabled-by-default hook interface that accepts `enabled` and `userId`.
- [x] Build the WebSocket URL with `userId=demo_pet` and `clientType=sentinel`.
- [x] Apply valid `pet_status` messages through the tested adapter.
- [x] Add heartbeat, bounded exponential reconnect, connection status, last-update time, and full cleanup.
- [x] Document `NEXT_PUBLIC_PET_SYNC_WS_URL`, defaulting to `ws://127.0.0.1:13002/ws/pet`.
- [x] Run the adapter test and ESLint on both new files.

### Task 3: Pocket visual assets

**Files:**
- Create: `public/pet/pocket-live/frames/*.png`
- Create: `public/pet/pocket-live/scenes/*.png`

- [x] Copy the exact 45 frame paths listed in Pocket's `PET_ANIMATION_FRAMES`.
- [x] Copy Pocket's exact `static/scenes/*.png` backgrounds with their scene ids unchanged.
- [x] Verify copied file counts and PNG signatures.

### Task 4: Student pet page integration

**Files:**
- Modify: `app/(dashboard)/students/[id]/pet/page.tsx`

- [x] Enable the live hook only when `studentId === "stu-test"`.
- [x] Merge live mood, energy, sociability, scene and activity over the snapshot.
- [x] Render the Pocket frames over the synchronized Pocket scene background.
- [x] Stop frame animation when reduced motion is requested.
- [x] Display live, connecting, reconnecting, or offline status without clearing the last valid values.
- [x] Keep every other student's existing snapshot appearance and behavior unchanged.
- [x] Run the focused test and ESLint.

### Task 5: Documentation state and verification

**Files:**
- Modify: `docs/api_contract.md`
- Modify: `docs/superpowers/specs/2026-07-22-demo-pet-live-sync-design.md`

- [x] Mark the Sentinel `demo_pet` observer task complete only after runtime verification.
- [x] Run `npm run build` and confirm a successful Next.js production build.
- [x] Start or reuse the exact development ports without killing unrelated Node processes.
- [x] Verify offline fallback at `/students/stu-test/pet`.
- [x] Verify WebSocket live state and the F9 `picnic_lawn` to `psychological_room` sequence.
- [x] Save a dated Playwright screenshot under `screenshots/` and inspect it for background crop, pet position, state bars and status UI.
- [x] Check browser console output for critical errors.
- [x] Re-run focused tests and `git diff --check` before reporting completion.

### Task 6: LAN configuration and server activity logs

**Files:**
- Modify: `.env.example`
- Modify: `lib/pet-live-sync.ts`
- Modify: `lib/pet-live-sync.test.ts`
- Modify: `hooks/use-pet-live-sync.ts`
- Modify: `app/(dashboard)/students/[id]/pet/page.tsx`

- [x] Add a single `NEXT_PUBLIC_PET_SYNC_HOST` setting while keeping the service port and WebSocket path fixed.
- [x] Parse the authoritative server `activityLog` and reconstruct scene context for each entry.
- [x] Show the latest six server logs with location-aware scene, event, and status descriptions.
- [x] Keep the database log list as the fallback when no valid server activity log exists.
- [x] Cover LAN URL construction and activity-log conversion with focused automated tests.
- [x] Adapt the Pocket dashboard motion pattern into a live feed where new activity enters at the top and existing rows move down.
- [x] Remove cyclic rotation so old activity is never presented as newly arrived data.
- [x] Disable positional motion for reduced-motion users and verify the corrected direction, visual presentation, and browser console output.
