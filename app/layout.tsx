import type { Metadata, Viewport } from "next"
import { Noto_Sans_SC, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  variable: "--font-noto-sans-sc",
  weight: ["400", "500", "600", "700"],
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "心图PsyTwin - 校园心理健康数字孪生管理平台",
  description:
    "基于数字孪生技术的校园心理健康综合管理平台，提供全域态势感知、风险溯源、学生档案管理和AI智能配置等功能。",
}

export const viewport: Viewport = {
  themeColor: "#080c1a",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${notoSansSC.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  )
}
