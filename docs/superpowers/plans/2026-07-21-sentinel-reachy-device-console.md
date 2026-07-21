# Sentinel Reachy Device Console Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Sentinel-native “心宠管理 / 心宠调试” workspace switch and a light-theme Reachy device console that discovers, starts, controls and diagnoses the Windows-hosted robot without opening Reachy Mini Control.

**Architecture:** Sentinel server routes call the Host Bridge on `127.0.0.1:7861` and the existing ClawBody service on `127.0.0.1:7860`, then return one normalized device snapshot to the browser. The browser renders discovery, connection progress and ready-console states using existing shadcn/Tailwind patterns; it never receives service keys or calls Host Bridge directly.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Zod, Node test runner, Playwright visual verification.

## Global Constraints

- This plan starts only after the ClawBody Host Bridge plan passes its automated tests.
- Preserve the current `/pet-ai-management` URL and existing “心宠管理” behavior.
- Use Sentinel's light background, white cards, purple primary actions and green healthy status; do not use Reachy Control's black/orange theme.
- Browser code must call Sentinel same-origin APIs only.
- Keep Host Bridge and ClawBody keys server-only; never use a `NEXT_PUBLIC_` variable for them.
- Device startup must not call Hugging Face, GitHub, OpenAI, or an application catalog.
- Do not change `/api/pocket/*` or `docs/api_contract.md`.
- Preserve all existing uncommitted files in `C:/Users/txj12/Desktop/PsyTwin/PsyTwin-Sentinel` and avoid broad rewrites of `pet-ai-management-view.tsx`.
- Do not stop or kill Node processes. If port cleanup is required, use only `npx kill-port <exact-port>` after user confirmation.
- Do not commit automatically. At each commit checkpoint, show the exact diff and request user authorization.

## File Map

- Create `lib/pet-ai/reachy-device.ts`: normalized browser-safe types, labels and state helpers.
- Create `lib/pet-ai/host-bridge-client.ts`: server-only authenticated Host Bridge client.
- Create `app/api/pet-ai/reachy/device/route.ts`: aggregated GET and typed command POST endpoint.
- Create `components/views/pet-ai-management/reachy-debug-console.tsx`: lifecycle state container and page sections.
- Create `components/views/pet-ai-management/reachy-connection-panel.tsx`: discovery and four-stage connection UI.
- Create `components/views/pet-ai-management/reachy-ready-console.tsx`: ready dashboard, device controls, audio and logs.
- Modify `components/views/pet-ai-management-view.tsx`: page-level workspace switch and debug-console mount.
- Modify `lib/vision-camera.ts`: implement Reachy-labeled browser camera selection as best-effort preview.
- Create `lib/pet-ai/reachy-device.test.ts` and extend `lib/pet-ai/pet-ai-api.test.ts` and `lib/pet-ai-management-navigation.test.ts`.
- Modify `.env.example`, `README.md`, `docs/PRD.md`, and the accepted design spec checklist.

---

### Task 1: Browser-safe device model and Host Bridge server client

**Files:**
- Create: `lib/pet-ai/reachy-device.ts`
- Create: `lib/pet-ai/host-bridge-client.ts`
- Create: `lib/pet-ai/reachy-device.test.ts`
- Modify: `.env.example`

**Interfaces:**
- Consumes: Host Bridge JSON contracts from the backend plan.
- Produces: `ReachyDeviceSnapshot`, `ReachyDeviceCommand`, `getReachyPhasePresentation`, `requestHostBridge`, and `isHostBridgeUnavailable`.

- [ ] **Step 1: Write failing model and client source tests**

```typescript
test("device phases have stable Chinese presentation", () => {
  assert.deepEqual(getReachyPhasePresentation("healthchecking"), {
    label: "健康检查",
    tone: "progress",
  })
  assert.equal(getReachyPhasePresentation("ready").label, "设备就绪")
})

test("Host Bridge stays server-only on loopback", async () => {
  const source = await readFile(new URL("./host-bridge-client.ts", import.meta.url), "utf8")
  assert.match(source, /http:\/\/127\.0\.0\.1:7861/)
  assert.match(source, /X-Host-Bridge-Key/)
  assert.doesNotMatch(source, /NEXT_PUBLIC_HOST_BRIDGE/)
})
```

