import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

// GET /api/favorites/check?productId=xxx - 检查是否已收藏
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ isFavorite: false });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: '商品 ID 不能为空' },
        { status: 400 }
      );
    }

    const userId = (session.user as any).id as string;
    
    if (!userId) {
      return NextResponse.json({ isFavorite: false });
    }

    const favorite = await db.favorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    return NextResponse.json({
      isFavorite: !!favorite,
    });
  } catch (error) {
    console.error('检查收藏状态失败:', error);
    return NextResponse.json(
      { error: '检查收藏状态失败' },
      { status: 500 }
    );
  }
}
