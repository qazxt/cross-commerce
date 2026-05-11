import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';

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
  const category = await db.category.findUnique({
    where: { slug: params.slug },
    include: { _count: { select: { products: true } } },
  });

  if (!category) {
    return { title: '分类未找到' };
  }

  const url = `${SITE_URL}/${params.locale}/category/${category.slug}`;
  
  return {
    title: category.name,
    description: `${category.name}分类，���聚${category._count.products}款热门商品。${category.description || '发现优质' + category.name + '商品，推荐性价比好物！'}`,
    keywords: [category.name, '商品推荐', '价格对比', '热门商品'],
    alternates: {
      canonical: url,
      languages: {
        'zh-CN': `${SITE_URL}/zh/category/${category.slug}`,
        'en': `${SITE_URL}/en/category/${category.slug}`,
      },
    },
    openGraph: {
      type: 'website',
      url,
      title: `${category.name} - FindsIndex`,
      description: `${category.name}，共${category._count.products}个商品`,
      siteName: 'FindsIndex',
      locale: params.locale === 'zh' ? 'zh_CN' : 'en_US',
    },
    twitter: {
      card: 'summary',
      title: `${category.name} - FindsIndex`,
      description: `${category.name}，共${category._count.products}个商品`,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  setRequestLocale(params.locale);
  const t = await getTranslations({ locale: params.locale, namespace: 'Category' });
  
  // 先获取分类信息
  const category = await db.category.findUnique({
    where: { slug: params.slug },
    include: {
      children: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
      _count: { select: { products: true } },
    },
  });

  if (!category) {
    notFound();
  }

  // 单独查询该分类下的 active 商品
  const activeProducts = await db.product.findMany({
    where: {
      status: 'active',
      categories: {
        some: {
          categoryId: category.id,
        },
      },
    },
    include: {
      brand: true,
      primaryCategory: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 48,
  });

  return (
    <div className="container py-8">
      {/* 面包屑 */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
        <a href={`/${params.locale}`} className="hover:text-foreground">首页</a>
        <span>/</span>
        <a href={`/${params.locale}/category`} className="hover:text-foreground">分类</a>
        <span>/</span>
        <span className="text-foreground">{category.name}</span>
      </nav>

      {/* 分类标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
        <p className="text-muted-foreground">
          {t('productsCount', { count: category._count.products })}
        </p>
      </div>

      {/* 子分类 */}
      {category.children && category.children.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{t('subcategories')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {category.children.map((child) => (
              <a
                key={child.id}
                href={`/category/${child.slug}`}
                className="p-4 border rounded-lg hover:border-primary hover:shadow-sm transition-all"
              >
                <div className="font-medium text-sm mb-1">{child.name}</div>
                <div className="text-xs text-muted-foreground">
                  {child.productCount} 个商品
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* 商品列表 */}
      <section>
        <h2 className="text-xl font-semibold mb-6">商品列表</h2>
        {activeProducts.length > 0 ? (
          <ProductGrid products={activeProducts} />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">该分类下暂无商品</p>
          </div>
        )}
      </section>
    </div>
  );
}
