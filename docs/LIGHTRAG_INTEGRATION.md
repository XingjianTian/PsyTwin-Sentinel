# LightRAG 心理学知识库集成说明

更新时间：2026-07-02

本文档记录 PsyTwin-Sentinel 接入 LightRAG 心理学知识库的使用方式、配置项和验证方法。

## 功能范围

- Sentinel 的 `AI 配置 -> RAG 向量知识库` 页面内嵌 LightRAG WebUI。
- LightRAG WebUI 负责文档管理、知识图谱浏览、检索问答和 API 调试。
- 心理学知识库使用阿里云百炼 OpenAI 兼容接口进行 LLM 抽取、关键词生成、查询和向量化。
- 知识图谱默认使用全局标签 `*` 加载，不再需要先手动点开单个节点才能看到图谱。

## Sentinel 前端配置

默认配置：

```env
NEXT_PUBLIC_LIGHTRAG_WEBUI_URL=http://42.121.14.189:9621
LIGHTRAG_API_URL=http://42.121.14.189:9621
NEXT_PUBLIC_LIGHTRAG_API_KEY_HINT=psytwin-local-rag-key
```

当前部署采用固定 `9621` 端口直连 LightRAG，不再通过 80 端口或 Nginx 反向代理访问。云服务器安全组只需要放行入方向 TCP `9621`。

相关页面：

```text
http://localhost:3000/ai-config?tab=rag
```

如果 LightRAG 嵌入页提示 API Key，请输入：

```text
psytwin-local-rag-key
```

这个 Key 是 LightRAG API 访问密钥，不是阿里云百炼 `sk-...` 密钥。

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

### PowerShell 里看到中文节点名乱码

这是 Windows 终端输出编码问题，不代表 LightRAG 数据或 WebUI 前端乱码。以浏览器页面显示为准。
