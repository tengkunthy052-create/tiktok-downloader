const axios = require('axios');

async function testAPIs(username) {
  const cleanUser = username.replace('@', '').trim();
  console.log('Testing APIs for user:', cleanUser);

  // 1. TikWM with Mobile Web UA
  try {
    const res = await axios.post(
      'https://www.tikwm.com/api/user/posts',
      new URLSearchParams({
        unique_id: cleanUser,
        count: '30',
        cursor: '0',
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'User-Agent':
            'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
          'Referer': 'https://www.tikwm.com/',
        },
        timeout: 10000,
      }
    );
    console.log('TikWM Mobile UA Result:', res.data.code, res.data.msg, 'Videos:', res.data.data?.videos?.length);
    if (res.data.data?.videos) {
      console.log('First video:', res.data.data.videos[0].title);
      return;
    }
  } catch (e) {
    console.log('TikWM Mobile UA err:', e.message);
  }

  // 2. Countik API
  try {
    const userRes = await axios.get(`https://countik.com/api/user/exist/${cleanUser}`);
    console.log('Countik user:', userRes.data);
    const secUid = userRes.data?.sec_uid || userRes.data?.id;
    if (secUid) {
      const feedRes = await axios.get(`https://countik.com/api/user/feed/${secUid}`);
      console.log('Countik feed:', feedRes.data?.length);
    }
  } catch (e) {
    console.log('Countik err:', e.message);
  }

  // 3. TikWM Web Profile
  try {
    const res = await axios.get(`https://www.tikwm.com/api/user/posts?unique_id=${cleanUser}&count=30&cursor=0`, {
      headers: {
        'User-Agent': 'PostmanRuntime/7.36.0',
      },
    });
    console.log('TikWM Postman UA:', res.data.code, res.data.msg, 'Videos:', res.data.data?.videos?.length);
  } catch (e) {
    console.log('TikWM Postman err:', e.message);
  }
}

testAPIs('zachking');
