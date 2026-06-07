'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FavoriteButton } from './FavoriteButton';
import { ShoppingCart, Eye } from 'lucide-react';
import { ProductWithBrand } from '@/lib/types';
import { formatPrice, cn } from '@/lib/utils';
import { getImageSizes, getSafeImageUrl } from '@/lib/image-optimization';

interface ProductCardProps {
  product: ProductWithBrand;
  priority?: boolean;
  showQuickActions?: boolean;
}

export function ProductCard({ 
  product, 
  priority = false,
  showQuickActions = true 
}: ProductCardProps) {
  const safeImageUrl = getSafeImageUrl(product.mainImage);
  const hasDiscount = product.priceMax > product.priceMin;
  const discountPercent = hasDiscount 
    ? Math.round((1 - product.priceMin / product.priceMax) * 100) 
    : 0;

  return (
    <Card className="group overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 rounded-2xl bg-white">
      <div className="relative">
        {/* 图片容器 - 优化移动端触摸 */}
        <Link href={`/product/${product.slug}`} className="block">
          <div className="aspect-[3/4] relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl">
            <Image
              src={safeImageUrl}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              sizes={getImageSizes(true, 4)}
              priority={priority}
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjFmNWY5Ii8+PC9zdmc+"
            />
            {/* 渐变遮罩 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* 标签区 - 优化位置 */}
            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
              {discountPercent > 0 && (
                <Badge className="bg-rose-500 hover:bg-rose-600 text-white border-0 text-[10px] font-bold px-2 py-0.5 shadow-sm">
                  -{discountPercent}%
                </Badge>
              )}
              {product.isFeatured && (
                <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-0 text-[10px] font-bold px-2 py-0.5 shadow-sm">
                  ✨ 精选
                </Badge>
              )}
              {product.popularityScore > 0.8 && (
                <Badge className="bg-gradient-to-r from-orange-500 to-rose-500 text-white border-0 text-[10px] font-bold px-2 py-0.5 shadow-sm">
                  🔥 热门
                </Badge>
              )}
            </div>

            {/* 悬浮操作按钮 - 移动端优化 */}
            {showQuickActions && (
              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex gap-2 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 sm:flex-col">
                <Link 
                  href={`/product/${product.slug}`}
                  className="flex-1 h-9 bg-white/95 backdrop-blur text-slate-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-white transition-colors shadow-lg hover:shadow-xl"
                >
                  <Eye className="w-3.5 h-3.5" />
                  查看详情
                </Link>
              </div>
            )}
          </div>
        </Link>
      </div>

      {/* 商品信息 - 优化布局 */}
      <CardContent className="p-3.5">
        {/* 品牌名 */}
        <p className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wide mb-1.5">
          {product.brand.name}
        </p>
        
        {/* 商品标题 */}
        <Link href={`/product/${product.slug}`} className="block">
          <h3 className="font-medium text-sm text-slate-800 line-clamp-2 mb-2 min-h-[40px] group-hover:text-indigo-600 transition-colors leading-snug">
            {product.title}
          </h3>
        </Link>

        {/* 价格区 - 增强视觉 */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {formatPrice(product.priceMin, product.currency)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-slate-400 line-through font-medium">
              {formatPrice(product.priceMax, product.currency)}
            </span>
          )}
        </div>
        
        {/* 统计信息 - 优化显示 */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
          <span className="flex items-center gap-1 text-[10px] text-slate-500">
            <Eye className="w-3 h-3" />
            {product.viewCount || 0}
          </span>
          {product.affiliateLinks?.length > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-slate-500">
              <ShoppingCart className="w-3 h-3" />
              {product.affiliateLinks.length}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 商品卡片网格组件
 * 支持响应式布局和无限滚动
 */
interface ProductGridProps {
  products: ProductWithBrand[];
  columns?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  loading?: boolean;
  showQuickActions?: boolean;
}

export function ProductGrid({ 
  products, 
  columns = { default: 2, sm: 2, md: 3, lg: 4, xl: 5 },
  loading = false,
  showQuickActions = true
}: ProductGridProps) {
  const gridClass = cn(
    'grid gap-4 md:gap-5',
    columns.default && `grid-cols-${columns.default}`,
    columns.sm && `sm:grid-cols-${columns.sm}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    columns.xl && `xl:grid-cols-${columns.xl}`
  );

  return (
    <div className={gridClass}>
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={index < 4}
          showQuickActions={showQuickActions}
        />
      ))}
      {loading && (
        <>
          {[...Array(columns.lg || 5)].map((_, i) => (
            <div key={`skeleton-${i}`} className="animate-pulse">
              <div className="aspect-[3/4] bg-slate-200 rounded-xl mb-3" />
              <div className="h-3.5 bg-slate-200 rounded w-3/4 mb-2" />
              <div className="h-3.5 bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </>
      )}
    </div>
  );
}