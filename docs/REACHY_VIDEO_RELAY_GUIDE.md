# Reachy Mini Lite 视频中继使用指南

本功能让 Reachy Mini Lite 保持 USB 连接到直播室电脑，由该电脑通过局域网向 Sentinel 传输实时视频。

默认模式只需要在运行 Sentinel 的电脑修改 `.env.local` 中的 `REACHY_RELAY_HOST`。端口固定为 `7862`，无人咨询直播室不需要再填写主机地址或手动点击连接。

## 双机拓扑

```text
Reachy Mini Lite
      │ USB（摄像头）
      ▼
电脑 A：直播主机 / 视频中继（0.0.0.0:7862）
      │ 局域网 MJPEG + JSON-RPC
      ▼
电脑 B：PsyTwin Sentinel → 无人咨询直播室
```

两台电脑必须处于同一局域网。电脑 A 的地址应使用 WLAN/以太网的私有 IPv4 地址，例如 `192.168.0.102`，不要填写 `127.0.0.1`。

## 单机测试

1. 安装项目内独立 Python 环境：

   ```powershell
   npm run relay:install
   ```

2. 在 `.env.local` 中配置同一密钥：

   ```dotenv
   REACHY_RELAY_HOST="127.0.0.1"
   REACHY_RELAY_API_KEY="dev-only-change-me"
   NEXT_PUBLIC_REACHY_RELAY_ENABLED="true"
   ```

3. 在当前电脑启动视频中继：

   ```powershell
   npm run relay:start
   ```

   中继会自动读取项目根目录的 `.env.local` 和 `.env`，无需再设置 PowerShell 环境变量。

4. 打开“心宠 AI 管理中心 → 心宠调试 → 直播主机”，填写 `127.0.0.1` 和端口 `7862`，点击“连接并检测”。
5. 打开“无人咨询直播室”，页面会通过 Sentinel 同源代理自动播放中继画面。

## 两台电脑

### 电脑 A：连接 Reachy USB

1. 拉取代码并安装依赖，同时注册 Windows 登录自启任务：

   ```powershell
   npm install
   npm run relay:setup
   ```

   `relay:setup` 只需在连接 Reachy USB 的电脑上执行一次。任务使用项目内虚拟环境、监听 `0.0.0.0:7862`，登录 Windows 后自动启动；中继在收到画面请求时才打开摄像头。

   安装完成后，项目根目录会生成 `摄像机同步服务.bat`。电脑重启后如果计划任务没有及时启动，直接双击这个文件即可；脚本会先检查已有服务，再启动计划任务或后台中继，并自动验证 `7862` 健康状态。

2. 查看电脑 A 的 WLAN/以太网 IPv4 地址：

   ```powershell
   ipconfig
   ```

3. 首次安装后可立即检查中继。该任务固定监听 `0.0.0.0:7862`，允许本机局域网 IP 和电脑 B 访问：

   ```powershell
   Invoke-WebRequest http://127.0.0.1:7862/health
   ```

4. 在电脑 A 浏览器验证服务：

   ```text
   http://192.168.0.109:7862/health
   ```

   正常结果包含 `"ok": true`。

### 电脑 B：运行 Sentinel

1. 在项目根目录创建或修改 `.env.local`，只需要修改电脑 A 的 IP；密钥保持与电脑 A 一致：

   ```dotenv
   REACHY_RELAY_HOST="192.168.0.109"
   REACHY_RELAY_API_KEY="dev-only-change-me"
   NEXT_PUBLIC_REACHY_RELAY_ENABLED="true"
   ```

   后续电脑 A 的局域网 IP 变化时，只改 `REACHY_RELAY_HOST`；不要设置 `REACHY_RELAY_URL` 或另一个视频地址覆盖它。

2. 启动或重启 Sentinel，让环境变量生效：

   ```powershell
   npm run dev
   ```

3. 直接打开“无人咨询直播室”查看画面。页面会通过 Sentinel 同源代理自动启动/读取中继，并在失败时每 3 秒重试。

- 两台电脑的 `REACHY_RELAY_API_KEY` 必须一致。
- Windows 防火墙仅在专用网络中允许 TCP 7862，不要暴露到公网。

## Windows 防火墙

如果电脑 A 本机能打开 `/health`，电脑 B 无法打开，请在电脑 A 上为 TCP 7862 创建仅适用于“专用”网络的入站规则。也可以首次启动 Python 时在 Windows 安全提示中勾选“专用网络”并允许访问。

电脑 B 可用以下命令检查端口：

```powershell
Test-NetConnection 192.168.0.102 -Port 7862
```

`TcpTestSucceeded : True` 表示网络和防火墙已连通。

## 启动顺序与验收

1. 电脑 A 接好 Reachy USB，并确认没有其他程序占用摄像头。
2. 电脑 A 执行一次 `npm run relay:setup`，然后确认登录后计划任务正在运行。
3. 电脑 A 打开 `/health`，确认服务在线。
4. 电脑 B 执行 `Test-NetConnection`，确认 7862 可达。
5. 电脑 B 重启 Sentinel，执行“连接并检测”。
6. 无人咨询直播室出现实时画面即完成验收。

## 常见故障

| 现象 | 原因 | 处理 |
|---|---|---|
| `127.0.0.1` 可用，局域网 IP 不可用 | 旧中继只监听回环地址 | 使用 `npm run relay:start`，确认监听地址为 `0.0.0.0:7862` |
| 电脑 A 可用，电脑 B 端口测试失败 | 防火墙或两台电脑不在同一局域网 | 放行专用网络 TCP 7862，检查 Wi-Fi/VLAN |
| 连接返回 401 | 两台电脑密钥不一致 | 保持 `REACHY_RELAY_API_KEY` 相同并重启服务 |
| 提示摄像头被占用 | Reachy daemon、浏览器或其他程序独占摄像头 | 关闭占用程序后重启中继 |
| 修改 IP 后仍访问旧地址 | Next.js 尚未重新读取环境变量 | 重启 `npm run dev` 或生产服务；不要保留 `REACHY_RELAY_URL` 覆盖项 |
| 画面卡顿 | Wi-Fi 信号弱或 JPEG 参数过高 | 优先使用 5 GHz/有线网络，降低分辨率、FPS 或 JPEG 质量 |

## 摄像头配置

中继默认使用已验证的 Reachy Mini 摄像头索引 `1`，所以正常部署不需要额外配置。只有设备管理器中的摄像头顺序确实变化时，才在连接 USB 的电脑 `.env.local` 中覆盖，并重新启动计划任务：

```dotenv
REACHY_RELAY_CAMERA_INDEX="1"
```

```powershell
npm run relay:install-task
```

Reachy daemon、浏览器和中继服务不能同时独占同一个 USB 摄像头。若提示设备占用，请先关闭当前直接读取摄像头的页面或释放 daemon 媒体。

## RPC

中继提供 JSON-RPC 2.0：

- `stream.status`：读取状态。
- `stream.start`：启动摄像头和视频流。
- `stream.stop`：停止摄像头。

视频数据通过 `/stream.mjpeg` 传输，不将连续视频帧塞入 RPC 请求。
