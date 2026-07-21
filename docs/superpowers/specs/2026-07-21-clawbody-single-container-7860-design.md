# ClawBody 单容器与 7860 端口统一设计

## 目标

将当前遗留的 Gradio、preview 和 7862 服务收敛为一个无界面的 ClawBody 内部服务。Sentinel 与 Docker 宿主机统一使用 `http://127.0.0.1:7860`，Reachy Mini Control 继续独立运行在 Windows 宿主机的 `8000` 端口。

## 最终架构

- 唯一容器名称：`clawbody-reachy`。
- 唯一启动命令：`clawbody-service`。
- 容器内部端口：`7860`。
- 宿主机绑定：`127.0.0.1:7860:7860`，不向局域网或公网暴露。
- Sentinel 默认服务地址：`http://127.0.0.1:7860`。
- Reachy Mini Control 地址：容器通过 `host.docker.internal:8000` 访问。
- 容器重启策略：`unless-stopped`。
- Gradio 不再作为默认入口，不再保留运行中的 preview 容器。

## 配置变更

### ClawBody

- `docker-compose.yml` 将 `SERVICE_PORT`、端口映射和健康检查统一为 `7860`。
- `Dockerfile` 暴露并检查 `7860`。
- `.env.example` 默认 `SERVICE_PORT=7860`。
- README 中所有 Sentinel 集成示例统一使用 `7860`。
- `docker-compose.preview.yml` 不参与正式启动；其存在不得创建运行中的 preview 容器。

### Sentinel

- `CLAWBODY_SERVICE_URL` 默认值与示例配置改为 `http://127.0.0.1:7860`。
- 浏览器仍只访问 Sentinel 同源 API，不直接访问 ClawBody。
- 不新增或修改 `/api/pocket/*` 契约。

## 迁移流程

1. 修改并验证两边配置。
2. 精确删除现有 `clawbody-preview` 和 `clawbody-reachy` 容器；不批量删除其他容器或镜像。
3. 使用 `docker compose up -d --build --force-recreate clawbody` 创建唯一容器。
4. 验证 `7862` 未监听、`7860` 健康检查成功、容器命令为 `clawbody-service`。
5. 验证 Sentinel 状态接口与心宠 AI 管理页面恢复。

## 错误处理与回退

- Docker 构建失败时不删除镜像，不影响 Reachy Mini Control 的 `8000` 服务。
- 新容器健康检查失败时保留日志用于诊断，不创建第二个兼容容器。
- 回退仅需把服务端口恢复为 `7862` 并重建单个容器，不恢复 Gradio。

## 验收清单

- [ ] 仅存在一个 ClawBody 容器 `clawbody-reachy`。
- [ ] 容器运行 `clawbody-service`，不运行 Gradio。
- [ ] 宿主机只为 ClawBody 监听 `127.0.0.1:7860`，`7862` 未监听。
- [ ] `GET http://127.0.0.1:7860/health` 返回成功。
- [ ] Sentinel 使用 `7860` 代理并能读取设备状态。
- [ ] Reachy Mini Control 的 `8000` 连接保持不变。
- [ ] ClawBody Python 测试与 Sentinel 生产构建通过。

