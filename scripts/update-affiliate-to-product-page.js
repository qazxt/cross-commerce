#!/usr/bin/env node
/**
 * 更新联盟链接为具体产品页链接
 * FindsIndex 原网站是直接跳转到代购平台的产品页，不是搜索页
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔧 开始更新为具体产品页链接...\n');

  // 先删除旧的搜索链接
  await prisma.affiliateLink.deleteMany({});
  console.log('🗑️  已清除旧的搜索链接\n');

  // 获取所有商品
  const products = await prisma.product.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
    },
  });

  console.log(`找到 ${products.length} 个商品\n`);

  // 代购平台配置
  // 实际运营中，需要手动或通过 API 获取每个商品在各平台的产品页链接
  const platforms = [
    {
      name: 'Kakobuy',
      // 代购平台通常有"一键导入"功能，通过 1688/微店链接生成产品页
      // 格式：https://www.kakobuy.com/product/[product_id]
      // 或：https://www.kakobuy.com/?url=[1688 链接]
      baseUrl: 'https://www.kakobuy.com',
      importParam: 'url',
    },
    {
      name: 'CNFans',
      baseUrl: 'https://www.cnfans.com',
      importParam: 'url',
    },
    {
      name: 'ACBuy',
      baseUrl: 'https://www.acbuy.com',
      importParam: 'url',
    },
  ];

  // 模拟 1688/微店货源链接（实际需要从供应商获取）
  const sourceLinks = {
    'nike-air-max-90': 'https://detail.1688.com/offer/12345678.html',
    'adidas-ultraboost': 'https://detail.1688.com/offer/23456789.html',
    'gucci-canvas-bag': 'https://detail.1688.com/offer/34567890.html',
    'nike-sport-tshirt': 'https://detail.1688.com/offer/45678901.html',
  };

  for (const product of products) {
    console.log(`📦 商品：${product.title} (${product.slug})`);

    // 获取货源链接
    const sourceLink = sourceLinks[product.slug];
    if (!sourceLink) {
      console.log(`  ⚠️  缺少货源链接，跳过`);
      continue;
    }

    // 为每个商品创建 3 个代购平台的产品页链接
    for (const platform of platforms) {
      // 代购平台的"一键导入"链接格式
      // 用户点击后，代购平台会解析 1688/微店链接，自动生成产品页
      const importUrl = `${platform.baseUrl}/?${platform.importParam}=${encodeURIComponent(sourceLink)}`;

      // 或者使用产品 ID 格式（如果代购平台已导入该商品）
      // const productUrl = `${platform.baseUrl}/product/${product.slug}-${generateProductId()}`;

      await prisma.affiliateLink.create({
        data: {
          productId: product.id,
          platform: platform.name,
          platformUrl: sourceLink, // 货源链接
          affiliateUrl: importUrl, // 代购平台导入链接
          isPrimary: platform.name === 'Kakobuy', // Kakobuy 设为主链接
          isActive: true,
          clickCount: 0,
          conversionRate: 0,
          metadata: JSON.stringify({
            sourceType: '1688',
            sourceLink: sourceLink,
          }),
        },
      });

      console.log(`  ✅ 创建 ${platform.name} 产品页链接`);
      console.log(`     货源：${sourceLink}`);
      console.log(`     导入：${importUrl}`);
    }

    console.log();
  }

  console.log('✅ 产品页链接创建完成！');

  // 统计结果
  const totalLinks = await prisma.affiliateLink.count();
  console.log(`\n📊 总计：${totalLinks} 个联盟链接`);
}

main()
  .catch((e) => {
    console.error('❌ 错误:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
