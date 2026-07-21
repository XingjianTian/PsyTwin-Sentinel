# ClawBody Single Container 7860 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the legacy Gradio/preview containers and port 7862 with one headless `clawbody-service` container exposed only at `127.0.0.1:7860`.

**Architecture:** Docker Compose owns one `clawbody-reachy` container. Sentinel proxies server-side requests to `http://127.0.0.1:7860`; the container reaches Reachy Mini Control through `host.docker.internal:8000`. The browser never accesses ClawBody directly.

**Tech Stack:** Docker Compose, Python 3.11/FastAPI/Uvicorn, Next.js 16/TypeScript, Node test runner, PowerShell.

## Global Constraints

- Do not stop or kill any Node process.
- Do not delete images, volumes, unrelated containers, or files.
- Remove `clawbody-preview` and `clawbody-reachy` as two explicit container operations only.
- Keep Reachy Mini Control on Windows host port `8000`.
- Bind ClawBody only to `127.0.0.1:7860`.
- Do not commit, push, or create a branch without separate user confirmation.
- Do not change `/api/pocket/*` or `docs/api_contract.md`.

---

### Task 1: Sentinel default service address

**Files:**
- Modify: `lib/pet-ai/clawbody-client.ts`
- Modify: `lib/pet-ai/pet-ai-api.test.ts`

**Interfaces:**
- Consumes: `CLAWBODY_SERVICE_URL` environment variable.
- Produces: server-side ClawBody requests defaulting to `http://127.0.0.1:7860`.

- [x] **Step 1: Add a failing source contract test** *(已于 2026-07-21 完成)*

Add to `lib/pet-ai/pet-ai-api.test.ts`:

```ts
test("ClawBody defaults to the single Docker service on port 7860", async () => {
  const source = await readFile(new URL("./clawbody-client.ts", import.meta.url), "utf8")
  assert.match(source, /http:\/\/127\.0\.0\.1:7860/)
  assert.doesNotMatch(source, /127\.0\.0\.1:7862/)
})
```

- [x] **Step 2: Run the test and confirm RED** *(已于 2026-07-21 完成)*

Run: `npx tsx --test lib/pet-ai/pet-ai-api.test.ts`

Expected: FAIL because `clawbody-client.ts` still contains `127.0.0.1:7862`.

- [x] **Step 3: Change the default URL** *(已于 2026-07-21 完成)*

Set the fallback in `lib/pet-ai/clawbody-client.ts` to:

```ts
const serviceUrl = () => (process.env.CLAWBODY_SERVICE_URL || "http://127.0.0.1:7860").replace(/\/$/, "")
```

- [x] **Step 4: Run the test and confirm GREEN** *(已于 2026-07-21 完成)*

Run: `npx tsx --test lib/pet-ai/pet-ai-api.test.ts`

Expected: all tests pass.

### Task 2: ClawBody Docker runtime normalization

**Files:**
- Modify: `C:/Users/txj12/Desktop/PsyTwin/clawbody-minimax/docker-compose.yml`
- Modify: `C:/Users/txj12/Desktop/PsyTwin/clawbody-minimax/Dockerfile`
- Modify: `C:/Users/txj12/Desktop/PsyTwin/clawbody-minimax/.env.example`
- Modify: `C:/Users/txj12/Desktop/PsyTwin/clawbody-minimax/README.md`

**Interfaces:**
- Consumes: `.env`, host service `host.docker.internal:8000`.
- Produces: `GET http://127.0.0.1:7860/health` and authenticated `/v1/*` endpoints.

- [x] **Step 1: Update Compose runtime values** *(已于 2026-07-21 完成)*

Use exactly:

```yaml
environment:
  SERVICE_HOST: 0.0.0.0
  SERVICE_PORT: "7860"
ports:
  - "127.0.0.1:7860:7860"
command:
  - clawbody-service
restart: unless-stopped
```

Keep `ROBOT_HOST: host.docker.internal`, `ROBOT_PORT: "8000"`, and `extra_hosts` unchanged.

- [x] **Step 2: Update the image contract** *(已于 2026-07-21 完成)*

Set `EXPOSE 7860` and make the Docker healthcheck request `http://127.0.0.1:7860/health`.

