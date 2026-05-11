import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'FindsIndex - 发现好物',
    template: '%s | FindsIndex',
  },
  description: '海量商品数据库，帮你快速找到心仪商品。对比价格、查看评测、发现优质好物。',
  keywords: ['商品推荐', '好物发现', '价格对比', '产品评测', '购物指南'],
  authors: [{ name: 'FindsIndex' }],
  creator: 'FindsIndex',
  publisher: 'FindsIndex',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
    languages: {
      'zh-CN': '/zh',
      'en': '/en',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    alternateLocale: 'en_US',
    url: '/',
    siteName: 'FindsIndex',
    title: 'FindsIndex - 发现好物',
    description: '海量商品数据库，帮你快速找到心仪商品',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FindsIndex - 发现好物',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FindsIndex - 发现好物',
    description: '海量商品数据库，帮你快速找到心仪商品',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
