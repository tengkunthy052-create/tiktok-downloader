const puppeteer = require('puppeteer-core');
const fs = require('fs');

const CHROME_PATH =
  fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function scrapeTikTokProfile(username, maxVideos = 30) {
  const cleanUser = username.replace('@', '').trim();
  const profileUrl = `https://www.tiktok.com/@${cleanUser}`;
  console.log(`Scraping profile: ${profileUrl} using ${CHROME_PATH}`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1280,800',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    await page.setViewport({ width: 1280, height: 800 });

    console.log('Navigating to profile page...');
    await page.goto(profileUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

    try {
      await page.waitForSelector('[data-e2e="user-post-item"], a[href*="/video/"]', { timeout: 10000 });
    } catch (e) {
      console.log('Timeout waiting for specific selector, inspecting full DOM...');
    }

    const result = await page.evaluate((max) => {
      const links = Array.from(document.querySelectorAll('a[href*="/video/"]'));
      const videoMap = new Map();

      links.forEach((a) => {
        const href = a.href;
        const match = href.match(/\/video\/(\d+)/i);
        if (match && !videoMap.has(match[1])) {
          const container = a.closest('[data-e2e="user-post-item"]') || a;
          const img = container.querySelector('img');
          const views = container.querySelector('[data-e2e="video-views"]')?.textContent?.trim() || '';
          
          videoMap.set(match[1], {
            id: match[1],
            url: href.split('?')[0],
            cover: img ? img.src : '',
            views: views,
          });
        }
      });

      // Also check SIGI_STATE or __UNIVERSAL_DATA_FOR_REHYDRATION__ in page
      let universalData = null;
      try {
        const script = document.querySelector('#__UNIVERSAL_DATA_FOR_REHYDRATION__');
        if (script) {
          universalData = JSON.parse(script.textContent);
        }
      } catch (e) {}

      const avatar = document.querySelector('[data-e2e="user-avatar"] img')?.src || '';
      const nickname = document.querySelector('[data-e2e="user-subtitle"]')?.textContent?.trim() || '';
      const handle = document.querySelector('[data-e2e="user-title"]')?.textContent?.trim() || '';
      const bio = document.querySelector('[data-e2e="user-bio"]')?.textContent?.trim() || '';

      const userDetail = universalData ? universalData['__DEFAULT_SCOPE__']?.['webapp.user-detail'] : null;
      
      return {
        author: {
          uniqueId: handle,
          nickname: nickname,
          avatar: avatar,
          bio: bio,
        },
        userDetailKeys: userDetail ? Object.keys(userDetail) : [],
        itemList: userDetail?.itemList || [],
        userInfo: userDetail?.userInfo || null
      };
    }, maxVideos);

    console.log('Result:', JSON.stringify(result, null, 2));
    return result;
  } finally {
    await browser.close();
  }
}

scrapeTikTokProfile('zachking', 15);
