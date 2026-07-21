# ClawBody Windows Host Bridge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a secure Windows-only local service that discovers Reachy Mini Lite over USB, owns one `reachy-mini-daemon` process, exposes typed device controls to Sentinel, and starts automatically at Windows login.

**Architecture:** A new `reachy_mini_openclaw.host_bridge` package runs a FastAPI service on `127.0.0.1:7861`. `DaemonManager` owns process state and delegates robot operations to the existing Reachy daemon REST API on `127.0.0.1:8000`; Sentinel remains the only browser-facing service and Docker continues to reach the daemon through `host.docker.internal:8000`.

**Tech Stack:** Python 3.11, FastAPI, Pydantic, httpx, pyserial, asyncio, Windows Task Scheduler, pytest.

## Global Constraints

- Target Windows 10/11 and Reachy Mini SDK `1.8.0` for the first implementation.
- Bind Host Bridge only to `127.0.0.1:7861`.
- Accept only typed, predefined operations; never accept shell commands or executable paths from HTTP requests.
- Start at most one owned daemon process and stop only its recorded PID.
- Do not access Hugging Face, GitHub, OpenAI, or any application catalog during device startup.
- Preserve all existing uncommitted files in `C:/Users/txj12/Desktop/PsyTwin/clawbody-minimax`.
- Do not delete files, containers, images, processes, or scheduled tasks outside the exact `PsyTwin ClawBody Host Bridge` target.
- Do not commit automatically. At each commit checkpoint, show the exact diff and request user authorization.

## File Map

- Create `src/reachy_mini_openclaw/host_bridge/models.py`: public enums and Pydantic contracts.
- Create `src/reachy_mini_openclaw/host_bridge/log_store.py`: bounded log storage and redaction.
- Create `src/reachy_mini_openclaw/host_bridge/daemon_client.py`: typed Reachy daemon REST client.
- Create `src/reachy_mini_openclaw/host_bridge/manager.py`: discovery, lifecycle state machine, locking and process ownership.
- Create `src/reachy_mini_openclaw/host_bridge/api.py`: authenticated FastAPI routes and service entry point.
- Create `src/reachy_mini_openclaw/host_bridge/autostart.py`: install/status/restart/uninstall CLI for the single login task.
- Create `src/reachy_mini_openclaw/host_bridge/__init__.py`: package exports.
- Create `tests/test_host_bridge_models.py`, `tests/test_host_bridge_daemon_client.py`, `tests/test_host_bridge_manager.py`, `tests/test_host_bridge_api.py`, `tests/test_host_bridge_autostart.py`.
- Modify `pyproject.toml`: register Host Bridge service and administration commands.
- Modify `.env.example`, `README.md`, and `DOCKER_SETUP.md`: configuration and operating instructions.

---

### Task 1: Device contracts and bounded redacted logs

**Files:**
- Create: `src/reachy_mini_openclaw/host_bridge/__init__.py`
- Create: `src/reachy_mini_openclaw/host_bridge/models.py`
- Create: `src/reachy_mini_openclaw/host_bridge/log_store.py`
- Test: `tests/test_host_bridge_models.py`

**Interfaces:**
- Consumes: no earlier task interfaces.
- Produces: `DevicePhase`, `DeviceAction`, `DeviceError`, `SerialDevice`, `MediaStatus`, `DeviceStatus`, `StartRequest`, `ActionRequest`, `PoseRequest`, `VolumeRequest`, `LogEntry`, and `LogStore`.

- [ ] **Step 1: Write failing contract and redaction tests**

```python
from reachy_mini_openclaw.host_bridge.log_store import LogStore
from reachy_mini_openclaw.host_bridge.models import DevicePhase, DeviceStatus


def test_device_status_serializes_stable_phase_values():
    status = DeviceStatus(phase=DevicePhase.HEALTHCHECKING)
    assert status.model_dump(mode="json")["phase"] == "healthchecking"


def test_log_store_bounds_history_and_redacts_secrets():
    store = LogStore(limit=2)
    store.append("info", "first")
    store.append("info", "Authorization: Bearer secret-token")
    store.append("error", "MINIMAX_API_KEY=sk-private")
    result = store.after(0)
    assert len(result["items"]) == 2
    assert "secret-token" not in str(result)
    assert "sk-private" not in str(result)
    assert "[REDACTED]" in str(result)
```

- [ ] **Step 2: Run the test and confirm RED**

