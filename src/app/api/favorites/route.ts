import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

// GET /api/favorites - 获取收藏列表
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }

    const page = Number(request.nextUrl.searchParams.get('page')) || 1;
    const limit = Number(request.nextUrl.searchParams.get('limit')) || 24;

    const favorites = await db.favorite.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          include: {
            brand: true,
            primaryCategory: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await db.favorite.count({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      favorites: favorites.map(f => f.product),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('获取收藏失败:', error);
    return NextResponse.json(
      { error: '获取收藏失败' },
      { status: 500 }
    );
  }
}

// POST /api/favorites - 添加收藏
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: '商品 ID 不能为空' },
        { status: 400 }
      );
    }

    // 检查商品是否存在
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: '商品不存在' },
        { status: 404 }
      );
    }

    // 添加收藏
    const userId = (session.user as any).id as string;
    
    const favorite = await db.favorite.create({
      data: {
        userId,
        productId,
      },
    });

    return NextResponse.json({
      message: '收藏成功',
      favorite,
    });
  } catch (error) {
    console.error('添加收藏失败:', error);
    return NextResponse.json(
      { error: '添加收藏失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/favorites - 取消收藏
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: '商品 ID 不能为空' },
        { status: 400 }
      );
    }

    // 删除收藏
    await db.favorite.deleteMany({
      where: {
        userId: session.user.id,
        productId,
      },
    });

    return NextResponse.json({
      message: '取消收藏成功',
    });
  } catch (error) {
    console.error('取消收藏失败:', error);
    return NextResponse.json(
      { error: '取消收藏失败' },
      { status: 500 }
    );
  }
}
