# 心宠对话与设备配置变更说明（2026-08-03）

本文记录 Sentinel 配套 ClawBody 的心宠对话、设备和部署配置调整。

## 对话链路

### 关闭 LLM 思考模式

当前通义兼容接口请求显式使用：

```env
MINIMAX_ENABLE_THINKING=false
```

该变量名保留 `MINIMAX_*` 只是为了兼容现有代码；实际部署模型为阿里云百炼/通义兼容模型。关闭后模型直接生成回答，不再额外生成思考 Token。

### 风险对话只调用一次 LLM

普通对话和中/高风险对话都只调用一次 LLM。风险对话页面仍显示：

1. 情绪识别
2. 转交小芯 AI
3. 小芯专业建议
4. 心宠完成转述

其中前 3 个协作阶段由本地风险关键词和模板生成，仅用于可审核的界面演示，不会再次调用 LLM，也不会自动创建真实预警、工单或咨询记录。唯一一次模型请求直接生成最终心宠回复。

## 设备与语音

Host Bridge 启动的 Reachy daemon 使用无摄像头模式，保留麦克风、扬声器、电机和动作控制，让 Sentinel 的无人咨询直播室可以独占相机预览。更新后重启 Host Bridge：

```powershell
clawbody-host restart
```

当前心宠文字显示后约 2—3 秒才开始播放声音，原因是现有链路会等待百度 TTS 完整生成 WAV，再上传 Reachy daemon 并启动播放器。实测百度 TTS 约 1.37 秒，WAV 解码接近 0 秒，其余时间主要是音频上传和播放管线启动。本次未修改播放链路；后续可改为 WebRTC PCM 直推或流式 TTS。

## 部署与验收

在 ClawBody 项目根目录 `.env` 确认思考模式关闭，并重建服务：

```powershell
docker compose up -d --build clawbody
docker compose ps
Invoke-RestMethod http://127.0.0.1:7860/health
```

预期 ClawBody 为 `healthy`，健康接口返回 `ok: true`。随后在 Sentinel 的“心宠 AI 管理中心 → 实时联调”验证普通对话、风险对话四阶段协作、ASR 转写和 TTS 播放。