Run:

```powershell
.\.venv\Scripts\python.exe -m pytest tests/test_host_bridge_models.py -q
```

Expected: collection fails because `reachy_mini_openclaw.host_bridge` does not exist.

- [ ] **Step 3: Add stable models**

Implement `models.py` with these exact public values and fields:

```python
from enum import StrEnum
from typing import Literal

from pydantic import BaseModel, Field


class DevicePhase(StrEnum):
    OFFLINE = "offline"
    DISCOVERING = "discovering"
    STARTING = "starting"
    CONNECTING = "connecting"
    HEALTHCHECKING = "healthchecking"
    LOADING_APPS = "loading_apps"
    READY = "ready"
    STOPPING = "stopping"
    ERROR = "error"


class DeviceAction(StrEnum):
    WAKE_UP = "wake_up"
    GOTO_SLEEP = "goto_sleep"
    CENTER = "center"
    ANTENNA_TEST = "antenna_test"
    TEST_SOUND = "test_sound"


class DeviceError(BaseModel):
    code: str
    phase: DevicePhase
    message: str
    detail: str | None = None


class SerialDevice(BaseModel):
    port: str
    label: str
    vid: str = "1A86"
    pid: str = "55D3"


class MediaStatus(BaseModel):
    camera: Literal["ready", "unavailable", "unknown"] = "unknown"
    microphone: Literal["ready", "unavailable", "unknown"] = "unknown"
    speaker: Literal["ready", "unavailable", "unknown"] = "unknown"
    input_volume: int | None = None
    output_volume: int | None = None


class DeviceStatus(BaseModel):
    phase: DevicePhase = DevicePhase.OFFLINE
    operation_id: str | None = None
    serial_port: str | None = None
    daemon_owned: bool = False
    daemon_pid: int | None = None
    daemon_version: str | None = None
    daemon_state: str | None = None
    motor_mode: str | None = None
    media: MediaStatus = Field(default_factory=MediaStatus)
    clawbody_reachable: bool = False
    error: DeviceError | None = None


class StartRequest(BaseModel):
    serial_port: str | None = Field(default=None, pattern=r"^COM\d+$")


class ActionRequest(BaseModel):
    action: DeviceAction


class PoseRequest(BaseModel):
    head_pitch: float = Field(default=0, ge=-40, le=40)
    head_roll: float = Field(default=0, ge=-40, le=40)
    head_yaw: float = Field(default=0, ge=-65, le=65)
    body_yaw: float = Field(default=0, ge=-180, le=180)
    left_antenna: float = Field(default=0, ge=-3.1416, le=3.1416)
    right_antenna: float = Field(default=0, ge=-3.1416, le=3.1416)
    duration: float = Field(default=0.5, ge=0.1, le=5)


class VolumeRequest(BaseModel):
    target: Literal["speaker", "microphone"]
    volume: int = Field(ge=0, le=100)


class LogEntry(BaseModel):
    id: int
    level: Literal["debug", "info", "warning", "error"]
    message: str
    created_at: str
```

- [ ] **Step 4: Implement bounded redaction**

Implement `LogStore(limit=300)` using a `deque`, monotonically increasing cursor, `threading.Lock`, and these redaction patterns before truncating each message to 2,000 characters:

```python
REDACTIONS = (
    re.compile(r"(?i)(authorization\s*:\s*bearer\s+)\S+"),
    re.compile(r"(?i)((?:api[_-]?key|token|secret|password)\s*[=:]\s*)\S+"),
)
```

`after(cursor)` must return `{"cursor": current_cursor, "items": [...]}` using serialized `LogEntry` dictionaries.

- [ ] **Step 5: Run tests and confirm GREEN**

Run:

```powershell
.\.venv\Scripts\python.exe -m pytest tests/test_host_bridge_models.py -q
```

Expected: `2 passed`.

- [ ] **Step 6: Review and request commit authorization**

Proposed commit: `feat: add Reachy host bridge contracts`

---

### Task 2: Typed Reachy daemon REST client

**Files:**
- Create: `src/reachy_mini_openclaw/host_bridge/daemon_client.py`
- Test: `tests/test_host_bridge_daemon_client.py`

**Interfaces:**
- Consumes: `DeviceAction`, `MediaStatus`, `PoseRequest`, `VolumeRequest` from Task 1.
- Produces: `ReachyDaemonClient(base_url: str, timeout: float)` with `status`, `wait_until_ready`, `snapshot`, `perform`, `set_pose`, and `set_volume` async methods.

