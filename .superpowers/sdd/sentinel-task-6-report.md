# Sentinel Task 6 Report

## Scope

Implemented the documentation and integration-verification portion of Task 6 from `docs/superpowers/plans/2026-07-21-sentinel-reachy-device-console.md`.

- Added the Sentinel operator guide for matching ClawBody/Host Bridge secrets, Windows current-user Host Bridge installation, immediate start/status checks, Docker + Sentinel daily operation, safe read-only diagnostics, browser camera permission behavior, degraded modes, and troubleshooting.
- Synchronized `docs/PRD.md` and the accepted design specification with a dated distinction between code/no-hardware verification and pending visual/physical-device acceptance.
- Confirmed that `.env.example` already contains the exact server-only URLs and key names required by Task 6; it was not changed in this task.
- Did not start, stop, restart, or move the robot; did not send device mutation commands; did not create or modify a Windows scheduled task; did not access a real camera; did not push.

## Usage and configuration

Keep the two local `.env` files aligned:

```dotenv
# clawbody-minimax/.env
SERVICE_API_KEY="<clawbody-service-key>"
HOST_BRIDGE_API_KEY="<host-bridge-key>"

# PsyTwin-Sentinel/.env
CLAWBODY_SERVICE_URL="http://127.0.0.1:7860"
CLAWBODY_SERVICE_KEY="<clawbody-service-key>"
HOST_BRIDGE_URL="http://127.0.0.1:7861"
HOST_BRIDGE_API_KEY="<host-bridge-key>"
```

`CLAWBODY_SERVICE_KEY` must equal ClawBody `SERVICE_API_KEY`; both repositories' `HOST_BRIDGE_API_KEY` values must also match. Neither secret may use a `NEXT_PUBLIC_*` name. The browser calls only Sentinel same-origin APIs, Host Bridge stays on `127.0.0.1:7861`, and the device route accepts only the fixed command union rather than arbitrary URLs, executables, or shell arguments.

After preparing the ClawBody `.venv`, SDK, and `.env` according to the ClawBody README, an operator can install and immediately start the fixed current-user login task from the ClawBody repository root:

```powershell
.\.venv\Scripts\Activate.ps1
clawbody-host install
clawbody-host restart
clawbody-host status
```

Daily operation:

```text
启动 Docker → 打开 Sentinel → 心宠调试 → 启动设备
```

Reachy Mini Control must be fully closed. A VPN is not required for local device startup. Online conversation still depends on the configured Alibaba Cloud and Baidu services.

Camera preview requests browser permission only after the explicit preview button is clicked. Permission denial, an unlabeled/unrecognized camera, or a busy camera is a media-only degradation and does not disable Ready, motor, speaker, or microphone controls. No daemon media-release request is sent.

## Verification commands and results

### Sentinel focused and related tests

```powershell
npx tsx --test lib/pet-ai/reachy-device.test.ts lib/pet-ai/pet-ai-api.test.ts lib/pet-ai-management-navigation.test.ts lib/vision-camera.test.ts
```

Result: exit `0`; 55 passed, 0 failed.

```powershell
npx tsx --test lib/pet-ai/reachy-command-queue.test.ts lib/pet-ai/reachy-ready-console-state.test.ts
```

Result: exit `0`; 9 passed, 0 failed.

### TypeScript

```powershell
npx tsc --noEmit --allowJs false --strict --skipLibCheck --target ES2022 --module ESNext --moduleResolution bundler --lib DOM,DOM.Iterable,ESNext lib/pet-ai/reachy-device.ts lib/pet-ai/host-bridge-client.ts lib/pet-ai/reachy-command-queue.ts lib/pet-ai/reachy-ready-console-state.ts lib/vision-camera.ts
```

Result: exit `0`; the Reachy core target files passed strict TypeScript validation.

```powershell
npx tsc --noEmit --incremental false
```

Result: exit `1`; pre-existing out-of-scope syntax error `TS1128` at `prisma/backups/seeds/seed-pocket-data-test.ts:1309`. No Task 6 file is implicated.

### ESLint

```powershell
npm run lint
```

Result: exit `0`; 0 errors and 238 existing warnings.

### Production build

```powershell
npm run build
```

Result: exit `0`; Next.js compiled and generated 67 static pages. The build explicitly reported `Skipping validation of types` because `next.config.mjs` has `typescript.ignoreBuildErrors: true`; the independent targeted TypeScript result above is the type evidence for the Reachy core files.

### ClawBody regression tests

From `C:/Users/txj12/Desktop/PsyTwin/clawbody-minimax`:

```powershell
.\.venv\Scripts\python.exe -m pytest tests -q
```

Result: exit `0`; 114 passed, 0 failed.

## Safe read-only integration checks

Only read-only task/service/device queries were attempted.

- `clawbody-host status`: exit `1`; the fixed login task is not installed or unavailable.
- `GET http://127.0.0.1:7861/health`: connection unavailable, so authenticated Host Bridge `status` and `discover` checks were not attempted.
- `GET http://127.0.0.1:7860/health`: returned `{"ok":true,"service":"clawbody"}`.
- `GET http://127.0.0.1:3000/pet-ai-management`: HTTP `307` to the login page.
- `GET http://127.0.0.1:3000/api/pet-ai/reachy/device`: HTTP `401` without an authenticated session.
- Chrome read-only navigation also reached the login page. No account login was performed, no real camera permission was requested, and no screenshots were saved.

