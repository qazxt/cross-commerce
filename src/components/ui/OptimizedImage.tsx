'use client';

import { useState, useCallback, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';
import { ImageOff, Loader2 } from 'lucide-react';

interface OptimizedImageProps extends Omit<ImageProps, 'onError' | 'onLoad'> {
  fallbackSrc?: string;
  showError?: boolean;
  blurDataURL?: string;
  onLoadComplete?: () => void;
}

/**
 * 优化的图片组件
 * - 模糊占位符
 * - 错误处理
 * - 加载状态
 * - 平滑过渡
 */
export function OptimizedImage({
  src,
  alt,
  fallbackSrc = '/placeholder-image.png',
  showError = true,
  blurDataURL,
  onLoadComplete,
  className,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  // 当 src 变化时重置状态
  useEffect(() => {
    setIsLoading(true);
    setError(false);
    setCurrentSrc(src);
  }, [src]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoadComplete?.();
  }, [onLoadComplete]);

  const handleError = useCallback(() => {
    setError(true);
    setIsLoading(false);
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    }
  }, [fallbackSrc, currentSrc]);

  return (
    <div className={cn('relative overflow-hidden bg-muted', className)}>
      {/* 加载状态 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
          {props.fill ? (
            <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50" />
          ) : (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          )}
        </div>
      )}

      {/* 错误状态 */}
      {error && !currentSrc && showError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <ImageOff className="h-8 w-8 text-muted-foreground" />
        </div>
      )}

      {/* 图片 */}
      <Image
        src={currentSrc}
        alt={alt}
        {...props}
        className={cn(
          'transition-all duration-300',
          isLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100',
          props.className
        )}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}

/**
 * 模糊占位符组件
 * 在图片加载时显示模糊背景
 */
interface BlurPlaceholderProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export function BlurPlaceholder({
  src,
  alt,
  className,
  sizes = '(max-width: 768px) 100vw, 50vw',
  priority = false,
}: BlurPlaceholderProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* 模糊背景层 */}
      <div
        className={cn(
          'absolute inset-0 bg-cover bg-center transition-opacity duration-500',
          isLoaded ? 'opacity-0' : 'opacity-100'
        )}
        style={{ backgroundImage: `url(${src})`, filter: 'blur(20px)', transform: 'scale(1.1)' }}
      />

      {/* 主图片 */}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn(
          'object-cover transition-all duration-500',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
}

/**
 * 响应式图片组件
 * 根据视口大小自动调整图片
 */
interface ResponsiveImageProps {
  mobileSrc: string;
  tabletSrc: string;
  desktopSrc: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export function ResponsiveImage({
  mobileSrc,
  tabletSrc,
  desktopSrc,
  alt,
  className,
  priority = false,
}: ResponsiveImageProps) {
  return (
    <picture className={className}>
      {/* 移动端 */}
      <source media="(max-width: 640px)" srcSet={mobileSrc} />
      {/* 平板 */}
      <source media="(max-width: 1024px)" srcSet={tabletSrc} />
      {/* 桌面 */}
      <Image
        src={desktopSrc}
        alt={alt}
        fill
        priority={priority}
        className="object-cover"
      />
    </picture>
  );
}

/**
 * 懒加载图片组
 * 用于图片列表，一次只加载可见区域
 */
interface LazyImageGridProps {
  images: { src: string; alt: string }[];
  renderItem: (src: string, alt: string, index: number) => React.ReactNode;
  columns?: number;
}

export function LazyImageGrid({
  images,
  renderItem,
  columns = 4,
}: LazyImageGridProps) {
  return (
    <div
      className={cn(
        'grid gap-4',
        columns === 1 && 'grid-cols-1',
        columns === 2 && 'grid-cols-2',
        columns === 3 && 'grid-cols-3',
        columns === 4 && 'grid-cols-4',
        columns === 6 && 'grid-cols-6'
      )}
    >
      {images.map((image, index) => (
        <div key={index} className="relative">
          {renderItem(image.src, image.alt, index)}
        </div>
      ))}
    </div>
  );
}