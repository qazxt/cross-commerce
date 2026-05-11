import { setRequestLocale } from 'next-intl/server';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { db } from '@/lib/db';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';

type Props = { params: { locale: string } };

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'zh' }];
}

export const metadata = {
  title: '我的收藏 - FindsIndex',
  description: '查看您收藏的商品',
};

export default async function FavoritesPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const t = await getTranslations({ locale, namespace: 'Account' });

  // 获取收藏列表
  const favorites = await db.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: {
          brand: true,
          primaryCategory: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const products = favorites.map(f => f.product);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Heart className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">我的收藏</h1>
        </div>
        <p className="text-muted-foreground">
          您已收藏 {products.length} 个商品
        </p>
      </div>

      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
            <Heart className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">还没有收藏任何商品</h2>
          <p className="text-muted-foreground mb-6">
            浏览商品时点击心形图标可以添加到收藏
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link href="/search">
                <ShoppingBag className="w-4 h-4 mr-2" />
                去逛逛
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
