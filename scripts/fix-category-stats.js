#!/usr/bin/env node
/**
 * 修复商品分类关联和统计数量
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔧 开始修复商品分类关联和统计...\n');

  // 1. 修复 CategoryProduct 关联
  console.log('📌 修复 CategoryProduct 关联...');
  const products = await prisma.product.findMany({
    select: {
      id: true,
      primaryCategoryId: true,
      categories: {
        select: {
          categoryId: true,
        },
      },
    },
  });

  let categoryProductCount = 0;
  for (const product of products) {
    // 检查是否已有关联
    const hasPrimaryCategory = product.categories.some(
      (cp) => cp.categoryId === product.primaryCategoryId
    );

    if (!hasPrimaryCategory) {
      await prisma.categoryProduct.create({
        data: {
          productId: product.id,
          categoryId: product.primaryCategoryId,
        },
      });
      categoryProductCount++;
    }
  }
  console.log(`✅ 新增 ${categoryProductCount} 条分类关联\n`);

  // 2. 更新 Category.productCount
  console.log('📌 更新分类商品数量...');
  const categories = await prisma.category.findMany({
    include: {
      products: true,
    },
  });

  for (const category of categories) {
    await prisma.category.update({
      where: { id: category.id },
      data: {
        productCount: category.products.length,
      },
    });
    console.log(`  - ${category.name}: ${category.products.length} 个商品`);
  }
  console.log();

  // 3. 更新 Brand.productCount
  console.log('📌 更新品牌商品数量...');
  const brands = await prisma.brand.findMany({
    include: {
      products: true,
    },
  });

  for (const brand of brands) {
    await prisma.brand.update({
      where: { id: brand.id },
      data: {
        productCount: brand.products.length,
      },
    });
    console.log(`  - ${brand.name}: ${brand.products.length} 个商品`);
  }
  console.log();

  console.log('✅ 修复完成！');
}

main()
  .catch((e) => {
    console.error('❌ 错误:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
