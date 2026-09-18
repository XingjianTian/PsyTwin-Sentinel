# Sentinel Task 2 Report

## Outcome

- Added protected same-origin `GET` and `POST` handlers at `/api/pet-ai/reachy/device`.
- Aggregates Host Bridge status, discovery, cursor logs, and ClawBody session status into the browser-safe device snapshot.
- Degrades ClawBody transport failures to `clawbody_reachable=false` without hiding hardware state.
- Uses a strict Zod discriminated union with fixed command routes and Host Bridge request bodies.
- Stops an active ClawBody session before stopping the Reachy device.
- Uses long-running Host Bridge timeouts only for start/restart; all other commands use the short client timeout.
- Applies `private, no-store, max-age=0`, bounded error messages, and field-by-field nested response projection.
- Relies on Sentinel middleware's existing token/cookie authentication; `/api/pet-ai` remains outside `publicRoutes`.

## TDD Evidence

- Initial RED: route contract and behavior tests failed with `ENOENT` because `app/api/pet-ai/reachy/device/route.ts` did not exist.
- First GREEN: 16 route/API tests passed after implementing the route.
- Hardening RED: nested upstream metadata test exposed unexpected media/session/device/log/error fields.
- Final GREEN: field projection removed unexpected nested fields and all focused tests passed.

## Verification

- `npx tsx --test lib/pet-ai/reachy-device.test.ts lib/pet-ai/pet-ai-api.test.ts`: 27 passed, 0 failed.
- `npx eslint app/api/pet-ai/reachy/device/route.ts lib/pet-ai/pet-ai-api.test.ts`: passed.
- Task-scoped TypeScript compiler API check using project `tsconfig.json`: passed.
- `git diff --check` and staged diff check: passed.
- Repository-wide `npx tsc --noEmit`: blocked by the pre-existing unrelated syntax error at `prisma/backups/seeds/seed-pocket-data-test.ts:1309` (`TS1128`).

## Commit

- `e59ad3f feat: proxy Reachy device controls through Sentinel`
- No push performed.

## Review Follow-up

- Changed GET aggregation so every ClawBody `/v1/status` failure, including HTTP failures, degrades only the ClawBody/session fields to offline while preserving Host Bridge hardware data.
- Added runtime Zod validation and field-by-field redacted projection for Host Bridge status, discovery, and log payloads and ClawBody session status.
- Applied the same exact public projections to every successful POST result, including nested device status returned by stop.
- Added a mutation gate before JSON parsing: all POSTs require `application/json`; cookie-style requests also require an `Origin` matching `request.nextUrl.origin`; middleware-validated Bearer callers may omit Origin.
- Added RED/GREEN coverage for HTTP-status degradation, secrets in allowed string fields, malformed/extra POST success payloads, discover/stop projections, and CSRF/content-type rejection before upstream calls.
- The reviewer also identified that `middleware.ts` decodes JWT payloads without signature verification. This pre-existing issue is explicitly outside Task 2 follow-up scope and was not changed.
- Follow-up commit: `5c456bd fix: harden Sentinel Reachy device proxy`.
