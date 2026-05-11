#!/usr/bin/env node
/**
 * 批量接入更多代购平台
 * 第二阶段：Sugargoo, Superbuy, Pandabuy, Wegobuy, CSSBuy
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔧 开始批量接入更多代购平台...\n');

  // 联盟配置
  const AFFILIATE_ID = 'findsindex';

  // 所有代购平台配置（10 个平台）
  const platforms = [
    // === 第一阶段（已接入）===
    {
      name: 'Kakobuy',
      baseUrl: 'https://www.kakobuy.com',
      importParam: 'url',
      affiliateParam: 'affiliate_id',
      commissionRate: 0.03,
      priority: 1, // 优先级
    },
    {
      name: 'CNFans',
      baseUrl: 'https://www.cnfans.com',
      importParam: 'url',
      affiliateParam: 'aff',
      commissionRate: 0.025,
      priority: 2,
    },
    {
      name: 'ACBuy',
      baseUrl: 'https://www.acbuy.com',
      importParam: 'url',
      affiliateParam: 'ref',
      commissionRate: 0.02,
      priority: 3,
    },
    
    // === 第二阶段（新增）===
    {
      name: 'Sugargoo',
      baseUrl: 'https://www.sugargoo.com',
      importParam: 'url',
      affiliateParam: 'aff',
      commissionRate: 0.025,
      priority: 4,
    },
    {
      name: 'Superbuy',
      baseUrl: 'https://www.superbuy.com',
      importParam: 'goodsUrl',
      affiliateParam: 'affiliate_id',
      commissionRate: 0.04,
      priority: 5,
    },
    {
      name: 'Pandabuy',
      baseUrl: 'https://www.pandabuy.com',
      importParam: 'url',
      affiliateParam: 'ref',
      commissionRate: 0.035,
      priority: 6,
    },
    {
      name: 'Wegobuy',
      baseUrl: 'https://www.wegobuy.com',
      importParam: 'url',
      affiliateParam: 'aff',
      commissionRate: 0.03,
      priority: 7,
    },
    {
      name: 'CSSBuy',
      baseUrl: 'https://www.cssbuy.com',
      importParam: 'url',
      affiliateParam: 'code',
      commissionRate: 0.025,
      priority: 8,
    },
    
    // === 第三阶段（预留）===
    {
      name: 'Ytaopal',
      baseUrl: 'https://www.ytaopal.com',
      importParam: 'url',
      affiliateParam: 'aff',
      commissionRate: 0.025,
      priority: 9,
    },
    {
      name: '8Buy',
      baseUrl: 'https://www.8buy.com',
      importParam: 'url',
      affiliateParam: 'ref',
      commissionRate: 0.02,
      priority: 10,
    },
  ];

  // 模拟 1688 货源链接
  const sourceLinks = {
    'nike-air-max-90': 'https://detail.1688.com/offer/12345678.html',
    'adidas-ultraboost': 'https://detail.1688.com/offer/23456789.html',
    'gucci-canvas-bag': 'https://detail.1688.com/offer/34567890.html',
    'nike-sport-tshirt': 'https://detail.1688.com/offer/45678901.html',
  };

  // 获取所有商品
  const products = await prisma.product.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
    },
  });

  console.log(`找到 ${products.length} 个商品\n`);

  // 先删除旧链接
  await prisma.affiliateLink.deleteMany({});
  console.log('🗑️  已清除旧的联盟链接\n');

  let totalCreated = 0;

  for (const product of products) {
    console.log(`📦 商品：${product.title} (${product.slug})`);

    const sourceLink = sourceLinks[product.slug];
    if (!sourceLink) {
      console.log(`  ⚠️  缺少货源链接，跳过`);
      continue;
    }

    for (const platform of platforms) {
      // 构建联盟链接
      const affiliateUrl = `${platform.baseUrl}/?${platform.importParam}=${encodeURIComponent(sourceLink)}&${platform.affiliateParam}=${AFFILIATE_ID}`;

      await prisma.affiliateLink.create({
        data: {
          productId: product.id,
          platform: platform.name,
          platformUrl: sourceLink,
          affiliateUrl: affiliateUrl,
          isPrimary: platform.priority === 1, // Kakobuy 为主链接
          isActive: true,
          clickCount: 0,
          conversionRate: 0,
          metadata: JSON.stringify({
            sourceType: '1688',
            sourceLink: sourceLink,
            affiliateId: AFFILIATE_ID,
            commissionRate: platform.commissionRate,
            trackingParam: platform.affiliateParam,
            priority: platform.priority,
          }),
        },
      });

      if (platform.priority <= 3) {
        console.log(`  ✅ ${platform.name} (已接入) - 佣金${(platform.commissionRate * 100).toFixed(1)}%`);
      } else if (platform.priority <= 8) {
        console.log(`  ✨ ${platform.name} (新增) - 佣金${(platform.commissionRate * 100).toFixed(1)}%`);
      } else {
        console.log(`  ⏸️ ${platform.name} (预留) - 佣金${(platform.commissionRate * 100).toFixed(1)}%`);
      }

      totalCreated++;
    }

    console.log();
  }

  console.log('✅ 联盟链接批量创建完成！');

  // 统计结果
  console.log(`\n📊 总计：${totalCreated} 个联盟链接`);

  // 按平台统计
  const platformStats = await prisma.affiliateLink.groupBy({
    by: ['platform'],
    _count: true,
    orderBy: {
      _count: {
        platform: 'desc',
      },
    },
  });

  console.log('\n📈 平台分布:');
  platformStats.forEach((stat) => {
    console.log(`  - ${stat.platform}: ${stat._count} 个链接`);
  });

  // 计算平均佣金率
  const allLinks = await prisma.affiliateLink.findMany({
    select: {
      metadata: true,
    },
  });

  let totalCommission = 0;
  allLinks.forEach((link) => {
    const meta = JSON.parse(link.metadata);
    totalCommission += meta.commissionRate;
  });

  const avgCommission = totalCommission / allLinks.length;
  console.log(`\n💰 平均佣金率：${(avgCommission * 100).toFixed(2)}%`);
}

main()
  .catch((e) => {
    console.error('❌ 错误:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
