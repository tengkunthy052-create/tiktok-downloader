const axios = require('axios');

async function inspectShortDrama(url) {
  try {
    console.log('Fetching shortdrama URL:', url);
    const res = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      maxRedirects: 5,
    });

    console.log('Status:', res.status, 'HTML length:', res.data.length);

    // Check for script tags
    const matchJson =
      res.data.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/i) ||
      res.data.match(/<script id="SIGI_STATE"[^>]*>([\s\S]*?)<\/script>/i) ||
      res.data.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);

    if (matchJson) {
      console.log('Found script tag JSON!');
      try {
        const parsed = JSON.parse(matchJson[1]);
        const defaultScope = parsed['__DEFAULT_SCOPE__'] || {};
        console.log('Scope keys:', Object.keys(defaultScope));

        // Save entire JSON to inspection file
        const fs = require('fs');
        fs.writeFileSync('shortdrama_dump.json', JSON.stringify(defaultScope, null, 2));
        console.log('Saved shortdrama_dump.json successfully!');
      } catch (e) {
        console.log('JSON parse error:', e.message);
      }
    } else {
      console.log('No script tag. First 500 chars of HTML:');
      console.log(res.data.substring(0, 500));
    }
  } catch (e) {
    console.error('Error fetching shortdrama:', e.message);
  }
}

inspectShortDrama('https://www.tiktok.com/shortdrama/episode/7679560445010875412/1?is_from_webapp=1&sender_device=pc');
