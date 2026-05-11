import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProductWithBrand } from '@/lib/types';
import { formatPrice, cn } from '@/lib/utils';
import { getImageSizes } from '@/lib/image-optimization';
import { getSafeImageUrl } from '@/lib/image-optimization';

interface ProductCardProps {
  product: ProductWithBrand;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const safeImageUrl = getSafeImageUrl(product.mainImage);

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link href={`/product/${product.slug}`}>
        <div className="aspect-square relative overflow-hidden bg-muted">
          <Image
            src={safeImageUrl}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes={getImageSizes(true, 4)}
            priority={priority}
            placeholder="empty"
          />
          {product.isFeatured && (
            <Badge className="absolute top-2 left-2">精选</Badge>
          )}
          {product.popularityScore > 0.8 && (
            <Badge variant="secondary" className="absolute top-2 right-2">
              🔥 热门
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-medium text-sm line-clamp-2 mb-2 h-10">
            {product.title}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary">
              {formatPrice(product.priceMin, product.currency)}
            </span>
            {product.priceMax > product.priceMin && (
              <span className="text-sm text-muted-foreground">
                - {formatPrice(product.priceMax, product.currency)}
              </span>
            )}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {product.brand.name}
          </div>
        </CardContent>
      </Link>
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
}

export function ProductGrid({ 
  products, 
  columns = { default: 2, sm: 2, md: 3, lg: 4 },
  loading = false 
}: ProductGridProps) {
  const gridClass = cn(
    'grid gap-4',
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
          // 前 4 个商品使用 priority 提高 LCP
          priority={index < 4}
        />
      ))}
      {loading && (
        <>
          {[...Array(8)].map((_, i) => (
            <div key={`skeleton-${i}`} className="animate-pulse">
              <div className="aspect-square bg-muted rounded-lg mb-2" />
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          ))}
        </>
      )}
    </div>
  );
}