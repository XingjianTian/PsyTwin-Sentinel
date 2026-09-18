# Sentinel Task 3 Report

## Scope

Implemented only Task 3 of `2026-07-21-sentinel-reachy-device-console.md`:

- Replaced the page-header Reachy badge with a page-level `心宠管理 / 心宠调试` segmented switch.
- Preserved the existing student/pet management tree without restructuring it.
- Added the Reachy debug workspace shell, adaptive polling, serialized device commands, and last-successful-snapshot retention.
- Added loading, Host Bridge offline, zero-USB, USB discovery, active progress, error, and minimal Ready states.
- Added the four startup stages and visibly disabled Wi-Fi/simulator entries.
- Did not add the Task 4 device controls, media controls, logs console, or app controls.

## Usage and configuration

1. Start Sentinel and sign in.
2. Open `心宠AI管理中心`.
3. Use the header switch:
   - `心宠管理` keeps the existing student and conversation workspace.
   - `心宠调试` opens the Reachy device workspace.
4. With the Windows Host Bridge running, select a detected USB COM port and choose `启动设备`.
5. Watch the four-stage progress: `启动 → 连接 → 健康检查 → 应用`.
6. On failure, use `重试` or `复制诊断信息`.

No new environment variables or configuration keys were added. The browser only calls the existing same-origin `/api/pet-ai/reachy/device` endpoint. Host Bridge setup remains the prerequisite established by Tasks 1–2.

## Runtime behavior

- The device snapshot is fetched immediately on entering debug mode.
- Active lifecycle phases poll every 1 second; Ready/offline and other stable states poll every 3 seconds.
- A transient poll failure keeps the most recent successful snapshot visible and adds a retryable status notice.
- One `runCommand(command)` path handles browser commands, with a ref-backed lock preventing same-page overlaps.
- Discovery/stopping/startup phases disable lifecycle controls even if the operation originated elsewhere.
- Incremental log items are retained and de-duplicated for the future Task 4 console.

## Visual and accessibility decisions

- Preserved Sentinel's light gray/white surfaces, purple selected/primary actions, green Ready/healthy state, and restrained red errors; no Reachy Control black/orange styling.
- Used one bounded console surface with divided selectable rows instead of nested decorative cards or broad shadows.
- Kept corner radii at the existing `rounded-lg`/`rounded-xl` scale.
- Used native buttons plus `aria-pressed` for the page switch and USB choices; disabled future connection modes remain discoverable but non-functional.
- Marked the running or failed startup stage with `aria-current="step"` and kept reduced-motion fallbacks on pulse/spin feedback.
- Used a skeleton for initial loading and an instructional empty state for missing USB hardware.
- Avoided a nested `<main>` landmark; the console is a labelled `<section>` inside the dashboard's existing main landmark.
- Browser QA at 768, 1024, and 1440 px found no horizontal overflow. At 390 px, the repository's pre-existing fixed-width Dashboard sidebar leaves a very narrow content column; Task 3 adds no document overflow, but a future app-shell mobile navigation pass is needed for good phone usability.

## Verification

- TDD RED observed before implementation for the new UI source contract.
- `npx tsx --test lib/pet-ai-management-navigation.test.ts`: 4/4 passed.
- Target ESLint on all Task 3 files: passed with no warnings.
- Target TypeScript program check on all Task 3 files and dependencies: passed.
- `npm run build`: passed and generated all 67 static pages.
- Browser QA covered real Host Bridge offline response plus mocked USB discovery, active health-check progress, and failure diagnostics.
- Full-repository `npx tsc --noEmit` remains blocked by the pre-existing syntax error in `prisma/backups/seeds/seed-pocket-data-test.ts:1309`; it is outside Task 3.
