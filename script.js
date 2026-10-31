/* =============================================
   === ARPIMC ZONE — SCRIPT.JS ===
   === ID-based Link + Fullscreen Modal + Share Preview ===
   ============================================= */

let allSkins = [];
let allAddons = [];
let allGames = [];
let currentFilter = 'all';
let currentAddonFilter = 'all';

// =============================================
// === MUAT DATA DARI JSON ===
// =============================================
async function loadAllData() {
  try {
    const [skinsRes, addonsRes, gamesRes] = await Promise.all([
      fetch('skins.json'),
      fetch('addons.json'),
      fetch('games.json')
    ]);

    allSkins = await skinsRes.json();
    allAddons = await addonsRes.json();
    allGames = await gamesRes.json();

    document.getElementById('totalSkin').textContent = allSkins.length;
    
    renderSkins();
    renderAddons();
    renderGames();
    
    checkIdFromURL();
  } catch (err) {
    console.error('Gagal memuat data:', err);
  }
}

// =============================================
// === BACA ID DARI LINK & BUKA MODAL OTOMATIS ===
// =============================================
function checkIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  const skinId = params.get('id');
  
  if (skinId !== null) {
    const id = parseInt(skinId);
    const skin = allSkins.find(s => s.id === id);
    if (skin) {
      bukaModalSkinFull(skin);
      updateMetaShare(skin);
    }
  }
}

// =============================================
// === UPDATE META UNTUK PREVIEW SHARE ===
// =============================================
function updateMetaShare(skin) {
  const baseUrl = window.location.origin + window.location.pathname;
  const shareUrl = `${baseUrl}?id=${skin.id}`;
  
  let ogTitle = document.querySelector('meta[property="og:title"]');
  let ogDesc = document.querySelector('meta[property="og:description"]');
  let ogImage = document.querySelector('meta[property="og:image"]');
  let ogUrl = document.querySelector('meta[property="og:url"]');
  
  if (!ogTitle) {
    ogTitle = document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    document.head.appendChild(ogTitle);
  }
  if (!ogDesc) {
    ogDesc = document.createElement('meta');
    ogDesc.setAttribute('property', 'og:description');
    document.head.appendChild(ogDesc);
  }
  if (!ogImage) {
    ogImage = document.createElement('meta');
    ogImage.setAttribute('property', 'og:image');
    document.head.appendChild(ogImage);
  }
  if (!ogUrl) {
    ogUrl = document.createElement('meta');
    ogUrl.setAttribute('property', 'og:url');
    document.head.appendChild(ogUrl);
  }
  
  ogTitle.setAttribute('content', skin.tag);
  ogDesc.setAttribute('content', skin.deskripsi || 'Unduh gratis di ArpiMC Zone');
  ogImage.setAttribute('content', skin.gambar);
  ogUrl.setAttribute('content', shareUrl);
  
  document.title = `${skin.tag} | ArpiMC Zone`;
}

// =============================================
// === RENDER KARTU SKIN — TIDAK ADA UNDEFINED ===
// =============================================
function renderSkins() {
  const container = document.getElementById('skinContent');
  let filtered = allSkins;

  if (currentFilter !== 'all') {
    filtered = allSkins.filter(skin => skin.kategori === currentFilter);
  }

  if (filtered.length === 0) {
    container.innerHTML = '<p class="loading-text">Skin tidak ditemukan</p>';
    return;
  }

  container.innerHTML = filtered.map(skin => `
    <div class="skin-card">
      <div class="card-image-wrapper" onclick='bukaModalSkinFull(${JSON.stringify(skin).replace(/'/g, "\\'").replace(/"/g, '&quot;')})'>
        <img src="${skin.gambar}" alt="${skin.tag}" loading="lazy">
      </div>
      <div class="card-body">
        <h3 class="card-title">${skin.tag}</h3>
        <div class="card-buttons">
          <button class="card-btn preview" onclick='bukaModalSkinFull(${JSON.stringify(skin).replace(/'/g, "\\'").replace(/"/g, '&quot;')})'>Preview</button>
          <a href="${skin.link_download}" target="_blank" class="card-btn download">Unduh</a>
        </div>
      </div>
    </div>
  `).join('');
}

// =============================================
// === MODAL PREVIEW SKIN — LAYAR PENUH SEPERTI GAME ===
// =============================================
function bukaModalSkinFull(skin) {
  const modal = document.getElementById('skinFullModal');
  const body = document.getElementById('skinFullBody');
  const baseUrl = window.location.origin + window.location.pathname;
  const shareUrl = `${baseUrl}?id=${skin.id}`;
  
  history.replaceState(null, '', shareUrl);
  updateMetaShare(skin);
  
  body.innerHTML = `
    <img src="${skin.gambar}" alt="${skin.tag}" loading="lazy">
  `;
  
  document.getElementById('skinFullName').textContent = skin.tag;
  document.getElementById('skinFullDesc').innerHTML = `
    ${skin.deskripsi || 'Credit: Pemilik asli'}<br>
    📅 ${skin.tanggal_upload || 'Tanggal tidak diketahui'}
  `;
  document.getElementById('skinFullDownload').href = skin.link_download;
  
  // Tombol Salin
  document.getElementById('skinFullCopy').onclick = async () => {
    const teks = `${skin.tag}\n👉 ${shareUrl}`;
    try {
      await navigator.clipboard.writeText(teks);
      alert('✅ Link disalin!');
    } catch {
      alert('❌ Gagal menyalin');
    }
  };
  
  // Tombol Bagikan WA
  document.getElementById('skinFullWA').onclick = () => {
    const teks = encodeURIComponent(`✨ ${skin.tag}\n👉 ${shareUrl}`);
    window.open(`https://wa.me/?text=${teks}`, '_blank');
  };
  
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}


