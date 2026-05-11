import { Product } from '@prisma/client';

interface ProductStructuredDataProps {
  product: Product & {
    brand: { name: string; slug: string };
    primaryCategory: { name: string; slug: string };
    affiliateLinks?: { url: string; platform: string }[];
  };
  locale?: string;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export function ProductStructuredData({ product, locale = 'zh' }: ProductStructuredDataProps) {
  const images = product.images ? JSON.parse(product.images) : [product.mainImage];
  const primaryLink = product.affiliateLinks?.[0];
  
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: images,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: product.brand.name,
      url: `${SITE_URL}/${locale}/brand/${product.brand.slug}`,
    },
    category: product.primaryCategory.name,
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: product.priceMin / 100,
      highPrice: product.priceMax / 100,
      priceCurrency: product.currency,
      availability: product.status === 'active' 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      url: `${SITE_URL}/${locale}/product/${product.slug}`,
    },
    aggregateRating: product.ratingCount > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: product.ratingAvg / 20,
      reviewCount: product.ratingCount,
    } : undefined,
    sku: product.id,
  };

  // 移除 undefined 值
  const filteredData = JSON.parse(JSON.stringify(structuredData));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(filteredData) }}
    />
  );
}

// 面包屑结构化数据组件
export function BreadcrumbStructuredData({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}