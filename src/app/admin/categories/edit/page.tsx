import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import EditCategoryForm from "./EditCategoryForm";

export const metadata = {
  title: "编辑分类 - 后台管理",
};

export default async function EditCategoryPage({
  searchParams,
}: {
  searchParams: { id: string };
}) {
  const id = searchParams.id;
  if (!id) return notFound();

  const [category, categories] = await Promise.all([
    prisma.category.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: [{ level: "asc" }, { sortOrder: "asc" }] }),
  ]);

  if (!category) return notFound();

  return (
    <EditCategoryForm
      category={category}
      categories={categories.filter((c) => c.id !== id)}
    />
  );
}