- [x] **Step 3: Update examples and operational documentation** *(已于 2026-07-21 完成)*

Set `.env.example` to `SERVICE_PORT=7860`. Replace ClawBody service examples using `7862` with `7860`, and document that `docker-compose.preview.yml` is not part of the supported runtime.

- [x] **Step 4: Validate Compose before container deletion** *(已于 2026-07-21 完成)*

Run: `docker compose config`

Expected: one `clawbody` service, command `clawbody-service`, host binding `127.0.0.1:7860`, container port `7860`, restart policy `unless-stopped`.

### Task 3: Remove legacy containers and create the single service

**Files:**
- Runtime state only; no file deletion.

**Interfaces:**
- Consumes: validated Compose configuration and existing Docker daemon.
- Produces: one running container named `clawbody-reachy`.

- [x] **Step 1: Reconfirm exact deletion targets** *(已于 2026-07-21 完成)*

Run: `docker ps -a --filter name=clawbody-preview --filter name=clawbody-reachy --format "{{.Names}}\t{{.Status}}\t{{.Ports}}"`

Expected: only `clawbody-preview` and `clawbody-reachy` appear.

- [x] **Step 2: Remove the preview container explicitly** *(已于 2026-07-21 完成)*

Run: `docker rm -f clawbody-preview`

Expected: output `clawbody-preview`.

- [x] **Step 3: Remove the old runtime container explicitly** *(已于 2026-07-21 完成)*

Run: `docker rm -f clawbody-reachy`

Expected: output `clawbody-reachy`.

- [x] **Step 4: Build and start the only runtime container** *(已于 2026-07-21 完成)*

Run: `docker compose up -d --build --force-recreate clawbody`

Expected: container `clawbody-reachy` is created and started.

- [x] **Step 5: Wait for the health condition** *(已于 2026-07-21 完成)*

Poll `docker inspect --format "{{.State.Health.Status}}" clawbody-reachy` for up to 120 seconds.

Expected: `healthy`. If it becomes `unhealthy`, inspect `docker logs --tail 200 clawbody-reachy` and stop without creating a fallback container.

### Task 4: Verification and documentation state

**Files:**
- Modify: `docs/superpowers/specs/2026-07-21-clawbody-single-container-7860-design.md`
- Modify: `docs/superpowers/plans/2026-07-21-clawbody-single-container-7860.md`

**Interfaces:**
- Consumes: running Docker service and Sentinel build.
- Produces: checked OpenSpecs state matching verified runtime state.

- [x] **Step 1: Run Sentinel tests and production build** *(已于 2026-07-21 完成)*

Run:

```powershell
npx tsx --test lib/pet-ai/pet-ai-api.test.ts
npm run build
```

Expected: both commands exit `0`.

- [x] **Step 2: Run ClawBody tests** *(已于 2026-07-21 完成)*

Run from `C:/Users/txj12/Desktop/PsyTwin/clawbody-minimax`:

```powershell
.\.venv\Scripts\python.exe -m pytest tests -q
```

Expected: all tests pass.

- [x] **Step 3: Verify ports, command, health and container count** *(已于 2026-07-21 完成)*

Run:

```powershell
docker ps -a --filter name=clawbody --format "{{.Names}}\t{{.Command}}\t{{.Ports}}\t{{.Status}}"
netstat -ano | findstr LISTENING | findstr ":7860"
netstat -ano | findstr LISTENING | findstr ":7862"
Invoke-RestMethod http://127.0.0.1:7860/health
```

Expected: only `clawbody-reachy`; command is `clawbody-service`; `7860` listens on loopback; `7862` has no listener; health returns `ok: true`.

- [x] **Step 4: Verify Sentinel proxy and page behavior** *(已于 2026-07-21 验证服务端代理客户端可读取状态)*

Refresh `/pet-ai-management`, open “实时联调”, and click “刷新设备状态”. Expected: no “心宠设备服务暂不可用” toast and a Reachy state is displayed.

- [x] **Step 5: Synchronize OpenSpecs** *(已于 2026-07-21 完成)*

Change each verified item in `docs/superpowers/specs/2026-07-21-clawbody-single-container-7860-design.md` from `- [ ]` to `- [x]` and append `*(已于 2026-07-21 验证)*`. Mark completed plan steps with `- [x]`.
