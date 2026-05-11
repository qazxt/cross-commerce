/**
 * SEO 工具函数
 * 
 * 生成页面元数据：Title、Description、Open Graph、Twitter Card
 */

import { db } from '@/lib/db';

const SITE_NAME = 'FindsIndex Clone';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://47.108.119.210:3000';
const SITE_DESCRIPTION = 'Discover trending fashion products, compare prices across platforms, and find the best deals from Chinese shopping agents.';
const SITE_IMAGE = '/og-image.png';

/**
 * 生成页面 Metadata
 */
export interface SeoMetadata {
  title: string;
  description: string;
  canonical: string;
  openGraph: {
    title: string;
    description: string;
    url: string;
    siteName: string;
    images: { url: string; width?: number; height?: number; alt?: string }[];
    locale: string;
    type: string;
  };
  twitter: {
    card: 'summary' | 'summary_large_image';
    title: string;
    description: string;
    images: string[];
  };
  alternates: {
    languages: Record<string, string>;
  };
}

/**
 * 生成基础 Metadata
 */
export function generateMetadata(options: {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  locale?: string;
  noIndex?: boolean;
}): Promise<SeoMetadata> {
  const {
    title,
    description = SITE_DESCRIPTION,
    image = SITE_IMAGE,
    url = '',
    locale = 'zh',
    noIndex = false,
  } = options;

  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const fullUrl = url.startsWith('http') ? url : `${SITE_URL}/${locale}${url}`;

  return Promise.resolve({
    title: fullTitle,
    description,
    canonical: fullUrl,
    openGraph: {
      title: fullTitle,
      description,
      url: fullUrl,
      siteName: SITE_NAME,
      images: [
        {
          url: image.startsWith('http') ? image : `${SITE_URL}${image}`,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image.startsWith('http') ? image : `${SITE_URL}${image}`],
    },
    alternates: {
      languages: {
        zh: `${SITE_URL}/zh${url}`,
        en: `${SITE_URL}/en${url}`,
      },
    },
  });
}

/**
 * 生成商品页面 Metadata
 */
export async function generateProductMetadata(slug: string, locale: string = 'zh') {
  const product = await db.product.findUnique({
    where: { slug },
    include: {
      brand: true,
      primaryCategory: true,
    },
  });

  if (!product) {
    return generateMetadata({
      title: '商品未找到',
      description: '抱歉，您查找的商品不存在',
      url: `/product/${slug}`,
      locale,
    });
  }

  const title = locale === 'zh' ? product.title : product.titleEn || product.title;
  const description = product.description?.substring(0, 160) || SITE_DESCRIPTION;
  const fullUrl = `${SITE_URL}/${locale}/product/${slug}`;
  const images = product.images ? JSON.parse(product.images) : [product.mainImage];

  return {
    title: `${title} | ${product.brand.name} - ${SITE_NAME}`,
    description,
    canonical: fullUrl,
    openGraph: {
      title: `${title} | ${product.brand.name}`,
      description,
      url: fullUrl,
      siteName: SITE_NAME,
      images: images.map((img: string) => ({
        url: img,
        width: 800,
        height: 800,
        alt: title,
      })),
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      type: 'product',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${product.brand.name}`,
      description,
      images: [images[0]],
    },
    alternates: {
      languages: {
        zh: `${SITE_URL}/zh/product/${slug}`,
        en: `${SITE_URL}/en/product/${slug}`,
      },
    },
  };
}

/**
 * 生成分类页面 Metadata
 */
export async function generateCategoryMetadata(slug: string, locale: string = 'zh') {
  const category = await db.category.findUnique({
    where: { slug },
  });

  if (!category) {
    return generateMetadata({
      title: '分类未找到',
      url: `/category/${slug}`,
      locale,
    });
  }

  const name = locale === 'zh' ? category.name : (category.nameEn || category.name);
  const title = `${name} - ${SITE_NAME}`;
  const fullUrl = `${SITE_URL}/${locale}/category/${slug}`;

  return {
    title,
    description: `浏览 ${name} 类商品，包括最新潮流款式、价格比较和购买链接。`,
    canonical: fullUrl,
    openGraph: {
      title,
      description: `浏览 ${name} 类商品，包括最新潮流款式、价格比较和购买链接。`,
      url: fullUrl,
      siteName: SITE_NAME,
      images: category.coverImage ? [{ url: category.coverImage }] : [],
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description: `浏览 ${name} 类商品`,
    },
    alternates: {
      languages: {
        zh: `${SITE_URL}/zh/category/${slug}`,
        en: `${SITE_URL}/en/category/${slug}`,
      },
    },
  };
}

/**
 * 生成品牌页面 Metadata
 */
export async function generateBrandMetadata(slug: string, locale: string = 'zh') {
  const brand = await db.brand.findUnique({
    where: { slug },
  });

  if (!brand) {
    return generateMetadata({
      title: '品牌未找到',
      url: `/brand/${slug}`,
      locale,
    });
  }

  const title = `${brand.name} - ${SITE_NAME}`;
  const fullUrl = `${SITE_URL}/${locale}/brand/${slug}`;

  return {
    title,
    description: brand.description?.substring(0, 160) || `浏览 ${brand.name} 品牌商品，包括最新款式、价格比较和购买链接。`,
    canonical: fullUrl,
    openGraph: {
      title,
      description: `浏览 ${brand.name} 品牌商品`,
      url: fullUrl,
      siteName: SITE_NAME,
      images: brand.logoUrl ? [{ url: brand.logoUrl }] : [],
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description: `浏览 ${brand.name} 品牌商品`,
    },
    alternates: {
      languages: {
        zh: `${SITE_URL}/zh/brand/${slug}`,
        en: `${SITE_URL}/en/brand/${slug}`,
      },
    },
  };
}

/**
 * 生成搜索页面 Metadata
 */
export function generateSearchMetadata(query: string, locale: string = 'zh') {
  const title = query ? `搜索: ${query} - ${SITE_NAME}` : `搜索商品 - ${SITE_NAME}`;
  const fullUrl = `${SITE_URL}/${locale}/search${query ? `?q=${encodeURIComponent(query)}` : ''}`;

  return {
    title,
    description: query 
      ? `搜索 "${query}" 的结果 - 发现最新潮流商品、价格比较和购买链接。`
      : '搜索商品，发现最新潮流款式、价格比较和购买链接。',
    canonical: fullUrl,
    openGraph: {
      title,
      description: '搜索商品，发现最新潮流款式',
      url: fullUrl,
      siteName: SITE_NAME,
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description: '搜索商品',
    },
    alternates: {
      languages: {
        zh: `${SITE_URL}/zh/search`,
        en: `${SITE_URL}/en/search`,
      },
    },
  };
}

export { SITE_URL, SITE_NAME, SITE_DESCRIPTION, SITE_IMAGE };