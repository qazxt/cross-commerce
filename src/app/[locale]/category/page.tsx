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
        take: 6,
      },
    },
  });

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">{t('allCategories')}</h1>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((category) => (
          <div
            key={category.id}
            className="border rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4 mb-4">
              {category.coverImage && (
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
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
                  className="text-xl font-semibold hover:text-primary transition-colors"
                >
                  {category.name}
                </a>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('productsCount', { count: category.productCount })}
                </p>
              </div>
            </div>

            {category.children && category.children.length > 0 && (
              <div className="space-y-2">
                {category.children.map((child) => (
                  <div key={child.id}>
                    <a
                      href={`/category/${child.slug}`}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors block"
                    >
                      {child.name}
                    </a>
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