- [ ] **Step 1: Write failing HTTP contract tests**

Use `httpx.MockTransport` and assert these exact daemon calls:

```python
async def test_wake_up_uses_reachy_move_endpoint():
    requests = []
    async def handler(request):
        requests.append((request.method, request.url.path))
        return httpx.Response(200, json={"uuid": "00000000-0000-0000-0000-000000000001"})
    client = ReachyDaemonClient(transport=httpx.MockTransport(handler))
    await client.perform(DeviceAction.WAKE_UP)
    assert requests == [("POST", "/api/move/play/wake_up")]


async def test_snapshot_degrades_media_without_losing_motor_state():
    # Return daemon ready and motors enabled, but make camera specs return 503.
    snapshot = await client.snapshot()
    assert snapshot["motor_mode"] == "enabled"
    assert snapshot["media"].camera == "unavailable"
```

- [ ] **Step 2: Run the test and confirm RED**

Run: `.\.venv\Scripts\python.exe -m pytest tests/test_host_bridge_daemon_client.py -q`

Expected: import fails because `daemon_client.py` does not exist.

- [ ] **Step 3: Implement the client with exact endpoint mapping**

Use one `httpx.AsyncClient` and these endpoints:

```python
ACTION_PATHS = {
    DeviceAction.WAKE_UP: "/api/move/play/wake_up",
    DeviceAction.GOTO_SLEEP: "/api/move/play/goto_sleep",
    DeviceAction.TEST_SOUND: "/api/volume/test-sound",
}
```

- `status`: `GET /api/daemon/status`.
- motor state: `GET /api/motors/status`.
- media state: `GET /api/media/status` and `GET /api/camera/specs`.
- speaker volume: `GET /api/volume/current`.
- microphone volume: `GET /api/volume/microphone/current`.
- installed app status: `GET /api/apps/current-app-status`.
- `CENTER`: `POST /api/move/goto` with zero pose, zero antennas, zero body yaw, `duration=1.0`, `interpolation="minjerk"`.
- `ANTENNA_TEST`: post `antennas=[0.7, -0.7]`, wait 0.4 seconds, then post `antennas=[0, 0]`.
- pose control: `POST /api/move/goto`, converting degrees to radians for roll, pitch, yaw and body yaw.
- volumes: `POST /api/volume/set` or `/api/volume/microphone/set` with `{"volume": value}`.

Every non-2xx response must raise `DaemonRequestError(status_code, detail)` with daemon `detail` preserved but not credentials.

- [ ] **Step 4: Run tests and confirm GREEN**

Run: `.\.venv\Scripts\python.exe -m pytest tests/test_host_bridge_daemon_client.py -q`

Expected: all daemon client tests pass.

- [ ] **Step 5: Review and request commit authorization**

Proposed commit: `feat: add typed Reachy daemon client`

---

### Task 3: Idempotent daemon process manager and state machine

**Files:**
- Create: `src/reachy_mini_openclaw/host_bridge/manager.py`
- Test: `tests/test_host_bridge_manager.py`

**Interfaces:**
- Consumes: Task 1 contracts and `ReachyDaemonClient` from Task 2.
- Produces: `DaemonManager(discover_ports, process_factory, daemon_client, logs, clawbody_health_url)` with async `discover`, `start`, `stop`, `restart`, `perform`, `set_pose`, `set_volume`, `status`, and `logs_after`.

- [ ] **Step 1: Write failing lifecycle tests**

Cover these exact behaviors with injected fakes:

```python
async def test_two_concurrent_starts_create_one_process():
    results = await asyncio.gather(manager.start(StartRequest()), manager.start(StartRequest()))
    assert process_factory.call_count == 1
    assert results[0].operation_id == results[1].operation_id


async def test_multiple_ports_require_explicit_selection():
    discover_ports.return_value = ["COM5", "COM8"]
    status = await manager.start(StartRequest())
    assert status.phase == DevicePhase.ERROR
    assert status.error.code == "multiple_serial_ports"


async def test_stop_never_terminates_reused_external_daemon():
    daemon_client.status.return_value = {"state": "running"}
    await manager.status()
    result = await manager.stop()
    assert result.error.code == "daemon_not_owned"
    process_factory.assert_not_called()
```

- [ ] **Step 2: Run the test and confirm RED**

