import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import { Metadata } from 'next';

import { LOCALES } from '@/lib/constants';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import '../globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://47.108.119.210:3000';
const SITE_NAME = 'FindsIndex Clone | 发现好物';
const SITE_DESCRIPTION = '海量商品数据库，帮你快速找到心仪商品。发现潮流时尚，比较价格，购买国外潮牌。';
const SITE_IMAGE = '/og-image.png';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ['fashion', 'shopping', 'price comparison', 'Chinese shopping agent', 'CNFans', 'Kakobuy'],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    alternateLocale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: SITE_IMAGE,
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [SITE_IMAGE],
    creator: '@findsindex',
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
  alternates: {
    canonical: SITE_URL,
    languages: {
      zh: `${SITE_URL}/zh`,
      en: `${SITE_URL}/en`,
    },
  },
};

// WebSite Structured Data for Search Action
function WebsiteStructuredData({ locale }: { locale: string }) {
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

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale: locale.code }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const locale = params.locale;
  setRequestLocale(locale);
  
  // Validate that the incoming `locale` parameter is valid
  if (!LOCALES.find((loc) => loc.code === locale)) {
    notFound();
  }

  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <head>
        <WebsiteStructuredData locale={locale} />
      </head>
      <body>
        <SessionProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}