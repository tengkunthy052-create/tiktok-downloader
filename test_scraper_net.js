const puppeteer = require('puppeteer-core');
const fs = require('fs');

const CHROME_PATH =
  fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function scrapeProfileWithNetwork(username) {
  const cleanUser = username.replace('@', '').trim();
  const profileUrl = `https://www.tiktok.com/@${cleanUser}`;
  console.log(`Scraping profile with network intercept: ${profileUrl}`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--window-size=1280,800',
    ],
  });

  const capturedVideos = [];
  let authorProfile = null;

  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    await page.setViewport({ width: 1280, height: 800 });

    // Intercept API responses
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/api/post/item_list') || url.includes('/item_list')) {
        console.log('Intercepted item_list API response URL:', url.substring(0, 80));
        try {
          const text = await response.text();
          console.log('Raw item_list response:', text.substring(0, 300));
          if (text) {
            const json = JSON.parse(text);
            console.log('Parsed JSON keys:', Object.keys(json));
            if (json && Array.isArray(json.itemList)) {
              console.log(`API returned ${json.itemList.length} items!`);
              json.itemList.forEach((item) => {
                capturedVideos.push({
                  id: item.id,
                  title: item.desc || 'TikTok Video',
                  cover: item.video?.cover || item.video?.originCover || item.video?.dynamicCover || '',
                  duration: item.video?.duration || 0,
                  stats: {
                    views: item.stats?.playCount || 0,
                    likes: item.stats?.diggCount || 0,
                    comments: item.stats?.commentCount || 0,
                    shares: item.stats?.shareCount || 0,
                  },
                  url: `https://www.tiktok.com/@${cleanUser}/video/${item.id}`,
                });
              });
            }
          }
        } catch (e) {
          console.log('Parse note:', e.message);
        }
      }
    });

    await page.goto(profileUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    // Scroll down slightly to trigger feed fetch if needed
    await page.evaluate(() => {
      window.scrollBy(0, 800);
    });
    await new Promise((r) => setTimeout(r, 2000));

    // Get author details from page
    authorProfile = await page.evaluate(() => {
      let universalData = null;
      try {
        const script = document.querySelector('#__UNIVERSAL_DATA_FOR_REHYDRATION__');
        if (script) universalData = JSON.parse(script.textContent);
      } catch (e) {}

      const userDetail = universalData ? universalData['__DEFAULT_SCOPE__']?.['webapp.user-detail'] : null;
      const user = userDetail?.userInfo?.user;
      const stats = userDetail?.userInfo?.stats;

      return {
        uniqueId: user?.uniqueId || document.querySelector('[data-e2e="user-title"]')?.textContent?.trim(),
        nickname: user?.nickname || document.querySelector('[data-e2e="user-subtitle"]')?.textContent?.trim(),
        avatar: user?.avatarLarger || document.querySelector('[data-e2e="user-avatar"] img')?.src,
        bio: user?.signature || document.querySelector('[data-e2e="user-bio"]')?.textContent?.trim(),
        followerCount: stats?.followerCount || 0,
        followingCount: stats?.followingCount || 0,
        videoCount: stats?.videoCount || 0,
        heartCount: stats?.heartCount || 0,
      };
    });

    console.log('Author details:', authorProfile);
    console.log(`Captured total ${capturedVideos.length} videos from profile!`);

    return {
      author: authorProfile,
      videos: capturedVideos,
    };
  } finally {
    await browser.close();
  }
}

scrapeProfileWithNetwork('zachking');