- [ ] **Step 2: Run the test and confirm RED**

Run: `npx tsx --test lib/pet-ai/reachy-device.test.ts`

Expected: module imports fail because the new files do not exist.

- [ ] **Step 3: Implement normalized public types**

Export these exact unions and fields from `reachy-device.ts`:

```typescript
export type ReachyDevicePhase =
  | "offline" | "discovering" | "starting" | "connecting"
  | "healthchecking" | "loading_apps" | "ready" | "stopping" | "error"

export type ReachyDeviceCommand =
  | { action: "discover" }
  | { action: "start"; serialPort?: string }
  | { action: "stop" }
  | { action: "restart" }
  | { action: "device_action"; deviceAction: "wake_up" | "goto_sleep" | "center" | "antenna_test" | "test_sound" }
  | { action: "pose"; headPitch: number; headRoll: number; headYaw: number; bodyYaw: number; leftAntenna: number; rightAntenna: number; duration: number }
  | { action: "volume"; target: "speaker" | "microphone"; volume: number }

export type ReachyDeviceSnapshot = {
  phase: ReachyDevicePhase
  operation_id: string | null
  serial_port: string | null
  daemon_owned: boolean
  daemon_pid: number | null
  daemon_version: string | null
  daemon_state: string | null
  motor_mode: string | null
  media: { camera: string; microphone: string; speaker: string; input_volume: number | null; output_volume: number | null }
  clawbody_reachable: boolean
  session: { running?: boolean; student_id?: string | null; state?: string; error?: string | null }
  devices: Array<{ port: string; label: string; vid: string; pid: string }>
  logs: { cursor: number; items: Array<{ id: number; level: string; message: string; created_at: string }> }
  error: { code: string; phase: ReachyDevicePhase; message: string; detail?: string | null } | null
}
```

Implement a total presentation map for all nine phases using tones `neutral | progress | success | danger`.

- [ ] **Step 4: Implement the server-only client**

Follow the existing `clawbody-client.ts` timeout/error pattern. Use:

```typescript
const hostBridgeUrl = () => (process.env.HOST_BRIDGE_URL || "http://127.0.0.1:7861").replace(/\/$/, "")
```

Use a 10-second default timeout and a 60-second timeout only for explicitly passed long-running requests. Add `X-Host-Bridge-Key` from `HOST_BRIDGE_API_KEY`. Parse daemon `detail` or `message` and throw `HostBridgeUnavailableError` only for transport/abort failures.

- [ ] **Step 5: Add environment examples**

```dotenv
HOST_BRIDGE_URL="http://127.0.0.1:7861"
HOST_BRIDGE_API_KEY="replace-with-the-same-key-as-clawbody-host-bridge"
```

- [ ] **Step 6: Run tests and confirm GREEN**

Run: `npx tsx --test lib/pet-ai/reachy-device.test.ts`

Expected: all tests pass.

- [ ] **Step 7: Review and request commit authorization**

Proposed commit: `feat: add Sentinel Reachy device contracts`

---

### Task 2: Aggregated Sentinel device API and safe stop orchestration

**Files:**
- Create: `app/api/pet-ai/reachy/device/route.ts`
- Modify: `lib/pet-ai/pet-ai-api.test.ts`

**Interfaces:**
- Consumes: `requestHostBridge`, `requestClawBody`, and `ReachyDeviceCommand`.
- Produces: `GET /api/pet-ai/reachy/device?after=<cursor>` and `POST /api/pet-ai/reachy/device`.

- [ ] **Step 1: Write failing route contract tests**

Assert the source includes:

- Zod discriminated union on `action`.
- server calls to Host Bridge status, discovery and logs.
- ClawBody `/v1/status` aggregation.
- active-session stop calls `/v1/session/stop` before `/v1/device/stop`.
- no browser-visible Host Bridge URL or key.

