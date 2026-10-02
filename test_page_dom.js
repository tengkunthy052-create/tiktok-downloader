const puppeteer = require('puppeteer-core');
const fs = require('fs');

const CHROME_PATH =
  fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function testPageDOM(username) {
  const cleanUser = username.replace('@', '').trim();
  const profileUrl = `https://www.tiktok.com/@${cleanUser}`;
  console.log('Testing page DOM for:', profileUrl);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--window-size=1280,900',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    await page.setViewport({ width: 1280, height: 900 });

    // Set custom headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
    });

    await page.goto(profileUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 2000));

    // Click on videos tab if present
    try {
      await page.click('[data-e2e="videos-tab"]');
      console.log('Clicked videos-tab!');
    } catch (e) {
      console.log('videos-tab click note:', e.message);
    }

    // Scroll down to load video items
    for (let s = 0; s < 3; s++) {
      await page.evaluate(() => window.scrollBy(0, 1500));
      await new Promise((r) => setTimeout(r, 1500));
    }

    // Evaluate all post elements
    const pageData = await page.evaluate(() => {
      const allDivs = Array.from(document.querySelectorAll('[data-e2e]')).map((el) => el.getAttribute('data-e2e'));
      const videoLinks = Array.from(document.querySelectorAll('a[href*="/video/"]')).map((a) => a.href);
      return {
        dataE2eTags: Array.from(new Set(allDivs)),
        videoLinksCount: videoLinks.length,
        videoLinks: videoLinks.slice(0, 10),
      };
    });

    console.log('Page E2E tags:', pageData.dataE2eTags);
    console.log('Video links found:', pageData.videoLinksCount, pageData.videoLinks);
    await page.screenshot({ path: 'tiktok_profile_screenshot.png' });
    console.log('Saved tiktok_profile_screenshot.png');
  } finally {
    await browser.close();
  }
}

testPageDOM('zachking');
