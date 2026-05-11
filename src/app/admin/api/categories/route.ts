import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

// GET /admin/api/categories
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: [{ level: "asc" }, { sortOrder: "asc" }],
  });
  return NextResponse.json(categories);
}

// POST /admin/api/categories
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { name, nameEn, slug, level, parentId, sortOrder, isActive, coverImage } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });
    }

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Slug 已存在" }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name,
        nameEn: nameEn || null,
        slug,
        level: Number(level) || 0,
        parentId: parentId || null,
        sortOrder: Number(sortOrder) || 0,
        isActive: isActive !== false,
        coverImage: coverImage || null,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "创建失败" }, { status: 500 });
  }
}

// PUT /admin/api/categories - Update category
export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { id, name, nameEn, slug, level, parentId, sortOrder, isActive, coverImage } = body;

    if (!id || !name || !slug) {
      return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });
    }

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing && existing.id !== id) {
      return NextResponse.json({ error: "Slug 已存在" }, { status: 400 });
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        nameEn: nameEn || null,
        slug,
        level: Number(level) || 0,
        parentId: parentId || null,
        sortOrder: Number(sortOrder) || 0,
        isActive: isActive !== false,
        coverImage: coverImage || null,
      },
    });

    return NextResponse.json(category);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "更新失败" }, { status: 500 });
  }
}

// DELETE /admin/api/categories - Delete category
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "缺少分类 ID" }, { status: 400 });
    }

    const productCount = await prisma.categoryProduct.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      return NextResponse.json(
        { error: `该分类下有 ${productCount} 个商品，请先移除商品后再删除` },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "删除失败" }, { status: 500 });
  }
}
