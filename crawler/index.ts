import { PlaywrightCrawler, Dataset } from 'crawlee';

// 配置
const CONFIG = {
  baseUrl: 'https://findsindex.com',
  maxProducts: 20,  // 测试用
  concurrency: 1,   // 降低并发避免触发反爬
  delay: 3000,      // 请求间隔 (ms)
};

// 爬虫
const crawler = new PlaywrightCrawler({
  maxRequestsPerCrawl: CONFIG.maxProducts * 3,
  requestHandlerTimeoutSecs: 45,
  maxConcurrency: CONFIG.concurrency,
  useSessionPool: true,
  
  // 浏览器配置
  launchContext: {
    launchOptions: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ],
    },
  },
  
  requestHandler: async ({ request, page, log, enqueueLinks }) => {
    const url = request.url;
    log.info(`Crawling: ${url}`);
    
    // 设置真实 headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Linux"',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'none',
      'sec-fetch-user': '?1',
      'upgrade-insecure-requests': '1',
    });
    
    await page.waitForLoadState('networkidle');
    
    // 模拟人类行为 - 随机等待
    await page.waitForTimeout(1000 + Math.random() * 2000);
    
    // 判断页面类型
    if (url.includes('/products/') && !url.includes('/products?')) {
      // 商品详情页
      const productData = await page.evaluate(() => {
        const title = document.querySelector('h1')?.textContent?.trim() || '';
        const price = document.querySelector('[class*="accent"]')?.textContent?.trim() || '';
        const brand = document.querySelector('.bg-accent\\/15')?.textContent?.trim() || '';
        const images = Array.from(document.querySelectorAll('img[alt]')).map(img => ({
          src: img.getAttribute('src'),
          alt: img.getAttribute('alt'),
        })).filter(img => img.src);
        
        return { title, price, brand, images };
      });
      
      log.info(`Product: ${productData.title} - ${productData.price}`);
      
      await Dataset.pushData({
        type: 'product',
        url: url,
        ...productData,
        crawledAt: new Date().toISOString(),
      });
      
    } else if (url.includes('/products') || url.includes('/categories')) {
      // 列表页 - 提取商品链接
      log.info(`Extracting product links from ${url}`);
      
      await enqueueLinks({
        selector: 'a[href*="/en/products/"]',
        transformRequestFunction: (req) => {
          req.url = req.url.split('?')[0];
          req.userData = { type: 'product' };
          return req;
        },
      });
      
      log.info(`Product links extracted and queued`);
    }
  },
  
  failedRequestHandler: ({ request, log }) => {
    log.error(`Failed: ${request.url} - ${request.errorMessages}`);
  },
});

// 启动爬虫
(async () => {
  console.log('🕷️ 启动 FindsIndex 爬虫...');
  console.log(`📊 最大商品数：${CONFIG.maxProducts}`);
  console.log(`⏱️  请求间隔：${CONFIG.delay}ms`);
  console.log('');
  
  await crawler.run([
    `${CONFIG.baseUrl}/en/products`,
  ]);

  console.log('\n✅ 爬虫完成！数据保存在 crawler/storage/datasets/');
})();
