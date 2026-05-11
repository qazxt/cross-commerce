import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============ 配置 ============
const CONFIG = {
  baseUrl: 'https://findsindex.com',
  batchSize: 100,           // 每批抓取数量
  maxProducts: 500,         // 最大导入数量（-1 = 全部）
  delayMs: 300,             // 请求间隔
  progressFile: 'crawler/.progress.json',
};

// ============ 工具函数 ============
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function fetchWithRetry(url: string, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      if (i === retries - 1) throw e;
      console.log(`   ⚠️  重试 ${i + 1}/${retries}: ${url}`);
      await sleep(1000 * (i + 1));
    }
  }
}

// ============ 进度管理 ============
interface Progress {
  categoriesDone: boolean;
  brandsDone: boolean;
  productsImported: number;
  importedSlugs: string[];
  lastPage: number;
  startedAt: string;
  completedAt?: string;
}

import fs from 'fs';
import path from 'path';

function loadProgress(): Progress {
  try {
    const data = fs.readFileSync(CONFIG.progressFile, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {
      categoriesDone: false,
      brandsDone: false,
      productsImported: 0,
      importedSlugs: [],
      lastPage: 0,
      startedAt: new Date().toISOString(),
    };
  }
}

function saveProgress(p: Progress) {
  fs.mkdirSync('crawler', { recursive: true });
  fs.writeFileSync(CONFIG.progressFile, JSON.stringify(p, null, 2));
}

// ============ 导入分类 ============
async function importCategories() {
  console.log('\n📁 导入分类...');
  const data = await fetchWithRetry(`${CONFIG.baseUrl}/api/categories`);
  
  let count = 0;
  // 远程 ID → 本地 slug 映射（用于子分类查找父分类）
  const remoteIdToSlug: Record<string, string> = {};

  for (const cat of data) {
    // 父分类（level 0，无 parentId）
    const localCat = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        nameEn: cat.nameEn,
        level: cat.level ?? 0,
        isActive: cat.isActive ?? true,
        sortOrder: cat.sortOrder ?? 0,
        aliases: JSON.stringify(cat.aliases || []),
        translations: cat.translations ? JSON.stringify(cat.translations) : null,
        coverImage: cat.coverImage || null,
      },
      create: {
        slug: cat.slug,
        name: cat.name,
        nameEn: cat.nameEn || null,
        level: cat.level ?? 0,
        sortOrder: cat.sortOrder ?? 0,
        isActive: cat.isActive ?? true,
        aliases: JSON.stringify(cat.aliases || []),
        translations: cat.translations ? JSON.stringify(cat.translations) : null,
        coverImage: cat.coverImage || null,
      },
    });
    remoteIdToSlug[cat.id] = cat.slug;
    count++;

    // 子分类
    if (cat.children && cat.children.length > 0) {
      const parentSlug = remoteIdToSlug[cat.id];
      const parent = await prisma.category.findUnique({ where: { slug: parentSlug } });
      const parentId = parent?.id || null;

      for (const child of cat.children) {
        await prisma.category.upsert({
          where: { slug: child.slug },
          update: {
            name: child.name,
            nameEn: child.nameEn,
            level: child.level ?? 1,
            parentId,
            isActive: child.isActive ?? true,
            sortOrder: child.sortOrder ?? 0,
            aliases: JSON.stringify(child.aliases || []),
            translations: child.translations ? JSON.stringify(child.translations) : null,
            coverImage: child.coverImage || null,
          },
          create: {
            slug: child.slug,
            name: child.name,
            nameEn: child.nameEn || null,
            level: child.level ?? 1,
            parentId,
            sortOrder: child.sortOrder ?? 0,
            isActive: child.isActive ?? true,
            aliases: JSON.stringify(child.aliases || []),
            translations: child.translations ? JSON.stringify(child.translations) : null,
            coverImage: child.coverImage || null,
          },
        });
        count++;
      }
    }
  }
  console.log(`   ✅ 导入 ${count} 个分类`);
  return count;
}

