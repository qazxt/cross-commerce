import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';

import { db } from '@/lib/db';
import { ProductGrid } from '@/components/product/ProductGrid';
import { SearchFilters } from '@/components/search/SearchFilters';
import { SearchBar } from '@/components/search/SearchBar';
import { PAGINATION } from '@/lib/constants';

type Props = { params: { locale: string }; searchParams: { [key: string]: string | string[] | undefined } };

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'zh' }];
}

export async function generateMetadata({
  params: { locale },
  searchParams,
}: Props): Promise<Metadata> {
  const q = (searchParams.q as string) || '';
  const category = (searchParams.category as string) || '';
  const sort = (searchParams.sort as string) || 'relevance';
  
  const baseUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/${locale}`;
  const searchUrl = `${baseUrl}/search?q=${encodeURIComponent(q)}`;
  
  let title = q ? `${q} - 搜索结果` : '搜索商品';
  let description = q 
    ? `搜索 "${q}" 的结果，发现更多优质商品。价格对比、用户评测，帮助你找到性价比最高的选择。`
    : '搜索海量商品，发现好物、对比价格、查看评测。';
  
  if (category) {
    title = `${category} - 商品搜索`;
    description = `浏览${category}分类下的热门商品，精选推荐！`;
  }

  return {
    title,
    description,
    keywords: [q, category, '商品搜索', '���物推荐', '价格对比'].filter(Boolean),
    alternates: {
      canonical: searchUrl,
    },
    openGraph: {
      type: 'website',
      url: searchUrl,
      title,
      description,
      siteName: 'FindsIndex',
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
    },
  };
}

export default async function SearchPage({ params: { locale }, searchParams }: Props) {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Search' });

  const {
    q = '',
    category = '',
    brand = '',
    colors = '',
    sort = 'relevance',
    page: pageStr = '1',
    limit = PAGINATION.defaultLimit.toString(),
  } = searchParams;

  const page = Number(pageStr);
  const priceMin = searchParams.priceMin ? Number(searchParams.priceMin) : undefined;
  const priceMax = searchParams.priceMax ? Number(searchParams.priceMax) : undefined;

  // 构建查询条件
  const where: any = {
    status: 'active',
  };

  // 搜索关键词
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { titleEn: { contains: q } },
      { description: { contains: q } },
    ];
  }

  // 分类筛选
  if (category) {
    where.primaryCategoryId = category;
  }

  // 品牌筛选
  if (brand) {
    where.brandId = brand;
  }

  // 价格筛选
  if (priceMin !== undefined || priceMax !== undefined) {
    where.AND = [];
    if (priceMin !== undefined) {
      where.AND.push({ priceMin: { gte: priceMin } });
    }
    if (priceMax !== undefined) {
      where.AND.push({ priceMax: { lte: priceMax } });
    }
  }

  // 排序
  const orderBy: any = {};
  switch (sort) {
    case 'price_asc':
      orderBy.priceMin = 'asc';
      break;
    case 'price_desc':
      orderBy.priceMin = 'desc';
      break;
    case 'newest':
      orderBy.createdAt = 'desc';
      break;
    case 'popular':
      orderBy.popularityScore = 'desc';
      break;
    default:
      orderBy.createdAt = 'desc';
  }

  // 获取商品和总数
  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      orderBy,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      include: {
        brand: true,
        primaryCategory: true,
      },
    }),
    db.product.count({ where }),
  ]);

  // 获取筛选选项
  const [categories, brands] = await Promise.all([
    db.category.findMany({
      where: { isActive: true, level: 0 },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { products: true } },
      },
      take: 10,
    }),
    db.brand.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { products: true } },
      },
      take: 20,
    }),
  ]);

  const totalPages = Math.ceil(total / Number(limit));

  return (
    <div className="container py-8">
      {/* 搜索框 */}
      <div className="mb-8">
        <SearchBar />
      </div>

      {/* 标题和结果统计 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">
          {q ? `${t('title')}: "${q}"` : t('title')}
        </h1>
        <p className="text-muted-foreground">
          {total > 0
            ? t('resultsCount', { count: total })
            : t('noResults')
          }
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* 筛选侧边栏 */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <Suspense fallback={<div className="h-96 bg-muted rounded-lg" />}>
            <SearchFilters
              categories={categories.map(c => ({
                id: c.id,
                name: c.name,
                count: c._count.products,
              }))}
              brands={brands.map(b => ({
                id: b.id,
                name: b.name,
                count: b._count.products,
              }))}
              colors={[
                { id: 'black', name: '黑色', color: '#000000' },
                { id: 'white', name: '白色', color: '#ffffff' },
                { id: 'red', name: '红色', color: '#ff0000' },
                { id: 'blue', name: '蓝色', color: '#0000ff' },
                { id: 'green', name: '绿色', color: '#00ff00' },
              ]}
              priceRange={{ min: 0, max: 100000 }}
              totalProducts={total}
            />
          </Suspense>
        </aside>

        {/* 商品列表 */}
        <div className="flex-1">
          {products.length > 0 ? (
            <>
              <ProductGrid products={products} />
              
              {/* 分页 */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  {page > 1 && (
                    <a
                      href={`?${new URLSearchParams({ ...searchParams, page: String(Number(page) - 1) })}`}
                      className="px-4 py-2 border rounded hover:bg-muted transition-colors"
                    >
                      {t('previous')}
                    </a>
                  )}
                  
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => {
                        const diff = Math.abs(p - Number(page));
                        return diff === 0 || diff === 1 || (Number(page) <= 3 && p <= 5) || (Number(page) > totalPages - 3 && p > totalPages - 5);
                      })
                      .map((p, i, arr) => (
                        <div key={p}>
                          {i > 0 && arr[i - 1] !== p - 1 && <span className="px-2">...</span>}
                          <a
                            href={`?${new URLSearchParams({ ...searchParams, page: String(p) })}`}
                            className={cn(
                              'px-4 py-2 border rounded transition-colors',
                              Number(page) === p
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-muted'
                            )}
                          >
                            {p}
                          </a>
                        </div>
                      ))}
                  </div>

                  {page < totalPages && (
                    <a
                      href={`?${new URLSearchParams({ ...searchParams, page: String(Number(page) + 1) })}`}
                      className="px-4 py-2 border rounded hover:bg-muted transition-colors"
                    >
                      {t('next')}
                    </a>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">{t('noResults')}</p>
              <p className="text-sm text-muted-foreground">
                {t('noResultsFor', { query: q })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 导入 cn 函数
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}
