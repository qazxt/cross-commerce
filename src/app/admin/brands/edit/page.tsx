import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import EditBrandForm from "./EditBrandForm";

export const metadata = {
  title: "编辑品牌 - 后台管理",
};

export default async function EditBrandPage({
  searchParams,
}: {
  searchParams: { id: string };
}) {
  const id = searchParams.id;
  if (!id) return notFound();

  const brand = await prisma.brand.findUnique({ where: { id } });
  if (!brand) return notFound();

  return <EditBrandForm brand={brand} />;
}