## Pending acceptance

- Visual QA at 1367 x 614 and 1440 x 900 remains pending in an authenticated Sentinel session; the planned discovery/connecting/ready screenshots were not created.
- The eight-step physical Reachy Mini Lite acceptance remains pending because Host Bridge is not currently running and hardware mutation/access was explicitly outside this safe verification pass.
- The accepted design checklist remains unchecked for all criteria that require live startup, motors, audio, camera, sessions, network observation during startup, or the composite automated + build + physical-device result.

## Review follow-up: operator commands and session-entry degradation

The Task 6 review identified two follow-ups and both were handled without hardware access:

- Daily Host Bridge `status` and `restart` instructions now run the venv entry point explicitly from the ClawBody repository root: `.\.venv\Scripts\clawbody-host.exe <command>`. They no longer assume the operator's current PowerShell has an activated virtual environment. The one-time block continues to activate `.venv` explicitly before using the installed command, matching the ClawBody source documentation.
- The management workspace now distinguishes an unchecked ClawBody status from a confirmed unavailable status. `开始对话` is disabled with visible, `aria-describedby`-linked copy while status is being checked or ClawBody is offline/unavailable. A later healthy poll clears the reason and re-enables the test student's start action. The same presentation guard runs before the session POST, while stop-session and all hardware-debug controls remain unchanged.

TDD RED was observed before implementation: the new behavior test failed because `reachy-session-entry` did not exist, and the source contract failed because the management view had no availability helper, accessible reason, or pre-request guard.

Follow-up verification:

- Focused Sentinel Reachy suite including the new behavior tests: 58 passed, 0 failed.
- Related Reachy queue/state suite: 9 passed, 0 failed.
- Target ESLint for the view, helper, and tests: exit `0`, no output.
- Full `npm run lint`: exit `0`; 0 errors and the same 238 existing warnings.
- Target TypeScript compiler-API check using the repository `tsconfig.json`: passed for 4 roots.
- `npm run build`: exit `0`; 67 static pages generated. As before, the repository build reported `Skipping validation of types`, so the independent target TypeScript check is the type evidence.
- No Host Bridge, robot, session, audio, movement, scheduled-task, or real-camera action was performed.

## Final review follow-up: persistent safe stop warnings

The device console now consumes the safe `data.warnings` projection returned by a successful stop command. It recognizes only `clawbody_status_unavailable` and `clawbody_session_stop_failed`, replaces any response text with fixed local copy, and renders the result in a persistent top-level `role="alert"`. The warning therefore remains visible after the refreshed snapshot moves the device out of Ready or polling continues. An operator can dismiss it explicitly; the next successful start, restart, or warning-free stop also clears it. Failed commands, polling, discovery, pose, volume, and device actions preserve the existing warning.

Usage requires no new configuration. In 心宠调试, stop the device as usual. If ClawBody status could not be checked or its active session could not be stopped, review the amber warning and confirm the ClawBody service/session separately before starting another conversation. Use 关闭 to dismiss it, or complete a later successful lifecycle command.

TDD RED was observed before implementation: the new helper test failed with `MODULE_NOT_FOUND`, and the source contract failed because the console did not consume or render lifecycle warnings.

Final verification:

- Focused command: `npx tsx --test lib/pet-ai/reachy-device.test.ts lib/pet-ai/pet-ai-api.test.ts lib/pet-ai-management-navigation.test.ts lib/vision-camera.test.ts lib/pet-ai/reachy-session-entry.test.ts lib/pet-ai/reachy-lifecycle-warning.test.ts` — exit `0`; 62 passed, 0 failed.
- Independent related command: `npx tsx --test lib/pet-ai/reachy-command-queue.test.ts lib/pet-ai/reachy-ready-console-state.test.ts` — exit `0`; 9 passed, 0 failed.
- Target ESLint for the changed TS/TSX files: exit `0`, no output.
- Full `npm run lint`: exit `0`; 0 errors and the same 238 existing warnings.
- Target TypeScript compiler-API check using repository `tsconfig.json`: passed for 4 changed roots.
- `npm run build`: exit `0`; compiled successfully and generated 67 static pages. It still reports `Skipping validation of types`, so the independent target check remains the type evidence.
- `git diff --check`: exit `0`.
- No push and no hardware, session, audio, movement, camera, daemon, or scheduled-task mutation was performed.

## Final allowlist hardening

The lifecycle warning allowlist now uses an exact own-property check instead of JavaScript's prototype-aware `in` operator. Regression coverage confirms `toString`, `constructor`, `__proto__`, and a normal unknown code are ignored and cannot become rendered warning entries. This changes no operator workflow or configuration.

- TDD RED: `toString` produced an invalid projected entry whose message was `Object.prototype.toString`.
- Focused helper tests: 5 passed, 0 failed.
- Full Sentinel Reachy focused command: 63 passed, 0 failed.
