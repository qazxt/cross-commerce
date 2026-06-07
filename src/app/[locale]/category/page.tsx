import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';

import { db } from '@/lib/db';

type Props = { params: { locale: string } };

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'zh' }];
}

export const metadata: Metadata = {
  title: '全部分类 - FindsIndex',
  description: '浏览所有商品分类',
};

export default async function CategoryListPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Category' });

  // 获取一级分类及其完整三级结构
  const categories = await db.category.findMany({
    where: {
      level: 0,
      isActive: true,
    },
    orderBy: { sortOrder: 'asc' },
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
    },
  });

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">{t('allCategories')}</h1>
      
      <div className="space-y-10">
        {categories.map((category) => (
          <div key={category.id} className="border rounded-xl p-6 hover:shadow-lg transition-shadow">
            {/* 一级分类标题 */}
            <div className="flex items-center gap-4 mb-5 pb-4 border-b">
              {category.coverImage && (
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={category.coverImage}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <a
                  href={`/category/${category.slug}`}
                  className="text-2xl font-bold hover:text-primary transition-colors"
                >
                  {category.name}
                </a>
                <p className="text-sm text-muted-foreground">
                  {t('productsCount', { count: category.productCount })}
                </p>
              </div>
            </div>

            {/* 二级 + 三级分类树 */}
            {category.children && category.children.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.children.map((child) => (
                  <div key={child.id} className="bg-muted/30 rounded-lg p-4">
                    <a
                      href={`/category/${child.slug}`}
                      className="font-semibold text-base mb-3 block hover:text-primary transition-colors"
                    >
                      {child.name}
                    </a>
                    {/* 三级分类 */}
                    {child.children && child.children.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {child.children.map((grandchild) => (
                          <a
                            key={grandchild.id}
                            href={`/category/${grandchild.slug}`}
                            className="text-sm py-1.5 px-3 rounded-full bg-background border hover:border-primary hover:text-primary transition-colors"
                          >
                            {grandchild.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
