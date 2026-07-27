# F9 心宠对话同步配置

Sentinel 的 `stu-test` 心宠页面通过 WebSocket 只读观察 Pocket 仓库中心宠服务器的 `demo_pet` 状态。F9 会固定演示“户外相遇 → 两句对话 → 心理咨询室”。

## 必要配置

在 Sentinel 根目录创建或修改 `.env.local`：

```dotenv
NEXT_PUBLIC_PET_SYNC_HOST="127.0.0.1"
```

心宠服务器在另一台电脑时，改为对方的局域网 IP：

```dotenv
NEXT_PUBLIC_PET_SYNC_HOST="192.168.1.100"
```

端口和路径固定为 `13002` 和 `/ws/pet`。如果 Sentinel 页面通过 HTTPS 打开，改用完整 WSS 地址：

```dotenv
NEXT_PUBLIC_PET_SYNC_WS_URL="wss://pet-sync.example.com/ws/pet"
```

修改环境变量后重启 Sentinel：

```powershell
npm install
npm run dev
```

打开 `stu-test` 学生的心宠页面。页面应显示“正在连接本地心宠”，心宠服务器终端按 F9 后，页面会同步显示花环小暖、主心宠、固定台词与场景切换。

## 验证

```powershell
node --import tsx --test lib/pet-live-sync.test.ts
npm run build
```

完整的 Pocket、Sentinel、Unity 三端配置与排错流程见 PsyTwin-Pocket 仓库的 `docs/F9_DEMO_SYNC_SETUP.md`。