// ============ 导入品牌 ============
async function importBrands() {
  console.log('\n🏷️  导入品牌...');
  const data = await fetchWithRetry(`${CONFIG.baseUrl}/api/brands`);
  
  let count = 0;
  for (const brand of data.data || data) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {
        name: brand.name,
        description: brand.description || null,
        logoUrl: brand.logoUrl || null,
      },
      create: {
        slug: brand.slug,
        name: brand.name,
        nameCn: null,
        description: brand.description || null,
        logoUrl: brand.logoUrl || null,
      },
    });
    count++;
  }
  console.log(`   ✅ 导入 ${count} 个品牌`);
  return count;
}

// ============ 导入商品 ============
async function importProducts(progress: Progress) {
  console.log(`\n📦 导入商品（目标: ${CONFIG.maxProducts === -1 ? '全部' : CONFIG.maxProducts}）...`);
  
  const slugSet = new Set(progress.importedSlugs);
  let page = progress.lastPage + 1;
  let totalImported = progress.productsImported;
  const limit = CONFIG.batchSize;
  const maxProducts = CONFIG.maxProducts;

  while (true) {
    if (maxProducts !== -1 && totalImported >= maxProducts) break;

    const url = `${CONFIG.baseUrl}/api/products?page=${page}&limit=${limit}`;
    console.log(`\n📥 第 ${page} 页...`);

    let data;
    try {
      data = await fetchWithRetry(url);
    } catch (e) {
      console.log(`   ❌ 获取失败，停止`);
      break;
    }

    const products = data.data || [];
    if (products.length === 0) {
      console.log('   📭 没有更多数据');
      break;
    }

    const meta = data.meta || {};
    console.log(`   共 ${meta.total || 'N/A'} 个商品，当前页 ${products.length} 个`);

    for (const p of products) {
      if (maxProducts !== -1 && totalImported >= maxProducts) break;
      if (slugSet.has(p.slug)) continue;

      try {
        // 品牌
        let brand = await prisma.brand.findUnique({ where: { slug: p.brand?.slug } });
        if (!brand && p.brand) {
          brand = await prisma.brand.create({
            data: {
              slug: p.brand.slug,
              name: p.brand.name,
            },
          });
        }
        if (!brand) {
          console.log(`   ⏭️  跳过（无品牌）: ${p.title?.slice(0, 30)}...`);
          continue;
        }

        // 分类
        let category = await prisma.category.findUnique({ where: { slug: p.primaryCategory?.slug } });
        if (!category && p.primaryCategory) {
          category = await prisma.category.create({
            data: {
              slug: p.primaryCategory.slug,
              name: p.primaryCategory.name,
              nameEn: p.primaryCategory.nameEn || null,
              level: 0,
              isActive: true,
            },
          });
        }
        if (!category) {
          console.log(`   ⏭️  跳过（无分类）: ${p.title?.slice(0, 30)}...`);
          continue;
        }

        // 价格（API 是元，DB 是分）
        const priceMin = Math.round((p.priceMin || 0) * 100);
        const priceMax = Math.round((p.priceMax || 0) * 100);

        // 商品
        const product = await prisma.product.create({
          data: {
            slug: p.slug,
            title: p.title || 'Untitled',
            titleEn: p.originalTitle || null,
            description: p.description?.slice(0, 4000) || null,
            descriptionCn: null,
            priceMin,
            priceMax,
            currency: p.currency || 'CNY',
            mainImage: p.mainImage || '',
            images: JSON.stringify(p.images || []),
            status: p.status || 'active',
            isFeatured: p.isFeatured || false,
            viewCount: p.viewCount || 0,
            salesCount: p.salesCount || 0,
            popularityScore: p.popularityScore || 0,
            ctr: p.ctr || 0,
            brandId: brand.id,
            primaryCategoryId: category.id,
          },
        });

        // 关联分类（多对多）
        await prisma.categoryProduct.create({
          data: { productId: product.id, categoryId: category.id },
        }).catch(() => {}); // 忽略重复

        // 属性
        if (p.aiAttributes && typeof p.aiAttributes === 'object') {
          for (const [key, value] of Object.entries(p.aiAttributes)) {
            if (value) {
              await prisma.productAttribute.create({
                data: {
                  productId: product.id,
                  name: key,
                  value: String(value),
                  type: 'text',
                },
              }).catch(() => {});
            }
          }
        }

        slugSet.add(p.slug);
        totalImported++;

        if (totalImported % 50 === 0) {
          console.log(`\n   📊 进度: ${totalImported}${maxProducts !== -1 ? '/' + maxProducts : ''}`);
        }
      } catch (e: any) {
        if (e?.message?.includes('Unique constraint') || e?.code === 'P2002') {
          slugSet.add(p.slug);
        } else {
          console.error(`   ❌ 导入失败: ${p.title?.slice(0, 30)}... ${e?.message || ''}`);
        }
      }

      await sleep(CONFIG.delayMs);
    }

    // 保存进度
    progress.productsImported = totalImported;
    progress.lastPage = page;
    progress.importedSlugs = Array.from(slugSet);
    saveProgress(progress);

    // 检查是否还有下一页
    if (page >= (meta.totalPages || page + 1)) break;
    page++;
  }

  progress.completedAt = new Date().toISOString();
  saveProgress(progress);

  console.log(`\n🎉 商品导入完成！总计: ${totalImported}`);
  return totalImported;
}

