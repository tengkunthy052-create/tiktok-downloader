const puppeteer = require('puppeteer-core');
const fs = require('fs');

const CHROME_PATH =
  fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function extractProfileVideos(username, scrollTimes = 2) {
  const cleanUser = username.replace('@', '').trim();
  const profileUrl = `https://www.tiktok.com/@${cleanUser}`;
  console.log(`Extracting profile videos for: ${profileUrl}`);

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

    await page.goto(profileUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 2500));

    // Scroll down to load more videos if requested
    for (let i = 0; i < scrollTimes; i++) {
      await page.evaluate(() => {
        window.scrollBy(0, 1800);
      });
      await new Promise((r) => setTimeout(r, 1200));
    }

    const data = await page.evaluate(() => {
      // Author info
      const authorTitle = document.querySelector('[data-e2e="user-title"]')?.textContent?.trim() || '';
      const authorSubtitle = document.querySelector('[data-e2e="user-subtitle"]')?.textContent?.trim() || '';
      const avatar = document.querySelector('[data-e2e="user-avatar"] img')?.src || '';
      const bio = document.querySelector('[data-e2e="user-bio"]')?.textContent?.trim() || '';
      const followerCount = document.querySelector('[data-e2e="followers-count"]')?.textContent?.trim() || '';
      const likesCount = document.querySelector('[data-e2e="likes-count"]')?.textContent?.trim() || '';
      const videoCount = document.querySelector('[data-e2e="videos-tab"]')?.textContent?.trim() || '';

      const items = Array.from(document.querySelectorAll('[data-e2e="user-post-item"]'));
      const videoMap = new Map();

      items.forEach((item) => {
        const link = item.querySelector('a[href*="/video/"]');
        if (!link) return;
        const href = link.href;
        const idMatch = href.match(/\/video\/(\d+)/);
        if (!idMatch) return;
        const id = idMatch[1];

        if (videoMap.has(id)) return;

        const img = item.querySelector('img');
        const views = item.querySelector('[data-e2e="video-views"]')?.textContent?.trim() || '';
        const badge = item.querySelector('[data-e2e="video-card-badge"]')?.textContent?.trim() || '';
        const title = img?.alt || `Video by ${authorTitle || authorSubtitle}`;

        videoMap.set(id, {
          id: id,
          title: title,
          url: `https://www.tiktok.com/@${authorSubtitle || authorTitle || 'user'}/video/${id}`,
          cover: img ? img.src : '',
          views: views,
          badge: badge,
        });
      });

      return {
        author: {
          uniqueId: authorSubtitle || authorTitle,
          nickname: authorTitle || authorSubtitle,
          avatar: avatar,
          bio: bio,
          followers: followerCount,
          likes: likesCount,
          videoCount: videoCount,
        },
        videos: Array.from(videoMap.values()),
      };
    });

    console.log('Author:', data.author);
    console.log(`Successfully extracted ${data.videos.length} videos from @${cleanUser}!`);
    console.log('Sample video:', data.videos[0]);
    return data;
  } finally {
    await browser.close();
  }
}

extractProfileVideos('zachking', 2);
