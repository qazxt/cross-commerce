import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

// GET /admin/api/products/[id]
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { brand: true, primaryCategory: true, skus: true, affiliateLinks: true },
  });

  if (!product) {
    return NextResponse.json({ error: "商品不存在" }, { status: 404 });
  }

  return NextResponse.json(product);
}

// PUT /admin/api/products/[id]
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, titleEn, slug, description, descriptionCn, priceMin, priceMax, brandId, primaryCategoryId, mainImage, images, isFeatured, status, skus } = body;

    const product = await prisma.product.update({
      where: { id: params.id },
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

    // Update SKUs if provided
    if (skus && Array.isArray(skus)) {
      await prisma.productSKU.deleteMany({ where: { productId: params.id } });
      await Promise.all(
        skus.map((sku: any) =>
          prisma.productSKU.create({
            data: {
              productId: params.id,
              name: sku.name || "默认",
              price: Number(sku.price) || Number(priceMin),
              stock: Number(sku.stock) || 0,
              options: sku.options || "{}",
            },
          })
        )
      );
    }

    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "更新失败" }, { status: 500 });
  }
}

// DELETE /admin/api/products/[id]
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "删除失败" }, { status: 500 });
  }
}