Run: `.\.venv\Scripts\python.exe -m pytest tests/test_host_bridge_manager.py -q`

Expected: import fails because `manager.py` does not exist.

- [ ] **Step 3: Implement discovery and process creation**

Default discovery must call:

```python
from reachy_mini.daemon.utils import find_serial_port

ports = find_serial_port(wireless_version=False, vid="1a86", pid="55d3")
```

Build the child command internally:

```python
[
    sys.executable,
    "-m",
    "reachy_mini.daemon.app.main",
    "--serialport",
    selected_port,
    "--localhost-only",
    "--log-level",
    "INFO",
]
```

On Windows use `subprocess.CREATE_NO_WINDOW | subprocess.CREATE_NEW_PROCESS_GROUP`, pipe combined stdout/stderr, and record the returned PID as owned. The serial port comes only from discovery or a request value that exactly matches a discovered port.

- [ ] **Step 4: Implement the lifecycle state machine**

Use one `asyncio.Lock` plus one `_operation_task`. `start` must return the current status immediately with an `operation_id`; the background task must transition through `STARTING`, `CONNECTING`, `HEALTHCHECKING`, `LOADING_APPS`, and `READY`.

Timeouts:

- process begins listening: 15 seconds.
- daemon reports running/ready: 45 seconds.
- ClawBody health probe: 5 seconds, but failure only sets `clawbody_reachable=False` and does not fail hardware startup.

`stop` must reject unowned external daemons with `daemon_not_owned`. For an owned daemon it must request `POST /api/move/play/goto_sleep`, wait at most 3 seconds, call `process.terminate()`, wait 5 seconds, then call `process.kill()` only for that recorded PID if termination times out.

- [ ] **Step 5: Stream stdout into the redacted log store**

Read the owned process output on a daemon thread, map lines containing `ERROR` to error, `WARNING` to warning, and all others to info, then call `LogStore.append`. On child exit, schedule state reconciliation on the manager event loop.

- [ ] **Step 6: Run tests and confirm GREEN**

Run: `.\.venv\Scripts\python.exe -m pytest tests/test_host_bridge_manager.py -q`

Expected: all manager tests pass without creating a real process.

- [ ] **Step 7: Review and request commit authorization**

Proposed commit: `feat: manage the Reachy daemon lifecycle`

---

### Task 4: Authenticated Host Bridge API

**Files:**
- Create: `src/reachy_mini_openclaw/host_bridge/api.py`
- Test: `tests/test_host_bridge_api.py`
- Modify: `pyproject.toml`

**Interfaces:**
- Consumes: `DaemonManager` and Task 1 request models.
- Produces: `create_app(manager) -> FastAPI`, module-level `app`, and `main()` service entry point.

- [ ] **Step 1: Write failing API tests**

Assert:

- `GET /health` is public.
- every `/v1/*` route requires matching `X-Host-Bridge-Key`.
- start, stop, restart, action, pose and volume bodies are validated by Pydantic.
- logs support `after >= 0`.
- arbitrary action values and extra shell/path fields return `422`.

- [ ] **Step 2: Run the test and confirm RED**

Run: `.\.venv\Scripts\python.exe -m pytest tests/test_host_bridge_api.py -q`

Expected: import fails because `api.py` does not exist.

- [ ] **Step 3: Implement the exact route surface**

```text
GET  /health
GET  /v1/device/discover
GET  /v1/device/status
POST /v1/device/start
POST /v1/device/stop
POST /v1/device/restart
POST /v1/device/action
POST /v1/device/pose
POST /v1/device/volume
GET  /v1/device/logs?after=0
```

Read the expected key from `HOST_BRIDGE_API_KEY`; refuse to start outside tests if it is empty or equals `replace-with-a-long-random-value`. Use `hmac.compare_digest` for comparison. Configure Uvicorn with `HOST_BRIDGE_HOST=127.0.0.1` and `HOST_BRIDGE_PORT=7861`; reject a non-loopback host value.

- [ ] **Step 4: Register entry points**

Add exactly:

```toml
clawbody-host-bridge = "reachy_mini_openclaw.host_bridge.api:main"
clawbody-host = "reachy_mini_openclaw.host_bridge.autostart:main"
```

- [ ] **Step 5: Run tests and confirm GREEN**

Run: `.\.venv\Scripts\python.exe -m pytest tests/test_host_bridge_api.py -q`

