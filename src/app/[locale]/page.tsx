import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { Suspense } from 'react';

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
  const url = `${SITE_URL}/${locale}`;
  
  return {
    title: {
      default: 'FindsIndex - 发现好物 | 海量商品数据库',
      template: '%s | FindsIndex',
    },
    description: '海量商品数据库，发现好物、对比价格、查看评测。精选 Nike、Adidas、Gucci 等热门品牌商品，帮你快速找到心仪商品。',
    keywords: ['商品推荐', '好物发现', '价格对比', '产品评测', '购物指南', '热门商品', '精选好物', 'Nike', 'Adidas', 'Gucci', '潮牌'],
    authors: [{ name: 'FindsIndex', url: SITE_URL }],
    creator: 'FindsIndex',
    publisher: 'FindsIndex',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(SITE_URL),
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
      title: 'FindsIndex - 发现好物 | 海量商品数据库',
      description: '海量商品数据库，发现好物、对比价格、查看评测。精选热门商品，帮你快速找到心仪商品。',
      siteName: 'FindsIndex',
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      images: [
        {
          url: `${SITE_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: 'FindsIndex - 发现好物',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'FindsIndex - 发现好物',
      description: '海量商品数据库，发现好物、对比价格、查看评测。',
      images: [`${SITE_URL}/og-image.png`],
      creator: '@findsindex',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function HomePage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Home' });

  // 获取数据统计
  const [brandCount, productCount, categoryCount] = await Promise.all([
    db.brand.count({ where: { productCount: { gt: 0 } } }),
    db.product.count({ where: { status: 'active' } }),
    db.category.count({ where: { level: 0, isActive: true } }),
  ]);

  // 获取热门品牌（按商品数量排序）
  const brands = await db.brand.findMany({
    take: 12,
    orderBy: { productCount: 'desc' },
    where: { productCount: { gt: 0 } },
  });

  // 获取精选商品（合并精选+最新，共16个）
  const featuredProducts = await db.product.findMany({
    where: { status: 'active' },
    take: 16,
    orderBy: [
      { isFeatured: 'desc' },
      { viewCount: 'desc' },
    ],
    include: { 
      brand: true, 
      primaryCategory: true,
    },
  });

  // JSON-LD 结构化数据
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'FindsIndex',
    alternateName: '发现好物',
    url: SITE_URL,
    description: '海量商品数据库，发现好物、对比价格、查看评测。',
    inLanguage: locale === 'zh' ? 'zh-CN' : 'en',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/${locale}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: '首页',
        item: `${SITE_URL}/${locale}`,
      },
    ],
  };

  const hotTags = ['Nike', 'Adidas', 'Gucci', '运动鞋', '双肩包'];

  return (
    <div className="space-y-6 pb-12">
      {/* JSON-LD 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* ====== Phase 1: 搜索引导区 ====== */}
      <section className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 border-b border-slate-100">
        <div className="container py-8 md:py-12">
          <div className="max-w-2xl mx-auto text-center">
            {/* 标题 */}
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
              发现好物，轻松购物
            </h1>
            <p className="text-sm md:text-base text-slate-500 mb-6">
              海量商品数据库，帮你快速找到心仪商品
            </p>

            {/* 搜索框 - 核心元素 */}
            <form action="/search" className="flex gap-2 mb-5">
              <div className="relative flex-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input 
                  type="search" 
                  name="q"
                  placeholder="搜索商品、品牌..." 
                  className="w-full h-12 pl-11 pr-4 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 text-base"
                />
              </div>
              <button 
                type="submit"
                className="h-12 px-6 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-medium shadow-sm hover:shadow-md transition-all active:scale-95 whitespace-nowrap"
              >
                搜索
              </button>
            </form>

            {/* 热门搜索标签 */}
            <div className="flex flex-wrap justify-center gap-2">
              <span className="text-xs text-slate-400 py-1.5">热门搜索</span>
              {hotTags.map((tag) => (
                <a
                  key={tag}
                  href={`/search?q=${tag}`}
                  className="px-3 py-1 rounded-full bg-white border border-slate-200 text-xs text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                >
                  {tag}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ====== Phase 3: 统计信息 - 精简 1 行 ====== */}
      <section className="border-b border-slate-100">
        <div className="container">
          <div className="flex items-center justify-center gap-6 md:gap-10 py-3 text-xs md:text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="font-bold text-indigo-600">{brandCount}</span>
              <span>热门品牌</span>
            </span>
            <span className="w-px h-4 bg-slate-200" />
            <span className="flex items-center gap-1.5">
              <span className="font-bold text-indigo-600">{productCount}</span>
              <span>商品</span>
            </span>
            <span className="w-px h-4 bg-slate-200" />
            <span className="flex items-center gap-1.5">
              <span className="font-bold text-indigo-600">{categoryCount}</span>
              <span>分类</span>
            </span>
            <span className="w-px h-4 bg-slate-200" />
            <span className="flex items-center gap-1.5">
              <span className="font-bold text-indigo-600">10K+</span>
              <span>浏览量</span>
            </span>
          </div>
        </div>
      </section>

      {/* ====== Phase 2: 热门分类 - 网格布局 ====== */}
      <section className="container py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">{t('popularCategories')}</h2>
          <a href="/category" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">查看全部 →</a>
        </div>
        <CategoryNav />
      </section>

      {/* ====== Phase 2: 热门品牌 - 网格布局 ====== */}
      <section className="container py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">热门品牌</h2>
          <a href="/brand" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">查看全部 →</a>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {brands.slice(0, 12).map((brand) => (
            <a
              key={brand.id}
              href={`/brand/${brand.slug}`}
              className="group flex flex-col items-center p-3 rounded-xl bg-slate-50 hover:bg-white hover:shadow-md hover:ring-1 hover:ring-indigo-200 border border-transparent transition-all duration-200"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-white flex items-center justify-center mb-2 shadow-sm group-hover:scale-110 transition-transform">
                {brand.logoUrl ? (
                  <img src={brand.logoUrl} alt={brand.name} className="w-8 h-8 md:w-10 md:h-10 object-contain" />
                ) : (
                  <span className="text-lg font-bold text-slate-600">{brand.name.charAt(0)}</span>
                )}
              </div>
              <div className="text-xs font-medium text-slate-700 text-center truncate w-full">{brand.name}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{brand.productCount}</div>
            </a>
          ))}
        </div>
      </section>

      {/* ====== 精选商品 ====== */}
      <section className="container py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">{t('featuredProducts')}</h2>
          <a href="/search?sort=popular" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            {t('viewAll')}
          </a>
        </div>
        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductGrid products={featuredProducts} />
        </Suspense>
      </section>
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-square rounded-xl bg-slate-100 mb-2" />
          <div className="h-4 bg-slate-100 rounded w-3/4 mb-1" />
          <div className="h-3 bg-slate-100 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}
