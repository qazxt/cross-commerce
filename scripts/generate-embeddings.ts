/**
 * 生成商品文本嵌入（使用 BGE-M3 模型）
 * 
 * 使用方法：
 * npx tsx scripts/generate-embeddings.ts
 * 
 * 可选：使用本地模型或 API
 * - 本地：@xenova/transformers (需要下载模型)
 * - API：HuggingFace Inference API (免费额度)
 */

import { PrismaClient } from '@prisma/client';
import { generateSearchText } from '@/lib/vector';

const prisma = new PrismaClient();

// 配置
const CONFIG = {
  // 使用 HuggingFace API (免费)
  USE_HF_API: true,
  HF_API_URL: 'https://api-inference.huggingface.co/models/BAAI/bge-m3',
  HF_TOKEN: process.env.HUGGINGFACE_TOKEN || '',
  
  // 批量处理大小
  BATCH_SIZE: 10,
  
  // 向量维度 (BGE-M3 输出 1024 维)
  DIMENSION: 1024,
};

// 调用 HuggingFace API 生成嵌入
async function generateEmbedding(text: string): Promise<number[]> {
  if (CONFIG.USE_HF_API && CONFIG.HF_TOKEN) {
    try {
      const response = await fetch(CONFIG.HF_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CONFIG.HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: text,
          options: {
            wait_for_model: true,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HF API error: ${response.status}`);
      }

      const result = await response.json();
      // HF API 返回格式：{ embeddings: [[...]] } 或 [[...]]
      const embedding = Array.isArray(result) ? result[0] : result.embeddings?.[0] || result[0];
      return embedding;
    } catch (error) {
      console.error('HF API failed, falling back to mock:', error);
    }
  }

  // Fallback: 生成伪向量用于测试（实际部署时替换为真实模型）
  console.log('Using mock embedding (install transformers for real embeddings)');
  return generateMockEmbedding(text);
}

// 伪嵌入生成（用于开发测试）
function generateMockEmbedding(text: string): number[] {
  // 使用简单的 hash 生成可重复的伪向量
  const hash = simpleHash(text);
  const vector = new Array(CONFIG.DIMENSION).fill(0).map((_, i) => {
    return Math.sin(hash + i * 0.1);
  });
  
  // 归一化
  const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  return vector.map(v => v / norm);
}

// 简单哈希函数
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// 获取品牌名称
async function getBrandName(brandId: string): Promise<string> {
  const brand = await prisma.brand.findUnique({
    where: { id: brandId },
    select: { name: true },
  });
  return brand?.name || '';
}

// 获取分类名称
async function getCategoryName(categoryId: string): Promise<string> {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { name: true },
  });
  return category?.name || '';
}

// 主函数
async function generateEmbeddings() {
  console.log('🚀 Starting embedding generation...\n');

  // 获取所有商品
  const products = await prisma.product.findMany({
    where: {
      status: 'active',
      hasEmbedding: false, // 只处理未生成的
    },
    include: {
      brand: true,
      primaryCategory: true,
    },
    take: CONFIG.BATCH_SIZE,
  });

  if (products.length === 0) {
    console.log('✅ All products have embeddings!');
    return;
  }

  console.log(`Processing ${products.length} products...\n`);

  for (const product of products) {
    try {
      // 生成搜索文本
      const searchText = generateSearchText({
        title: product.title,
        titleEn: product.titleEn,
        description: product.description,
        brandName: product.brand.name,
        categoryName: product.primaryCategory.name,
      });

      console.log(`Processing: ${product.title}`);

      // 生成嵌入
      const embedding = await generateEmbedding(searchText);

      // 保存到数据库
      await prisma.product.update({
        where: { id: product.id },
        data: {
          embedding: JSON.stringify(embedding),
          hasEmbedding: true,
          // AI 生成的属性（可选）
          aiBrandName: product.brand.name,
          aiAttributes: JSON.stringify({
            gender: 'Unisex', // 可以从描述中提取
          }),
        },
      });

      console.log(`✓ Generated embedding for ${product.slug}\n`);
    } catch (error) {
      console.error(`✗ Error processing ${product.slug}:`, error);
    }
  }

  console.log('✅ Batch complete! Run again to process more.');
}

// 运行
generateEmbeddings()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
