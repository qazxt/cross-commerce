import { prisma } from "@/lib/db";
import AffiliateList from "./AffiliateList";

export const metadata = {
  title: "联盟链接管理 - 后台管理",
};

async function getAffiliateLinks() {
  return prisma.affiliateLink.findMany({
    include: { product: { include: { brand: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export default async function AffiliatePage() {
  const links = await getAffiliateLinks();
  return <AffiliateList links={links} />;
}
