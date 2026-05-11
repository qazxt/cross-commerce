import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import Image from 'next/image';

import { db } from '@/lib/db';
import { ProductGrid } from '@/components/product/ProductGrid';

type Props = { params: { slug: string; locale: string } };

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'zh' }];
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const brand = await db.brand.findUnique({
    where: { slug: params.slug },
    include: { _count: { select: { products: true } } },
  });

  if (!brand) {
    return { title: '品牌未找到' };
  }

  const url = `${SITE_URL}/${params.locale}/brand/${brand.slug}`;
  
  return {
    title: brand.name,
    description: `${brand.name}品牌专区，汇聚${brand._count.products}款热门商品。${brand.description || '发现优质' + brand.name + '产品，推荐性价比好物！'}`,
    keywords: [brand.name, '品牌商品', '商品推荐', '价格对比', '热门推荐'],
    alternates: {
      canonical: url,
      languages: {
        'zh-CN': `${SITE_URL}/zh/brand/${brand.slug}`,
        'en': `${SITE_URL}/en/brand/${brand.slug}`,
      },
    },
    openGraph: {
      type: 'website',
      url,
      title: `${brand.name} - FindsIndex`,
      description: `${brand.name}，共${brand._count.products}个商品`,
      siteName: 'FindsIndex',
      locale: params.locale === 'zh' ? 'zh_CN' : 'en_US',
      images: brand.logoUrl ? [brand.logoUrl] : undefined,
    },
    twitter: {
      card: 'summary',
      title: `${brand.name} - FindsIndex`,
      description: `${brand.name}，共${brand._count.products}个商品`,
    },
  };
}

export default async function BrandPage({ params }: Props) {
  setRequestLocale(params.locale);
  const t = await getTranslations({ locale: params.locale, namespace: 'Brand' });
  
  const brand = await db.brand.findUnique({
    where: { slug: params.slug },
    include: {
      products: {
        where: { status: 'active' },
        orderBy: { createdAt: 'desc' },
        take: 48,
        include: {
          brand: true,
          primaryCategory: true,
        },
      },
      _count: { select: { products: true } },
    },
  });

  if (!brand) {
    notFound();
  }

  return (
    <div className="container py-8">
      {/* 面包屑 */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
        <a href={`/${params.locale}`} className="hover:text-foreground">首页</a>
        <span>/</span>
        <a href={`/${params.locale}/brand`} className="hover:text-foreground">品牌</a>
        <span>/</span>
        <span className="text-foreground">{brand.name}</span>
      </nav>

      {/* 品牌信息 */}
      <div className="mb-8 p-6 border rounded-lg bg-muted/30">
        <div className="flex items-start gap-6">
          {brand.logoUrl && (
            <div className="w-24 h-24 relative flex-shrink-0 rounded-lg overflow-hidden bg-white border">
              <Image
                src={brand.logoUrl}
                alt={brand.name}
                fill
                className="object-contain p-2"
              />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{brand.name}</h1>
            <p className="text-muted-foreground mb-2">
              {t('productsCount', { count: brand._count.products })}
            </p>
            {brand.description && (
              <p className="text-sm text-muted-foreground">
                {brand.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 商品列表 */}
      <section>
        <h2 className="text-xl font-semibold mb-6">品牌商品</h2>
        {brand.products.length > 0 ? (
          <ProductGrid products={brand.products} />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">该品牌下暂无商品</p>
          </div>
        )}
      </section>
    </div>
  );
}
