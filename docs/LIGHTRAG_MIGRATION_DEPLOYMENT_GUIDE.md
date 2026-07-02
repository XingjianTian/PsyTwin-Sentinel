# LightRAG 知识库迁移与部署教程

更新时间：2026-07-02

本文档用于指导新的部署者从零克隆 LightRAG，配置阿里云百炼模型，迁移已有心理学知识库数据，并接入 PsyTwin-Sentinel。

> 安全提醒：不要把 `.env`、API Key、`data/rag_storage` 运行态数据直接提交到公开仓库。仓库中只保存配置模板和部署说明。

## 1. 目录约定

推荐目录结构：

```text
C:\Users\<你的用户名>\Desktop\PsyTwin\
  ├─ PsyTwin-Sentinel\
  └─ LightRAG\
```

本文默认 LightRAG 位于：

```powershell
C:\Users\<你的用户名>\Desktop\PsyTwin\LightRAG
```

如果你的路径不同，请把命令里的路径替换成自己的实际路径。

## 2. 前置环境

部署机器需要安装：

| 工具 | 用途 | 验证命令 |
| --- | --- | --- |
| Git | 克隆代码 | `git --version` |
| Docker Desktop | 启动 LightRAG 服务 | `docker --version` |
| Docker Compose | 编排容器 | `docker compose version` |

Windows 用户建议使用 PowerShell 执行命令。

## 3. 克隆 LightRAG

```powershell
cd C:\Users\<你的用户名>\Desktop\PsyTwin
git clone https://github.com/HKUDS/LightRAG.git
cd LightRAG
```

如果使用 SSH：

```powershell
git clone git@github.com:HKUDS/LightRAG.git
```

## 4. 准备配置文件

复制官方环境变量模板：

```powershell
copy env.example .env
```

然后用编辑器打开：

```powershell
notepad .env
```

## 5. 配置本地服务端口和 API Key

在 `.env` 中确认或添加以下配置：

```env
HOST=0.0.0.0
PORT=9621
LIGHTRAG_API_KEY=请设置一个本地访问密钥
```

示例：

```env
LIGHTRAG_API_KEY=psytwin-local-rag-key
```

这个 Key 用于访问 LightRAG WebUI 和 API。它不是阿里云百炼 API Key。

## 6. 配置阿里云百炼模型

LightRAG 使用 OpenAI 兼容接口接入阿里云百炼。请在阿里云百炼控制台创建 API Key，并确认模型已开通。

推荐配置：

```env
LLM_BINDING=openai
LLM_MODEL=qwen-plus
LLM_BINDING_HOST=https://dashscope.aliyuncs.com/compatible-mode/v1
LLM_BINDING_API_KEY=你的阿里云百炼 API Key

EMBEDDING_BINDING=openai
EMBEDDING_MODEL=text-embedding-v4
EMBEDDING_BINDING_HOST=https://dashscope.aliyuncs.com/compatible-mode/v1
EMBEDDING_BINDING_API_KEY=你的阿里云百炼 API Key
EMBEDDING_DIM=1024
```

如果你使用的是百炼业务空间专属 endpoint，请把 Host 改成你的实际地址，例如：

```env
LLM_BINDING_HOST=https://你的业务空间.cn-beijing.maas.aliyuncs.com/compatible-mode/v1
EMBEDDING_BINDING_HOST=https://你的业务空间.cn-beijing.maas.aliyuncs.com/compatible-mode/v1
```

如果 LightRAG 支持分角色模型配置，也建议配置为：

```env
SUMMARY_LANGUAGE=Chinese

OPENAI_API_KEY=你的阿里云百炼 API Key
OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1

LLM_MODEL=qwen-plus
KEYWORD_EXTRACTION_MODEL=qwen-turbo
VLM_MODEL=qwen-plus
EMBEDDING_MODEL=text-embedding-v4
```

不同 LightRAG 版本的环境变量名可能略有差异。最终以当前仓库的 `env.example` 为准：如果 `env.example` 中已有同名变量，请优先修改已有变量，不要重复写多个冲突项。

## 7. 配置存储目录

Docker Compose 默认会把本地数据目录挂载到容器：

```text
./data/rag_storage -> /app/data/rag_storage
./data/inputs      -> /app/data/inputs
./data/prompts     -> /app/data/prompts
./.env             -> /app/.env
```

首次部署时创建目录：

```powershell
mkdir data
mkdir data\rag_storage
mkdir data\inputs
mkdir data\prompts
```

如果目录已存在，不需要重复创建。

## 8. 启动 LightRAG

首次启动或代码有修改时执行：

```powershell
cd C:\Users\<你的用户名>\Desktop\PsyTwin\LightRAG
docker compose up -d --build lightrag
```

平时只是启动服务时执行：

```powershell
docker compose up -d lightrag
```

查看容器：

```powershell
docker ps --filter "name=lightrag"
```

查看日志：

```powershell
docker logs -f lightrag-lightrag-1
```

看到类似信息表示启动成功：

```text
Uvicorn running on http://0.0.0.0:9621
WebUI assets mounted at /webui
Application startup complete.
```

## 9. 打开 WebUI

浏览器访问：

```text
http://localhost:9621
```

如果提示 API Key，输入 `.env` 中配置的：

```text
LIGHTRAG_API_KEY
```

例如：

```text
psytwin-local-rag-key
```

## 10. 迁移已有知识库数据

如果你已经有一份可用知识库，需要迁移到新机器，请迁移 LightRAG 的 `data` 目录。

源机器目录：

```text
LightRAG\data\
```

目标机器目录：

```text
LightRAG\data\
```

至少需要迁移：

```text
data\rag_storage\
data\inputs\
data\prompts\
```

推荐流程：

