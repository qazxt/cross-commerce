'use client';

import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { getSafeImageUrl } from '@/lib/image-optimization';
import { ProductWithBrand } from '@/lib/types';

interface RelatedProductsProps {
  products: ProductWithBrand[];
  title?: string;
}

export function RelatedProducts({ products, title = '相关推荐' }: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <div className="border rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <Link 
            key={product.id}
            href={`/product/${product.slug}`}
            className="group block"
          >
            <div className="aspect-square relative rounded-lg overflow-hidden bg-muted mb-2">
              <Image
                src={getSafeImageUrl(product.mainImage)}
                alt={product.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
            <p className="text-sm font-medium line-clamp-2 mb-1 h-10">
              {product.title}
            </p>
            <p className="text-sm font-bold text-primary">
              {formatPrice(product.priceMin, product.currency)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}