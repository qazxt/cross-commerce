/**
 * 图片优化配置和工具
 * 
 * 包含：
 * - 图片加载优化
 * - 图片 URL 处理
 * - 响应式图片生成
 */

// 图片域名配置
export const IMAGE_CONFIG = {
  // 允许的图片域名
  allowedDomains: [
    'si.geilicdn.com',      // 阿里云 OSS
    'img.alicdn.com',       // 淘宝 CDN
    'cdn.shopify.com',      // Shopify
    'images.unsplash.com', // Unsplash
    'via.placeholder.com', // 占位图
  ],
  
  // 默认占位图
  placeholder: '/images/placeholder.png',
  
  // 错误时显示的图片
  errorImage: '/images/error.png',
  
  // 默认图片质量 (1-100)
  quality: 80,
  
  // 设备像素比
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  
  // 图片尺寸断点
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
};

/**
 * 验证图片 URL 是否安全
 */
export function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  
  // 允许相对路径
  if (url.startsWith('/')) return true;
  
  // 检查域名白名单
  try {
    const urlObj = new URL(url);
    return IMAGE_CONFIG.allowedDomains.some(domain => 
      urlObj.hostname.includes(domain)
    );
  } catch {
    return false;
  }
}

/**
 * 获取安全的图片 URL
 */
export function getSafeImageUrl(url: string | null | undefined): string {
  if (!url) return IMAGE_CONFIG.placeholder;
  if (!isValidImageUrl(url)) return IMAGE_CONFIG.placeholder;
  return url;
}

/**
 * 生成响应式图片 srcset
 * (用于自定义图片域名的情况)
 */
export function generateSrcSet(
  baseUrl: string,
  widths: number[] = [400, 800, 1200]
): string {
  if (!baseUrl || !isValidImageUrl(baseUrl)) {
    return baseUrl;
  }
  
  return widths
    .map(w => `${baseUrl}?w=${w}&q=${IMAGE_CONFIG.quality} ${w}w`)
    .join(', ');
}

/**
 * 生成 blurDataURL 用于渐进式加载
 * 这是一个简化的版本，实际可以使用真正的模糊算法
 */
export function generateBlurDataURL(): string {
  // 返回一个简单的灰色 base64 模糊占位符
  // 生产环境建议使用 sharp 等库生成真正的模糊图
  return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1" height="1"%3E%3C/svg%3E';
}

/**
 * 获取图片尺寸配置
 */
export function getImageSizes(isGrid: boolean = false, columns: number = 4): string {
  if (isGrid) {
    return `
      (max-width: 640px) ${100 / 2}vw,
      (max-width: 768px) ${100 / 3}vw,
      (max-width: 1024px) ${100 / 4}vw,
      ${100 / columns}vw
    `.replace(/\s+/g, ' ').trim();
  }
  
  return `
    (max-width: 640px) 100vw,
    (max-width: 768px) 50vw,
    (max-width: 1024px) 33vw,
    25vw
  `.replace(/\s+/g, ' ').trim();
}

/**
 * 预加载关键图片
 * 用于在页面头部预加载 LCP 图片
 */
export function getPreloadLinks(imageUrls: string[]): string {
  return imageUrls
    .filter(url => isValidImageUrl(url))
    .map(url => `<link rel="preload" as="image" href="${url}" />`)
    .join('\n');
}

/**
 * 图片加载优先级配置
 */
export type ImagePriority = 'high' | 'medium' | 'low';

export function getImagePriorityConfig(priority: ImagePriority) {
  const configs = {
    high: {
      priority: true,
      loading: 'eager' as const,
      fetchPriority: 'high' as const,
    },
    medium: {
      priority: false,
      loading: 'lazy' as const,
      fetchPriority: 'auto' as const,
    },
    low: {
      priority: false,
      loading: 'lazy' as const,
      fetchPriority: 'low' as const,
    },
  };
  
  return configs[priority];
}

/**
 * 优化外部图片 URL
 * (如果使用图片 CDN，可以在这里添加优化参数)
 */
export function optimizeImageUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpeg';
  } = {}
): string {
  if (!url || !isValidImageUrl(url)) return url;
  
  const { width, height, quality = IMAGE_CONFIG.quality, format } = options;
  
  // 如果是阿里云 OSS 图片，可以使用他们的图片处理参数
  if (url.includes('si.geilicdn.com') || url.includes('img.alicdn.com')) {
    const params = new URLSearchParams();
    
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    if (quality) params.set('q', quality.toString());
    if (format) params.set('format', format);
    
    const queryString = params.toString();
    return queryString ? `${url}${url.includes('?') ? '&' : '?'}${queryString}` : url;
  }
  
  return url;
}

/**
 * 延迟加载图片 Intersection Observer
 * (用于非 Next.js Image 组件的懒加载)
 */
export function setupLazyLoading() {
  if (typeof window === 'undefined') return;
  
  const images = document.querySelectorAll('img[data-lazy]');
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          
          if (src) {
            img.src = src;
            img.removeAttribute('data-lazy');
            img.classList.remove('opacity-0');
            img.classList.add('opacity-100');
          }
          
          observer.unobserve(img);
        }
      });
    },
    {
      rootMargin: '50px',
      threshold: 0.01,
    }
  );
  
  images.forEach(img => observer.observe(img));
  
  return () => observer.disconnect();
}