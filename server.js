const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Smart Normalizer: Extracts URL, follows short redirects, and cleans parameters
async function normalizeTikTokUrl(rawInput) {
  if (!rawInput || typeof rawInput !== 'string') return null;
  const text = rawInput.trim();

  // If user passed just digits (Video ID)
  if (/^\d{15,25}$/.test(text)) {
    return `https://www.tiktok.com/@tiktok/video/${text}`;
  }

  // Extract HTTP URL from text
  const match = text.match(/https?:\/\/[^\s"'<>]+/i);
  if (!match) return null;

  let targetUrl = match[0];

  // If it's a short URL or mobile share link, follow redirects to get canonical URL
  if (/(?:vt|vm|t)\.tiktok\.com|\/t\//i.test(targetUrl)) {
    try {
      const headRes = await axios.get(targetUrl, {
        maxRedirects: 10,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        timeout: 10000,
      });

      if (headRes.request?.res?.responseUrl) {
        targetUrl = headRes.request.res.responseUrl;
      }
    } catch (err) {
      console.warn('Unshorten redirect notice (using original):', err.message);
    }
  }

  return targetUrl;
}

// Fetch video info from TikWM API
async function fetchTikTokData(rawUrl) {
  const cleanUrl = await normalizeTikTokUrl(rawUrl);
  if (!cleanUrl) {
    throw new Error('Invalid TikTok URL. Please paste a valid link (e.g. https://www.tiktok.com/@... or vt.tiktok.com/...)');
  }

  let response;
  try {
    response = await axios.post(
      'https://www.tikwm.com/api/',
      new URLSearchParams({
        url: cleanUrl,
        hd: '1',
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        timeout: 15000,
      }
    );
  } catch (err) {
    throw new Error('Could not reach video service. Please check your internet connection.');
  }

  const data = response?.data;
  if (!data || data.code !== 0 || !data.data) {
    const errorMsg = data?.msg || '';
    if (errorMsg.toLowerCase().includes('parsing') || errorMsg.toLowerCase().includes('failed') || data?.code === -1) {
      throw new Error('Video not found or is private/deleted. Please ensure the TikTok video is public.');
    }
    throw new Error(errorMsg || 'Unable to retrieve TikTok video data. Please verify the URL.');
  }

  const videoData = data.data;

  // Build sanitized title for filename
  const cleanTitle = (videoData.title || 'tiktok_video')
    .replace(/[^\w\s\u00C0-\u1EF9-]/gi, '')
    .trim()
    .substring(0, 60) || 'tiktok_video';

  const authorName = videoData.author ? (videoData.author.unique_id || videoData.author.nickname || 'creator') : 'creator';
  const videoId = videoData.id || Date.now();

  const isImages = Array.isArray(videoData.images) && videoData.images.length > 0;

  const formatUrl = (u) => {
    if (!u) return null;
    if (u.startsWith('http://') || u.startsWith('https://')) return u;
    return `https://www.tikwm.com${u.startsWith('/') ? '' : '/'}${u}`;
  };

  return {
    id: videoId,
    title: videoData.title || 'Untitled TikTok',
    cleanFilename: `TikTok_${authorName}_${videoId}`,
    duration: videoData.duration || 0,
    isImages: isImages,
    images: isImages ? (videoData.images || []).map(formatUrl) : [],
    cover: formatUrl(videoData.cover || videoData.origin_cover),
    dynamicCover: formatUrl(videoData.dynamic_cover),
    hdSize: videoData.hd_size || 0,
    size: videoData.size || 0,
    // Video URLs (No Watermark)
    hdPlay: formatUrl(videoData.hdplay),
    play: formatUrl(videoData.play),
    wmPlay: formatUrl(videoData.wmplay),
    // Music
    music: formatUrl(videoData.music),
    musicInfo: videoData.music_info || {
      title: videoData.music_info?.title || 'Original Sound',
      author: videoData.music_info?.author || authorName,
    },
    // Author
    author: {
      id: videoData.author?.id,
      uniqueId: videoData.author?.unique_id,
      nickname: videoData.author?.nickname,
      avatar: videoData.author?.avatar,
    },
    // Stats
    stats: {
      plays: videoData.play_count || 0,
      likes: videoData.digg_count || 0,
      comments: videoData.comment_count || 0,
      shares: videoData.share_count || 0,
      downloads: videoData.download_count || 0,
    },
    createdAt: videoData.create_time,
  };
}

// Single URL extraction
app.post('/api/extract', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, error: 'URL parameter is required.' });
    }

    const data = await fetchTikTokData(url);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to extract video information.',
    });
  }
});

