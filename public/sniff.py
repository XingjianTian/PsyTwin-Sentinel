import asyncio
import websockets
import json
import uuid

TOKEN = "123456"
GATEWAY_URI = f"ws://127.0.0.1:18789/?token={TOKEN}"

async def sniff_v17():
    print(f"🚀 [PsyTwin 终极监听] 准备捕获全量 Agents 信号...")
    # 模拟您 TS 代码中的 Header
    headers = {"Origin": "http://localhost:4200", "Authorization": f"Bearer {TOKEN}"}

    try:
        async with websockets.connect(GATEWAY_URI, additional_headers=headers) as ws:
            while True:
                raw = await ws.recv()
                data = json.loads(raw)
                
                # 1. 响应身份挑战
                if data.get("event") == "connect.challenge":
                    auth_req = {
                        "type": "req", "id": "auth-final", "method": "connect",
                        "params": {
                            "minProtocol": 3, "maxProtocol": 3,
                            "client": { "id": "openclaw-control-ui", "version": "1.0.0", "platform": "nodejs", "mode": "ui" },
                            "role": "operator",
                            # 🔥 开启所有读权限
                            "scopes": ["operator.read", "agent.read", "message.read", "session.read", "log.read"],
                            "auth": {"token": TOKEN}
                        }
                    }
                    await ws.send(json.dumps(auth_req))
                    continue

                # 2. 鉴权成功后，申请广播订阅
                if data.get("id") == "auth-final" and data.get("ok"):
                    print("✅ 鉴权通过！正在开启全局事件订阅...")
                    await ws.send(json.dumps({
                        "type": "req", "id": "sub-all", "method": "subscribe", "params": { "all": True }
                    }))
                    continue

                # 3. 核心探测：不仅仅找 text，我们要把所有 payload 结构打印出来看一眼
                if data.get("event") == "agent":
                    payload = data.get("payload", {})
                    stream = payload.get("stream")
                    inner_data = payload.get("data", {})
                    
                    # 如果不是 lifecycle，说明这就是咱们要找的“肉”
                    if stream != "lifecycle":
                        print(f"\n🔥 [捕获到流数据] Stream: {stream}")
                        # 扫描所有可能的文本字段
                        text = inner_data.get("text") or inner_data.get("content") or inner_data.get("delta") or inner_data.get("output")
                        if text:
                            print(f"💬 [内容]: \033[92m{text}\033[0m")
                        else:
                            # 如果没找到 text，打印出所有 key 让我们分析
                            print(f"📦 [未知结构字段]: {list(inner_data.keys())}")
                            print(f"📄 [原始 JSON]: {json.dumps(payload, ensure_ascii=False)}")
                    else:
                        print(f"⏳ [{payload.get('sessionKey')}] {inner_data.get('phase')}")

    except Exception as e:
        print(f"\n❌ 连接异常: {e}")

if __name__ == "__main__":
    asyncio.run(sniff_v17())