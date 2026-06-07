/** @type {import('next').NextConfig} */
const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig = {
  // dev 模式内存优化
  swcMinify: true,
  
  // 关闭不需要的功能
  reactStrictMode: false, // 关闭严格模式减少内存
  
  // 输出模式
  output: 'standalone',
  
  // 图片优化配置
  images: {
    // 允许加载图片的域名
    domains: [
      'si.geilicdn.com',      // 阿里云 OSS (主要)
      'img.alicdn.com',       // 淘宝 CDN
      'gd4.alicdn.com',      // 阿里云 CDN
      'api.findsindex.com',
      'findsindex.com',
      'images.unsplash.com',
      'picsum.photos',
      'logo.clearbit.com',
    ],
    
    // 远程图片模式（支持通配符）
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.geilicdn.com',
      },
      {
        protocol: 'https',
        hostname: '**.alicdn.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
    
    // 图片格式优先级（服务端会自动转换）
    formats: ['image/avif', 'image/webp'],
    
    // 设备像素比（用于生成 srcset）
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    
    // 图片尺寸断点
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512, 640, 750, 828],
    
    // 最小缓存时间（秒）
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 天
    
    // 图片禁用静默处理
    disableStaticImages: false,
  },
  
  // 编译时忽略错误
  // typescript: {
  //   ignoreBuildError: true,
  // },
  
  // 实验性功能
  experimental: {
    // 优化包大小
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // 安全策略
  poweredByHeader: false,
  
  // 压缩
  compress: true,
};

module.exports = withNextIntl(nextConfig);