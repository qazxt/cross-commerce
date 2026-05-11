import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { linkId, productId, sessionId } = body;

    if (!linkId) {
      return NextResponse.json(
        { error: 'linkId is required' },
        { status: 400 }
      );
    }

    // 更新点击数
    await db.affiliateLink.update({
      where: { id: linkId },
      data: {
        clickCount: { increment: 1 },
      },
    });

    // 记录用户行为
    if (sessionId) {
      await db.userBehavior.create({
        data: {
          sessionId,
          type: 'click',
          targetType: 'affiliate_link',
          targetId: linkId,
          metadata: JSON.stringify({ productId }),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to track click:', error);
    return NextResponse.json(
      { error: 'Failed to track click' },
      { status: 500 }
    );
  }
}
