# Reachy 直播画面故障处理记录（2026-08-04）

## 问题

无人咨询直播室最初没有画面。中继安装命令看似执行完成，但启动时提示“系统找不到指定的路径”。中继恢复后，画面显示的是笔记本内置摄像头，而不是 Reachy Mini 摄像头。

## 排查结果

1. `.env.local` 已启用中继，目标地址为 `192.168.0.109:7862`。
2. `7862` 端口最初没有监听，且 `.venv-video-relay` 不存在。
3. Windows 的 `python` 命令解析到了 Microsoft Store 空壳别名，退出码为 `9009`；实际可用的 Python 启动器是 `py -3.11`。
4. 安装依赖并启动中继后，`/health` 返回 200，JSON-RPC `stream.start` 返回 `running=true`、`transport=mjpeg`，且持续产生 `lastFrameAt`。
5. Windows 摄像设备枚举结果显示：索引 `0` 为 `Integrated Camera`，索引 `1` 为 `Reachy Mini Camera`。中继默认索引为 `0`，因此此前显示的是笔记本摄像头。

## 修复内容

- 将 `package.json` 的 `relay:install` 改为使用 `py -3.11 -m venv`，避免 Windows Store `python` 别名导致虚拟环境创建失败。
- 在本机 `.env.local` 增加 `REACHY_RELAY_CAMERA_INDEX="1"`，指定 Reachy Mini 摄像头。
- 重启 `7862` 中继并调用 `stream.start` 验证 Reachy 视频流。
- 在 `docs/PRD.md` 回写本次联调和实时帧验证状态。

## 验证结果

当前中继状态：

```text
cameraIndex: 1
width: 960
height: 540
fps: 24
running: true
transport: mjpeg
error: null
```

访问 `/stream.mjpeg` 返回 HTTP 200，并持续收到视频字节。刷新无人咨询直播室后应显示 Reachy Mini 摄像头画面。

## 后续排障

若再次显示笔记本摄像头，检查 `.env.local` 中的 `REACHY_RELAY_CAMERA_INDEX` 是否为 `1`，修改后重启 `npm run relay:start`。若设备索引因 USB 重连变化，应重新执行 `pnputil /enum-devices /class Camera` 确认索引，并检查 Reachy daemon 是否占用摄像头。
