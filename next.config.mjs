/** @type {import('next').NextConfig} */
const nextConfig = {
  // TypeScript 构建错误处理（生产环境建议设为 false）
  typescript: {
    ignoreBuildErrors: true,
  },
  // 图片优化配置（静态导出时需要）
  images: {
    unoptimized: true,
  },
  // 生产环境性能优化
  poweredByHeader: false, // 隐藏 X-Powered-By 头
  compress: true, // 启用 gzip 压缩
  // 实验性功能（Next.js 16）
  experimental: {
    // 启用 Server Actions 优化
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // 环境变量暴露给客户端（仅限前缀为 NEXT_PUBLIC_ 的）
  env: {
    NEXT_PUBLIC_APP_NAME: 'PsyTwin Sentinel',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },

}

export default nextConfig
