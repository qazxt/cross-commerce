import { prisma } from "@/lib/db";
import CreateCategoryForm from "./CreateCategoryForm";

export const metadata = {
  title: "添加分类 - 后台管理",
};

export default async function CreateCategoryPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ level: "asc" }, { sortOrder: "asc" }],
  });

  return <CreateCategoryForm categories={categories} />;
}