Expected: API tests pass.

- [ ] **Step 6: Review and request commit authorization**

Proposed commit: `feat: expose the Reachy host bridge API`

---

### Task 5: Current-user Windows login task administration

**Files:**
- Create: `src/reachy_mini_openclaw/host_bridge/autostart.py`
- Test: `tests/test_host_bridge_autostart.py`

**Interfaces:**
- Consumes: installed `clawbody-host-bridge` entry point and current Python environment.
- Produces: `clawbody-host install|status|restart|uninstall`.

- [ ] **Step 1: Write failing command-generation tests**

Test exact task name `PsyTwin ClawBody Host Bridge`, current-user `ONLOGON` schedule, `pythonw.exe` path derived from `sys.executable`, and that uninstall targets only that exact task name.

- [ ] **Step 2: Run the test and confirm RED**

Run: `.\.venv\Scripts\python.exe -m pytest tests/test_host_bridge_autostart.py -q`

Expected: import fails because `autostart.py` does not exist.

- [ ] **Step 3: Implement the administration CLI**

Use `argparse` with required subcommands. Generate a Task Scheduler XML file in `tempfile.TemporaryDirectory()` containing:

- `LogonTrigger` for the current user SID.
- `RunLevel=LeastPrivilege`.
- `Hidden=true`.
- executable `.venv\Scripts\pythonw.exe`.
- arguments `-m reachy_mini_openclaw.host_bridge.api`.
- working directory equal to the repository root captured at install time.

Call `schtasks.exe /Create /TN "PsyTwin ClawBody Host Bridge" /XML <file> /F`. `status` calls `/Query`; `restart` calls `/End` then `/Run`; `uninstall` asks for explicit `--yes` and calls `/Delete /TN <exact-name> /F`.

- [ ] **Step 4: Run tests and confirm GREEN**

Run: `.\.venv\Scripts\python.exe -m pytest tests/test_host_bridge_autostart.py -q`

Expected: all tests pass with `subprocess.run` mocked; no real task is created.

- [ ] **Step 5: Review and request commit authorization**

Proposed commit: `feat: add Host Bridge login task management`

---

### Task 6: Configuration, documentation and backend verification

**Files:**
- Modify: `.env.example`
- Modify: `README.md`
- Modify: `DOCKER_SETUP.md`
- Verify: all Host Bridge and existing Python tests.

**Interfaces:**
- Consumes: completed Host Bridge CLI and API.
- Produces: documented one-time installation and daily operating workflow.

- [ ] **Step 1: Add non-secret configuration examples**

Add:

```dotenv
HOST_BRIDGE_HOST=127.0.0.1
HOST_BRIDGE_PORT=7861
HOST_BRIDGE_API_KEY=replace-with-a-long-random-value
HOST_BRIDGE_DAEMON_URL=http://127.0.0.1:8000
HOST_BRIDGE_CLAWBODY_HEALTH_URL=http://127.0.0.1:7860/health
```

- [ ] **Step 2: Document installation and use**

Document these exact commands and meanings:

```powershell
.\.venv\Scripts\Activate.ps1
clawbody-host install
clawbody-host status
clawbody-host restart
clawbody-host uninstall --yes
```

Daily use must read: start Docker, open Sentinel, select “心宠调试”, click “启动设备”. State that Reachy Mini Control must be closed and VPN is not required for device startup.

- [ ] **Step 3: Run focused and full verification**

Run:

```powershell
.\.venv\Scripts\python.exe -m pytest tests/test_host_bridge_models.py tests/test_host_bridge_daemon_client.py tests/test_host_bridge_manager.py tests/test_host_bridge_api.py tests/test_host_bridge_autostart.py -q
.\.venv\Scripts\python.exe -m pytest tests -q
.\.venv\Scripts\python.exe -m ruff check src/reachy_mini_openclaw/host_bridge tests/test_host_bridge_*.py
.\.venv\Scripts\python.exe -m mypy src/reachy_mini_openclaw/host_bridge
```

Expected: every command exits `0`.

- [ ] **Step 4: Perform manual safe smoke test without hardware mutation**

Run the bridge in a terminal, request `/health`, request authenticated `/v1/device/discover`, and verify it reports either the exact Reachy port or an empty list. Do not start or move the robot in this step.

- [ ] **Step 5: Review and request commit authorization**

Proposed commit: `docs: document Reachy Host Bridge setup`

