import { prisma } from "@/lib/db";
import CreateProductForm from "./CreateProductForm";

export const metadata = {
  title: "添加商品 - 后台管理",
};

export default async function CreateProductPage() {
  const [brands, categories] = await Promise.all([
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: [{ level: "asc" }, { sortOrder: "asc" }] }),
  ]);

  return <CreateProductForm brands={brands} categories={categories} />;
}