// Batch URL extraction
app.post('/api/batch-extract', async (req, res) => {
  try {
    const { urls } = req.body;
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ success: false, error: 'An array of URLs is required.' });
    }

    // Process sequentially with delay to respect rate limit
    const limitedUrls = urls.slice(0, 15);
    const formatted = [];

    for (let i = 0; i < limitedUrls.length; i++) {
      const rawUrl = limitedUrls[i];
      try {
        const data = await fetchTikTokData(rawUrl);
        formatted.push({ success: true, url: rawUrl, data });
      } catch (err) {
        formatted.push({ success: false, url: rawUrl, error: err.message || 'Failed' });
      }

      // 1.1s delay between consecutive calls
      if (i < limitedUrls.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1100));
      }
    }

    res.json({ success: true, results: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Puppeteer profile extractor
const puppeteer = require('puppeteer-core');
const fs = require('fs');

const CHROME_PATH =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  (fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : fs.existsSync('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe')
    ? 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
    : fs.existsSync('/usr/bin/google-chrome')
    ? '/usr/bin/google-chrome'
    : fs.existsSync('/usr/bin/chromium-browser')
    ? '/usr/bin/chromium-browser'
    : fs.existsSync('/usr/bin/chromium')
    ? '/usr/bin/chromium'
    : null);

async function scrapeTikTokProfile(inputUser, scrollTimes = 2) {
  let cleanUser = inputUser.trim();
  const urlMatch = cleanUser.match(/tiktok\.com\/@([^\/?&#\s]+)/i);
  if (urlMatch) {
    cleanUser = urlMatch[1];
  } else {
    cleanUser = cleanUser.replace(/^@/, '').trim();
  }

  if (!cleanUser) {
    throw new Error('Invalid TikTok profile link or username.');
  }

  if (!CHROME_PATH) {
    throw new Error('Chrome/Chromium is not configured for profile scraping on this server.');
  }

  const profileUrl = `https://www.tiktok.com/@${cleanUser}`;
  console.log(`[Scraper] Fetching TikTok profile: ${profileUrl}`);

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

    // Scroll down to load more videos from profile
    for (let i = 0; i < (scrollTimes || 2); i++) {
      await page.evaluate(() => {
        window.scrollBy(0, 1800);
      });
      await new Promise((r) => setTimeout(r, 1200));
    }

    const data = await page.evaluate(() => {
      let author = {
        uniqueId: '',
        nickname: '',
        avatar: '',
        bio: '',
        followers: '0',
        likes: '0',
        videoCount: '0',
      };

      // 1. Try SSR JSON Hydration first
      const scriptTag = document.getElementById('__UNIVERSAL_DATA_FOR_REHYDRATION__') || document.getElementById('SIGI_STATE');
      if (scriptTag && scriptTag.textContent) {
        try {
          const parsed = JSON.parse(scriptTag.textContent);
          const defaultScope = parsed['__DEFAULT_SCOPE__'] || parsed;
          const userDetail = defaultScope['webapp.user-detail']?.userInfo;
          if (userDetail) {
            author = {
              uniqueId: userDetail.user?.uniqueId || '',
              nickname: userDetail.user?.nickname || userDetail.user?.uniqueId || '',
              avatar: userDetail.user?.avatarLarger || userDetail.user?.avatarMedium || userDetail.user?.avatarThumb || '',
              bio: userDetail.user?.signature || '',
              followers: String(userDetail.stats?.followerCount || '0'),
              likes: String(userDetail.stats?.heartCount || '0'),
              videoCount: String(userDetail.stats?.videoCount || '0'),
            };
          }
        } catch (e) {}
      }

      // Fallback author info from DOM elements
      if (!author.uniqueId) {
        author.uniqueId = document.querySelector('[data-e2e="user-subtitle"]')?.textContent?.trim() || '';
        author.nickname = document.querySelector('[data-e2e="user-title"]')?.textContent?.trim() || author.uniqueId || 'Creator';
        author.avatar = document.querySelector('[data-e2e="user-avatar"] img')?.src || '';
        author.bio = document.querySelector('[data-e2e="user-bio"]')?.textContent?.trim() || '';
        author.followers = document.querySelector('[data-e2e="followers-count"]')?.textContent?.trim() || '0';
        author.likes = document.querySelector('[data-e2e="likes-count"]')?.textContent?.trim() || '0';
        author.videoCount = document.querySelector('[data-e2e="videos-tab"]')?.textContent?.trim() || '0';
      }

      // 2. Extract Videos from DOM
      const videoList = [];
      const seenIds = {};
      const allAnchors = document.querySelectorAll('a');

      for (let i = 0; i < allAnchors.length; i++) {
        const link = allAnchors[i];
        const href = link.href || '';
        const match = href.match(/\/video\/(\d+)/);
        if (!match) continue;
        const id = match[1];
        if (seenIds[id]) continue;
        seenIds[id] = true;

        const container = link.closest('[data-e2e="user-post-item"]') || link.parentElement || link;
        const img = container.querySelector('img') || link.querySelector('img');
        const views = container.querySelector('[data-e2e="video-views"]')?.textContent?.trim() || '';
        const badge = container.querySelector('[data-e2e="video-card-badge"]')?.textContent?.trim() || '';
        const title = img?.alt || container.innerText?.slice(0, 90)?.trim() || `TikTok Video ${id}`;

        videoList.push({
          id: id,
          title: title,
          url: href.startsWith('http') ? href.split('?')[0] : `https://www.tiktok.com/@${author.uniqueId || 'user'}/video/${id}`,
          cover: img ? img.src : '',
          views: views,
          badge: badge,
        });
      }

      return {
        author: author,
        videos: videoList,
      };
    });

    if (!data.videos || data.videos.length === 0) {
      if (!data.author.uniqueId) {
        throw new Error('TikTok Profile not found or is private/inaccessible.');
      }
    }

    return data;
  } finally {
    await browser.close();
  }
}

// Profile Videos Extraction Endpoint
app.post('/api/profile-extract', async (req, res) => {
  try {
    const { username, scroll } = req.body;
    if (!username) {
      return res.status(400).json({ success: false, error: 'TikTok profile link or username is required.' });
    }

    const data = await scrapeTikTokProfile(username, scroll || 2);
    res.json({ success: true, data });
  } catch (err) {
    console.error('Profile extract error:', err.message);
    res.status(500).json({ success: false, error: err.message || 'Failed to extract profile videos.' });
  }
});

// Proxy streaming download to bypass CORS / force attachment download with custom filename
app.get('/api/proxy-download', async (req, res) => {
  try {
    const { url, filename, type } = req.query;
    if (!url) {
      return res.status(400).send('Missing url parameter');
    }

    const safeFilename = (filename || `tiktok_download_${Date.now()}.${type === 'audio' ? 'mp3' : type === 'image' ? 'jpg' : 'mp4'}`)
      .replace(/[^\w\s\.-]/gi, '_');

    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      timeout: 60000,
    });

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, Content-Length');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodeURIComponent(safeFilename)}`
    );

    if (type === 'audio') {
      res.setHeader('Content-Type', 'audio/mpeg');
    } else if (type === 'image') {
      res.setHeader('Content-Type', 'image/jpeg');
    } else {
      res.setHeader('Content-Type', 'video/mp4');
    }

    if (response.headers['content-length']) {
      res.setHeader('Content-Length', response.headers['content-length']);
    }

    response.data.on('error', (err) => {
      console.error('Stream error:', err.message);
      if (!res.headersSent) {
        res.status(500).send('Stream error');
      }
    });

    response.data.pipe(res);
  } catch (err) {
    console.error('Proxy download error:', err.message);
    if (!res.headersSent) {
      res.status(500).send('Failed to stream video file.');
    }
  }
});

// Exported server start function for Electron usage
function startServer() {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`TikTok Downloader server running at http://localhost:${PORT}`);
  });
}

// If this file is executed directly, start the server
if (require.main === module) {
  startServer();
}

