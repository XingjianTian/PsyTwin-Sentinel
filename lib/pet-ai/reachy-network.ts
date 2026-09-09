export const DEFAULT_REACHY_NETWORK_PORT = 7862

export type ReachyNetworkConnection = {
  host: string
  port: number
  endpoint: string
  running: boolean
  transport: "mjpeg"
  width: number
  height: number
  fps: number
  lastFrameAt: number | null
  error: string | null
}

export function normalizeReachyNetworkHost(value: string) {
  const host = value.trim().toLowerCase().replace(/\.$/, "")
  if (!host) throw new Error("请输入心宠主机名或局域网 IP 地址")
  if (host.length > 253 || /[\s/@?#\\]/.test(host) || host.includes(":")) {
    throw new Error("主机地址格式不正确，请仅输入主机名或 IPv4 地址")
  }

  const octets = host.split(".")
  if (octets.length === 4 && octets.every((part) => /^\d+$/.test(part))) {
    if (octets.some((part) => Number(part) > 255)) throw new Error("IPv4 地址格式不正确")
    return host
  }

  if (host !== "reachy-mini.local" && !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*\.local$/.test(host)) {
    throw new Error("仅支持局域网 IPv4 地址或 .local 主机名")
  }
  return host
}

export function isPrivateIpv4(address: string) {
  const parts = address.split(".").map(Number)
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return false
  return (parts[0] === 127 && parts[1] === 0 && parts[2] === 0 && parts[3] === 1)
    || parts[0] === 10
    || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31)
    || (parts[0] === 192 && parts[1] === 168)
    || (parts[0] === 169 && parts[1] === 254)
}

export function normalizeReachyNetworkPort(value: unknown) {
  const port = value === undefined ? DEFAULT_REACHY_NETWORK_PORT : Number(value)
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("端口必须是 1–65535 之间的整数")
  return port
}
