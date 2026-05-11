import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// 配置
const CONFIG = {
  limit: 500,
  dataFile: path.join(process.cwd(), 'crawler', 'storage', 'data', 'products-2026-04-26T07-04-45-198Z.json'),
};

// 获取热门商品
async function fetchPopularProducts(limit: number) {
  console.log(`📥 获取 ${limit} 个热门商品...`);
  
  const allProducts: any[] = [];
  const perPage = 100;
  const pages = Math.ceil(limit / perPage);
  
  for (let page = 1; page <= pages; page++) {
    const url = `https://findsindex.com/api/products?sortBy=popular&page=${page}&limit=${perPage}`;
    const response = await fetch(url);
    const data = await response.json();
    
    const products = data.data || [];
    allProducts.push(...products);
    
    console.log(`   第 ${page}/${pages} 页: ${products.length} 个商品`);
    
    if (page < pages) {
      await new Promise(r => setTimeout(r, 500));
    }
  }
  
  return allProducts.slice(0, limit);
}

// 导入或获取品牌
async function getOrCreateBrand(brandData: any) {
  if (!brandData?.name) return '';
  
  try {
    let brand = await prisma.brand.findUnique({
      where: { slug: brandData.slug || brandData.name.toLowerCase().replace(/\s+/g, '-') },
    });
    
    if (!brand) {
      brand = await prisma.brand.create({
        data: {
          name: brandData.name,
          slug: brandData.slug || brandData.name.toLowerCase().replace(/\s+/g, '-'),
          nameCn: brandData.nameCn || null,
          description: brandData.description || null,
          logoUrl: brandData.logoUrl || null,
        },
      });
      console.log(`   🏷️  创建品牌: ${brand.name}`);
    }
    
    return brand.id;
  } catch (error) {
    console.error(`   ❌ 品牌创建失败: ${brandData.name}`, error);
    return '';
  }
}

// 导入或获取分类
async function getOrCreateCategory(categoryData: any) {
  if (!categoryData?.name) return '';
  
  try {
    let category = await prisma.category.findUnique({
      where: { slug: categoryData.slug || categoryData.name.toLowerCase().replace(/\s+/g, '-') },
    });
    
    if (!category) {
      category = await prisma.category.create({
        data: {
          name: categoryData.name,
          nameEn: categoryData.nameEn || null,
          slug: categoryData.slug || categoryData.name.toLowerCase().replace(/\s+/g, '-'),
          level: 0,
          isActive: true,
        },
      });
      console.log(`   📁 创建分类: ${category.name}`);
    }
    
    return category.id;
  } catch (error) {
    console.error(`   ❌ 分类创建失败: ${categoryData.name}`, error);
    return '';
  }
}

// 导入商品
async function importProduct(productData: any) {
  try {
    // 处理品牌
    const brandId = await getOrCreateBrand(productData.brand);
    if (!brandId) {
      console.log(`   ⚠️  跳过商品（无品牌）: ${productData.title}`);
      return false;
    }
    
    // 处理分类
    const categoryId = await getOrCreateCategory(productData.primaryCategory);
    if (!categoryId) {
      console.log(`   ⚠️  跳过商品（无分类）: ${productData.title}`);
      return false;
    }
    
    // 价格转换（API 是浮点数，数据库是整数分）
    const priceMin = Math.round(productData.priceMin * 100);
    const priceMax = Math.round(productData.priceMax * 100);
    
    // 创建商品
    const product = await prisma.product.create({
      data: {
        slug: productData.slug,
        title: productData.title,
        titleEn: productData.originalTitle || null,
        description: productData.description?.slice(0, 2000) || null,
        priceMin,
        priceMax,
        currency: productData.currency || 'CNY',
        mainImage: productData.mainImage,
        images: JSON.stringify(productData.images || []),
        status: productData.status || 'active',
        isFeatured: productData.isFeatured || false,
        brandId,
        primaryCategoryId: categoryId,
      },
    });
    
    // 关联分类
    await prisma.categoryProduct.create({
      data: {
        productId: product.id,
        categoryId,
      },
    });
    
    // 创建属性
    if (productData.aiAttributes) {
      for (const [key, value] of Object.entries(productData.aiAttributes)) {
        if (value) {
          await prisma.productAttribute.create({
            data: {
              productId: product.id,
              name: key,
              value: String(value),
              type: 'text',
            },
          });
        }
      }
    }
    
    console.log(`   ✅ 导入: ${productData.title.slice(0, 40)}...`);
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      console.log(`   ⏭️  跳过（已存在）: ${productData.title.slice(0, 40)}...`);
      return false;
    }
    console.error(`   ❌ 导入失败: ${productData.title}`, error);
    return false;
  }
}

// 主函数
(async () => {
  console.log('🚀 开始导入热门商品...');
  console.log(`📊 目标数量: ${CONFIG.limit}`);
  console.log('');
  
  // 获取热门商品
  const products = await fetchPopularProducts(CONFIG.limit);
  console.log(`\n📦 共获取 ${products.length} 个商品\n`);
  
  // 导入商品
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const result = await importProduct(product);
    
    if (result) {
      successCount++;
    } else {
      skipCount++;
    }
    
    // 进度显示
    if ((i + 1) % 50 === 0) {
      console.log(`\n📊 进度: ${i + 1}/${products.length} (${Math.round((i + 1) / products.length * 100)}%)\n`);
    }
    
    // 避免请求过快
    await new Promise(r => setTimeout(r, 100));
  }
  
  console.log('\n🎉 导入完成！');
  console.log(`   ✅ 成功: ${successCount}`);
  console.log(`   ⏭️  跳过: ${skipCount}`);
  console.log(`   ❌ 失败: ${errorCount}`);
  
  // 统计
  const totalProducts = await prisma.product.count();
  const totalBrands = await prisma.brand.count();
  const totalCategories = await prisma.category.count();
  
  console.log('\n📊 数据库统计:');
  console.log(`   商品: ${totalProducts}`);
  console.log(`   品牌: ${totalBrands}`);
  console.log(`   分类: ${totalCategories}`);
  
  await prisma.$disconnect();
})();
