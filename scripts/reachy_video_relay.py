"""PsyTwin Reachy Mini Lite LAN video relay.

Control plane: JSON-RPC 2.0 at POST /rpc.
Media plane: MJPEG at GET /stream.mjpeg.
"""

from __future__ import annotations

import os
import threading
import time
from dataclasses import dataclass
from typing import Any

import cv2
from fastapi import FastAPI, Header, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv


# Keep the relay and Next.js on the same project-level configuration. Local
# overrides win, matching Next.js' usual .env.local -> .env precedence.
load_dotenv(".env.local", override=False)
load_dotenv(".env", override=False)


SERVICE_NAME = "psytwin-reachy-video-relay"
API_KEY = os.getenv("REACHY_RELAY_API_KEY", "dev-only-change-me")
CAMERA_INDEX = int(os.getenv("REACHY_RELAY_CAMERA_INDEX", "0"))
WIDTH = int(os.getenv("REACHY_RELAY_WIDTH", "960"))
HEIGHT = int(os.getenv("REACHY_RELAY_HEIGHT", "540"))
FPS = max(1, min(30, int(os.getenv("REACHY_RELAY_FPS", "24"))))
JPEG_QUALITY = max(25, min(90, int(os.getenv("REACHY_RELAY_JPEG_QUALITY", "65"))))


class RpcRequest(BaseModel):
    jsonrpc: str = Field(pattern=r"^2\.0$")
    id: str | int
    method: str
    params: dict[str, Any] = Field(default_factory=dict)


@dataclass
class RelaySnapshot:
    running: bool
    camera_index: int
    width: int
    height: int
    fps: int
    last_frame_at: float | None
    error: str | None


class CameraRelay:
    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._frame_ready = threading.Condition(self._lock)
        self._stop = threading.Event()
        self._thread: threading.Thread | None = None
        self._capture: cv2.VideoCapture | None = None
        self._frame: bytes | None = None
        self._last_frame_at: float | None = None
        self._error: str | None = None

    def snapshot(self) -> RelaySnapshot:
        with self._lock:
            return RelaySnapshot(
                running=self._thread is not None and self._thread.is_alive() and self._error is None,
                camera_index=CAMERA_INDEX,
                width=WIDTH,
                height=HEIGHT,
                fps=FPS,
                last_frame_at=self._last_frame_at,
                error=self._error,
            )

    def start(self) -> RelaySnapshot:
        with self._lock:
            if self._thread is not None and self._thread.is_alive():
                return self.snapshot_unlocked()
            self._stop.clear()
            self._error = None
            self._thread = threading.Thread(target=self._capture_loop, name="reachy-video-relay", daemon=True)
            self._thread.start()

        deadline = time.monotonic() + 4.0
        while time.monotonic() < deadline:
            snapshot = self.snapshot()
            if snapshot.running and snapshot.last_frame_at is not None:
                return snapshot
            if snapshot.error:
                return snapshot
            time.sleep(0.05)
        return self.snapshot()

    def snapshot_unlocked(self) -> RelaySnapshot:
        return RelaySnapshot(
            running=self._thread is not None and self._thread.is_alive() and self._error is None,
            camera_index=CAMERA_INDEX,
            width=WIDTH,
            height=HEIGHT,
            fps=FPS,
            last_frame_at=self._last_frame_at,
            error=self._error,
        )

    def stop(self) -> RelaySnapshot:
        self._stop.set()
        thread = self._thread
        if thread is not None:
            thread.join(timeout=3.0)
        with self._lock:
            self._thread = None
            self._frame = None
            self._last_frame_at = None
        return self.snapshot()

    def wait_for_frame(self, previous: bytes | None) -> bytes | None:
        with self._frame_ready:
            self._frame_ready.wait_for(
                lambda: self._frame is not None and self._frame is not previous or self._stop.is_set(),
                timeout=2.0,
            )
            return self._frame

    def _capture_loop(self) -> None:
        capture = cv2.VideoCapture(CAMERA_INDEX, cv2.CAP_DSHOW)
        self._capture = capture
        capture.set(cv2.CAP_PROP_FRAME_WIDTH, WIDTH)
        capture.set(cv2.CAP_PROP_FRAME_HEIGHT, HEIGHT)
        capture.set(cv2.CAP_PROP_FPS, FPS)
        capture.set(cv2.CAP_PROP_BUFFERSIZE, 1)

        if not capture.isOpened():
            with self._frame_ready:
                self._error = f"无法打开摄像头索引 {CAMERA_INDEX}；设备可能被 Reachy daemon 或其他程序占用"
                self._frame_ready.notify_all()
            capture.release()
            return

        frame_interval = 1.0 / FPS
        try:
            while not self._stop.is_set():
                started = time.monotonic()
                ok, frame = capture.read()
                if not ok:
                    with self._frame_ready:
                        self._error = "摄像头读取失败"
                        self._frame_ready.notify_all()
                    return
                encoded, buffer = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, JPEG_QUALITY])
                if encoded:
                    with self._frame_ready:
                        self._frame = buffer.tobytes()
                        self._last_frame_at = time.time()
                        self._error = None
                        self._frame_ready.notify_all()
                self._stop.wait(max(0.0, frame_interval - (time.monotonic() - started)))
        finally:
            capture.release()
            self._capture = None


relay = CameraRelay()
app = FastAPI(title="PsyTwin Reachy Video Relay", version="0.1.0")


def authorize(x_relay_key: str | None) -> None:
    if not x_relay_key or x_relay_key != API_KEY:
        raise HTTPException(status_code=401, detail="中继服务密钥无效")


def snapshot_payload() -> dict[str, Any]:
    snapshot = relay.snapshot()
    return {
        "service": SERVICE_NAME,
        "running": snapshot.running,
        "cameraIndex": snapshot.camera_index,
        "width": snapshot.width,
        "height": snapshot.height,
        "fps": snapshot.fps,
        "lastFrameAt": snapshot.last_frame_at,
        "error": snapshot.error,
        "transport": "mjpeg",
    }


@app.get("/health")
def health() -> dict[str, Any]:
    return {"service": SERVICE_NAME, "ok": True}


@app.post("/rpc")
def rpc(request: RpcRequest, x_relay_key: str | None = Header(default=None)) -> dict[str, Any]:
    authorize(x_relay_key)
    if request.method == "stream.status":
        result = snapshot_payload()
    elif request.method == "stream.start":
        relay.start()
        result = snapshot_payload()
    elif request.method == "stream.stop":
        relay.stop()
        result = snapshot_payload()
    else:
        return {
            "jsonrpc": "2.0",
            "id": request.id,
            "error": {"code": -32601, "message": "不支持的 RPC 方法"},
        }
    return {"jsonrpc": "2.0", "id": request.id, "result": result}


@app.get("/stream.mjpeg")
def stream(x_relay_key: str | None = Header(default=None)) -> StreamingResponse:
    authorize(x_relay_key)
    snapshot = relay.start()
    if snapshot.error:
        raise HTTPException(status_code=503, detail=snapshot.error)

    def frames():
        previous: bytes | None = None
        while True:
            frame = relay.wait_for_frame(previous)
            if frame is None:
                return
            previous = frame
            yield b"--frame\r\nContent-Type: image/jpeg\r\nCache-Control: no-store\r\n\r\n" + frame + b"\r\n"

    return StreamingResponse(
        frames(),
        media_type="multipart/x-mixed-replace; boundary=frame",
        headers={"Cache-Control": "no-store, no-cache, must-revalidate"},
    )


@app.on_event("shutdown")
def shutdown() -> None:
    relay.stop()
