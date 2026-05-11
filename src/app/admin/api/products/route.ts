import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

// GET /admin/api/products - List products
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const brandId = searchParams.get("brandId") || "";
  const categoryId = searchParams.get("categoryId") || "";

  const where: any = {};

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { slug: { contains: search } },
    ];
  }
  if (status) where.status = status;
  if (brandId) where.brandId = brandId;
  if (categoryId) where.primaryCategoryId = categoryId;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { brand: true, primaryCategory: true, skus: true },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({ products, total, page, totalPages: Math.ceil(total / limit) });
}

// POST /admin/api/products - Create product
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, titleEn, slug, description, descriptionCn, priceMin, priceMax, brandId, primaryCategoryId, mainImage, images, isFeatured, status, skus } = body;

    if (!title || !slug || !brandId || !primaryCategoryId || !mainImage) {
      return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });
    }

    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Slug 已存在" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        title,
        titleEn: titleEn || null,
        slug,
        description: description || null,
        descriptionCn: descriptionCn || null,
        priceMin: Number(priceMin),
        priceMax: Number(priceMax),
        brandId,
        primaryCategoryId,
        mainImage,
        images: JSON.stringify(images || []),
        isFeatured: isFeatured || false,
        status: status || "active",
      },
      include: { brand: true, primaryCategory: true },
    });

    if (skus && Array.isArray(skus)) {
      await Promise.all(
        skus.map((sku: any) =>
          prisma.productSKU.create({
            data: {
              productId: product.id,
              name: sku.name || "默认",
              price: Number(sku.price) || Number(priceMin),
              stock: Number(sku.stock) || 0,
              options: sku.options || "{}",
            },
          })
        )
      );
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "创建失败" }, { status: 500 });
  }
}
