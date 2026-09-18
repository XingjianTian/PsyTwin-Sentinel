# LightRAG 心理学知识库集成说明

更新时间：2026-07-02

本文档记录 PsyTwin-Sentinel 接入 LightRAG 心理学知识库的使用方式、配置项和验证方法。

## 功能范围

- Sentinel 的 `AI 配置 -> RAG 向量知识库` 页面内嵌 LightRAG WebUI。
- LightRAG WebUI 负责文档管理、知识图谱浏览、检索问答和 API 调试。
- 心理学知识库使用阿里云百炼 OpenAI 兼容接口进行 LLM 抽取、关键词生成、查询和向量化。
- 页面将“心图心理学知识库”品牌标识与“连接”入口统一放在 LightRAG 顶部导航；点击“连接”可查看服务地址、模型服务、向量模型和图谱入口状态。*(已于 2026-07-23 完成界面整合与回归验证)*
- [x] 检索回答的 `References` 列表会把 `.md` 来源文件显示为可点击链接，点击后在新标签页通过 Sentinel 同源只读接口进入后台风格的 Markdown 阅读页。*(已于 2026-07-27 完成引用链接化、文档查看接口与阅读页视觉优化)*
- 知识图谱默认使用全局标签 `*` 加载，不再需要先手动点开单个节点才能看到图谱。

## Sentinel 前端配置

默认配置：

```env
NEXT_PUBLIC_LIGHTRAG_WEBUI_URL=http://42.121.14.189:9621
LIGHTRAG_API_URL=http://42.121.14.189:9621
LIGHTRAG_API_KEY=psytwin-local-rag-key
```

当前部署采用固定 `9621` 端口直连 LightRAG，不再通过 80 端口或 Nginx 反向代理访问。云服务器安全组只需要放行入方向 TCP `9621`。

相关页面：

```text
http://localhost:3000/ai-config?tab=rag
```

Sentinel 会通过同源 `/api/lightrag-proxy` 代理为嵌入页附加 `LIGHTRAG_API_KEY`，教师无需在 LightRAG WebUI 重复输入访问密钥。该密钥仅保存在 Sentinel 服务端环境变量中，不应使用 `NEXT_PUBLIC_` 前缀。

## LightRAG 模型配置

当前 LightRAG 容器使用以下模型角色配置：

| 角色 | 模型 | 用途 |
| --- | --- | --- |
| extract | `qwen-plus` | 实体和关系抽取 |
| keyword | `qwen-turbo` | 检索关键词生成 |
| query | `qwen-plus` | RAG 查询回答 |
| vlm | `qwen-plus` | 多模态/视觉模型预留 |
| embedding | `text-embedding-v4` | 文档、实体、关系向量化 |

阿里云百炼 OpenAI 兼容接口 Host：

```text
https://ws-kffj97vkyojiudxk.cn-beijing.maas.aliyuncs.com/compatible-mode/v1
```

## 文档管理流程

1. 打开 Sentinel：`http://localhost:3000/ai-config?tab=rag`。
2. 在嵌入的 LightRAG 页面中切到「文档」。
3. 上传 Markdown、TXT、PDF 或 Word 文档。
4. 等待状态变为 `Completed` / `已完成`。
5. 切到「知识图谱」或「检索」查看入库效果。

## 知识图谱展示优化

LightRAG WebUI 已针对高密度心理学图谱做展示优化：

- 初始节点使用稳定螺旋分布，避免所有节点挤在中心。
- 自动布局使用 `ForceAtlas2 + Noverlap`，先拉开社群，再消除节点重叠。
- 普通节点缩小，核心节点按连接度保留层次。
- 默认只显示核心、选中、悬停节点标签，减少中文标签遮挡。
- 边线使用更柔和的颜色和更细的宽度，选中或悬停时再高亮。
- 画布增加轻量网格背景，便于观察节点空间关系。

## 验证命令

检查 LightRAG 文档处理状态：

```powershell
$headers=@{ 'X-API-Key'='psytwin-local-rag-key' }
Invoke-RestMethod -Uri 'http://localhost:9621/documents/status_counts' -Headers $headers
```

云服务器部署时把地址替换为：

```powershell
$headers=@{ 'X-API-Key'='psytwin-local-rag-key' }
Invoke-RestMethod -Uri 'http://42.121.14.189:9621/documents/status_counts' -Headers $headers
```

检查全局知识图谱规模：

```powershell
$headers=@{ 'X-API-Key'='psytwin-local-rag-key' }
Invoke-RestMethod -Uri 'http://localhost:9621/graphs?label=*&max_depth=3&max_nodes=1000' -Headers $headers
```

云服务器部署时把地址替换为：

```powershell
$headers=@{ 'X-API-Key'='psytwin-local-rag-key' }
Invoke-RestMethod -Uri 'http://42.121.14.189:9621/graphs?label=*&max_depth=3&max_nodes=1000' -Headers $headers
```

当前验证结果：

```text
documents: processed 8 / all 8, failed 0
graph: 203 nodes, 204 edges
```

## 常见问题

### 嵌入页仍然显示旧图谱样式

浏览器缓存可能仍在使用旧前端资源。请在页面按 `Ctrl + F5` 强制刷新。

### LightRAG 要求输入 API Key

输入 `psytwin-local-rag-key`。不要输入阿里云百炼密钥。

### 页面显示 0 个文档，但接口查询仍有数据

LightRAG 在关闭自身登录认证时仍会为 WebUI 签发 Guest Bearer Token。Sentinel 的 `/api/lightrag-proxy` 必须优先使用当前 Sentinel 会话 Cookie 鉴权，不能把该 Guest Token 当成 Sentinel JWT。此兼容逻辑已于 2026-07-22 修复，并保留未登录访问返回 401 的保护行为。升级后重新登录 Sentinel，再刷新 `AI 配置 -> 心理学知识库` 页面即可，无需重新导入文档或修改 LightRAG API Key。

### PowerShell 里看到中文节点名乱码

这是 Windows 终端输出编码问题，不代表 LightRAG 数据或 WebUI 前端乱码。以浏览器页面显示为准。
