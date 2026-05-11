import { PlaywrightCrawler, Dataset } from 'crawlee';

// 配置
const CONFIG = {
  baseUrl: 'https://findsindex.com',
  maxProducts: 10,
  concurrency: 1,
};

// 拦截 API 请求
const apiResponses: any[] = [];

const crawler = new PlaywrightCrawler({
  maxRequestsPerCrawl: 20,
  requestHandlerTimeoutSecs: 45,
  maxConcurrency: CONFIG.concurrency,
  
  // 拦截网络请求
  requestHandler: async ({ request, page, log }) => {
    const url = request.url;
    log.info(`Crawling: ${url}`);
    
    // 监听网络响应
    page.on('response', async (response) => {
      const respUrl = response.url();
      // 捕获 API 响应
      if (respUrl.includes('/api/') || respUrl.includes('graphql')) {
        try {
          const body = await response.json().catch(() => null);
          if (body) {
            log.info(`API Response: ${respUrl}`);
            apiResponses.push({ url: respUrl, data: body });
          }
        } catch (e) {
          // ignore
        }
      }
    });
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // 提取页面中的商品链接
    const productLinks = await page.evaluate(() => {
      const links = document.querySelectorAll('a[href*="/en/products/"]');
      return Array.from(links)
        .map(a => a.getAttribute('href'))
        .filter(href => href && href.includes('/en/products/'))
        .map(href => href.split('?')[0])
        .filter((value, index, self) => self.indexOf(value) === index);
    });
    
    log.info(`Found ${productLinks.length} product links`);
    
    // 保存页面 HTML 供分析
    const fs = await import('fs');
    const path = await import('path');
    const outputPath = path.join(process.cwd(), 'crawler', 'storage', 'pages');
    fs.mkdirSync(outputPath, { recursive: true });
    const slug = url.replace(/[^a-zA-Z0-9]/g, '_');
    const html = await page.content();
    fs.writeFileSync(path.join(outputPath, `${slug}.html`), html);
  },
  
  failedRequestHandler: ({ request, log }) => {
    log.error(`Failed: ${request.url}`);
  },
});

// 启动爬虫
(async () => {
  console.log('🕷️ 启动 FindsIndex 爬虫 (API 探测模式)...');
  
  await crawler.run([
    `${CONFIG.baseUrl}/en/products`,
  ]);

  console.log('\n📊 捕获的 API 响应:');
  apiResponses.forEach((resp, i) => {
    console.log(`${i + 1}. ${resp.url}`);
    console.log(JSON.stringify(resp.data, null, 2).slice(0, 500));
    console.log('');
  });
  
  console.log('✅ 完成！');
})();
