import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

// GET /admin/api/affiliate
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId") || "";
  const platform = searchParams.get("platform") || "";

  const where: any = {};
  if (productId) where.productId = productId;
  if (platform) where.platform = platform;

  const links = await prisma.affiliateLink.findMany({
    where,
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(links);
}

// POST /admin/api/affiliate
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { productId, platform, platformUrl, affiliateUrl, isPrimary, isActive, metadata } = body;

    if (!productId || !platform || !affiliateUrl) {
      return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });
    }

    // If this is primary, unset other primary links for this product
    if (isPrimary) {
      await prisma.affiliateLink.updateMany({
        where: { productId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const link = await prisma.affiliateLink.create({
      data: {
        productId,
        platform,
        platformUrl: platformUrl || "",
        affiliateUrl,
        isPrimary: isPrimary || false,
        isActive: isActive !== false,
        metadata: metadata || null,
      },
      include: { product: true },
    });

    return NextResponse.json(link, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "创建失败" }, { status: 500 });
  }
}

// PUT /admin/api/affiliate
export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { id, productId, platform, platformUrl, affiliateUrl, isPrimary, isActive, metadata } = body;

    if (!id || !platform || !affiliateUrl) {
      return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });
    }

    // If this is primary, unset other primary links for this product
    if (isPrimary) {
      await prisma.affiliateLink.updateMany({
        where: { productId, isPrimary: true, id: { not: id } },
        data: { isPrimary: false },
      });
    }

    const link = await prisma.affiliateLink.update({
      where: { id },
      data: {
        platform,
        platformUrl: platformUrl || "",
        affiliateUrl,
        isPrimary: isPrimary || false,
        isActive: isActive !== false,
        metadata: metadata || null,
      },
      include: { product: true },
    });

    return NextResponse.json(link);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "更新失败" }, { status: 500 });
  }
}

// DELETE /admin/api/affiliate
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "缺少链接 ID" }, { status: 400 });
    }

    await prisma.affiliateLink.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "删除失败" }, { status: 500 });
  }
}
