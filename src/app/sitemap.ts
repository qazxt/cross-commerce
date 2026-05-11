import { MetadataRoute } from 'next';
import { db } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const locale = 'zh';
  
  // 获取所有商品
  const products = await db.product.findMany({
    where: { status: 'active' },
    select: { slug: true, updatedAt: true },
  });

  // 获取所有分类
  const categories = await db.category.findMany({
    where: { isActive: true },
    select: { slug: true },
  });

  // 获取所有品牌
  const brands = await db.brand.findMany({
    select: { slug: true },
  });

  // 静态页面
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: `${url}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${url}/${locale}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${url}/${locale}/category`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${url}/${locale}/brand`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  // 商品页面
  const productUrls: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${url}/${locale}/product/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // 分类页面
  const categoryUrls: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${url}/${locale}/category/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // 品牌页面
  const brandUrls: MetadataRoute.Sitemap = brands.map((brand) => ({
    url: `${url}/${locale}/brand/${brand.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticUrls, ...productUrls, ...categoryUrls, ...brandUrls];
}
