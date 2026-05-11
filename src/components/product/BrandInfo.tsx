'use client';

import { Badge } from '@/components/ui/badge';
import { Brand } from '@prisma/client';

interface BrandInfoProps {
  brand: Brand & {
    productCount?: number;
    productCountAggregate?: Array<{ _count: { id: number } }>;
  };
}

export function BrandInfo({ brand }: BrandInfoProps) {
  return (
    <div className="border rounded-lg p-6 space-y-4">
      <div className="flex items-center gap-4">
        {brand.logoUrl ? (
          <img 
            src={brand.logoUrl} 
            alt={brand.name}
            className="w-16 h-16 object-contain rounded-lg bg-white p-2 border"
          />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary">
              {brand.name.charAt(0)}
            </span>
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold">{brand.nameCn || brand.name}</h3>
          <p className="text-sm text-muted-foreground">
            {brand.productCountAggregate?.[0]?._count?.id || brand.productCount || 0} 件商品
          </p>
        </div>
      </div>
      
      {brand.description && (
        <div className="text-sm text-muted-foreground">
          <p>{brand.description}</p>
        </div>
      )}
      
      <div className="flex gap-2">
        <Badge variant="outline">授权正品</Badge>
        <Badge variant="outline">官方直采</Badge>
      </div>
    </div>
  );
}