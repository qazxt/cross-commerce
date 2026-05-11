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

  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
  };

  return (
    <div className={`grid ${gridCols[columns]} sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
