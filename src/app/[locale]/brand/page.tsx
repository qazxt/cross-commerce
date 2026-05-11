import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import Image from 'next/image';

import { db } from '@/lib/db';

type Props = { params: { locale: string } };

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'zh' }];
}

export const metadata: Metadata = {
  title: '全部品牌 - FindsIndex',
  description: '浏览所有品牌',
};

export default async function BrandListPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Brand' });

  const brands = await db.brand.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { products: true } },
    },
  });

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">{t('allBrands')}</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {brands.map((brand) => (
          <a
            key={brand.id}
            href={`/brand/${brand.slug}`}
            className="border rounded-lg p-4 hover:shadow-md hover:border-primary transition-all group"
          >
            {brand.logoUrl ? (
              <div className="aspect-square relative mb-3 rounded-lg overflow-hidden bg-white">
                <Image
                  src={brand.logoUrl}
                  alt={brand.name}
                  fill
                  className="object-contain p-2 group-hover:scale-105 transition-transform"
                />
              </div>
            ) : (
              <div className="aspect-square mb-3 rounded-lg bg-muted flex items-center justify-center">
                <span className="text-2xl font-bold text-muted-foreground">
                  {brand.name.charAt(0)}
                </span>
              </div>
            )}
            <div className="text-center">
              <div className="font-medium text-sm mb-1 truncate">
                {brand.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {t('productsCount', { count: brand._count.products })}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
