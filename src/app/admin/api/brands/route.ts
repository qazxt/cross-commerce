import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

// GET /admin/api/brands
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const brands = await prisma.brand.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(brands);
}

// POST /admin/api/brands
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { name, nameCn, slug, description, logoUrl } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });
    }

    const existing = await prisma.brand.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Slug 已存在" }, { status: 400 });
    }

    const brand = await prisma.brand.create({
      data: {
        name,
        nameCn: nameCn || null,
        slug,
        description: description || null,
        logoUrl: logoUrl || null,
      },
    });

    return NextResponse.json(brand, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "创建失败" }, { status: 500 });
  }
}

// PUT /admin/api/brands
export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { id, name, nameCn, slug, description, logoUrl } = body;

    if (!id || !name || !slug) {
      return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });
    }

    const existing = await prisma.brand.findUnique({ where: { slug } });
    if (existing && existing.id !== id) {
      return NextResponse.json({ error: "Slug 已存在" }, { status: 400 });
    }

    const brand = await prisma.brand.update({
      where: { id },
      data: {
        name,
        nameCn: nameCn || null,
        slug,
        description: description || null,
        logoUrl: logoUrl || null,
      },
    });

    return NextResponse.json(brand);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "更新失败" }, { status: 500 });
  }
}

// DELETE /admin/api/brands
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "缺少品牌 ID" }, { status: 400 });
    }

    const productCount = await prisma.product.count({ where: { brandId: id } });
    if (productCount > 0) {
      return NextResponse.json(
        { error: `该品牌下有 ${productCount} 个商品，请先移除商品` },
        { status: 400 }
      );
    }

    await prisma.brand.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "删除失败" }, { status: 500 });
  }
}
