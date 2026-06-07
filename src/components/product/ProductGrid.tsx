import { ProductWithBrand } from '@/lib/types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: ProductWithBrand[];
  columns?: 2 | 3 | 4 | 5 | 6;
}

export function ProductGrid({ products, columns = 4 }: ProductGridProps) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">暂无商品</p>
      </div>
    );
  }

  // 生成商品结构化数据（JSON-LD）
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: products.slice(0, 20).map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: product.title,
        image: product.mainImage,
        brand: {
          '@type': 'Brand',
          name: product.brand.name,
        },
        offers: {
          '@type': 'Offer',
          price: product.priceMin / 100,
          priceCurrency: product.currency || 'CNY',
          availability: product.status === 'active' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        },
      },
    })),
  };

  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <div className={`grid ${gridCols[columns]} sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4`}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
}
