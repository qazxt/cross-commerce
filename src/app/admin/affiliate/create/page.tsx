import { prisma } from "@/lib/db";
import CreateAffiliateForm from "./CreateAffiliateForm";

export const metadata = {
  title: "添加联盟链接 - 后台管理",
};

export default async function CreateAffiliatePage() {
  const products = await prisma.product.findMany({
    include: { brand: true },
    orderBy: { title: "asc" },
  });

  return <CreateAffiliateForm products={products} />;
}