- [ ] **Step 2: Run the test and confirm RED**

Run: `npx tsx --test lib/pet-ai/pet-ai-api.test.ts`

Expected: new route contract test fails because the route is absent.

- [ ] **Step 3: Implement GET aggregation**

For every request, fetch in parallel:

```typescript
requestHostBridge("/v1/device/status")
requestHostBridge("/v1/device/discover")
requestHostBridge(`/v1/device/logs?after=${after}`)
requestClawBody("/v1/status")
```

If ClawBody is unavailable, return the device snapshot with `clawbody_reachable=false` and `session={ state: "offline" }`; do not fail the hardware response. If Host Bridge is unavailable, return HTTP `503` with `心宠设备控制桥未运行`.

- [ ] **Step 4: Implement typed POST commands**

Use a Zod discriminated union matching `ReachyDeviceCommand`. Map commands to the exact Host Bridge routes:

```text
discover      → GET  /v1/device/discover
start         → POST /v1/device/start
restart       → POST /v1/device/restart
device_action → POST /v1/device/action
pose          → POST /v1/device/pose
volume        → POST /v1/device/volume
```

For `stop`, first fetch `/v1/status`. If `running=true`, post `/v1/session/stop`; then post `/v1/device/stop`. Return both `sessionStopped` and the final device result. Reject unknown or extra command fields with HTTP `400`.

- [ ] **Step 5: Run tests and confirm GREEN**

Run: `npx tsx --test lib/pet-ai/pet-ai-api.test.ts`

Expected: all API source-contract tests pass.

- [x] **Step 6: Review and request commit authorization** *(2026-07-21: Task-scoped commit authorized; no push.)*

Proposed commit: `feat: proxy Reachy device controls through Sentinel`

---

### Task 3: Page-level workspace switch and connection state UI

**Files:**
- Create: `components/views/pet-ai-management/reachy-debug-console.tsx`
- Create: `components/views/pet-ai-management/reachy-connection-panel.tsx`
- Modify: `components/views/pet-ai-management-view.tsx`
- Modify: `lib/pet-ai-management-navigation.test.ts`

**Interfaces:**
- Consumes: GET/POST device API and Task 1 presentation helpers.
- Produces: `ReachyDebugConsole` and `ReachyConnectionPanel` components.

- [ ] **Step 1: Write failing UI source-contract tests**

Assert:

- the page contains both `心宠管理` and `心宠调试`.
- the original student management layout remains present.
- debug mode mounts `ReachyDebugConsole`.
- connection panel renders `启动`, `连接`, `健康检查`, and `应用` stages.
- unsupported Wi-Fi/simulation controls are visibly disabled rather than silently functional.

- [ ] **Step 2: Run the test and confirm RED**

Run: `npx tsx --test lib/pet-ai-management-navigation.test.ts`

Expected: new assertions fail because the switch and components are absent.

- [ ] **Step 3: Add the workspace switch without rewriting current management UI**

Add:

```typescript
type WorkspaceMode = "management" | "debug"
const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>("management")
```

Replace the existing top-right Reachy badge with a two-button segmented control. Use `aria-pressed`, `Button` with `variant="ghost"`, and the existing `cn()` helper. Render the current two-column management tree only when `workspaceMode === "management"`; render `<ReachyDebugConsole onReturnToManagement={() => setWorkspaceMode("management")} />` otherwise.

- [ ] **Step 4: Implement polling and discovery states**

`ReachyDebugConsole` must:

- GET the snapshot immediately and every 1,000 ms while phase is active, every 3,000 ms when ready/offline.
- keep the last successful snapshot during a transient poll failure.
- send commands through one `runCommand(command)` function and prevent overlapping commands.
- pass snapshot and command state into either the connection panel or ready console.

`ReachyConnectionPanel` must render USB cards from `devices`, a disabled Wi-Fi card, a disabled simulation card, the selected COM port, and a primary `启动设备` button. For active phases render the four-stage progress bar; for errors pin the failed stage and show `重试` plus `复制诊断信息`.

