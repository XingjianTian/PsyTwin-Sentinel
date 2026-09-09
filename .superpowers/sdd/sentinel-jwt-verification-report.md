# Sentinel JWT Verification Fix Report

Date: 2026-07-21

Commit: `3a5466a fix: verify Sentinel JWT signatures`

## Outcome

- Replaced payload-only middleware decoding with Edge-compatible WebCrypto HMAC-SHA256 verification.
- Centralized the JWT secret, HS256 algorithm, issuer, audience, expiry, and not-before policy across token issuance, Node verification, and middleware verification.
- Rejects forged, unsigned, tampered, malformed, expired, future-not-before, wrong-issuer, wrong-audience, and malformed-identity tokens.
- Rejects missing or known-placeholder `JWT_SECRET` values in production without logging token or secret material.
- Preserves Bearer, cookie, and public-route behavior; `/api/pet-ai/reachy/device` remains protected.
- Added production configuration guidance to `.env.example` and synchronized the PRD security-hardening state.

## Configuration and Use

Set these server-only variables before running a production Sentinel deployment:

```dotenv
JWT_SECRET="<at-least-32-random-bytes>"
JWT_ISSUER="psytwin-sentinel"
JWT_AUDIENCE="psytwin-sentinel"
```

Restart Sentinel after changing the environment. Browser login continues to store the issued token in the `token` cookie, and API clients continue to send `Authorization: Bearer <token>`. Tokens issued before this change do not contain the new issuer/audience claims, so existing sessions must sign in again once after deployment.

Development retains the legacy fallback secret when `NODE_ENV` is not `production`. Production fails closed until a non-placeholder `JWT_SECRET` is configured.

## Verification

- RED: the original middleware returned HTTP 200 for forged, unsigned, tampered, future-not-before, wrong-issuer/audience, and unsafe-production-config tokens.
- Auth-focused suite: 17 passed, 0 failed.
- Combined auth/Reachy suite: 57 passed, 0 failed.
- Targeted TypeScript check for middleware/auth files: exit 0.
- Targeted ESLint: 0 errors, 1 pre-existing `require("crypto")` warning in the server-only auth utility.
- Repository ESLint: exit 0 with 238 existing warnings and 0 errors.
- Next.js production build: exit 0; 67 pages generated and the middleware bundle reported as `Proxy (Middleware)`.
- `git diff --cached --check`: clean before commit.

The build configuration reports that type validation is skipped, so the independent targeted TypeScript command is the type-check evidence for this change.

## Review Note

A fresh reviewer-agent dispatch was attempted before commit, but the active thread limit was full. A local staged security audit confirmed that the middleware dependency graph contains no Node-only crypto import, no secrets or tokens are logged, and unrelated `tsconfig.tsbuildinfo` and existing `.superpowers` files were excluded from the commit.

## Independent Review Follow-up

Follow-up commit: `0ba4e76 fix: enforce JWT strength and Reachy roles`

- Explicitly configured JWT secrets shorter than 32 UTF-8 bytes now fail closed in every environment across issuance, Node verification, and Edge middleware verification. Missing non-production configuration retains the documented development fallback; explicitly configured empty or weak development values are rejected.
- Boundary tests cover 1-byte and 31-byte rejection, 31/32-byte multibyte values, and exact 32-byte acceptance across all three JWT boundaries.
- `/api/pet-ai/reachy/device` and its trailing-slash/subpath form now allow only the real Sentinel operator roles `ADMIN`, `COUNSELOR`, and `TEACHER`.
- Real issued `student`, `ASSISTANT`, and unknown-role tokens receive HTTP 403 before Next.js route dispatch, while student tokens remain valid on unrelated authenticated APIs.
- Replaced the stale `JWT_SECRET="xxx"` architecture example with the production-rejected setup placeholder and documented issuer/audience variables.
- Tightened the existing Reachy source-contract test so it inspects only the `publicRoutes` array rather than matching protected route constants elsewhere in middleware.

Follow-up verification:

- Auth-focused suite: 26 passed, 0 failed.
- Combined auth/Reachy suite: 66 passed, 0 failed.
- Scoped ESLint and targeted TypeScript: exit 0.
- Repository ESLint: exit 0 with 238 existing warnings and 0 errors.
- Next.js production build: exit 0; 67 pages generated and the middleware bundle compiled.
- Staged diff check: clean; the pre-existing `tsconfig.tsbuildinfo` modification was excluded from the commit.

## Public Registration Privilege Follow-up

Follow-up commit: `931a7b1 fix: prevent public operator registration`

- Public `POST /api/auth/register` now creates only a `User` with the least-privileged non-operator `ASSISTANT` role. The role may be omitted or explicitly set to `ASSISTANT`; teacher mode and all caller-selected operator roles fail before password hashing or any Prisma access.
- `TEACHER`, `ADMIN`, and `COUNSELOR` self-registration attempts return HTTP 403. The separate `POST /api/pocket/auth/register` student flow was not modified.
- A newly registered assistant can log in and use unrelated authenticated APIs but receives HTTP 403 before the Reachy device route is dispatched.
- Existing `/api/users` and `/api/teachers` provisioning mutations, including nested update/delete/action paths, now require an authenticated `ADMIN`. Read-only GET behavior is unchanged.
- Operator accounts can be provisioned through those admin-only APIs or trusted database/seed workflows; public registration is never an operator-provisioning path.

Public assistant registration request:

```json
{
  "name": "Assistant Name",
  "email": "assistant@example.com",
  "password": "a-strong-password"
}
```

No new environment configuration is required. Restart Sentinel after deploying the follow-up.

Follow-up verification:

- Registration route suite: 4 passed, 0 failed.
- Combined registration/auth/Reachy suite: 70 passed, 0 failed.
- Scoped ESLint and targeted TypeScript: exit 0.
- Repository ESLint: exit 0 with 238 existing warnings and 0 errors.
- Next.js production build: exit 0; 67 pages generated, including `/api/auth/register`, and middleware compiled.
- Staged diff check: clean; the pre-existing `tsconfig.tsbuildinfo` modification and untracked reports were excluded from the commit.

## Staff Provisioning Safe-Method Follow-up

Follow-up commit: `e16af80 fix: preserve safe staff route methods`

- Staff provisioning authorization explicitly treats only `POST`, `PUT`, `PATCH`, and `DELETE` as mutations.
- Authenticated `GET`, `HEAD`, and `OPTIONS` requests to `/api/users` and `/api/teachers` retain their prior safe/read middleware behavior for non-admin users.
- Operator-changing mutations remain restricted to `ADMIN`.
- No new environment configuration is required. Restart Sentinel after deploying the follow-up.
