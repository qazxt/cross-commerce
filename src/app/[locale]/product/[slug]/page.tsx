import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';

import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Share2, Heart } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { ImageGallery } from '@/components/product/ImageGallery';
import { ProductInfo } from '@/components/product/ProductInfo';
import { SizeGuide } from '@/components/product/SizeGuide';
import { FavoriteButton } from '@/components/product/FavoriteButton';
import { TrackView } from '@/components/product/TrackView';
import { ProductStructuredData } from '@/components/seo/ProductStructuredData';
import { BrandInfo } from '@/components/product/BrandInfo';
import { ShippingInfo } from '@/components/product/ShippingInfo';
import { PlatformCompare } from '@/components/product/PlatformCompare';
import { Reviews } from '@/components/product/Reviews';
import { RelatedProducts } from '@/components/product/RelatedProducts';

type Props = { params: { slug: string; locale: string } };

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'zh' }];
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const product = await db.product.findUnique({
    where: { slug: params.slug },
    include: { brand: true, primaryCategory: true },
  });

  if (!product) {
    return { title: '商品未找到' };
  }

  const url = `${SITE_URL}/${params.locale}/product/${product.slug}`;
  const description = product.description?.slice(0, 160) || `${product.title} - ${product.brand.name} 品牌商品`;
  const images = product.images ? JSON.parse(product.images) : [product.mainImage];

  return {
    title: product.title,
    description,
    keywords: [product.title, product.brand.name, product.primaryCategory.name, '商品推荐', '价格对比'],
    authors: [{ name: product.brand.name }],
    alternates: {
      canonical: url,
      languages: {
        'zh-CN': `${SITE_URL}/zh/product/${product.slug}`,
        'en': `${SITE_URL}/en/product/${product.slug}`,
      },
    },
    openGraph: {
      type: 'website',
      url,
      title: product.title,
      description,
      siteName: 'FindsIndex',
      locale: params.locale === 'zh' ? 'zh_CN' : 'en_US',
      alternateLocale: params.locale === 'zh' ? 'en_US' : 'zh_CN',
      images: images.slice(0, 5).map((img: string) => ({
        url: img,
        width: 800,
        height: 800,
        alt: product.title,
      })),
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description,
      images: [product.mainImage],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  setRequestLocale(params.locale);
  const t = await getTranslations({ locale: params.locale, namespace: 'Product' });
  
  const product = await db.product.findUnique({
    where: { slug: params.slug },
    include: {
      brand: true,
      primaryCategory: true,
      affiliateLinks: {
        where: { isActive: true },
        orderBy: { isPrimary: 'desc' },
      },
      skus: {
        where: { isActive: true },
      },
      attributes: true,
      reviews: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      shippingInfo: true,
    },
  });

  // 获取相关商品（同品牌其他商品）
  const relatedProducts = await db.product.findMany({
    where: {
      brandId: product.brandId,
      id: { not: product.id },
      status: 'active',
    },
    include: { brand: true },
    take: 4,
    orderBy: { popularityScore: 'desc' },
  });

  if (!product) {
    notFound();
  }

  // 更新浏览次数
  await db.product.update({
    where: { id: product.id },
    data: { viewCount: { increment: 1 } },
  });

  // 记录浏览历史（客户端）
  // 使用客户端组件记录，避免 SSR 问题

  // 解析图片数组
  const images = product.images ? JSON.parse(product.images) : [];
  
  // 解析 SKU 选项
  const skus = product.skus.map(sku => ({
    ...sku,
    image: sku.image ?? undefined, // 将 null 转换为 undefined
    options: JSON.parse(sku.options),
  }));

  // 提取选项
  const options: { colors?: any[]; sizes?: any[]; styles?: any[] } = {};
  const colorSet = new Set<string>();
  const sizeSet = new Set<string>();
  const styleSet = new Set<string>();

  skus.forEach(sku => {
    if (sku.options.color && !colorSet.has(sku.options.color)) {
      colorSet.add(sku.options.color);
      if (!options.colors) options.colors = [];
      options.colors.push({
        id: `color-${sku.options.color}`,
        name: sku.options.color,
        value: sku.options.color,
        type: 'color' as const,
      });
    }
    if (sku.options.size && !sizeSet.has(sku.options.size)) {
      sizeSet.add(sku.options.size);
      if (!options.sizes) options.sizes = [];
      options.sizes.push({
        id: `size-${sku.options.size}`,
        name: sku.options.size,
        value: sku.options.size,
        type: 'size' as const,
      });
    }
    if (sku.options.style && !styleSet.has(sku.options.style)) {
      styleSet.add(sku.options.style);
      if (!options.styles) options.styles = [];
      options.styles.push({
        id: `style-${sku.options.style}`,
        name: sku.options.style,
        value: sku.options.style,
        type: 'style' as const,
      });
    }
  });

  return (
    <div className="container py-8">
      {/* 结构化数据 */}
      <ProductStructuredData product={product} locale={params.locale} />
      
      {/* 记录浏览 */}
      <TrackView productId={product.id} />
      {/* 面包屑 */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
        <a href={`/${params.locale}`} className="hover:text-foreground">首页</a>
        <span>/</span>
        <a href={`/${params.locale}/category/${product.primaryCategory.slug}`} className="hover:text-foreground">
          {product.primaryCategory.name}
        </a>
        <span>/</span>
        <a href={`/${params.locale}/brand/${product.brand.slug}`} className="hover:text-foreground">
          {product.brand.name}
        </a>
        <span>/</span>
        <span className="text-foreground">{product.title}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* 商品图片 */}
        <div>
          <ImageGallery images={images} mainImage={product.mainImage} />
        </div>

        {/* 商品信息 - 客户端组件包装 */}
        <ProductInfo
          product={{
            id: product.id,
            title: product.title,
            priceMin: product.priceMin,
            priceMax: product.priceMax,
            currency: product.currency,
            brand: product.brand,
            popularityScore: product.popularityScore,
            affiliateLinks: product.affiliateLinks,
          }}
          skus={skus}
          options={options}
          translations={{
            purchaseInfo: t('purchaseInfo'),
            purchaseInfoDesc: t('purchaseInfoDesc'),
            buyNow: t('buyNow'),
          }}
        />

        {/* 尺码指南按钮 */}
        <div className="mt-4">
          <SizeGuide category="服装" sizes={options.sizes?.map(s => s.value) || []} />
        </div>

        {/* 商品描述和属性 - 保持服务端 */}
        <div className="md:col-span-1 space-y-6 pt-8 border-t">
          {product.description && (
            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold mb-2">{t('description')}</h3>
              <p className="text-muted-foreground whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {product.attributes.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">{t('specifications')}</h3>
              <div className="grid grid-cols-2 gap-2">
                {product.attributes.map((attr) => (
                  <div key={attr.id} className="flex justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">{attr.name}</span>
                    <span className="text-sm font-medium">{attr.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 商品统计 */}
          <div className="flex gap-6 text-sm text-muted-foreground pt-4 border-t">
            <div>
              <span className="font-medium text-foreground">{product.viewCount}</span> 次浏览
            </div>
            <div>
              <span className="font-medium text-foreground">{product.salesCount}</span> 次购买
            </div>
          </div>

          {/* 分类信息 */}
          <div className="pt-4 border-t space-y-2 text-sm">
            <div className="flex gap-2">
              <span className="text-muted-foreground">{t('category')}:</span>
              <a 
                href={`/category/${product.primaryCategory.slug}`}
                className="text-primary hover:underline"
              >
                {product.primaryCategory.name}
              </a>
            </div>
            <div className="flex gap-2">
              <span className="text-muted-foreground">{t('brand')}:</span>
              <a 
                href={`/brand/${product.brand.slug}`}
                className="text-primary hover:underline"
              >
                {product.brand.name}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 品牌介绍 */}
      <div className="mt-8">
        <BrandInfo brand={product.brand} />
      </div>

      {/* 平台对比 */}
      {product.affiliateLinks && product.affiliateLinks.length > 0 && (
        <div className="mt-6">
          <PlatformCompare 
            affiliateLinks={product.affiliateLinks} 
            productPrice={product.priceMin}
            currency={product.currency}
          />
        </div>
      )}

      {/* 配送信息 */}
      {product.shippingInfo && (
        <div className="mt-6">
          <ShippingInfo shipping={product.shippingInfo} />
        </div>
      )}

      {/* 用户评价 */}
      {product.reviews && product.reviews.length > 0 && (
        <div className="mt-6">
          <Reviews reviews={product.reviews} productId={product.id} />
        </div>
      )}

      {/* 相关商品 */}
      {relatedProducts.length > 0 && (
        <div className="mt-6">
          <RelatedProducts products={relatedProducts} />
        </div>
      )}
    </div>
  );
}

// 追踪点击
async function trackClick(linkId: string, productId: string) {
  // 调用 API 记录点击
  try {
    await fetch('/api/affiliate/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ linkId, productId }),
    });
  } catch (error) {
    console.error('Failed to track click:', error);
  }
}
