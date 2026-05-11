#!/usr/bin/env node
/**
 * 创建代购平台联盟链接数据
 * FindsIndex 原网站是代购导航，链接到 Kakobuy、CNFans、ACBuy 等代购平台
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔧 开始创建代购平台联盟链接数据...\n');

  // 先删除旧的淘宝京东链接
  await prisma.affiliateLink.deleteMany({});
  console.log('🗑️  已清除旧的联盟链接\n');

  // 获取所有商品
  const products = await prisma.product.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      priceMin: true,
    },
  });

  console.log(`找到 ${products.length} 个商品\n`);

  // 代购平台配置
  const platforms = [
    {
      name: 'Kakobuy',
      baseUrl: 'https://www.kakobuy.com/search',
      param: 'keyword',
      commission: 0.03, // 3% 佣金
    },
    {
      name: 'CNFans',
      baseUrl: 'https://www.cnfans.com/search',
      param: 'q',
      commission: 0.025, // 2.5% 佣金
    },
    {
      name: 'ACBuy',
      baseUrl: 'https://www.acbuy.com/search',
      param: 'keyword',
      commission: 0.02, // 2% 佣金
    },
    {
      name: 'Sugargoo',
      baseUrl: 'https://www.sugargoo.com/search',
      param: 'keyword',
      commission: 0.015, // 1.5% 佣金
    },
  ];

  for (const product of products) {
    console.log(`📦 商品：${product.title} (¥${(product.priceMin / 100).toFixed(0)})`);

    // 为每个商品创建 3-4 个代购平台链接
    for (let i = 0; i < 3; i++) {
      const platform = platforms[i];
      // 代购平台通常搜索商品关键词
      const platformUrl = `${platform.baseUrl}?${platform.param}=${encodeURIComponent(product.title)}`;
      // 联盟链接带追踪参数
      const affiliateUrl = `${platformUrl}&affiliate_id=findsindex_${product.slug}`;

      await prisma.affiliateLink.create({
        data: {
          productId: product.id,
          platform: platform.name,
          platformUrl: platformUrl,
          affiliateUrl: affiliateUrl,
          isPrimary: i === 0, // Kakobuy 设为主链接
          isActive: true,
          clickCount: 0,
          conversionRate: 0,
        },
      });

      console.log(`  ✅ 创建 ${platform.name} 链接 (佣金${(platform.commission * 100).toFixed(1)}%)`);
    }

    console.log();
  }

  console.log('✅ 代购联盟链接数据创建完成！');

  // 统计结果
  const totalLinks = await prisma.affiliateLink.count();
  console.log(`\n📊 总计：${totalLinks} 个联盟链接`);

  // 按平台统计
  const platformStats = await prisma.affiliateLink.groupBy({
    by: ['platform'],
    _count: true,
  });

  console.log('\n📈 平台分布:');
  platformStats.forEach((stat) => {
    console.log(`  - ${stat.platform}: ${stat._count} 个链接`);
  });
}

main()
  .catch((e) => {
    console.error('❌ 错误:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
