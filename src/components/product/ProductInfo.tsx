'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Share2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { SKUSelector } from './SKUSelector';
import { FavoriteButton } from './FavoriteButton';
import { getPlatformConfig } from '@/lib/platform-config';
import { trackAffiliateClick } from '@/lib/affiliate-tracking';

interface ProductSKU {
  id: string;
  name: string;
  price: number;
  stock: number;
  options: Record<string, string>;
  image?: string;
  isActive: boolean;
}

interface AffiliateLink {
  id: string;
  platform: string;
  affiliateUrl: string;
  isPrimary: boolean;
}

interface ProductInfoProps {
  product: {
    title: string;
    priceMin: number;
    priceMax: number;
    currency: string;
    brand: { name: string };
    popularityScore: number;
    affiliateLinks: AffiliateLink[];
    id: string;
  };
  skus: ProductSKU[];
  options: {
    colors?: any[];
    sizes?: any[];
    styles?: any[];
  };
  translations: {
    purchaseInfo: string;
    purchaseInfoDesc: string;
    buyNow: string;
  };
}

export function ProductInfo({ product, skus, options, translations }: ProductInfoProps) {
  const [selectedSKU, setSelectedSKU] = useState<ProductSKU | null>(null);

  // 处理购买链接点击
  const handleAffiliateClick = (linkId: string, platform: string) => {
    trackAffiliateClick(linkId, product.id, platform);
  };

  // 根据选中的 SKU 显示价格
  const displayPrice = selectedSKU ? selectedSKU.price : product.priceMin;
  const displayPriceMax = selectedSKU ? selectedSKU.price : product.priceMax;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary">{product.brand.name}</Badge>
          {product.popularityScore > 0.8 && (
            <Badge>🔥 热门</Badge>
          )}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold">{product.title}</h1>
      </div>

      {/* 价格 */}
      <div className="space-y-2">
        <div className="text-3xl font-bold text-primary">
          {formatPrice(displayPrice, product.currency)}
        </div>
        {displayPriceMax > displayPrice && !selectedSKU && (
          <div className="text-lg text-muted-foreground">
            最高 {formatPrice(displayPriceMax, product.currency)}
          </div>
        )}
        {selectedSKU && (
          <div className="text-sm text-muted-foreground">
            已选择：{selectedSKU.name}
          </div>
        )}
      </div>

      {/* SKU 选择器 */}
      {skus.length > 0 && (
        <SKUSelector
          options={options}
          skus={skus}
          onSelect={(sku) => {
            setSelectedSKU(sku);
          }}
        />
      )}

      {/* 购买链接 */}
      <div className="space-y-4 pt-4 border-t">
        <div>
          <h3 className="font-semibold mb-1">{translations.purchaseInfo}</h3>
          <p className="text-sm text-muted-foreground">{translations.purchaseInfoDesc}</p>
        </div>
        
        {/* 主要平台按钮（Kakobuy）*/}
        <div className="space-y-2">
          {product.affiliateLinks
            .filter(link => link.isPrimary)
            .map((link) => {
              const platformConfig = getPlatformConfig(link.platform);
              return (
                <Button 
                  key={link.id} 
                  asChild 
                  className="w-full h-14 text-base font-semibold" 
                  size="lg"
                  style={{
                    backgroundColor: platformConfig?.color,
                    borderColor: platformConfig?.color,
                  }}
                >
                  <a
                    href={link.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleAffiliateClick(link.id, link.platform)}
                    data-link-id={link.id}
                    data-product-id={product.id}
                    className="flex items-center justify-center gap-2 text-white hover:text-white"
                  >
                    <span className="font-bold">{platformConfig?.logoText || link.platform}</span>
                    <ExternalLink className="h-5 w-5" />
                  </a>
                </Button>
              );
            })}
        </div>
        
        {/* 其他平台列表 */}
        {product.affiliateLinks.filter(link => !link.isPrimary).length > 0 && (
          <div className="space-y-3">
            <div className="text-sm font-medium text-muted-foreground">其他购买平台：</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {product.affiliateLinks
                .filter(link => !link.isPrimary)
                .map((link) => {
                  const platformConfig = getPlatformConfig(link.platform);
                  return (
                    <Button 
                      key={link.id} 
                      asChild 
                      variant="outline"
                      size="sm"
                      className="h-12 transition-all hover:shadow-md"
                      style={{
                        borderColor: platformConfig?.color,
                      }}
                    >
                      <a
                        href={link.affiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleAffiliateClick(link.id, link.platform)}
                        data-link-id={link.id}
                        data-product-id={product.id}
                        className="flex items-center justify-center gap-1 w-full"
                      >
                        <span 
                          className="font-medium truncate"
                          style={{ color: platformConfig?.color }}
                        >
                          {platformConfig?.logoText || link.platform}
                        </span>
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                    </Button>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-2 pt-4 border-t">
        <FavoriteButton productId="placeholder" />
        <Button variant="outline" size="icon">
          <Share2 className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
