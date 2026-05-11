import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 格式化数字（添加千分位）
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// 计算相对时间
export function timeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + '年前';
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + '个月前';
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + '天前';
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + '小时前';
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + '分钟前';
  
  return '刚刚';
}

// 截断文本
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

// 获取图片 CDN URL
export function getImageUrl(url: string): string {
  if (!url) return '/placeholder.png';
  if (url.startsWith('http')) return url;
  return `https://si.geilicdn.com/${url}`;
}

// 计算折扣百分比
export function calculateDiscount(original: number, current: number): number {
  if (original <= 0) return 0;
  return Math.round(((original - current) / original) * 100);
}

// 验证邮箱
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 生成随机 ID（用于会话）
export function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// 格式化价格
export function formatPrice(price: number, currency: string = 'CNY'): string {
  const symbols: Record<string, string> = {
    CNY: '¥',
    USD: '$',
    EUR: '€',
  };
  
  const symbol = symbols[currency] || currency;
  return `${symbol}${(price / 100).toFixed(0)}`;
}
