/**
 * 平台管理 API
 * 
 * GET    /api/admin/platforms     - 获取平台列表
 * POST   /api/admin/platforms     - 创建平台
 * GET    /api/admin/platforms/:id - 获取平台详情
 * PUT    /api/admin/platforms/:id - 更新平台
 * DELETE /api/admin/platforms/:id - 删除平台
 * PUT    /api/admin/platforms/reorder - 批量更新排序
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// 获取平台列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const where = includeInactive ? {} : { isActive: true };

    const platforms = await db.platform.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { affiliateLinks: true },
        },
      },
    });

    return NextResponse.json({
      platforms: platforms.map(p => ({
        ...p,
        linkCount: p._count.affiliateLinks,
      })),
      total: platforms.length,
    });
  } catch (error) {
    console.error('Failed to fetch platforms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch platforms' },
      { status: 500 }
    );
  }
}

// 创建平台
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description, logoUrl, website, isActive, sortOrder } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // 检查 slug 是否已存在
    const existing = await db.platform.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Platform with this slug already exists' },
        { status: 400 }
      );
    }

    const platform = await db.platform.create({
      data: {
        name,
        slug: slug.toLowerCase(),
        description,
        logoUrl,
        website,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
      },
    });

    return NextResponse.json({ platform }, { status: 201 });
  } catch (error) {
    console.error('Failed to create platform:', error);
    return NextResponse.json(
      { error: 'Failed to create platform' },
      { status: 500 }
    );
  }
}

// 批量更新排序
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { platformIds } = body; // [id1, id2, id3...]

    if (!platformIds || !Array.isArray(platformIds)) {
      return NextResponse.json(
        { error: 'platformIds array is required' },
        { status: 400 }
      );
    }

    // 批量更新排序
    await Promise.all(
      platformIds.map((id: string, index: number) =>
        db.platform.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to reorder platforms:', error);
    return NextResponse.json(
      { error: 'Failed to reorder platforms' },
      { status: 500 }
    );
  }
}