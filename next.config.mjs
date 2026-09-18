/** @type {import('next').NextConfig} */
const nextConfig = {
  // TypeScript 构建错误处理（生产环境建议设为 false）
  typescript: {
    ignoreBuildErrors: true,
  },
  // 由 Next.js 按实际显示尺寸生成 WebP/AVIF，避免直接传输多 MB 场景原图
  images: {
    unoptimized: false,
  },
  // 生产环境性能优化
  poweredByHeader: false, // 隐藏 X-Powered-By 头
  compress: true, // 启用 gzip 压缩
  // 实验性功能（Next.js 16）
  experimental: {
    // 启用 Server Actions 优化
    serverActions: {
      bodySizeLimit: '10mb', // 支持最大 10MB 文件上传
    },
  },
  // 环境变量暴露给客户端（仅限前缀为 NEXT_PUBLIC_ 的）
  env: {
    NEXT_PUBLIC_APP_NAME: 'PsyTwin Sentinel',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },

}

export default nextConfig
