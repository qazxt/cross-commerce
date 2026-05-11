import fs from 'fs';
import path from 'path';

// 配置
const CONFIG = {
  baseUrl: 'https://findsindex.com',
  apiEndpoint: '/api/products',
  maxPages: 10,     // 测试用，生产环境可调大
  limit: 100,       // 每页数量
  delay: 500,       // 请求间隔 (ms)
  outputDir: path.join(process.cwd(), 'crawler', 'storage', 'data'),
};

// 延迟函数
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 抓取单页
async function fetchPage(page: number) {
  const url = `${CONFIG.baseUrl}${CONFIG.apiEndpoint}?page=${page}&limit=${CONFIG.limit}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`❌ 第 ${page} 页失败:`, error);
    return null;
  }
}

// 主爬虫
(async () => {
  console.log('🕷️ 启动 FindsIndex API 爬虫...');
  console.log(`📊 每页数量：${CONFIG.limit}`);
  console.log(`📄 最大页数：${CONFIG.maxPages}`);
  console.log(`⏱️  请求间隔：${CONFIG.delay}ms`);
  console.log('');
  
  // 创建输出目录
  fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  
  let totalProducts = 0;
  let totalPages = 0;
  const allProducts: any[] = [];
  
  for (let page = 1; page <= CONFIG.maxPages; page++) {
    console.log(`📥 抓取第 ${page} 页...`);
    
    const data = await fetchPage(page);
    if (!data) {
      console.log('⚠️  请求失败，跳过');
      continue;
    }
    
    const products = data.data || [];
    const meta = data.meta || {};
    
    console.log(`   ✅ 获取 ${products.length} 个商品 (总计：${meta.total || 'N/A'})`);
    
    // 收集数据
    allProducts.push(...products);
    totalProducts += products.length;
    totalPages++;
    
    // 如果已经获取完所有页面
    if (page >= (meta.totalPages || CONFIG.maxPages)) {
      console.log('\n✅ 已获取所有页面');
      break;
    }
    
    // 延迟
    await sleep(CONFIG.delay);
  }
  
  // 保存数据
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputFile = path.join(CONFIG.outputDir, `products-${timestamp}.json`);
  
  fs.writeFileSync(outputFile, JSON.stringify(allProducts, null, 2));
  
  console.log('\n📊 爬虫完成！');
  console.log(`   📄 总页数：${totalPages}`);
  console.log(`   📦 总商品：${totalProducts}`);
  console.log(`   💾 数据保存在：${outputFile}`);
})();
