import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import EditProductForm from "./EditProductForm";

export const metadata = {
  title: "编辑商品 - 后台管理",
};

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { brand: true, primaryCategory: true, skus: true },
  });

  if (!product) {
    notFound();
  }

  let images: string[] = [];
  try {
    images = JSON.parse(product.images);
  } catch {
    images = [];
  }

  const [brands, categories] = await Promise.all([
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: [{ level: "asc" }, { sortOrder: "asc" }] }),
  ]);

  return (
    <EditProductForm
      product={{
        ...product,
        images,
      }}
      brands={brands}
      categories={categories}
    />
  );
}
