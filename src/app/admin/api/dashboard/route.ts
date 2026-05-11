import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

// GET /admin/api/dashboard
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [
    productCount,
    categoryCount,
    brandCount,
    totalClicks,
    totalViews,
    featuredCount,
    todayStart,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.brand.count(),
    prisma.userBehavior.count(),
    prisma.product.aggregate({ _sum: { viewCount: true } }),
    prisma.product.count({ where: { isFeatured: true } }),
    (async () => {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      return now;
    })(),
  ]);

  const todayClicks = await prisma.userBehavior.count({
    where: { createdAt: { gte: todayStart } },
  });

  const products = await prisma.product.findMany({
    take: 5,
    orderBy: { viewCount: "desc" },
    include: { brand: true, primaryCategory: true },
  });

  const recentActivity = await prisma.userBehavior.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    stats: {
      productCount,
      categoryCount,
      brandCount,
      totalClicks,
      todayClicks,
      totalViews: totalViews._sum.viewCount || 0,
      featuredCount,
    },
    products,
    recentActivity,
  });
}
