import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PAGINATION } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const page = Number(searchParams.get('page')) || 1;
    const limit = Math.min(
      Number(searchParams.get('limit')) || PAGINATION.defaultLimit,
      PAGINATION.maxLimit
    );
    const brand = searchParams.get('brand');
    const category = searchParams.get('category');
    const featured = searchParams.get('featured') === 'true';

    const where: any = { status: 'active' };

    if (brand) {
      where.brandId = brand;
    }

    if (category) {
      where.primaryCategoryId = category;
    }

    if (featured) {
      where.isFeatured = true;
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          brand: true,
          primaryCategory: true,
        },
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
