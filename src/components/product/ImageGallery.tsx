'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ZoomIn, ChevronLeft, ChevronRight, ImageOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSafeImageUrl } from '@/lib/image-optimization';

interface ImageGalleryProps {
  images: string[];
  mainImage?: string;
}

export function ImageGallery({ images, mainImage }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // 合并主图和图片数组，去重
  const allImages = [];
  if (mainImage) allImages.push(mainImage);
  images.forEach(img => {
    if (img !== mainImage && !allImages.includes(img)) {
      allImages.push(img);
    }
  });

  const currentImage = allImages[selectedIndex] || allImages[0];
  const safeImageUrl = getSafeImageUrl(currentImage);

  const handlePrevious = useCallback(() => {
    setSelectedIndex(prev => (prev === 0 ? allImages.length - 1 : prev - 1));
    setIsZoomed(false);
  }, [allImages.length]);

  const handleNext = useCallback(() => {
    setSelectedIndex(prev => (prev === allImages.length - 1 ? 0 : prev + 1));
    setIsZoomed(false);
  }, [allImages.length]);

  // 键盘导航
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') setIsZoomed(false);
  }, [handlePrevious, handleNext]);

  if (allImages.length === 0) {
    return (
      <div 
        className="aspect-square bg-muted rounded-lg flex items-center justify-center"
        role="img"
        aria-label="No image available"
      >
        <div className="text-center text-muted-foreground">
          <ImageOff className="h-12 w-12 mx-auto mb-2" />
          <p>暂无图片</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" onKeyDown={handleKeyDown} tabIndex={0}>
      {/* 主图 */}
      <div 
        className={cn(
          'relative aspect-square rounded-lg overflow-hidden bg-muted',
          'group cursor-zoom-in',
          isZoomed && 'cursor-zoom-out'
        )}
        onClick={() => setIsZoomed(!isZoomed)}
        role="button"
        aria-label={isZoomed ? 'Click to zoom out' : 'Click to zoom in'}
      >
        {/* 加载状态 */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* 错误状态 */}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
            <div className="text-center text-muted-foreground">
              <ImageOff className="h-12 w-12 mx-auto mb-2" />
              <p className="text-sm">图片加载失败</p>
            </div>
          </div>
        )}

        <Image
          src={safeImageUrl}
          alt={`Product image ${selectedIndex + 1}`}
          fill
          priority
          className={cn(
            'object-cover transition-all duration-300',
            isZoomed && 'scale-150',
            isLoading && 'opacity-50'
          )}
          sizes="(max-width: 768px) 100vw, 50vw"
          onLoadStart={() => setIsLoading(true)}
          onLoad={() => {
            setIsLoading(false);
            setHasError(false);
          }}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
        
        {/* 放大按钮 */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20"
          onClick={(e) => {
            e.stopPropagation();
            setIsZoomed(!isZoomed);
          }}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>

        {/* 导航箭头 */}
        {allImages.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-20"
              onClick={(e) => {
                e.stopPropagation();
                handlePrevious();
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-20"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* 图片计数 */}
        {allImages.length > 1 && (
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 text-white text-xs rounded z-10">
            {selectedIndex + 1} / {allImages.length}
          </div>
        )}

        {/* 缩略图导航指示器（移动端） */}
        {allImages.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 md:hidden z-10">
            {allImages.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex(i);
                  setIsZoomed(false);
                }}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  i === selectedIndex ? 'bg-white w-4' : 'bg-white/50'
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* 缩略图（桌面端） */}
      {allImages.length > 1 && (
        <div className="hidden md:grid grid-cols-4 gap-2" role="tablist" aria-label="Product images">
          {allImages.map((image, index) => (
            <button
              key={index}
              onClick={() => {
                setSelectedIndex(index);
                setIsZoomed(false);
              }}
              className={cn(
                'aspect-square rounded-md overflow-hidden border-2 transition-all',
                selectedIndex === index
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-border hover:border-primary/50'
              )}
              role="tab"
              aria-selected={selectedIndex === index}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={getSafeImageUrl(image)}
                alt={`Thumbnail ${index + 1}`}
                width={80}
                height={80}
                className="w-full h-full object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}