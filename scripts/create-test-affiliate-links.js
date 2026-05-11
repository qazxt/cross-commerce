#!/usr/bin/env node
/**
 * 创建测试联盟链接数据
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔧 开始创建测试联盟链接数据...\n');

  // 获取所有商品
  const products = await prisma.product.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
    },
  });

  console.log(`找到 ${products.length} 个商品\n`);

  // 联盟平台配置
  const platforms = [
    {
      name: '淘宝',
      baseUrl: 'https://s.taobao.com/search',
      param: 'q',
    },
    {
      name: '京东',
      baseUrl: 'https://search.jd.com/Search',
      param: 'keyword',
    },
    {
      name: '亚马逊',
      baseUrl: 'https://www.amazon.cn/s',
      param: 'k',
    },
  ];

  for (const product of products) {
    console.log(`📦 商品：${product.title}`);

    // 为每个商品创建 2-3 个平台链接
    for (let i = 0; i < 2; i++) {
      const platform = platforms[i];
      const platformUrl = `${platform.baseUrl}?${platform.param}=${encodeURIComponent(product.title)}`;
      const affiliateUrl = platformUrl + `&tag=test-affiliate`; // 模拟联盟链接

      // 检查是否已存在
      const existing = await prisma.affiliateLink.findFirst({
        where: {
          productId: product.id,
          platform: platform.name,
        },
      });

      if (existing) {
        console.log(`  ⚠️  ${platform.name} 链接已存在，跳过`);
        continue;
      }

      await prisma.affiliateLink.create({
        data: {
          productId: product.id,
          platform: platform.name,
          platformUrl: platformUrl,
          affiliateUrl: affiliateUrl,
          isPrimary: i === 0, // 第一个平台设为主链接
          isActive: true,
        },
      });

      console.log(`  ✅ 创建 ${platform.name} 链接`);
    }

    console.log();
  }

  console.log('✅ 联盟链接数据创建完成！');

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