// =============================================
// === BAGIKAN LINK KE WHATSAPP / SALIN ===
// =============================================
async function bagikanLink(id, tag) {
  const baseUrl = window.location.origin + window.location.pathname;
  const shareUrl = `${baseUrl}?id=${id}`;
  
  const teks = `✨ ${tag}

👉 Unduh di sini: ${shareUrl}

📦 Dari ArpiMC Zone — Koleksi Skin & Addon Minecraft Gratis`;

  try {
    if (navigator.share) {
      await navigator.share({
        title: tag,
        text: teks,
        url: shareUrl
      });
    } else {
      await navigator.clipboard.writeText(teks);
      alert('✅ Link disalin!\n\n' + teks);
    }
  } catch (err) {
    await navigator.clipboard.writeText(teks).catch(() => {});
    alert('✅ Link disalin ke papan klip!');
  }
}

// =============================================
// === RENDER ADDON ===
// =============================================
function renderAddons() {
  const container = document.getElementById('addonContent');
  let filtered = allAddons;

  if (currentAddonFilter !== 'all') {
    filtered = allAddons.filter(addon => addon.kategori === currentAddonFilter);
  }

  if (filtered.length === 0) {
    container.innerHTML = '<p class="loading-text">Addon tidak ditemukan</p>';
    return;
  }

  container.innerHTML = filtered.map(addon => `
    <div class="addon-card">
      <div class="card-image-landscape">
        <img src="${addon.gambar}" alt="${addon.nama || addon.tag}" loading="lazy">
      </div>
      <div class="card-body">
        <h3 class="card-title">${addon.nama || addon.tag}</h3>
        <div class="card-buttons">
          <a href="${addon.link_download || addon.link}" target="_blank" class="card-btn download">Unduh</a>
        </div>
      </div>
    </div>
  `).join('');
}

// =============================================
// === RENDER GAME ===
// =============================================
function renderGames() {
  const container = document.getElementById('gameContent');
  
  if (allGames.length === 0) {
    container.innerHTML = '<p class="loading-text">Game belum tersedia</p>';
    return;
  }

  container.innerHTML = allGames.map(game => `
    <div class="game-card" onclick="bukaGameFull('${game.link}', '${game.nama || game.tag}')">
      <div class="card-image-wrapper">
        <img src="${game.gambar}" alt="${game.nama || game.tag}" loading="lazy">
      </div>
      <div class="card-body">
        <h3 class="card-title">${game.nama || game.tag}</h3>
        <button class="card-btn download">▶ Buka Game</button>
      </div>
    </div>
  `).join('');
}

// =============================================
// === MODAL GAME FULL SCREEN ===
// =============================================
function bukaGameFull(link, nama) {
  const modal = document.getElementById('gameFullModal');
  const iframe = document.getElementById('gameIframeFull');
  const tabBtn = document.getElementById('gameOpenTabBtn');
  
  iframe.src = link;
  tabBtn.href = link;
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function tutupGameFull() {
  const modal = document.getElementById('gameFullModal');
  const iframe = document.getElementById('gameIframeFull');
  modal.classList.add('hidden');
  iframe.src = '';
  document.body.style.overflow = '';
}

// =============================================
// === NAVIGASI BAWAH ===
// =============================================
function setupNavigation() {
  const navTabs = document.querySelectorAll('.bottom-nav-item');
  const pages = document.querySelectorAll('.page-section');

  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetPage = tab.getAttribute('data-page');
      
      navTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      pages.forEach(page => {
        page.classList.remove('active');
        if (page.id === `page-${targetPage}`) {
          page.classList.add('active');
        }
      });
      
      tutupModalSkinFull();
      tutupGameFull();
    });
  });
}

// =============================================
// === FILTER KATEGORI ===
// =============================================
function setupSkinFilter() {
  const filterTabs = document.querySelectorAll('#page-skin .filter-tab');
  
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.getAttribute('data-filter');
      renderSkins();
    });
  });
}

function setupAddonFilter() {
  const filterTabs = document.querySelectorAll('#page-addon .filter-tab');
  
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentAddonFilter = tab.getAttribute('data-filter');
      renderAddons();
    });
  });
}

// =============================================
// === TEMA ===
// =============================================
function setupThemes() {
  const savedTheme = localStorage.getItem('arpimc-theme') || 'default';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  const themeBtn = document.getElementById('themeToggle');
  const themePanel = document.getElementById('themePanel');
  const closePanel = document.getElementById('closeThemePanel');
  const themeOptions = document.querySelectorAll('.theme-option');
  
  themeBtn.addEventListener('click', () => {
    themePanel.classList.toggle('hidden');
  });
  
  closePanel.addEventListener('click', () => {
    themePanel.classList.add('hidden');
  });
  
  themeOptions.forEach(option => {
    option.addEventListener('click', () => {
      const theme = option.getAttribute('data-theme');
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('arpimc-theme', theme);
      themePanel.classList.add('hidden');
    });
  });
}

// =============================================
// === PWA ===
// =============================================
let deferredPrompt;
function setupPWA() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
  });
}

// =============================================
// === INISIALISASI ===
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupSkinFilter();
  setupAddonFilter();
  setupThemes();
  setupPWA();
  loadAllData();
});
