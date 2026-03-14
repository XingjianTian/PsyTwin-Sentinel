// 简单的文件日志，用于排查问题
import * as fs from "fs"
import * as path from "path"

// 使用 /tmp 目录，避免触发 Next.js 文件监控
const LOG_FILE = path.join("/tmp", "openclaw-bridge.log")

// 确保日志目录存在
try {
  fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true })
} catch {
  // 忽略错误
}

export function logToFile(level: string, message: string, data?: any) {
  const timestamp = new Date().toISOString()
  const logLine = `[${timestamp}] [${level}] ${message}${data ? " " + JSON.stringify(data) : ""}\n`
  
  // 同时输出到控制台和文件
  console.log(logLine.trim())
  
  try {
    fs.appendFileSync(LOG_FILE, logLine)
  } catch {
    // 忽略文件写入错误
  }
}

export function getRecentLogs(lines: number = 100): string {
  try {
    if (!fs.existsSync(LOG_FILE)) return "No logs yet"
    const content = fs.readFileSync(LOG_FILE, "utf-8")
    const allLines = content.split("\n").filter(Boolean)
    return allLines.slice(-lines).join("\n")
  } catch {
    return "Failed to read logs"
  }
}

export function clearLogs() {
  try {
    if (fs.existsSync(LOG_FILE)) {
      fs.unlinkSync(LOG_FILE)
    }
  } catch {
    // 忽略错误
  }
}