// ============ 更新统计 ============
async function updateCounts() {
  console.log('\n📊 更新统计字段...');
  
  // 更新品牌的 productCount
  const brands = await prisma.brand.findMany();
  for (const brand of brands) {
    const count = await prisma.product.count({ where: { brandId: brand.id } });
    await prisma.brand.update({
      where: { id: brand.id },
      data: { productCount: count },
    });
  }
  console.log(`   ✅ 更新了 ${brands.length} 个品牌的商品数`);

  // 更新分类的 productCount
  const categories = await prisma.category.findMany();
  for (const cat of categories) {
    const count = await prisma.product.count({ where: { primaryCategoryId: cat.id } });
    await prisma.category.update({
      where: { id: cat.id },
      data: { productCount: count },
    });
  }
  console.log(`   ✅ 更新了 ${categories.length} 个分类的商品数`);
}

// ============ 主函数 ============
async function main() {
  console.log('🚀 增强版爬虫启动');
  console.log(`   目标: ${CONFIG.baseUrl}`);
  console.log(`   每批: ${CONFIG.batchSize}`);
  console.log(`   最大商品: ${CONFIG.maxProducts === -1 ? '全部' : CONFIG.maxProducts}`);
  console.log('');

  const progress = loadProgress();
  const startTime = Date.now();

  // 1. 分类
  if (!progress.categoriesDone) {
    await importCategories();
    progress.categoriesDone = true;
    saveProgress(progress);
  } else {
    console.log('\n📁 分类已导入，跳过');
  }

  // 2. 品牌
  if (!progress.brandsDone) {
    await importBrands();
    progress.brandsDone = true;
    saveProgress(progress);
  } else {
    console.log('\n🏷️  品牌已导入，跳过');
  }

  // 3. 商品
  await importProducts(progress);

  // 4. 统计
  await updateCounts();

  // 5. 最终统计
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
  const totalProducts = await prisma.product.count();
  const totalBrands = await prisma.brand.count();
  const totalCategories = await prisma.category.count();

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 最终统计:');
  console.log(`   商品: ${totalProducts}`);
  console.log(`   品牌: ${totalBrands}`);
  console.log(`   分类: ${totalCategories}`);
  console.log(`   耗时: ${elapsed}s`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await prisma.$disconnect();
}

main().catch(e => {
  console.error('❌ 错误:', e);
  process.exit(1);
});
