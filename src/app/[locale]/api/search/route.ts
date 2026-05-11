import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PAGINATION } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const q = searchParams.get('q') || '';
    const page = Number(searchParams.get('page')) || 1;
    const limit = Math.min(
      Number(searchParams.get('limit')) || PAGINATION.defaultLimit,
      PAGINATION.maxLimit
    );
    const sort = searchParams.get('sort') || 'relevance';
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const priceMin = searchParams.get('priceMin');
    const priceMax = searchParams.get('priceMax');

    const where: any = { status: 'active' };

    // 搜索关键词
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { titleEn: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    // 分类筛选
    if (category) {
      where.primaryCategoryId = category;
    }

    // 品牌筛选
    if (brand) {
      where.brandId = brand;
    }

    // 价格筛选
    if (priceMin || priceMax) {
      where.AND = [];
      if (priceMin) {
        where.AND.push({ priceMin: { gte: Number(priceMin) } });
      }
      if (priceMax) {
        where.AND.push({ priceMax: { lte: Number(priceMax) } });
      }
    }

    // 排序
    const orderBy: any = {};
    switch (sort) {
      case 'price_asc':
        orderBy.priceMin = 'asc';
        break;
      case 'price_desc':
        orderBy.priceMin = 'desc';
        break;
      case 'newest':
        orderBy.createdAt = 'desc';
        break;
      case 'popular':
        orderBy.popularityScore = 'desc';
        break;
      default:
        orderBy.createdAt = 'desc';
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          brand: true,
          primaryCategory: true,
        },
      }),
      db.product.count({ where }),
    ]);

    // 获取筛选选项（facets）
    const [categories, brands] = await Promise.all([
      db.category.findMany({
        where: { isActive: true },
        select: {
          slug: true,
          name: true,
          _count: { select: { products: true } },
        },
        take: 10,
      }),
      db.brand.findMany({
        select: {
          slug: true,
          name: true,
          _count: { select: { products: true } },
        },
        take: 10,
      }),
    ]);

    return NextResponse.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      facets: {
        categories: categories.map((c) => ({
          slug: c.slug,
          name: c.name,
          count: c._count.products,
        })),
        brands: brands.map((b) => ({
          slug: b.slug,
          name: b.name,
          count: b._count.products,
        })),
        priceRanges: [
          { min: 0, max: 10000, count: 0 },
          { min: 10000, max: 30000, count: 0 },
          { min: 30000, max: 50000, count: 0 },
          { min: 50000, max: 100000, count: 0 },
        ],
      },
    });
  } catch (error) {
    console.error('Search failed:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
