# Sentinel Task 5 Report

## Scope

Implemented Task 5 of `2026-07-21-sentinel-reachy-device-console.md`:

- Added a browser-only Reachy Mini camera adapter that requests permission, prefers labeled `/reachy|mini/i` video inputs, and opens the selected device at an ideal 640 x 480 resolution with audio disabled.
- Added explicit unavailable, permission-denied, and daemon/other-program busy messages.
- Added a Ready-console preview tile that starts only after a user click and keeps camera failures isolated from Ready, motor, speaker, and microphone controls.
- Added track cleanup for the permission probe, preview replacement, close, component unmount, and late async results.
- Did not add or call any daemon media-release behavior.

## Usage and configuration

1. Start Sentinel, sign in, and open `心宠AI管理中心`.
2. Select `心宠调试`, start Reachy Mini, and wait for the Ready console.
3. In `媒体设备 > 摄像头`, click `打开摄像头预览`.
4. Approve the browser camera permission when prompted. Sentinel selects the first video-input label containing `Reachy` or `Mini`.
5. Click `关闭摄像头预览` to release every browser camera track. If the camera is occupied, close the conflicting application or daemon camera consumer and use `重新尝试摄像头预览`.

No environment variables or server configuration were added. Camera access requires a secure browser context (HTTPS, or localhost during development) and a browser-visible device label containing `Reachy` or `Mini`.

## Safety and degradation behavior

- No media API runs during SSR, render, polling, or Ready-console entry; `getUserMedia` is reachable only through the explicit preview button handler.
- The adapter performs a permission request before enumerating labels, stops that temporary stream, and then requests the selected Reachy device with exact `deviceId`, ideal 640 x 480 video, and `audio: false`.
- `NotReadableError` becomes `Reachy Mini 摄像头正被 daemon 或其他程序占用`.
- `NotAllowedError` and `SecurityError` become `摄像头权限未授予，请在浏览器设置中允许访问`.
- Missing labeled hardware becomes `Reachy Mini 摄像头未被浏览器识别`.
- Preview errors never issue device commands, alter the Ready phase, or disable motor/audio controls.

## Visual and accessibility QA

- Reused the existing Sentinel light Card, Badge, Button, status color, spacing, and Lucide vocabulary.
- Added a responsive 4:3 preview/empty-state surface within the existing three-column media grid.
- Opening state is announced politely; failures use `role="alert"`; the preview has a device-specific accessible label.
- The video uses `autoPlay`, `muted`, and `playsInline`; loading motion respects reduced-motion preferences.
- The Impeccable source detector returned no findings for the modified Ready console.
- Browser camera interaction was intentionally not invoked during QA because no user authorization to prompt for real camera access was present.

## Verification

- TDD RED observed for all adapter cases against the original unimplemented stub and for the missing explicit preview UI.
- `npx tsx --test lib/vision-camera.test.ts`: 6 passed, 0 failed.
- Related Reachy suite: 48 passed, 0 failed.
- Target ESLint: passed with no output.
- Target adapter/test TypeScript check: passed.
- `npm run build`: passed.
- `git diff --check`: passed; Git only reported the repository's existing CRLF conversion warnings.
- Full-project `npx tsc --noEmit` remains blocked by the pre-existing syntax error at `prisma/backups/seeds/seed-pocket-data-test.ts:1309`.

## Reviewer follow-up

- Initial permission-probe `NotFoundError` and legacy `DevicesNotFoundError` now map to `Reachy Mini 摄像头未被浏览器识别`.
- Unknown browser media errors now map to the bounded `无法打开 Reachy Mini 摄像头` message instead of exposing native exception text or local device details.
- The `getUserMedia` test double now handles its optional constraints parameter explicitly, eliminating the task-scoped TS2345 without suppressions.
- Extracted and integrated a deterministic preview lifecycle controller. Behavioral tests prove that creation does not request permission; close, dispose/unmount, and replacement stop the active session and clear the video source; and a late session resolved after close is stopped as stale.
- The Ready console keeps the explicit click boundary, delegates lifecycle ownership to the controller, and clears the actual video element's `srcObject` in effect cleanup.
- Reverted only the Task 5 checklist mutations in the implementation plan, preserving the plan's original tracking state.
- No real camera access or browser permission prompt was invoked during verification.

### Follow-up verification

- TDD RED observed for both unsafe browser error propagation and the missing lifecycle controller/integration.
- Camera suite: 13 passed, 0 failed.
- Related Reachy suite: 55 passed, 0 failed.
- Target ESLint: passed with no output.
- Target TypeScript (without diagnostic suppression): passed.
- Production `npm run build`: passed.
- `git diff --check`: passed; only the repository's CRLF conversion warnings were reported.
