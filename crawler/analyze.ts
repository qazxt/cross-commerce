import { PlaywrightCrawler, Dataset } from 'crawlee';

const crawler = new PlaywrightCrawler({
  maxRequestsPerCrawl: 10,
  requestHandlerTimeoutSecs: 30,
  maxConcurrency: 2,
  
  requestHandler: async ({ request, page, log }) => {
    log.info(`Crawling: ${request.url}`);
    
    await page.waitForLoadState('networkidle');
    
    // 获取页面完整 HTML 结构
    const html = await page.content();
    const title = await page.title();
    
    // 提取所有链接
    const links = await page.evaluate(() => {
      const anchors = document.querySelectorAll('a[href]');
      return Array.from(anchors).map(a => ({
        text: a.textContent?.trim().slice(0, 100),
        href: a.getAttribute('href'),
      })).filter(l => l.href && !l.href.startsWith('#') && !l.href.startsWith('javascript'));
    });
    
    // 提取主要文本内容
    const mainText = await page.evaluate(() => {
      const body = document.body;
      return body.innerText?.slice(0, 3000) || '';
    });
    
    log.info(`Title: ${title}`);
    log.info(`Links found: ${links.length}`);
    
    await Dataset.pushData({
      url: request.url,
      title,
      linkCount: links.length,
      links: links.slice(0, 50),
      preview: mainText.slice(0, 1000),
    });
    
    // 保存完整 HTML 供分析
    const fs = await import('fs');
    const path = await import('path');
    const outputPath = path.join(process.cwd(), 'crawler', 'storage', 'pages');
    fs.mkdirSync(outputPath, { recursive: true });
    const slug = request.url.replace(/[^a-zA-Z0-9]/g, '_');
    fs.writeFileSync(path.join(outputPath, `${slug}.html`), html);
    log.info(`HTML saved: ${slug}.html`);
  },
  
  failedRequestHandler: ({ request, log }) => {
    log.error(`Failed: ${request.url}`);
  },
});

(async () => {
  await crawler.run([
    'https://findsindex.com/en/categories',
    'https://findsindex.com/en/products',
  ]);

  console.log('✅ 分析完成！查看 crawler/storage/pages/ 获取完整 HTML');
})();
