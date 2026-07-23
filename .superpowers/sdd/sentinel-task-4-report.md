# Sentinel Task 4 Report

## Scope

Implemented only Task 4 of `2026-07-21-sentinel-reachy-device-console.md`:

- Replaced the temporary Ready shell with a complete Sentinel-light Reachy device console.
- Added Ready lifecycle, USB/COM, daemon, motor, ClawBody, and current student-session summaries.
- Added typed wake, sleep, center, antenna-test, sound-test, restart, stop, pose, and volume controls.
- Added camera, microphone, and speaker health states with independent degradation.
- Added bounded cursor-based logs, conditional auto-scroll, and clipboard copy.
- Kept camera preview out of scope for Task 5.

## Usage and configuration

1. Start Sentinel, sign in, and open `心宠AI管理中心`.
2. Select `心宠调试` and start the detected USB device.
3. After the four startup stages complete, the Ready console opens automatically.
4. Use `表情与动作` for wake, sleep, centering, and antenna checks.
5. Use `机器人控制器` for bounded head, body, and antenna pose commands.
6. Use the speaker and microphone sliders for volume; `测试声音` sends the safe sound-test action.
7. Use `返回实时联调` to return to management without stopping the device or session.
8. Use `停止设备` only after reviewing the confirmation. When a session is running, the dialog states that the student conversation stops first.

No new environment variables were added. The browser continues to call only the same-origin `/api/pet-ai/reachy/device` route with the existing typed command union. Host Bridge and ClawBody credentials remain server-only.

## Runtime and safety behavior

- Movement controls require `phase === "ready"` and `motor_mode === "enabled"`.
- Pose values are clamped to the Host Bridge contract: head pitch/roll `-40..40`, head yaw `-65..65`, body yaw `-180..180`, antennas `-3.1416..3.1416`.
- Pose commands are trailing-throttled at 100 ms (no more than 10 sends per second).
- Speaker and microphone updates are rounded to integer `0..100` and debounced for 250 ms.
- Media failures disable only the affected media control and do not disable healthy motor controls.
- Incremental logs accept only IDs above the prior cursor, sort new entries, retain the newest 300, and preserve the user's scroll position when they read older entries.
- The stop confirmation explicitly describes session-first shutdown when `session.running` is true.

## Visual and accessibility notes

- Reused Sentinel white surfaces, light gray/lavender stage background, purple actions, green Ready/healthy status, and restrained red destructive controls.
- Used existing Card, Button, Badge, Slider, AlertDialog, ScrollArea, and Lucide components; no black/orange Reachy Control theme was introduced.
- Avoided nested card stacks: overview, robot stage, app, controls, media, logs, and lifecycle are distinct peer surfaces.
- Desktop browser inspection at 1440 x 900 confirmed the existing management view and workspace switch fit without horizontal overflow.
- Ready-state browser QA could not be captured from the already-running development session: the visible `心宠调试` button received focus but did not update its React state in Chrome. No production debug route, API mock, or client-state injection was added to bypass that runtime issue.
- Source and build verification cover responsive stacking, focusable controls, explicit labels, live status announcements, reduced-motion spinner fallback, and scroll-safe logs. Physical device and mobile Ready-state acceptance remain for Task 6.

## Verification

- TDD RED observed for the missing ready-console module and missing pure state helpers.
- Pure behavior tests cover pose/volume clamping, motor gating, incremental cursor filtering, ordering, and the 300-entry cap.
- Related Reachy tests cover the same-origin typed proxy and UI source contracts.
- Target ESLint completes without warnings.
- Production build completes successfully.
- Full-repository `npx tsc --noEmit --incremental false` remains blocked by the pre-existing syntax error in `prisma/backups/seeds/seed-pocket-data-test.ts:1309`; this task does not modify that backup file.

## Reviewer follow-up fixes

- Stop is now fail-safe: ClawBody status and session-stop failures produce bounded warnings, while Host Bridge stop still runs exactly once.
- Reachy commands now use one serialized queue. Pending continuous controls coalesce to the latest value per pose, speaker-volume, or microphone-volume key without dropping updates for the other keys; lifecycle commands remain exclusive.
- Wake remains available when a Ready robot is sleeping or has disabled motors, while every other movement command still requires enabled motors.
- Delayed pose dispatch reads the latest device snapshot immediately before sending and drops the command if the robot is no longer Ready with enabled motors.
- Normal-size error text now uses Tailwind `red-700` instead of `text-destructive`. The resulting contrast is 6.47:1 on white and approximately 5.56:1 on the existing translucent destructive tint.

### Follow-up verification

- Related Reachy suite: 50 tests passed, 0 failed.
- Target ESLint: passed with no output.
- Task-scoped TypeScript compiler API check: passed for 10 roots.
- Production `npm run build`: passed.
- `git diff --check`: passed; Git only reported the repository's existing CRLF conversion warnings.

## Final reviewer follow-up

- Queue entries can now carry a pre-execution safety guard. A delayed pose checks the current snapshot both before enqueue and immediately before the queue invokes the network executor.
- The regression test blocks the queue with a speaker-volume request, enqueues a pose while motors are enabled, disables motors, releases the volume request, and confirms the pose is skipped without reaching the executor.
- Both the stop trigger and confirmation action now use `bg-red-700 text-white`, `hover:bg-red-800`, and explicit red focus-visible border/ring styles.
- White text contrast is 6.47:1 on `red-700` and 8.31:1 on the `red-800` hover state.

### Final follow-up verification

- TDD RED observed: the unsafe queued pose returned `executed`, and the two AA destructive-button style assertions were absent.
- Related Reachy suite: 51 tests passed, 0 failed.
- Target ESLint: passed with no output.
- Task-scoped TypeScript compiler API check: passed for 7 roots.
- Production `npm run build`: passed.
- `git diff --check`: passed; only CRLF conversion warnings were reported.
