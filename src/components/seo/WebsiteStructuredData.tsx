'use client';

import { usePathname } from 'next/navigation';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export function WebsiteStructuredData() {
  const pathname = usePathname();
  const locale = pathname?.startsWith('/en') ? 'en' : 'zh';
  
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'FindsIndex',
    alternateName: '发现好物',
    url: SITE_URL,
    description: '海量商品数据库，帮你快速找到心仪商品',
    inLanguage: locale === 'zh' ? 'zh-CN' : 'en-US',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/${locale}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// 组织结构化数据
export function OrganizationStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'FindsIndex',
    alternateName: '发现好物',
    url: SITE_URL,
    description: '海量商品数据库，帮你快速找到心仪商品',
    sameAs: [
      // 可以添加社交媒体链接
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '',
      contactType: 'customer service',
      availableLanguage: ['Chinese', 'English'],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}