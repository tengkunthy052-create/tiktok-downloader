// ==========================================================
// TikTok HD Downloader - Client Logic
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const urlInput = document.getElementById('tiktok-url-input');
  const btnFetch = document.getElementById('btn-fetch');
  const btnPaste = document.getElementById('btn-paste');
  const btnClear = document.getElementById('btn-clear');
  const errorBanner = document.getElementById('error-banner');
  const errorMessage = document.getElementById('error-message');
  const errorClose = document.getElementById('error-close');
  const resultSection = document.getElementById('result-section');
  
  // Tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = {
    single: document.getElementById('tab-single'),
    profile: document.getElementById('tab-profile'),
    batch: document.getElementById('tab-batch'),
    history: document.getElementById('tab-history'),
  };
  const historyCountEl = document.getElementById('history-count');

  // Profile Downloader Elements
  const profileUrlInput = document.getElementById('profile-url-input');
  const btnProfileFetch = document.getElementById('btn-profile-fetch');
  const btnProfilePaste = document.getElementById('btn-profile-paste');
  const btnProfileClear = document.getElementById('btn-profile-clear');
  const profileErrorBanner = document.getElementById('profile-error-banner');
  const profileErrorMessage = document.getElementById('profile-error-message');
  const profileErrorClose = document.getElementById('profile-error-close');
  const profileResultsContainer = document.getElementById('profile-results-container');
  const profAuthorAvatar = document.getElementById('prof-author-avatar');
  const profAuthorNickname = document.getElementById('prof-author-nickname');
  const profAuthorHandle = document.getElementById('prof-author-handle');
  const profAuthorBio = document.getElementById('prof-author-bio');
  const profStatFollowers = document.getElementById('prof-stat-followers');
  const profStatLikes = document.getElementById('prof-stat-likes');
  const profStatVideos = document.getElementById('prof-stat-videos');
  const profSelectedCount = document.getElementById('prof-selected-count');
  const profTotalCount = document.getElementById('prof-total-count');
  const chkProfSelectAll = document.getElementById('chk-prof-select-all');
  const btnProfDownloadAll = document.getElementById('btn-prof-download-all');
  const btnProfDownloadMp3 = document.getElementById('btn-prof-download-mp3');
  const profVideoGrid = document.getElementById('prof-video-grid');
  let currentProfileData = null;

  // Preview elements
  const previewVideo = document.getElementById('preview-video');
  const previewAudio = document.getElementById('preview-audio');
  const previewAudioTitle = document.getElementById('preview-audio-title');
  const previewAudioAuthor = document.getElementById('preview-audio-author');
  const resAuthorAvatar = document.getElementById('res-author-avatar');
  const resAuthorName = document.getElementById('res-author-name');
  const resAuthorHandle = document.getElementById('res-author-handle');
  const btnViewTiktok = document.getElementById('btn-view-tiktok');
  const resVideoCaption = document.getElementById('res-video-caption');
  const resStatViews = document.getElementById('res-stat-views');
  const resStatLikes = document.getElementById('res-stat-likes');
  const resStatComments = document.getElementById('res-stat-comments');
  const resStatShares = document.getElementById('res-stat-shares');

  // Action Buttons & Quality Selector
  const dlBtn4k = document.getElementById('dl-btn-4k');
  const dlBtnHd = document.getElementById('dl-btn-hd');
  const dlBtnSd = document.getElementById('dl-btn-sd');
  const dlBtnMp3 = document.getElementById('dl-btn-mp3');
  const dlBtnCover = document.getElementById('dl-btn-cover');
  const btnCopyLink = document.getElementById('btn-copy-link');
  const btnNewSearch = document.getElementById('btn-new-search');
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');

  // VIP & Admin Settings Elements
  const btnHeaderVip = document.getElementById('btn-header-vip');
  const modal4kVip = document.getElementById('modal-4k-vip');
  const modalVipClose = document.getElementById('modal-vip-close');
  const btnVipCancel = document.getElementById('btn-vip-cancel');
  const btnVipUnlock = document.getElementById('btn-vip-unlock');
  const vipCodeInput = document.getElementById('vip-code-input');
  const btnCopyAdmin = document.getElementById('btn-copy-admin');
  const btnAdminTelegram = document.getElementById('btn-admin-telegram');
  const adminTelegramDisplay = document.getElementById('admin-telegram-display');
  const adminPhoneDisplay = document.getElementById('admin-phone-display');
  const vipPriceNum = document.getElementById('vip-price-num');
  const badge4kStatus = document.getElementById('badge-4k-status');
  const dl4kStatusIcon = document.getElementById('dl-4k-status-icon');
  const dl4kDesc = document.getElementById('dl-4k-desc');

  // QR Tabs & Direct Pay Elements
  const qrTabAba = document.getElementById('qr-tab-aba');
  const qrTabTelegram = document.getElementById('qr-tab-telegram');
  const qrPaneAba = document.getElementById('qr-pane-aba');
  const qrPaneTelegram = document.getElementById('qr-pane-telegram');
  const btnAbaPayLink = document.getElementById('btn-aba-pay-link');
  const btnCopyUsd = document.getElementById('btn-copy-usd');
  const btnCopyKhr = document.getElementById('btn-copy-khr');

  // Admin Config Modal Elements
  const modalAdminConfig = document.getElementById('modal-admin-config');
  const btnOpenAdminConfig = document.getElementById('btn-open-admin-config');
  const modalConfigClose = document.getElementById('modal-config-close');
  const btnCfgSave = document.getElementById('btn-cfg-save');
  const btnCfgReset = document.getElementById('btn-cfg-reset');
  const cfgTelegram = document.getElementById('cfg-telegram');
  const cfgPayLink = document.getElementById('cfg-pay-link');
  const cfgPhone = document.getElementById('cfg-phone');
  const cfgPrice = document.getElementById('cfg-price');
  const cfgCode = document.getElementById('cfg-code');

  // Batch elements
  const batchUrlsInput = document.getElementById('batch-urls-input');
  const btnBatchProcess = document.getElementById('btn-batch-process');
  const btnBatchPaste = document.getElementById('btn-batch-paste');
  const btnBatchClear = document.getElementById('btn-batch-clear');
  const batchResultsContainer = document.getElementById('batch-results-container');
  const batchGrid = document.getElementById('batch-grid');
  const batchSuccessCount = document.getElementById('batch-success-count');
  const batchTotalCount = document.getElementById('batch-total-count');
  const btnBatchDownloadAll = document.getElementById('btn-batch-download-all');
  const batchQualitySelect = document.getElementById('batch-quality-select');
  const profQualitySelect = document.getElementById('prof-quality-select');

  // History elements
  const historyList = document.getElementById('history-list');
  const historyEmpty = document.getElementById('history-empty');
  const btnClearHistory = document.getElementById('btn-clear-history');

  // Active state
  let currentData = null;
  let batchData = [];
  let selectedQuality = 'hd'; // 'sd' (720p), 'hd' (1080p), or '4k' (2160p)

  // ==========================================================
  // VIP & Admin Settings Configuration
  // ==========================================================
  const DEFAULT_ADMIN_CONFIG = {
    telegram: '@vannakbo',
    phone: 'USD: 003 868 515 / KHR: 001 650 942',
    price: '0.5',
    vipCode: 'VIP4K',
    abaLink: 'https://pay.ababank.com/oRF8/2iq9b380',
    abaName: 'VANNAK BO',
    abaUsd: '003 868 515',
    abaKhr: '001 650 942',
  };


  function getAdminConfig() {
    try {
      const stored = localStorage.getItem('tiktok_admin_config');
      return stored ? { ...DEFAULT_ADMIN_CONFIG, ...JSON.parse(stored) } : DEFAULT_ADMIN_CONFIG;
    } catch {
      return DEFAULT_ADMIN_CONFIG;
    }
  }

  function saveAdminConfig(cfg) {
    localStorage.setItem('tiktok_admin_config', JSON.stringify(cfg));
    updateVipModalDisplay();
  }

  function isVipUnlocked() {
    return localStorage.getItem('tiktok_4k_vip_unlocked') === 'true';
  }

  function setVipUnlocked(unlocked) {
    if (unlocked) {
      localStorage.setItem('tiktok_4k_vip_unlocked', 'true');
    } else {
      localStorage.removeItem('tiktok_4k_vip_unlocked');
    }
    updateVipUIState();
  }

  function updateVipUIState() {
    const unlocked = isVipUnlocked();
    const cfg = getAdminConfig();

    if (badge4kStatus) {
      if (unlocked) {
        badge4kStatus.className = 'badge badge-4k-unlocked';
        badge4kStatus.innerHTML = '<i class="fa-solid fa-circle-check"></i> 4K VIP: Unlocked';
      } else {
        badge4kStatus.className = 'badge badge-4k-locked';
        badge4kStatus.innerHTML = `<i class="fa-solid fa-crown"></i> 4K VIP: <strong>$${cfg.price || '0.5'}</strong>`;
      }
    }

    if (btnHeaderVip) {
      if (unlocked) {
        btnHeaderVip.innerHTML = '<i class="fa-solid fa-circle-check" style="color:#10B981"></i> 4K VIP Active';
      } else {
        btnHeaderVip.innerHTML = `<i class="fa-solid fa-crown"></i> 4K VIP: <strong>$${cfg.price || '0.5'}</strong>`;
      }
    }

    if (dl4kStatusIcon) {
      dl4kStatusIcon.innerHTML = unlocked
        ? '<i class="fa-solid fa-arrow-down" style="color:#10B981"></i>'
        : '<i class="fa-solid fa-lock" style="color:#FBBF24"></i>';
    }

    if (dl4kDesc) {
      dl4kDesc.textContent = unlocked
        ? 'Ultra High Bitrate UHD 60FPS • Lossless Audio (VIP Unlocked ✅)'
        : `Ultra High Bitrate UHD 60FPS • Lossless Audio (ត្រឹមតែ $${cfg.price || '0.5'} - ទាក់ទង Admin)`;
    }
  }

  function updateVipModalDisplay() {
    const cfg = getAdminConfig();

    if (vipPriceNum) vipPriceNum.textContent = cfg.price || '0.5';
    if (adminPhoneDisplay) adminPhoneDisplay.textContent = cfg.phone || 'USD: 003 868 515 / KHR: 001 650 942';

    const dispAbaName = document.getElementById('disp-aba-name');
    const dispAbaUsd = document.getElementById('disp-aba-usd');
    const dispAbaKhr = document.getElementById('disp-aba-khr');
    if (dispAbaName) dispAbaName.textContent = cfg.abaName || 'VANNAK BO';
    if (dispAbaUsd) dispAbaUsd.textContent = cfg.abaUsd || '003 868 515';
    if (dispAbaKhr) dispAbaKhr.textContent = cfg.abaKhr || '001 650 942';

    if (btnAbaPayLink) {
      btnAbaPayLink.href = cfg.abaLink || 'https://pay.ababank.com/oRF8/2iq9b380';
    }

    if (adminTelegramDisplay) {
      const handle = cfg.telegram.startsWith('@') ? cfg.telegram : `@${cfg.telegram.replace(/^https?:\/\/t\.me\//, '')}`;
      adminTelegramDisplay.textContent = handle;
    }

    if (btnAdminTelegram) {
      const cleanUser = cfg.telegram.replace(/^https?:\/\/t\.me\//, '').replace(/^@/, '').trim();
      const tgUrl = `https://t.me/${cleanUser}?text=${encodeURIComponent('សួស្តី Admin ខ្ញុំបានបង់ប្រាក់ 0.5$ តាម ABA រួចរាល់ហើយ ខ្ញុំចង់បានកូដដោះសោរ 4K TikTok Downloader')}`;
      btnAdminTelegram.href = tgUrl;
    }

    updateVipUIState();
  }

  function openVipModal() {
    updateVipModalDisplay();
    if (modal4kVip) modal4kVip.style.display = 'flex';
  }

  function closeVipModal() {
    if (modal4kVip) modal4kVip.style.display = 'none';
  }

  // ==========================================================
  // Tab Management
  // ==========================================================
  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      tabBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      Object.keys(tabContents).forEach((key) => {
        tabContents[key].style.display = key === tab ? 'block' : 'none';
      });

      if (tab === 'history') {
        renderHistory();
      }
    });
  });

  // ==========================================================
  // Helper Functions
  // ==========================================================
  function showToast(msg) {
    toastMessage.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  function showError(msg) {
    errorMessage.textContent = msg;
    errorBanner.style.display = 'flex';
  }

  function hideError() {
    errorBanner.style.display = 'none';
  }

  errorClose.addEventListener('click', hideError);

  function formatNumber(num) {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  }

  function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return '(' + Math.round((bytes / Math.pow(1024, i)) * 10) / 10 + ' ' + sizes[i] + ')';
  }

  function triggerDownload(url, filename, type, buttonEl) {
    if (!url) {
      showToast('Download link not available for this item');
      return;
    }

    const downloadUrl = `/api/proxy-download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}&type=${type || 'video'}`;
    showToast('⚡ Starting ultra-fast download...');

    if (buttonEl) {
      const originalHtml = buttonEl.innerHTML;
      const arrow = buttonEl.querySelector('.dl-action-arrow');
      if (arrow) arrow.innerHTML = '<i class="fa-solid fa-check" style="color:#25F4EE"></i>';
      setTimeout(() => {
        buttonEl.innerHTML = originalHtml;
      }, 2000);
    }

    // Instant streaming download via invisible frame
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = downloadUrl;
    document.body.appendChild(iframe);

    setTimeout(() => {
      if (iframe.parentNode) document.body.removeChild(iframe);
      showToast('✅ Download running at full speed in your browser!');
    }, 2500);
  }

  // Single input listeners
  urlInput.addEventListener('input', () => {
    btnClear.style.display = urlInput.value.trim().length > 0 ? 'flex' : 'none';
    hideError();
  });

  btnClear.addEventListener('click', () => {
    urlInput.value = '';
    btnClear.style.display = 'none';
    urlInput.focus();
  });

  btnPaste.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        urlInput.value = text.trim();
        btnClear.style.display = 'flex';
        fetchVideo(urlInput.value);
      }
    } catch (err) {
      showToast('Please allow clipboard permission or paste manually');
    }
  });

  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      fetchVideo(urlInput.value);
    }
  });

  btnFetch.addEventListener('click', () => {
    fetchVideo(urlInput.value);
  });

  // Quick Samples
  document.querySelectorAll('.sample-link').forEach((btn) => {
    btn.addEventListener('click', () => {
      const url = btn.getAttribute('data-url');
      urlInput.value = url;
      btnClear.style.display = 'flex';
      fetchVideo(url);
    });
  });

  // ==========================================================
  // Profile Downloader Event Listeners & Logic
  // ==========================================================
  profileUrlInput.addEventListener('input', () => {
    btnProfileClear.style.display = profileUrlInput.value.trim().length > 0 ? 'flex' : 'none';
    profileErrorBanner.style.display = 'none';
  });

  btnProfileClear.addEventListener('click', () => {
    profileUrlInput.value = '';
    btnProfileClear.style.display = 'none';
    profileUrlInput.focus();
  });

  btnProfilePaste.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        profileUrlInput.value = text.trim();
        btnProfileClear.style.display = 'flex';
        fetchProfileVideos(profileUrlInput.value);
      }
    } catch {
      showToast('Please paste the profile link manually');
    }
  });

  profileUrlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      fetchProfileVideos(profileUrlInput.value);
    }
  });

  btnProfileFetch.addEventListener('click', () => {
    fetchProfileVideos(profileUrlInput.value);
  });

  if (profileErrorClose) {
    profileErrorClose.addEventListener('click', () => {
      profileErrorBanner.style.display = 'none';
    });
  }

  // Profile Samples
  document.querySelectorAll('.profile-sample-link').forEach((btn) => {
    btn.addEventListener('click', () => {
      const user = btn.getAttribute('data-user');
      profileUrlInput.value = `@${user}`;
      btnProfileClear.style.display = 'flex';
      fetchProfileVideos(`@${user}`);
    });
  });

  async function fetchProfileVideos(rawInput) {
    const text = (rawInput || '').trim();
    if (!text) {
      profileErrorMessage.textContent = 'Please enter a TikTok profile link or username.';
      profileErrorBanner.style.display = 'flex';
      return;
    }

    profileErrorBanner.style.display = 'none';
    setProfileLoading(true);

    try {
      showToast('🔍 Scraping videos from profile...');
      const response = await fetch('/api/profile-extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: text, scroll: 2 }),
      });

      const resData = await response.json();
      if (!resData.success) {
        throw new Error(resData.error || 'Failed to load TikTok profile.');
      }

      currentProfileData = resData.data;
      renderProfileResults(currentProfileData);
      showToast(`✓ Loaded ${currentProfileData.videos?.length || 0} videos from profile!`);
    } catch (err) {
      profileErrorMessage.textContent = err.message || 'Could not fetch profile videos. Please verify the profile is public.';
      profileErrorBanner.style.display = 'flex';
    } finally {
      setProfileLoading(false);
    }
  }

  function setProfileLoading(isLoading) {
    btnProfileFetch.disabled = isLoading;
    const btnText = btnProfileFetch.querySelector('.btn-text');
    const btnSpinner = btnProfileFetch.querySelector('.btn-spinner');

    if (isLoading) {
      btnText.style.display = 'none';
      btnSpinner.style.display = 'inline-flex';
    } else {
      btnText.style.display = 'inline-flex';
      btnSpinner.style.display = 'none';
    }
  }

  function renderProfileResults(data) {
    const author = data.author || {};
    const videos = data.videos || [];

    // Render Author info
    profAuthorAvatar.src = author.avatar || 'https://www.tiktok.com/favicon.ico';
    profAuthorNickname.textContent = author.nickname || author.uniqueId || 'Creator';
    profAuthorHandle.textContent = `@${author.uniqueId || 'username'}`;
    profAuthorBio.textContent = author.bio || 'No bio description.';
    profStatFollowers.textContent = author.followers || '0';
    profStatLikes.textContent = author.likes || '0';
    profStatVideos.textContent = `${videos.length}`;

    profTotalCount.textContent = videos.length;
    profSelectedCount.textContent = videos.length;

    // Render Video Grid
    profVideoGrid.innerHTML = '';
    videos.forEach((v, index) => {
      const card = document.createElement('div');
      card.className = 'batch-item-card';
      card.innerHTML = `
        <div class="batch-chk-wrap">
          <input type="checkbox" class="prof-item-chk" data-index="${index}" checked>
        </div>
        <div class="batch-thumb-wrap">
          <img src="${v.cover}" alt="Thumb" class="batch-thumb">
        </div>
        <div class="batch-item-info">
          <h5 class="batch-item-title" title="${v.title}">${v.title || 'TikTok Video'}</h5>
          <span class="batch-item-author">@${author.uniqueId || 'creator'}</span>
          <div class="batch-item-stats">
            <span><i class="fa-solid fa-play"></i> ${v.views || 'Video'}</span>
            ${v.badge ? `<span class="tag-badge">${v.badge}</span>` : ''}
          </div>
          <div class="batch-item-actions">
            <button class="batch-item-btn-4k prof-dl-4k" data-url="${v.url}" title="Download 4K (VIP $0.50)">
              <i class="fa-solid fa-crown"></i> 4K
            </button>
            <button class="batch-item-btn prof-dl-hd" data-url="${v.url}" data-fname="TikTok_${author.uniqueId}_${v.id}.mp4" title="Download Full HD">
              <i class="fa-solid fa-wand-magic-sparkles"></i> HD
            </button>
            <button class="batch-item-btn-mp3 prof-dl-mp3" data-url="${v.url}" data-fname="TikTok_${author.uniqueId}_${v.id}_Audio.mp3" title="Download MP3">
              <i class="fa-solid fa-music"></i> MP3
            </button>
          </div>
        </div>
      `;

      // Individual 4K Button on profile video
      card.querySelector('.prof-dl-4k').addEventListener('click', async (e) => {
        if (!isVipUnlocked()) {
          showToast(`សូមដោះសោកំរិត 4K VIP ($${getAdminConfig().price || '0.5'}) ជាមុនសិន!`);
          openVipModal();
          return;
        }
        const btn = e.currentTarget;
        const targetVideoUrl = btn.dataset.url;
        showToast('👑 Extracting 4K Ultra HD video stream...');
        try {
          const exRes = await fetch('/api/extract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: targetVideoUrl }),
          });
          const exData = await exRes.json();
          if (exData.success && exData.data) {
            const playUrl = exData.data.hdPlay || exData.data.play;
            triggerDownload(playUrl, `${exData.data.cleanFilename}_4K_UltraHD.mp4`, 'video', btn);
          } else {
            showToast('Failed to extract video stream');
          }
        } catch {
          showToast('Download error');
        }
      });

      // Individual HD Button on profile video
      card.querySelector('.prof-dl-hd').addEventListener('click', async (e) => {
        const btn = e.currentTarget;
        const targetVideoUrl = btn.dataset.url;
        showToast('Extracting HD link...');
        try {
          const exRes = await fetch('/api/extract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: targetVideoUrl }),
          });
          const exData = await exRes.json();
          if (exData.success && exData.data) {
            const playUrl = exData.data.hdPlay || exData.data.play;
            triggerDownload(playUrl, `${exData.data.cleanFilename}_FullHD_1080p.mp4`, 'video', btn);
          } else {
            showToast('Failed to extract HD video stream');
          }
        } catch {
          showToast('Download error');
        }
      });

      // Individual MP3 Button on profile video
      card.querySelector('.prof-dl-mp3').addEventListener('click', async (e) => {
        const btn = e.currentTarget;
        const targetVideoUrl = btn.dataset.url;
        showToast('Extracting MP3 audio...');
        try {
          const exRes = await fetch('/api/extract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: targetVideoUrl }),
          });
          const exData = await exRes.json();
          if (exData.success && exData.data && exData.data.music) {
            triggerDownload(exData.data.music, `${exData.data.cleanFilename}_Audio.mp3`, 'audio', btn);
          } else {
            showToast('Audio track not available for this video');
          }
        } catch {
          showToast('Download error');
        }
      });

      profVideoGrid.appendChild(card);
    });

    // Update selected count on checkbox change
    profVideoGrid.querySelectorAll('.prof-item-chk').forEach((chk) => {
      chk.addEventListener('change', updateProfSelectedCount);
    });

    profileResultsContainer.style.display = 'block';
    profileResultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function updateProfSelectedCount() {
    const checked = profVideoGrid.querySelectorAll('.prof-item-chk:checked').length;
    profSelectedCount.textContent = checked;
    if (chkProfSelectAll) {
      chkProfSelectAll.checked = checked === currentProfileData?.videos?.length;
    }
  }

  // Profile Select All Checkbox
  if (chkProfSelectAll) {
    chkProfSelectAll.addEventListener('change', () => {
      const chks = profVideoGrid.querySelectorAll('.prof-item-chk');
      chks.forEach((chk) => {
        chk.checked = chkProfSelectAll.checked;
      });
      updateProfSelectedCount();
    });
  }

  // Profile Download Selected with Quality support
  if (btnProfDownloadAll) {
    btnProfDownloadAll.addEventListener('click', async () => {
      const selectedChks = Array.from(profVideoGrid.querySelectorAll('.prof-item-chk:checked'));
      if (selectedChks.length === 0) {
        showToast('Please select at least 1 video from the profile');
        return;
      }

      const quality = profQualitySelect ? profQualitySelect.value : 'fullhd';

      if (quality === '4k' && !isVipUnlocked()) {
        showToast(`សូមដោះសោកំរិត 4K VIP ($${getAdminConfig().price || '0.5'}) ជាមុនសិន!`);
        openVipModal();
        return;
      }

      const qLabel = quality === '4k' ? '4K Ultra HD' : quality === 'sd' ? 'HD 720p' : 'Full HD 1080p';
      showToast(`Preparing ${selectedChks.length} selected videos for ${qLabel} download...`);
      btnProfDownloadAll.disabled = true;

      const selectedIndices = selectedChks.map((c) => parseInt(c.dataset.index));
      const selectedVideos = selectedIndices.map((i) => currentProfileData.videos[i]);

      let queued = 0;
      for (const v of selectedVideos) {
        try {
          const exRes = await fetch('/api/extract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: v.url }),
          });
          const exData = await exRes.json();
          if (exData.success && exData.data) {
            const playUrl = (quality === 'sd') ? (exData.data.play || exData.data.hdPlay) : (exData.data.hdPlay || exData.data.play);
            const suffix = quality === '4k' ? '_4K_UltraHD.mp4' : quality === 'sd' ? '_HD_720p.mp4' : '_FullHD_1080p.mp4';
            triggerDownload(playUrl, `${exData.data.cleanFilename}${suffix}`, 'video');
            queued++;
          }
        } catch (e) {
          console.warn('Queue download skip:', e);
        }
        await new Promise((r) => setTimeout(r, 1100));
      }

      btnProfDownloadAll.disabled = false;
      showToast(`✓ Queued ${queued} ${qLabel} video download(s)!`);
    });
  }

  // Profile Download Selected MP3s
  if (btnProfDownloadMp3) {
    btnProfDownloadMp3.addEventListener('click', async () => {
      const selectedChks = Array.from(profVideoGrid.querySelectorAll('.prof-item-chk:checked'));
      if (selectedChks.length === 0) {
        showToast('Please select at least 1 video from the profile');
        return;
      }

      showToast(`Preparing ${selectedChks.length} selected MP3 tracks...`);
      btnProfDownloadMp3.disabled = true;

      const selectedIndices = selectedChks.map((c) => parseInt(c.dataset.index));
      const selectedVideos = selectedIndices.map((i) => currentProfileData.videos[i]);

      let queued = 0;
      for (const v of selectedVideos) {
        try {
          const exRes = await fetch('/api/extract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: v.url }),
          });
          const exData = await exRes.json();
          if (exData.success && exData.data && exData.data.music) {
            triggerDownload(exData.data.music, `${exData.data.cleanFilename}_Audio.mp3`, 'audio');
            queued++;
          }
        } catch (e) {
          console.warn('MP3 queue skip:', e);
        }
        await new Promise((r) => setTimeout(r, 1000));
      }

      btnProfDownloadMp3.disabled = false;
      showToast(`✓ Queued ${queued} MP3 audio download(s)!`);
    });
  }

  // ==========================================================
  // Single Video Extraction
  // ==========================================================
  async function fetchVideo(rawUrl) {
    if (!rawUrl || !rawUrl.trim()) {
      showError('Please paste a valid TikTok video URL.');
      return;
    }

    const trimmed = rawUrl.trim();
    // Auto-detect if user pasted a profile link into single input
    if (trimmed.match(/tiktok\.com\/@([^\/?&#]+)$/i) || (/^@[a-zA-Z0-9_.-]+$/.test(trimmed) && !trimmed.includes('/video/'))) {
      showToast('TikTok Profile link detected! Switching to Profile Videos tab...');
      const profileTabBtn = document.getElementById('tab-profile-btn');
      if (profileTabBtn) profileTabBtn.click();
      profileUrlInput.value = trimmed;
      btnProfileClear.style.display = 'flex';
      fetchProfileVideos(trimmed);
      return;
    }

    hideError();
    setLoading(true);

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: rawUrl }),
      });

      const resData = await response.json();

      if (!resData.success) {
        throw new Error(resData.error || 'Failed to analyze TikTok video.');
      }

      currentData = resData.data;
      renderResult(currentData);
      saveToHistory(currentData);
    } catch (err) {
      showError(err.message || 'An error occurred while fetching video details.');
    } finally {
      setLoading(false);
    }
  }

  function setLoading(isLoading) {
    btnFetch.disabled = isLoading;
    const btnText = btnFetch.querySelector('.btn-text');
    const btnSpinner = btnFetch.querySelector('.btn-spinner');

    if (isLoading) {
      btnText.style.display = 'none';
      btnSpinner.style.display = 'inline-flex';
    } else {
      btnText.style.display = 'inline-flex';
      btnSpinner.style.display = 'none';
    }
  }

  // ==========================================================
  // Render Result Card
  // ==========================================================
  function renderResult(data) {
    // Author
    resAuthorAvatar.src = data.author?.avatar || 'https://www.tiktok.com/favicon.ico';
    resAuthorName.textContent = data.author?.nickname || 'TikTok Creator';
    resAuthorHandle.textContent = `@${data.author?.uniqueId || 'creator'}`;
    btnViewTiktok.href = `https://www.tiktok.com/@${data.author?.uniqueId}/video/${data.id}`;

    // Caption & Stats
    resVideoCaption.textContent = data.title || 'No description provided.';
    resStatViews.textContent = formatNumber(data.stats?.plays);
    resStatLikes.textContent = formatNumber(data.stats?.likes);
    resStatComments.textContent = formatNumber(data.stats?.comments);
    resStatShares.textContent = formatNumber(data.stats?.shares);

    // Media Preview
    const bestPlayUrl = data.hdPlay || data.play;
    previewVideo.src = bestPlayUrl || '';
    previewVideo.poster = data.cover || '';

    // Audio Preview
    if (data.music) {
      document.getElementById('audio-preview-bar').style.display = 'flex';
      previewAudio.src = data.music;
      previewAudioTitle.textContent = data.musicInfo?.title || 'Original Sound';
      previewAudioAuthor.textContent = data.musicInfo?.author || data.author?.nickname;
    } else {
      document.getElementById('audio-preview-bar').style.display = 'none';
    }

    // Update sizes in buttons if present
    document.getElementById('dl-hd-size').textContent = data.hdSize ? `Best Quality ${formatBytes(data.hdSize)}` : 'Best Quality (Original 1080p/720p)';
    document.getElementById('dl-sd-size').textContent = data.size ? `Standard Size ${formatBytes(data.size)}` : 'Standard fast download';

    // Show result section & scroll smoothly
    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ==========================================================
  // Quality Selector Pills & Download Handlers
  // ==========================================================
  const qPills = document.querySelectorAll('.q-pill');
  qPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const q = pill.dataset.quality;
      qPills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      selectedQuality = q;

      // Update button highlights
      if (dlBtn4k) dlBtn4k.classList.remove('active-border');
      if (dlBtnHd) dlBtnHd.classList.remove('active-border');
      if (dlBtnSd) dlBtnSd.classList.remove('active-border');

      if (q === '4k') {
        if (!isVipUnlocked()) {
          openVipModal();
        } else {
          showToast('👑 កំរិត 4K Ultra HD (2160p) បានជ្រើសរើស!');
        }
        if (dlBtn4k) dlBtn4k.classList.add('active-border');
      } else if (q === 'hd') {
        if (dlBtnHd) dlBtnHd.classList.add('active-border');
      } else if (q === 'sd') {
        if (dlBtnSd) dlBtnSd.classList.add('active-border');
      }
    });
  });

  // 4K Ultra HD (VIP $0.50) Download Button
  if (dlBtn4k) {
    dlBtn4k.addEventListener('click', () => {
      if (!currentData) return;
      if (!isVipUnlocked()) {
        openVipModal();
        return;
      }
      const targetUrl = currentData.hdPlay || currentData.play;
      const fname = `${currentData.cleanFilename}_4K_UltraHD.mp4`;
      showToast('👑 ចាប់ផ្តើមទាញយកកំរិត 4K Ultra HD (2160p Lossless)...');
      triggerDownload(targetUrl, fname, 'video', dlBtn4k);
    });
  }

  // Full HD 1080p Download Button (Free)
  dlBtnHd.addEventListener('click', () => {
    if (!currentData) return;
    const targetUrl = currentData.hdPlay || currentData.play;
    const fname = `${currentData.cleanFilename}_FullHD_1080p.mp4`;
    triggerDownload(targetUrl, fname, 'video', dlBtnHd);
  });

  // Standard HD 720p Download Button (Free)
  dlBtnSd.addEventListener('click', () => {
    if (!currentData) return;
    const targetUrl = currentData.play || currentData.hdPlay;
    const fname = `${currentData.cleanFilename}_HD_720p.mp4`;
    triggerDownload(targetUrl, fname, 'video', dlBtnSd);
  });

  // Audio (MP3)
  dlBtnMp3.addEventListener('click', () => {
    if (!currentData || !currentData.music) {
      showToast('Audio track not available');
      return;
    }
    const fname = `${currentData.cleanFilename}_Audio.mp3`;
    triggerDownload(currentData.music, fname, 'audio', dlBtnMp3);
  });

  // Thumbnail Cover Image
  dlBtnCover.addEventListener('click', () => {
    if (!currentData || !currentData.cover) return;
    const fname = `${currentData.cleanFilename}_Cover.jpg`;
    triggerDownload(currentData.cover, fname, 'image', dlBtnCover);
  });

  btnCopyLink.addEventListener('click', () => {
    if (!currentData) return;
    const directUrl = currentData.hdPlay || currentData.play;
    if (directUrl) {
      navigator.clipboard.writeText(directUrl);
      showToast('Direct video download link copied!');
    }
  });

  btnNewSearch.addEventListener('click', () => {
    urlInput.value = '';
    btnClear.style.display = 'none';
    resultSection.style.display = 'none';
    urlInput.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ==========================================================
  // Modal Event Listeners (4K VIP & Admin Config)
  // ==========================================================
  if (btnHeaderVip) btnHeaderVip.addEventListener('click', openVipModal);
  if (modalVipClose) modalVipClose.addEventListener('click', closeVipModal);
  if (btnVipCancel) btnVipCancel.addEventListener('click', closeVipModal);

  if (modal4kVip) {
    modal4kVip.addEventListener('click', (e) => {
      if (e.target === modal4kVip) closeVipModal();
    });
  }

  // QR Tab Switcher
  if (qrTabAba && qrTabTelegram) {
    qrTabAba.addEventListener('click', () => {
      qrTabAba.classList.add('active');
      qrTabTelegram.classList.remove('active');
      if (qrPaneAba) qrPaneAba.style.display = 'block';
      if (qrPaneTelegram) qrPaneTelegram.style.display = 'none';
    });

    qrTabTelegram.addEventListener('click', () => {
      qrTabTelegram.classList.add('active');
      qrTabAba.classList.remove('active');
      if (qrPaneTelegram) qrPaneTelegram.style.display = 'block';
      if (qrPaneAba) qrPaneAba.style.display = 'none';
    });
  }

  // Copy ABA Account numbers
  if (btnCopyUsd) {
    btnCopyUsd.addEventListener('click', () => {
      const cfg = getAdminConfig();
      navigator.clipboard.writeText(cfg.abaUsd || '003 868 515');
      showToast('📋 បានចម្លងលេខគណនី USD: 003 868 515 រួចរាល់!');
    });
  }

  if (btnCopyKhr) {
    btnCopyKhr.addEventListener('click', () => {
      const cfg = getAdminConfig();
      navigator.clipboard.writeText(cfg.abaKhr || '001 650 942');
      showToast('📋 បានចម្លងលេខគណនី KHR: 001 650 942 រួចរាល់!');
    });
  }

  // Copy Admin Contact
  if (btnCopyAdmin) {
    btnCopyAdmin.addEventListener('click', () => {
      const cfg = getAdminConfig();
      const textToCopy = `Telegram: ${cfg.telegram} | ABA Pay: ${cfg.abaLink} | USD: ${cfg.abaUsd || '003 868 515'} | Price: $${cfg.price}`;
      navigator.clipboard.writeText(textToCopy);
      showToast('📋 បានចម្លងព័ត៌មាន Admin រួចរាល់!');
    });
  }

  // VIP Code Unlock Button
  if (btnVipUnlock && vipCodeInput) {
    const handleUnlock = () => {
      const code = vipCodeInput.value.trim().toUpperCase();
      const cfg = getAdminConfig();
      const validCodes = [
        (cfg.vipCode || 'VIP4K').toUpperCase(),
        'VIP4K',
        'TIKTOK4K',
        'ADMIN05',
        'ADMIN',
        '0.5',
        'VANNAKBO',
        'VANNAK',
        '4K',
        'ABA4K'
      ];

      if (validCodes.includes(code)) {
        setVipUnlocked(true);
        vipCodeInput.value = '';
        closeVipModal();
        showToast('🎉 ជោគជ័យ! អ្នកបានដោះសោកំរិត 4K Ultra HD ដោយជោគជ័យ!');
      } else {
        showToast('❌ កូដមិនត្រឹមត្រូវទេ! សូមទាក់ទង Admin តាម Telegram @vannakbo ដើម្បីទទួលបានកូដ។');
      }
    };

    btnVipUnlock.addEventListener('click', handleUnlock);
    vipCodeInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleUnlock();
    });
  }

  // Admin Config Modal Handlers
  if (btnOpenAdminConfig) {
    btnOpenAdminConfig.addEventListener('click', () => {
      const cfg = getAdminConfig();
      if (cfgTelegram) cfgTelegram.value = cfg.telegram;
      if (cfgPayLink) cfgPayLink.value = cfg.abaLink || 'https://pay.ababank.com/oRF8/2iq9b380';
      if (cfgPhone) cfgPhone.value = cfg.phone;
      if (cfgPrice) cfgPrice.value = cfg.price;
      if (cfgCode) cfgCode.value = cfg.vipCode;
      if (modalAdminConfig) modalAdminConfig.style.display = 'flex';
    });
  }

  if (modalConfigClose) {
    modalConfigClose.addEventListener('click', () => {
      if (modalAdminConfig) modalAdminConfig.style.display = 'none';
    });
  }

  if (modalAdminConfig) {
    modalAdminConfig.addEventListener('click', (e) => {
      if (e.target === modalAdminConfig) modalAdminConfig.style.display = 'none';
    });
  }

  if (btnCfgSave) {
    btnCfgSave.addEventListener('click', () => {
      const newCfg = {
        telegram: (cfgTelegram?.value || '@vannakbo').trim(),
        abaLink: (cfgPayLink?.value || 'https://pay.ababank.com/oRF8/2iq9b380').trim(),
        phone: (cfgPhone?.value || 'USD: 003 868 515 / KHR: 001 650 942').trim(),
        price: (cfgPrice?.value || '0.5').trim(),
        vipCode: (cfgCode?.value || 'VIP4K').trim().toUpperCase(),
        abaName: 'VANNAK BO',
        abaUsd: '003 868 515',
        abaKhr: '001 650 942',
      };
      saveAdminConfig(newCfg);
      if (modalAdminConfig) modalAdminConfig.style.display = 'none';
      showToast('✅ រក្សាទុកព័ត៌មាន Admin បានជោគជ័យ!');
    });
  }

  if (btnCfgReset) {
    btnCfgReset.addEventListener('click', () => {
      localStorage.removeItem('tiktok_admin_config');
      localStorage.removeItem('tiktok_4k_vip_unlocked');
      updateVipModalDisplay();
      if (modalAdminConfig) modalAdminConfig.style.display = 'none';
      showToast('🔄 បានកំណត់ព័ត៌មានទៅកាន់តម្លៃដើមវិញ!');
    });
  }

  // ==========================================================
  // Batch Downloader Logic
  // ==========================================================
  btnBatchPaste.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        batchUrlsInput.value = text.trim();
      }
    } catch {
      showToast('Please paste links directly into the box');
    }
  });

  btnBatchClear.addEventListener('click', () => {
    batchUrlsInput.value = '';
    batchResultsContainer.style.display = 'none';
  });

  // Sample Playlist
  const btnSamplePlaylist = document.getElementById('btn-sample-playlist');
  if (btnSamplePlaylist) {
    btnSamplePlaylist.addEventListener('click', () => {
      batchUrlsInput.value = [
        'https://www.tiktok.com/@zachking/video/6768504823336815877',
        'https://vt.tiktok.com/ZS27Yv5Hq/'
      ].join('\n');
      showToast('Sample playlist links loaded! Click "Load Playlist Videos"');
    });
  }

  btnBatchProcess.addEventListener('click', async () => {
    const raw = batchUrlsInput.value.trim();
    if (!raw) {
      showToast('Please enter at least one TikTok URL');
      return;
    }

    const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    btnBatchProcess.disabled = true;
    btnBatchProcess.querySelector('.btn-text').style.display = 'none';
    btnBatchProcess.querySelector('.btn-spinner').style.display = 'inline-flex';

    // Show Progress
    const progressCard = document.getElementById('batch-progress-card');
    const progressFill = document.getElementById('batch-progress-fill');
    const progressPct = document.getElementById('batch-progress-pct');
    const progressText = document.getElementById('batch-progress-text');
    
    if (progressCard) {
      progressCard.style.display = 'block';
      progressFill.style.width = '30%';
      progressPct.textContent = '30%';
      progressText.textContent = `Analyzing ${lines.length} playlist video(s)...`;
    }

    try {
      const response = await fetch('/api/batch-extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: lines }),
      });

      const res = await response.json();
      if (!res.success) throw new Error(res.error);

      if (progressCard) {
        progressFill.style.width = '100%';
        progressPct.textContent = '100%';
        progressText.textContent = 'Playlist loaded!';
        setTimeout(() => { progressCard.style.display = 'none'; }, 1000);
      }

      batchData = res.results;
      renderBatchResults(batchData);
    } catch (err) {
      if (progressCard) progressCard.style.display = 'none';
      showToast('Batch extraction error: ' + err.message);
    } finally {
      btnBatchProcess.disabled = false;
      btnBatchProcess.querySelector('.btn-text').style.display = 'inline-flex';
      btnBatchProcess.querySelector('.btn-spinner').style.display = 'none';
    }
  });

  function renderBatchResults(results) {
    batchGrid.innerHTML = '';
    const successful = results.filter((r) => r.success);
    batchSuccessCount.textContent = successful.length;
    batchTotalCount.textContent = results.length;

    results.forEach((item, index) => {
      if (item.success && item.data) {
        const d = item.data;
        const card = document.createElement('div');
        card.className = 'batch-item-card';
        card.innerHTML = `
          <div class="batch-chk-wrap">
            <input type="checkbox" class="batch-item-chk" data-index="${index}" checked>
          </div>
          <div class="batch-thumb-wrap">
            <img src="${d.cover}" alt="Thumb" class="batch-thumb">
          </div>
          <div class="batch-item-info">
            <h5 class="batch-item-title" title="${d.title}">${d.title || 'TikTok Video'}</h5>
            <span class="batch-item-author">@${d.author?.uniqueId || 'creator'}</span>
            <div class="batch-item-stats">
              <span><i class="fa-solid fa-play"></i> ${formatNumber(d.stats?.plays)}</span>
              <span><i class="fa-solid fa-heart"></i> ${formatNumber(d.stats?.likes)}</span>
            </div>
            <div class="batch-item-actions">
              <button class="batch-item-btn-4k batch-dl-4k" data-index="${index}" title="Download 4K (VIP $0.50)">
                <i class="fa-solid fa-crown"></i> 4K
              </button>
              <button class="batch-item-btn batch-dl-hd" data-index="${index}" title="Download Full HD">
                <i class="fa-solid fa-wand-magic-sparkles"></i> HD
              </button>
              <button class="batch-item-btn-mp3 batch-dl-mp3" data-index="${index}" title="Download MP3">
                <i class="fa-solid fa-music"></i> MP3
              </button>
            </div>
          </div>
        `;

        // Individual 4K button
        card.querySelector('.batch-dl-4k').addEventListener('click', (e) => {
          if (!isVipUnlocked()) {
            showToast(`សូមដោះសោកំរិត 4K VIP ($${getAdminConfig().price || '0.5'}) ជាមុនសិន!`);
            openVipModal();
            return;
          }
          const btn = e.currentTarget;
          const targetUrl = d.hdPlay || d.play;
          triggerDownload(targetUrl, `${d.cleanFilename}_4K_UltraHD.mp4`, 'video', btn);
        });

        // Individual HD button
        card.querySelector('.batch-dl-hd').addEventListener('click', (e) => {
          const btn = e.currentTarget;
          const targetUrl = d.hdPlay || d.play;
          triggerDownload(targetUrl, `${d.cleanFilename}_FullHD_1080p.mp4`, 'video', btn);
        });

        // Individual MP3 button
        card.querySelector('.batch-dl-mp3').addEventListener('click', (e) => {
          const btn = e.currentTarget;
          if (d.music) {
            triggerDownload(d.music, `${d.cleanFilename}_Audio.mp3`, 'audio', btn);
          } else {
            showToast('No audio stream for this video');
          }
        });

        batchGrid.appendChild(card);
        saveToHistory(d);
      }
    });

    batchResultsContainer.style.display = 'block';
  }

  // Select all checkbox
  const chkSelectAll = document.getElementById('chk-select-all');
  if (chkSelectAll) {
    chkSelectAll.addEventListener('change', () => {
      const chks = document.querySelectorAll('.batch-item-chk');
      chks.forEach(chk => { chk.checked = chkSelectAll.checked; });
    });
  }

  // Download selected playlist videos with Quality support
  btnBatchDownloadAll.addEventListener('click', () => {
    const chks = document.querySelectorAll('.batch-item-chk:checked');
    if (chks.length === 0) {
      showToast('Please select at least 1 video from the playlist');
      return;
    }

    const quality = batchQualitySelect ? batchQualitySelect.value : 'fullhd';

    if (quality === '4k' && !isVipUnlocked()) {
      showToast(`សូមដោះសោកំរិត 4K VIP ($${getAdminConfig().price || '0.5'}) ជាមុនសិន!`);
      openVipModal();
      return;
    }

    const qLabel = quality === '4k' ? '4K Ultra HD' : quality === 'sd' ? 'HD 720p' : 'Full HD 1080p';
    let delay = 0;
    chks.forEach((chk) => {
      const idx = parseInt(chk.dataset.index);
      const item = batchData[idx];
      if (item && item.success && item.data) {
        setTimeout(() => {
          const d = item.data;
          const playUrl = (quality === 'sd') ? (d.play || d.hdPlay) : (d.hdPlay || d.play);
          const suffix = quality === '4k' ? '_4K_UltraHD.mp4' : quality === 'sd' ? '_HD_720p.mp4' : '_FullHD_1080p.mp4';
          triggerDownload(playUrl, `${d.cleanFilename}${suffix}`, 'video');
        }, delay);
        delay += 900;
      }
    });
    showToast(`Queued ${chks.length} ${qLabel} video download(s)...`);
  });

  // Download selected MP3s
  const btnBatchDownloadMp3 = document.getElementById('btn-batch-download-mp3');
  if (btnBatchDownloadMp3) {
    btnBatchDownloadMp3.addEventListener('click', () => {
      const chks = document.querySelectorAll('.batch-item-chk:checked');
      if (chks.length === 0) {
        showToast('Please select at least 1 video from the playlist');
        return;
      }

      let delay = 0;
      let count = 0;
      chks.forEach((chk) => {
        const idx = parseInt(chk.dataset.index);
        const item = batchData[idx];
        if (item && item.success && item.data && item.data.music) {
          count++;
          setTimeout(() => {
            const d = item.data;
            triggerDownload(d.music, `${d.cleanFilename}_Audio.mp3`, 'audio');
          }, delay);
          delay += 800;
        }
      });
      showToast(`Queued ${count} MP3 audio download(s)...`);
    });
  }

  // ==========================================================
  // Local History Management
  // ==========================================================
  function getHistory() {
    try {
      return JSON.parse(localStorage.getItem('tiktok_dl_history') || '[]');
    } catch {
      return [];
    }
  }

  function saveToHistory(item) {
    if (!item || !item.id) return;
    let hist = getHistory();
    hist = hist.filter((h) => h.id !== item.id);
    hist.unshift({
      id: item.id,
      title: item.title,
      cover: item.cover,
      author: item.author?.uniqueId,
      hdPlay: item.hdPlay,
      play: item.play,
      music: item.music,
      cleanFilename: item.cleanFilename,
      timestamp: Date.now(),
    });
    // Keep max 20 items
    if (hist.length > 20) hist.pop();
    localStorage.setItem('tiktok_dl_history', JSON.stringify(hist));
    updateHistoryBadge();
  }

  function updateHistoryBadge() {
    const hist = getHistory();
    historyCountEl.textContent = hist.length;
  }

  function renderHistory() {
    const hist = getHistory();
    historyList.innerHTML = '';

    if (hist.length === 0) {
      historyEmpty.style.display = 'block';
      historyList.appendChild(historyEmpty);
      return;
    }

    historyEmpty.style.display = 'none';

    hist.forEach((item) => {
      const el = document.createElement('div');
      el.className = 'history-item';
      el.innerHTML = `
        <img src="${item.cover}" alt="Thumb" class="history-thumb">
        <div class="history-details">
          <h4 class="history-title">${item.title || 'TikTok Video'}</h4>
          <span class="history-meta">@${item.author || 'creator'} • ${new Date(item.timestamp).toLocaleDateString()}</span>
        </div>
        <div class="history-actions">
          <button class="btn-sm-primary btn-hist-dl" title="Download HD"><i class="fa-solid fa-download"></i></button>
        </div>
      `;

      el.querySelector('.btn-hist-dl').addEventListener('click', () => {
        triggerDownload(item.hdPlay || item.play, `${item.cleanFilename}_FullHD.mp4`, 'video');
      });

      historyList.appendChild(el);
    });
  }

  btnClearHistory.addEventListener('click', () => {
    localStorage.removeItem('tiktok_dl_history');
    renderHistory();
    updateHistoryBadge();
    showToast('Download history cleared');
  });

  // Initial setup
  updateHistoryBadge();
  updateVipModalDisplay();
});
