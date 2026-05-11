/**
 * 代购平台 Logo 配置
 * 包含平台名称、颜色、Logo URL 等
 */

export interface PlatformConfig {
  name: string;
  color: string;
  logoUrl?: string;
  logoText: string; // 如果没有 Logo，用文字显示
  priority: number;
}

export const PLATFORM_LOGOS: PlatformConfig[] = [
  {
    name: 'Kakobuy',
    color: '#FF6B6B',
    logoText: 'Kakobuy',
    priority: 1,
  },
  {
    name: 'CNFans',
    color: '#4ECDC4',
    logoText: 'CNFans',
    priority: 2,
  },
  {
    name: 'ACBuy',
    color: '#45B7D1',
    logoText: 'ACBuy',
    priority: 3,
  },
  {
    name: 'Sugargoo',
    color: '#96CEB4',
    logoText: 'Sugargoo',
    priority: 4,
  },
  {
    name: 'Superbuy',
    color: '#FFA07A',
    logoText: 'Superbuy',
    priority: 5,
  },
  {
    name: 'Pandabuy',
    color: '#DDA0DD',
    logoText: 'Pandabuy',
    priority: 6,
  },
  {
    name: 'Wegobuy',
    color: '#98D8C8',
    logoText: 'Wegobuy',
    priority: 7,
  },
  {
    name: 'CSSBuy',
    color: '#F7DC6F',
    logoText: 'CSSBuy',
    priority: 8,
  },
  {
    name: 'Ytaopal',
    color: '#BB8FCE',
    logoText: 'Ytaopal',
    priority: 9,
  },
  {
    name: '8Buy',
    color: '#85C1E2',
    logoText: '8Buy',
    priority: 10,
  },
];

/**
 * 获取平台配置
 */
export function getPlatformConfig(platformName: string): PlatformConfig | undefined {
  return PLATFORM_LOGOS.find(p => p.name === platformName);
}

/**
 * 获取平台颜色
 */
export function getPlatformColor(platformName: string): string {
  const config = getPlatformConfig(platformName);
  return config?.color || '#666666';
}
