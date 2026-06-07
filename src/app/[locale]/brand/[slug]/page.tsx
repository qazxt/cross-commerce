import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';

import { db } from '@/lib/db';
import { ProductGrid } from '@/components/product/ProductGrid';
import { getSafeImageUrl } from '@/lib/image-optimization';

type Props = { params: { slug: string; locale: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const brand = await db.brand.findUnique({
    where: { slug: params.slug },
    include: {
      _count: {
        select: { products: true }
      }
    }
  });

  if (!brand) {
    return { title: '品牌未找到' };
  }

  return {
    title: `${brand.nameCn || brand.name} - ${brand.name} | FindsIndex`,
    description: brand.description || `${brand.name}品牌商品，发现好物、对比价格、查看评测`,
    openGraph: {
      title: brand.nameCn || brand.name,
      description: brand.description,
      images: brand.logoUrl ? [{ url: brand.logoUrl }] : undefined,
    },
  };
}

export default async function BrandPage({ params }: Props) {
  setRequestLocale(params.locale);
  const t = await getTranslations({ locale: params.locale, namespace: 'Brand' });

  const brand = await db.brand.findUnique({
    where: { slug: params.slug },
    include: {
      _count: {
        select: { products: true }
      }
    }
  });

  if (!brand) {
    notFound();
  }

  // 获取品牌下的商品
  const products = await db.product.findMany({
    where: { brandId: brand.id, status: 'active' },
    include: { brand: true },
    orderBy: { popularityScore: 'desc' },
    take: 24,
  });

  return (
    <div className="container py-8 space-y-8">
      {/* 品牌头部 */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 md:p-12">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {brand.logoUrl ? (
            <img
              src={brand.logoUrl}
              alt={brand.name}
              className="w-24 h-24 md:w-32 md:h-32 object-contain rounded-lg bg-white p-4 border shadow-sm"
            />
          ) : (
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-4xl md:text-5xl font-bold text-primary">
                {brand.name.charAt(0)}
              </span>
            </div>
          )}
          
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {brand.nameCn || brand.name}
            </h1>
            {brand.nameCn && brand.name !== brand.nameCn && (
              <p className="text-lg text-muted-foreground mb-2">{brand.name}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {brand._count?.products || 0} 件商品
            </p>
          </div>
        </div>

        {brand.description && (
          <div className="mt-6 prose prose-sm max-w-none text-muted-foreground">
            <p>{brand.description}</p>
          </div>
        )}
      </div>

      {/* 品牌故事 */}
      {brand.description && (
        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">关于品牌</h2>
          <div className="prose max-w-none text-muted-foreground">
            <p>{brand.description}</p>
          </div>
        </div>
      )}

      {/* 商品列表 */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">品牌商品</h2>
          <a
            href={`/search?brand=${brand.slug}`}
            className="text-sm text-primary hover:underline"
          >
            查看全部 →
          </a>
        </div>
        
        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            暂无商品
          </div>
        )}
      </div>
    </div>
  );
}