#!/usr/bin/env node
/**
 * 更新联盟链接为正确的佣金追踪格式
 * 包含 affiliate_id 等追踪参数
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔧 开始更新为正确的联盟追踪链接...\n');

  // 联盟配置
  const AFFILIATE_ID = 'findsindex'; // 需要从代购平台获取真实的 affiliate_id
  const COMMISSION_RATE = 0.03; // 3% 佣金

  // 代购平台配置
  const platforms = [
    {
      name: 'Kakobuy',
      baseUrl: 'https://www.kakobuy.com',
      importParam: 'url',
      affiliateParam: 'affiliate_id',
      commissionRate: 0.03, // 3%
    },
    {
      name: 'CNFans',
      baseUrl: 'https://www.cnfans.com',
      importParam: 'url',
      affiliateParam: 'aff',
      commissionRate: 0.025, // 2.5%
    },
    {
      name: 'ACBuy',
      baseUrl: 'https://www.acbuy.com',
      importParam: 'url',
      affiliateParam: 'ref',
      commissionRate: 0.02, // 2%
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

  for (const product of products) {
    console.log(`📦 商品：${product.title} (${product.slug})`);

    const sourceLink = sourceLinks[product.slug];
    if (!sourceLink) {
      console.log(`  ⚠️  缺少货源链接，跳过`);
      continue;
    }

    for (const platform of platforms) {
      // 构建正确的联盟链接
      // 格式：https://platform.com/?url=1688 链接&affiliate_id=findsindex
      const affiliateUrl = `${platform.baseUrl}/?${platform.importParam}=${encodeURIComponent(sourceLink)}&${platform.affiliateParam}=${AFFILIATE_ID}`;

      await prisma.affiliateLink.create({
        data: {
          productId: product.id,
          platform: platform.name,
          platformUrl: sourceLink, // 货源链接
          affiliateUrl: affiliateUrl, // 带追踪的联盟链接
          isPrimary: platform.name === 'Kakobuy',
          isActive: true,
          clickCount: 0,
          conversionRate: 0,
          metadata: JSON.stringify({
            sourceType: '1688',
            sourceLink: sourceLink,
            affiliateId: AFFILIATE_ID,
            commissionRate: platform.commissionRate,
            trackingParam: platform.affiliateParam,
          }),
        },
      });

      console.log(`  ✅ ${platform.name}`);
      console.log(`     佣金：${(platform.commissionRate * 100).toFixed(1)}%`);
      console.log(`     链接：${affiliateUrl}`);
    }

    console.log();
  }

  console.log('✅ 联盟追踪链接创建完成！');

  // 统计结果
  const totalLinks = await prisma.affiliateLink.count();
  console.log(`\n📊 总计：${totalLinks} 个联盟链接`);

  console.log('\n⚠️  注意：');
  console.log(`   当前使用的 affiliate_id = "${AFFILIATE_ID}"`);
  console.log('   实际运营时需要向代购平台申请真实的 affiliate_id');
  console.log();
}

main()
  .catch((e) => {
    console.error('❌ 错误:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
