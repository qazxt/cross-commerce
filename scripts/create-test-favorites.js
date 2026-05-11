#!/usr/bin/env node
/**
 * 创建测试收藏数据
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔧 开始创建测试收藏数据...\n');

  // 获取测试用户
  const testUser = await prisma.user.findUnique({
    where: { email: 'test@example.com' },
  });

  if (!testUser) {
    console.log('❌ 测试用户不存在，请先运行 create-test-users.js');
    return;
  }

  // 获取所有商品
  const products = await prisma.product.findMany({
    select: { id: true, title: true },
  });

  console.log(`找到用户：${testUser.name}`);
  console.log(`找到商品：${products.length} 个\n`);

  // 为用户创建收藏（收藏前 2 个商品）
  const favoritesToCreate = products.slice(0, 2);
  
  for (const product of favoritesToCreate) {
    // 检查是否已收藏
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId: testUser.id,
          productId: product.id,
        },
      },
    });

    if (existing) {
      console.log(`⚠️  商品 "${product.title}" 已在收藏中，跳过`);
      continue;
    }

    await prisma.favorite.create({
      data: {
        userId: testUser.id,
        productId: product.id,
      },
    });

    console.log(`✅ 收藏商品：${product.title}`);
  }

  console.log('\n✅ 测试收藏数据创建完成！');
  console.log(`\n📝 测试账号收藏情况:`);
  console.log(`   用户：test@example.com`);
  console.log(`   收藏数量：${favoritesToCreate.length} 个商品`);
}

main()
  .catch((e) => {
    console.error('❌ 错误:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
