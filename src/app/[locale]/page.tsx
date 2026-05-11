import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';

import { db } from '@/lib/db';
import { ProductGrid } from '@/components/product/ProductGrid';
import { CategoryNav } from '@/components/category/CategoryNav';

type Props = { params: { locale: string } };

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'zh' }];
}

export async function generateMetadata({
  params: { locale },
}: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Home' });
  const url = `${SITE_URL}/${locale}`;
  
  return {
    title: t('title'),
    description: '海量商品数据库，发现好物、对比价格、查看评测。精选热门商品，帮你快速找到心仪商品。',
    keywords: ['商品推荐', '好物发现', '价格对比', '产品评测', '购物指南', '热门商品', '精选好物'],
    alternates: {
      canonical: url,
      languages: {
        'zh-CN': `${SITE_URL}/zh`,
        'en': `${SITE_URL}/en`,
      },
    },
    openGraph: {
      type: 'website',
      url,
      title: t('title'),
      description: t('description'),
      siteName: 'FindsIndex',
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
    },
  };
}

export default async function HomePage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Home' });

  // 获取精选商品
  const featuredProducts = await db.product.findMany({
    where: { isFeatured: true, status: 'active' },
    take: 8,
    orderBy: { createdAt: 'desc' },
    include: { 
      brand: true, 
      primaryCategory: true,
    },
  });

  // 获取最新商品
  const newProducts = await db.product.findMany({
    where: { status: 'active' },
    take: 12,
    orderBy: { createdAt: 'desc' },
    include: { 
      brand: true, 
      primaryCategory: true,
    },
  });

  return (
    <div className="container py-8 space-y-12">
      {/* Hero Section */}
      <section className="relative rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 p-8 md:p-12 overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('title')}
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            {t('description')}
          </p>
        </div>
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
      </section>

      {/* 分类导航 */}
      <section>
        <h2 className="text-2xl font-bold mb-6">{t('popularCategories')}</h2>
        <CategoryNav />
      </section>

      {/* 精选商品 */}
      {featuredProducts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{t('featuredProducts')}</h2>
            <a 
              href="/search?sort=newest" 
              className="text-sm text-primary hover:underline"
            >
              {t('Common.viewAll')} →
            </a>
          </div>
          <ProductGrid products={featuredProducts} />
        </section>
      )}

      {/* 最新上架 */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{t('newArrivals')}</h2>
          <a 
            href="/search?sort=newest" 
            className="text-sm text-primary hover:underline"
          >
            {t('Common.viewAll')} →
          </a>
        </div>
        <ProductGrid products={newProducts} />
      </section>
    </div>
  );
}
