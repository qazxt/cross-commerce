import { prisma } from "@/lib/db";
import CategoriesList from "./CategoriesList";

export const metadata = {
  title: "分类管理 - 后台管理",
};

async function getCategories() {
  return prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: [{ level: "asc" }, { sortOrder: "asc" }],
  });
}

export default async function CategoriesPage() {
  const categories = await getCategories();
  return <CategoriesList categories={categories} />;
}
