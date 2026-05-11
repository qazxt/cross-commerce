import { Product, Brand, Category, AffiliateLink } from '@prisma/client';

// 扩展类型，包含关联数据
export type ProductWithRelations = Product & {
  brand: Brand;
  primaryCategory: Category;
  affiliateLinks: AffiliateLink[];
};

export type ProductWithBrand = Product & {
  brand: Brand;
  primaryCategory: Category;
};

export type CategoryWithChildren = Category & {
  children?: CategoryWithChildren[];
  parent?: Category | null;
};

export type BrandWithProducts = Brand & {
  products?: Product[];
};

// API 响应类型
export interface SearchResponse {
  products: ProductWithBrand[];
  total: number;
  page: number;
  totalPages: number;
  facets: {
    categories: { slug: string; name: string; count: number }[];
    brands: { slug: string; name: string; count: number }[];
    priceRanges: { min: number; max: number; count: number }[];
  };
}

export interface ProductListResponse {
  products: ProductWithBrand[];
  total: number;
  page: number;
  totalPages: number;
}

// 搜索参数
export interface SearchParams {
  q?: string;
  category?: string;
  brand?: string;
  priceMin?: number;
  priceMax?: number;
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'popular';
  page?: number;
  limit?: number;
}


