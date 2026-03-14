export type OpenClawGatewayConfig = {
  url: string
  token: string
}

export function getOpenClawGatewayConfig(): OpenClawGatewayConfig {
  const url = process.env.OPENCLAW_GATEWAY_URL || ""
  const token = process.env.OPENCLAW_GATEWAY_TOKEN || ""

  return { url, token }
}

export function isOpenClawConfigured() {
  const { url, token } = getOpenClawGatewayConfig()
  return Boolean(url && token)
}
