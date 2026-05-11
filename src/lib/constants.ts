// 网站配置
export const SITE_CONFIG = {
  name: 'FindsIndex',
  description: '海量商品数据库，帮你快速找到心仪商品',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
};

// SEO 配置
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://47.108.119.210:3000';
export const SITE_NAME = 'FindsIndex Clone | 发现好物';
export const SITE_DESCRIPTION = '海量商品数据库，帮你快速找到心仪商品。发现潮流时尚，比较价格，购买国外潮牌。';
export const SITE_IMAGE = '/og-image.png';

// 支持的货币
export const CURRENCIES = ['CNY', 'USD', 'EUR'] as const;

// 支持的語言
export const LOCALES = [
  { code: 'zh', name: '中文' },
  { code: 'en', name: 'English' },
] as const;

// 默认排序选项
export const SORT_OPTIONS = [
  { value: 'relevance', label: '相关性' },
  { value: 'newest', label: '最新上架' },
  { value: 'popular', label: '最受欢迎' },
  { value: 'price_asc', label: '价格从低到高' },
  { value: 'price_desc', label: '价格从高到低' },
] as const;

// 每页商品数量
export const PAGINATION = {
  defaultLimit: 24,
  maxLimit: 100,
};

// Affiliate 平台配置
export const AFFILIATE_PLATFORMS = [
  { id: 'kakobuy', name: 'Kakobuy' },
  { id: 'cnfans', name: 'CNFans' },
  { id: 'acbuy', name: 'ACBuy' },
] as const;

// 商品状态
export const PRODUCT_STATUS = {
  active: '在售',
  inactive: '下架',
  deleted: '删除',
} as const;

// 图片尺寸
export const IMAGE_SIZES = {
  thumbnail: '200x200',
  card: '400x400',
  detail: '800x800',
  large: '1200x1200',
} as const;

// SEO 配置
export const SEO_CONFIG = {
  defaultTitle: 'FindsIndex - 发现好物',
  defaultDescription: '海量商品数据库，支持多语言搜索，帮你快速找到心仪商品',
  keywords: ['商品搜索', '购物指南', '比价', '海淘'],
};

// 缓存时间（秒）
export const CACHE_TTL = {
  short: 60,      // 1 分钟
  medium: 300,    // 5 分钟
  long: 3600,     // 1 小时
  day: 86400,     // 1 天
};
