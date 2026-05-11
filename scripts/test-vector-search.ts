/**
 * 向量搜索功能测试脚本
 * 
 * 使用方法：
 * npx tsx scripts/test-vector-search.ts
 */

import { PrismaClient } from '@prisma/client';
import { cosineSimilarity, parseEmbedding, generateSearchText } from '@/lib/vector';

const prisma = new PrismaClient();

async function testVectorSearch() {
  console.log('🧪 向量搜索功能测试\n');

  // 测试 1: 检查有多少商品有 embedding
  console.log('📊 测试 1: 检查 Embedding 状态');
  const totalProducts = await prisma.product.count();
  const withEmbedding = await prisma.product.count({
    where: { hasEmbedding: true },
  });
  console.log(`   总商品数：${totalProducts}`);
  console.log(`   有 Embedding: ${withEmbedding}`);
  console.log(`   覆盖率：${((withEmbedding / totalProducts) * 100).toFixed(1)}%\n`);

  // 测试 2: 验证 embedding 格式
  console.log('📊 测试 2: 验证 Embedding 格式');
  const sampleProduct = await prisma.product.findFirst({
    where: { hasEmbedding: true, embedding: { not: null } },
  });

  if (sampleProduct) {
    const embedding = parseEmbedding(sampleProduct.embedding!);
    if (embedding) {
      console.log(`   ✓ Embedding 维度：${embedding.length}`);
      console.log(`   ✓ 向量范围：[${embedding.reduce((a, b) => Math.min(a, b), 0).toFixed(3)}, ${embedding.reduce((a, b) => Math.max(a, b), 0).toFixed(3)}]`);
      
      // 检查是否归一化
      const norm = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
      console.log(`   ✓ 向量模长：${norm.toFixed(3)} (应该接近 1.0)\n`);
    } else {
      console.log('   ✗ Embedding 解析失败\n');
    }
  } else {
    console.log('   ⚠ 暂无带 Embedding 的商品，先运行 generate-embeddings.ts\n');
  }

  // 测试 3: 相似度计算
  console.log('📊 测试 3: 余弦相似度计算');
  const vec1 = [1, 0, 0];
  const vec2 = [0, 1, 0];
  const vec3 = [1, 0, 0];
  
  console.log(`   vec1 · vec2 (正交): ${cosineSimilarity(vec1, vec2).toFixed(3)} (应该接近 0)`);
  console.log(`   vec1 · vec3 (相同): ${cosineSimilarity(vec1, vec3).toFixed(3)} (应该等于 1)\n`);

  // 测试 4: 搜索文本生成
  console.log('📊 测试 4: 搜索文本生成');
  const testProduct = await prisma.product.findFirst({
    include: { brand: true, primaryCategory: true },
  });

  if (testProduct) {
    const searchText = generateSearchText({
      title: testProduct.title,
      titleEn: testProduct.titleEn,
      description: testProduct.description,
      brandName: testProduct.brand.name,
      categoryName: testProduct.primaryCategory.name,
    });
    console.log(`   商品：${testProduct.title}`);
    console.log(`   搜索文本长度：${searchText.length} 字符`);
    console.log(`   前 100 字符：${searchText.substring(0, 100)}...\n`);
  }

  // 测试 5: 混合搜索 API 测试（需要服务器运行）
  console.log('📊 测试 5: API 连通性');
  try {
    const response = await fetch('http://localhost:3000/api/search/vector?q=test&mode=hybrid');
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✓ API 响应正常`);
      console.log(`   返回结果数：${data.total || 0}`);
      console.log(`   搜索模式：${data.mode || 'unknown'}\n`);
    } else {
      console.log(`   ⚠ API 未响应（服务器可能未运行）\n`);
    }
  } catch (error) {
    console.log(`   ⚠ API 连接失败（服务器可能未运行）\n`);
  }

  console.log('✅ 测试完成！\n');
}

// 运行测试
testVectorSearch()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