- [ ] **Step 5: Run tests and confirm GREEN**

Run: `npx tsx --test lib/pet-ai-management-navigation.test.ts`

Expected: all navigation and UI source-contract tests pass.

- [ ] **Step 6: Review and request commit authorization**

Proposed commit: `feat: add the Reachy debug workspace`

---

### Task 4: Ready console, device controls, audio and logs

**Files:**
- Create: `components/views/pet-ai-management/reachy-ready-console.tsx`
- Modify: `components/views/pet-ai-management/reachy-debug-console.tsx`
- Modify: `lib/pet-ai-management-navigation.test.ts`

**Interfaces:**
- Consumes: `ReachyDeviceSnapshot` and `runCommand` from Task 3.
- Produces: `ReachyReadyConsole` with robot overview, application, actions, controller, audio and diagnostics.

- [ ] **Step 1: Write failing ready-console source tests**

Assert the new component contains labels for `Ready`, `ClawBody`, `表情与动作`, `机器人控制器`, `扬声器`, `麦克风`, `实时日志`, `唤醒`, `休眠`, `头部归中`, `天线测试`, `重启服务`, and `停止设备`.

- [ ] **Step 2: Run the test and confirm RED**

Run: `npx tsx --test lib/pet-ai-management-navigation.test.ts`

Expected: ready-console assertions fail.

- [ ] **Step 3: Build the approved Sentinel-light layout**

Use existing `Card`, `Button`, `Badge`, `Slider`, `AlertDialog`, `ScrollArea`, and icons. Build:

- top status card with USB/COM, daemon version, phase and ClawBody health.
- left robot stage using a neutral light-purple background and an accessible static robot placeholder until a repository-native model asset is available.
- right application card showing ClawBody and current session.
- quick cards for expressions and controller.
- lower audio cards and cursor-based logs.

Do not add black full-page surfaces or orange controls.

- [ ] **Step 4: Wire typed actions and safety rules**

- wake, sleep, center, antenna test and test sound call `device_action`.
- speaker and microphone sliders debounce for 250 ms and call `volume` with integer `0..100`.
- controller sliders clamp to the bounds defined in the Host Bridge contract and send `pose` no more than 10 times per second.
- disable movement controls unless phase is `ready` and `motor_mode` is compatible.
- `停止设备` uses `AlertDialog`; when a session is running, text explicitly states that the student conversation will stop first.
- `返回实时联调` calls `onReturnToManagement` and does not stop device or session.

- [ ] **Step 5: Implement log behavior**

Append only log entries with IDs greater than the current cursor, cap browser history at 300 entries, auto-scroll only if the user is already near the bottom, and provide `复制日志` using `navigator.clipboard.writeText`.

- [ ] **Step 6: Run tests and confirm GREEN**

Run: `npx tsx --test lib/pet-ai-management-navigation.test.ts`

Expected: all ready-console assertions pass.

- [ ] **Step 7: Review and request commit authorization**

Proposed commit: `feat: add Reachy device controls and diagnostics`

---

### Task 5: Best-effort Reachy camera preview and media degradation

**Files:**
- Modify: `lib/vision-camera.ts`
- Modify: `components/views/pet-ai-management/reachy-ready-console.tsx`
- Create: `lib/vision-camera.test.ts`

**Interfaces:**
- Consumes: browser `mediaDevices` API and device media state.
- Produces: implemented `reachyMiniCameraAdapter` and a preview tile with explicit unavailable/busy states.

- [x] **Step 1: Write failing camera adapter tests**

Mock `enumerateDevices` and `getUserMedia` and assert:

- labels matching `/reachy|mini/i` are preferred.
- absence of a matching camera throws `Reachy Mini 摄像头未被浏览器识别`.
- `NotReadableError` maps to `Reachy Mini 摄像头正被 daemon 或其他程序占用`.
- `stop()` stops every track.

