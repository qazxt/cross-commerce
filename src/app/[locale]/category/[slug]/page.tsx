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
  // 获取分类及父分类信息
  const category = await db.category.findUnique({
    where: { slug: params.slug },
    include: {
      parent: {
        include: { parent: true }
      },
      children: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        take: 6,
      },
    },
  });

  if (!category) {
    return { title: '分类未找到' };
  }

  // 解析 translations
  let trans = {};
  try {
    trans = category.translations ? JSON.parse(category.translations) : {};
  } catch {}
  
  // 根据 locale 获取名称
  const getName = () => {
    if (params.locale === 'zh') return category.name;
    return category.nameEn || category.name;
  };
  
  // 构建面包屑路径
  const getBreadcrumb = () => {
    const parts = [];
    if (category.parent?.parent) {
      parts.push(category.parent.parent.name);
    }
    if (category.parent) {
      parts.push(category.parent.name);
    }
    parts.push(category.name);
    return parts.join(' > ');
  };

  // 解析 aliases 用于 keywords
  let aliases: string[] = [];
  try {
    aliases = category.aliases ? JSON.parse(category.aliases) : [];
  } catch {}

  const levelText = category.level === 0 ? '一级分类' : category.level === 1 ? '二级分类' : '三级分类';
  const productCount = category.productCount || 0;
  const categoryName = getName();
  const url = `${SITE_URL}/${params.locale}/category/${category.slug}`;
  
  // 描述文案
  const getDescription = () => {
    const names = category.children?.map(c => c.name).slice(0, 5).join('、') || '';
    if (productCount > 0) {
      return `${categoryName} - ${levelText}，汇聚${productCount}款热门商品。${names ? '包括' + names + '等' : ''}。发现优质${categoryName}商品，推荐性价比好物！`;
    }
    return `${categoryName} - ${levelText}。${names ? '包括' + names + '等' : ''}。发现优质${categoryName}商品，推荐性价比好物！`;
  };

  return {
    title: `${categoryName} - FindsIndex`,
    description: getDescription(),
    keywords: [categoryName, ...aliases.slice(0, 5), '商品推荐', '价格对比', '热门商品', '潮牌'],
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
      title: `${categoryName} - FindsIndex`,
      description: getDescription().slice(0, 100),
      siteName: 'FindsIndex',
      locale: params.locale === 'zh' ? 'zh_CN' : 'en_US',
    },
    twitter: {
      card: 'summary',
      title: `${categoryName} - FindsIndex`,
      description: getDescription().slice(0, 100),
    },
    other: {
      'breadcrumb': getBreadcrumb(),
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  setRequestLocale(params.locale);
  const t = await getTranslations({ locale: params.locale, namespace: 'Category' });
  
  // 先获取分类信息（包含二级和三级分类）
  const category = await db.category.findUnique({
    where: { slug: params.slug },
    include: {
      children: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        include: {
          children: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
          },
        },
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

      {/* 二级分类 */}
      {category.children && category.children.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{t('subcategories')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.children.map((child) => (
              <div key={child.id} className="border rounded-xl p-5 hover:border-primary/50 hover:shadow-md transition-all">
                <a
                  href={`/category/${child.slug}`}
                  className="font-semibold text-lg mb-3 block hover:text-primary transition-colors"
                >
                  {child.name}
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({child.productCount})
                  </span>
                </a>
                {/* 三级分类 */}
                {child.children && child.children.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                    {child.children.map((grandchild) => (
                      <a
                        key={grandchild.id}
                        href={`/category/${grandchild.slug}`}
                        className="text-sm py-2 px-3 rounded-lg bg-muted/50 hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        {grandchild.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
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
