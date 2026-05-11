import { MetadataRoute } from 'next';
import { db } from '@/lib/db';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://47.108.119.210:3000';
const LOCALES = ['zh', 'en'] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = [];

  // 获取活跃商品
  const products = await db.product.findMany({
    where: { status: 'active' },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
    take: 1000, // 限制数量
  });

  // 获取分类
  const categories = await db.category.findMany({
    where: { isActive: true },
    select: { slug: true },
  });

  // 获取品牌
  const brands = await db.brand.findMany({
    select: { slug: true },
    take: 500,
  });

  // 为每个语言生成 URL
  for (const locale of LOCALES) {
    // 静态页面
    urls.push({
      url: `${SITE_URL}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    });

    urls.push({
      url: `${SITE_URL}/${locale}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    });

    urls.push({
      url: `${SITE_URL}/${locale}/category`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    });

    urls.push({
      url: `${SITE_URL}/${locale}/brand`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    });

    // 商品页面 (每种语言)
    for (const product of products) {
      urls.push({
        url: `${SITE_URL}/${locale}/product/${product.slug}`,
        lastModified: product.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      });
    }

    // 分类页面
    for (const category of categories) {
      urls.push({
        url: `${SITE_URL}/${locale}/category/${category.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      });
    }

    // 品牌页面
    for (const brand of brands) {
      urls.push({
        url: `${SITE_URL}/${locale}/brand/${brand.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      });
    }
  }

  return urls;
}