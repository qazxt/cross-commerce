/**
 * 单个平台管理 API
 * 
 * GET    /api/admin/platforms/[id] - 获取平台详情
 * PUT    /api/admin/platforms/[id] - 更新平台
 * DELETE /api/admin/platforms/[id] - 删除平台
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type RouteParams = { params: { id: string } };

// 获取平台详情
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const platform = await db.platform.findUnique({
      where: { id: params.id },
      include: {
        affiliateLinks: {
          take: 5,
          orderBy: { clickCount: 'desc' },
        },
        _count: {
          select: { affiliateLinks: true },
        },
      },
    });

    if (!platform) {
      return NextResponse.json(
        { error: 'Platform not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      platform: {
        ...platform,
        linkCount: platform._count.affiliateLinks,
      },
    });
  } catch (error) {
    console.error('Failed to fetch platform:', error);
    return NextResponse.json(
      { error: 'Failed to fetch platform' },
      { status: 500 }
    );
  }
}

// 更新平台
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json();
    const { name, description, logoUrl, website, isActive, sortOrder } = body;

    const platform = await db.platform.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(website !== undefined && { website }),
        ...(isActive !== undefined && { isActive }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    return NextResponse.json({ platform });
  } catch (error) {
    console.error('Failed to update platform:', error);
    return NextResponse.json(
      { error: 'Failed to update platform' },
      { status: 500 }
    );
  }
}

// 删除平台
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // 检查是否有关联的联盟链接
    const linkCount = await db.affiliateLink.count({
      where: { platformId: params.id },
    });

    if (linkCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete platform with ${linkCount} associated affiliate links` },
        { status: 400 }
      );
    }

    await db.platform.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete platform:', error);
    return NextResponse.json(
      { error: 'Failed to delete platform' },
      { status: 500 }
    );
  }
}