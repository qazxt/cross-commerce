import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

const MAX_HISTORY = 50; // 最多保留 50 条历史记录

// GET /api/history - 获取浏览历史
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    const page = Number(request.nextUrl.searchParams.get('page')) || 1;
    const limit = Number(request.nextUrl.searchParams.get('limit')) || 24;

    const where: any = {};
    
    // 如果已登录，获取用户的浏览历史
    if (session?.user) {
      where.userId = session.user.id;
    }

    const history = await db.userBehavior.findMany({
      where: {
        ...where,
        type: 'view',
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await db.userBehavior.count({
      where: {
        ...where,
        type: 'view',
      },
    });

    // 获取商品信息
    const productIds = history.map(h => h.targetId);
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
      include: {
        brand: true,
        primaryCategory: true,
      },
    });

    // 将商品信息添加到历史记录
    const historyWithProducts = history.map(h => ({
      ...h,
      product: products.find(p => p.id === h.targetId),
    })).filter(h => h.product);

    return NextResponse.json({
      history: historyWithProducts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('获取浏览历史失败:', error);
    return NextResponse.json(
      { error: '获取浏览历史失败' },
      { status: 500 }
    );
  }
}

// POST /api/history - 记录浏览
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
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

    // 生成或获取 sessionId
    let sessionId = request.cookies.get('sessionId')?.value;
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    }

    // 记录浏览历史
    await db.userBehavior.create({
      data: {
        sessionId,
        userId: session?.user?.id || null,
        type: 'view',
        targetType: 'product',
        targetId: productId,
      },
    });

    // 清理旧记录（保留最近的 MAX_HISTORY 条）
    if (session?.user) {
      const oldHistory = await db.userBehavior.findMany({
        where: {
          userId: session.user.id,
          type: 'view',
        },
        orderBy: { createdAt: 'desc' },
        skip: MAX_HISTORY,
        select: { id: true },
      });

      if (oldHistory.length > 0) {
        await db.userBehavior.deleteMany({
          where: {
            id: { in: oldHistory.map(h => h.id) },
          },
        });
      }
    }

    return NextResponse.json({
      message: '浏览记录已保存',
      sessionId,
    }, {
      headers: {
        'Set-Cookie': `sessionId=${sessionId}; Path=/; Max-Age=31536000; SameSite=Lax`,
      },
    });
  } catch (error) {
    console.error('记录浏览历史失败:', error);
    return NextResponse.json(
      { error: '记录浏览历史失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/history - 清除浏览历史
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    const where: any = {
      type: 'view',
    };

    if (session?.user) {
      where.userId = session.user.id;
    }

    if (productId) {
      // 清除单条记录
      await db.userBehavior.deleteMany({
        where: {
          ...where,
          targetId: productId,
        },
      });
    } else {
      // 清除全部历史
      await db.userBehavior.deleteMany({
        where,
      });
    }

    return NextResponse.json({
      message: '浏览历史已清除',
    });
  } catch (error) {
    console.error('清除浏览历史失败:', error);
    return NextResponse.json(
      { error: '清除浏览历史失败' },
      { status: 500 }
    );
  }
}