- [x] **Step 2: Run the test and confirm RED**

Run: `npx tsx --test lib/vision-camera.test.ts`

Expected: tests fail because `reachyMiniCameraAdapter.start()` currently throws the unimplemented message.

- [x] **Step 3: Implement the adapter**

Request permission once, enumerate `videoinput` devices, select the first label matching `/reachy|mini/i`, and request:

```typescript
{ video: { deviceId: { exact: selected.deviceId }, width: { ideal: 640 }, height: { ideal: 480 } }, audio: false }
```

Return `{ stream, deviceLabel, stop }`. Never call daemon media-release automatically because that could interrupt ClawBody audio/video.

- [x] **Step 4: Add the preview tile**

Start preview only after the user clicks `打开摄像头预览`. If the camera is busy, keep the device Ready and show the mapped media warning. Closing the tile stops browser tracks. Camera preview failure must not disable motor or audio controls.

- [x] **Step 5: Run tests and confirm GREEN**

Run: `npx tsx --test lib/vision-camera.test.ts`

Expected: all camera adapter tests pass.

- [ ] **Step 6: Review and request commit authorization**

Proposed commit: `feat: add Reachy camera diagnostics`

---

### Task 6: Documentation, full verification and visual QA

**Files:**
- Modify: `README.md`
- Modify: `docs/PRD.md`
- Modify: `docs/superpowers/specs/2026-07-21-sentinel-reachy-device-console-design.md`
- Verify: Sentinel tests/build, ClawBody tests, Host Bridge smoke test and browser visuals.

**Interfaces:**
- Consumes: all earlier tasks and the running local services.
- Produces: user-facing configuration, synchronized OpenSpecs state and verified UI.

- [ ] **Step 1: Document configuration and daily use**

Document the two matching Host Bridge keys, ClawBody URL, one-time bridge installation and daily workflow:

```text
启动 Docker → 打开 Sentinel → 心宠调试 → 启动设备
```

State that Reachy Mini Control must be closed and VPN is not required for local device startup.

- [ ] **Step 2: Run focused tests**

```powershell
npx tsx --test lib/pet-ai/reachy-device.test.ts lib/pet-ai/pet-ai-api.test.ts lib/pet-ai-management-navigation.test.ts lib/vision-camera.test.ts
```

Expected: all tests pass.

- [ ] **Step 3: Run production build**

Run: `npm run build`

Expected: Next.js production build exits `0` with no TypeScript error.

- [ ] **Step 4: Run ClawBody regression tests**

From `C:/Users/txj12/Desktop/PsyTwin/clawbody-minimax` run:

```powershell
.\.venv\Scripts\python.exe -m pytest tests -q
```

Expected: all Python tests pass.

- [ ] **Step 5: Perform visual verification**

At `http://localhost:3000/pet-ai-management` verify at 1367×614 and 1440×900:

- segmented mode control fits in the header.
- management mode is visually unchanged.
- discovery, connecting, ready and error states use the Sentinel light theme.
- no horizontal overflow occurs.
- controls remain keyboard reachable and focus rings are visible.
- reduced-motion mode does not depend on animated progress for meaning.

Save screenshots as `screenshots/reachy-debug-discovery-2026-07-21.png`, `screenshots/reachy-debug-connecting-2026-07-21.png`, and `screenshots/reachy-debug-ready-2026-07-21.png`.

- [ ] **Step 6: Perform hardware acceptance with VPN and Reachy Control off**

Follow the eight-step hardware checklist in the accepted design spec. Record exact results for USB detection, four startup stages, motor controls, audio, camera, student session, conversation-only stop and full device stop.

- [ ] **Step 7: Synchronize OpenSpecs only for verified items**

Change a checklist item from `- [ ]` to `- [x]` only after its corresponding automated or hardware verification succeeds. Update `docs/PRD.md` with a dated completion note that distinguishes code completion from physical-device acceptance.

- [ ] **Step 8: Review and request commit authorization**

Proposed commit: `docs: document Sentinel Reachy device console`