1. 在源机器停止 LightRAG：

   ```powershell
   cd C:\Users\<源机器用户名>\Desktop\PsyTwin\LightRAG
   docker compose stop lightrag
   ```

2. 复制整个 `data` 文件夹到目标机器的 LightRAG 根目录。

3. 在目标机器启动 LightRAG：

   ```powershell
   cd C:\Users\<目标机器用户名>\Desktop\PsyTwin\LightRAG
   docker compose up -d lightrag
   ```

4. 查看日志确认数据加载：

   ```powershell
   docker logs --tail 100 lightrag-lightrag-1
   ```

如果看到类似内容，说明知识库数据被读取：

```text
Loaded graph from /app/data/rag_storage/graph_chunk_entity_relation.graphml
Process 1 KV load full_docs with N records
Process 1 KV load text_chunks with N records
Process 1 doc status load doc_status with N records
```

## 11. 验证文档和图谱

PowerShell 验证文档状态：

```powershell
$headers=@{ 'X-API-Key'='你的 LIGHTRAG_API_KEY' }
Invoke-RestMethod -Uri 'http://localhost:9621/documents/status_counts' -Headers $headers | ConvertTo-Json -Depth 5
```

正常结果示例：

```json
{
  "status_counts": {
    "processed": 8,
    "failed": 0,
    "all": 8
  }
}
```

验证知识图谱：

```powershell
$headers=@{ 'X-API-Key'='你的 LIGHTRAG_API_KEY' }
$r=Invoke-RestMethod -Uri 'http://localhost:9621/graphs?label=*&max_depth=3&max_nodes=1000' -Headers $headers
[pscustomobject]@{ nodes=$r.nodes.Count; edges=$r.edges.Count } | ConvertTo-Json
```

正常结果示例：

```json
{
  "nodes": 367,
  "edges": 395
}
```

节点数和边数会根据实际知识库内容变化，不要求完全一致。

## 12. 接入 PsyTwin-Sentinel

在 Sentinel 项目的 `.env` 中配置：

```env
NEXT_PUBLIC_LIGHTRAG_WEBUI_URL=http://localhost:9621
NEXT_PUBLIC_LIGHTRAG_API_KEY_HINT=你的 LIGHTRAG_API_KEY
```

启动 Sentinel：

```powershell
cd C:\Users\<你的用户名>\Desktop\PsyTwin\PsyTwin-Sentinel
npm run dev
```

打开：

```text
http://localhost:3000/ai-config?tab=rag
```

在嵌入的 LightRAG 页面中可以切换：

- 文档
- 知识图谱
- 检索
- API

## 13. 上传新文档

1. 打开 LightRAG WebUI：`http://localhost:9621`。
2. 进入「文档」。
3. 上传 Markdown、TXT、PDF 或 Word 文档。
4. 等待状态变为 `Completed` 或 `已完成`。
5. 进入「知识图谱」，使用 `label=*` 查看全局图谱。
6. 进入「检索」，使用 `mix` 模式测试问答效果。

## 14. 常用运维命令

启动：

```powershell
docker compose up -d lightrag
```

重建并启动：

```powershell
docker compose up -d --build lightrag
```

停止：

```powershell
docker compose stop lightrag
```

查看日志：

```powershell
docker logs -f lightrag-lightrag-1
```

查看端口：

```powershell
docker ps --filter "name=lightrag"
```

## 15. 不要提交到仓库的内容

以下内容必须加入 `.gitignore`，不要上传：

```gitignore
.env
.env.*
!env.example
data/
rag_storage/
inputs/
output/
lightrag_webui/node_modules/
lightrag/api/webui/
.venv/
__pycache__/
*.log
.codex/
```

原因：

- `.env` 可能包含 API Key。
- `data/rag_storage` 是运行态知识库数据，可能包含敏感材料。
- `node_modules` 和 `.venv` 体积很大，应由安装命令生成。
- `lightrag/api/webui` 是前端构建产物，应由构建命令生成。

## 16. 常见问题

### 16.1 页面要求输入 API Key

输入 `.env` 中的 `LIGHTRAG_API_KEY`，不是阿里云百炼 API Key。

### 16.2 `403 Forbidden: API Key required`

请求 API 时没有带 `X-API-Key` 请求头。

PowerShell 示例：

```powershell
$headers=@{ 'X-API-Key'='你的 LIGHTRAG_API_KEY' }
Invoke-RestMethod -Uri 'http://localhost:9621/documents/status_counts' -Headers $headers
```

### 16.3 知识图谱无数据

检查：

- 文档是否已经处理完成。
- 查询 label 是否为 `*`。
- `data/rag_storage` 是否迁移到正确位置。
- 日志里是否成功加载 graphml 文件。

### 16.4 阿里云模型调用失败

检查：

- API Key 是否有效。
- Host 是否是 OpenAI 兼容接口地址。
- 模型名是否开通，例如 `qwen-plus`、`qwen-turbo`、`text-embedding-v4`。
- 业务空间 endpoint 是否和 API Key 属于同一个空间。

### 16.5 PowerShell 输出中文乱码

这是终端编码显示问题，不一定代表 LightRAG 数据乱码。优先以 WebUI 页面显示为准。

### 16.6 改了前端样式但页面没变化

需要重建容器：

```powershell
docker compose up -d --build lightrag
```

浏览器再按 `Ctrl + F5` 强制刷新缓存。

## 17. 推荐交付清单

交付给他人部署时，建议提供：

```text
LightRAG 源码
.env.example
部署说明文档
可选：data 压缩包
```

不要提供：

```text
.env
真实 API Key
node_modules
.venv
Docker 镜像缓存
```

如果必须迁移真实知识库数据，请通过私有渠道传输 `data` 压缩包，并确认其中资料允许被目标环境持有。
