# Sentinel Task 1 Report

## Scope

- Added the browser-safe Reachy device contracts and total phase presentation helper.
- Added the server-side Host Bridge client with fixed API paths, authenticated loopback default, request timeouts, and normalized transport failures.
- Added matching server-only Host Bridge environment examples.

## TDD evidence

1. Added `lib/pet-ai/reachy-device.test.ts`; `npx tsx --test lib/pet-ai/reachy-device.test.ts` failed because `./reachy-device` did not exist.
2. Implemented the device model, phase presentation map, client source contract, and environment entries; the focused test then passed.
3. Added a second fixed-path safety test; it failed because `isHostBridgePath` was absent, then passed after adding runtime fixed-path validation.

## Verification

- PASS: `npx tsx --test lib/pet-ai/reachy-device.test.ts` (5 tests)
- PASS: `npx tsx --test lib/pet-ai/*.test.ts` (28 tests)
- PASS: `npx eslint lib/pet-ai/reachy-device.ts lib/pet-ai/host-bridge-client.ts lib/pet-ai/reachy-device.test.ts`
- PASS: focused TypeScript check of the two production modules.
- PASS: `npm run lint` (0 errors; repository has 238 pre-existing warnings).
- BLOCKED outside task scope: project `npx tsc --noEmit` stops at the existing syntax error in `prisma/backups/seeds/seed-pocket-data-test.ts:1309`.
- PASS: `git diff --check`.

## Files

- `.env.example`
- `lib/pet-ai/reachy-device.ts`
- `lib/pet-ai/host-bridge-client.ts`
- `lib/pet-ai/reachy-device.test.ts`

## Self-review

- Host Bridge has no `NEXT_PUBLIC_*` configuration or browser-callable URL/key.
- Host Bridge path types and runtime validation allow only the known device endpoints and numeric log cursor.
- HTTP errors retain daemon `detail`/`message`; only transport or abort failures become `HostBridgeUnavailableError`.
- Key remains in a request header assembled on the Sentinel server.

## Commit

`b5a6c3a feat: add Sentinel Reachy device contracts`

## Review follow-up

- RED: the new `server-only` assertion failed until the marker was added at the top of `host-bridge-client.ts`.
- GREEN: added behavior tests with isolated fetch and timer replacements; no network requests occur.
- Covered runtime fixed-path rejection, `X-Host-Bridge-Key`, daemon HTTP error preservation, transport-to-unavailable normalization, the default 10-second timer, the explicit 60-second timer, abort propagation, and timer cleanup.
- PASS: `npx tsx --test lib/pet-ai/reachy-device.test.ts` (10 tests).
- PASS: `npx tsx --test lib/pet-ai/*.test.ts` (33 tests).
- PASS: target ESLint, target TypeScript check, and `git diff --check`.
- Commit: `96772e8 test: harden Host Bridge client boundary`.
