import { prisma } from "@/lib/db";
import BrandsList from "./BrandsList";

export const metadata = {
  title: "品牌管理 - 后台管理",
};

async function getBrands() {
  return prisma.brand.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
}

export default async function BrandsPage() {
  const brands = await getBrands();
  return <BrandsList brands={brands} />;
}
