/* =============================================
   === ARPIMC ZONE — SCRIPT.JS ===
   === Garis Pembatas Bagian Mudah Diedit ===
   ============================================= */

// =============================================
// === BAGIAN: VARIABEL & DATA GLOBAL ===
// =============================================
let allSkins = [];
let allAddons = [];
let allGames = [];
let currentFilter = 'all';
let currentAddonFilter = 'all';
let currentGameSubPage = 'games';

// =============================================
// === BAGIAN: MUAT DATA DARI FILE JSON ===
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
    
    checkSlugFromURL();
  } catch (err) {
    console.error('Gagal memuat data:', err);
  }
}

// =============================================
// === BAGIAN: BACA SLUG DARI LINK & BUKA DETAIL ===
// =============================================
function checkSlugFromURL() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  
  if (slug) {
    const skin = allSkins.find(s => s.slug === slug);
    if (skin) {
      bukaModalDetailSkin(skin);
      updateOGImage(skin.gambar);
    }
  }
}

// =============================================
// === BAGIAN: UPDATE GAMBAR PRATINJAU SOSMED/WA ===
// =============================================
function updateOGImage(imageUrl) {
  let ogImage = document.querySelector('meta[property="og:image"]');
  if (!ogImage) {
    ogImage = document.createElement('meta');
    ogImage.setAttribute('property', 'og:image');
    document.head.appendChild(ogImage);
  }
  ogImage.setAttribute('content', imageUrl);
}

// =============================================
// === BAGIAN: RENDER KARTU SKIN ===
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
    <div class="skin-card" data-slug="${skin.slug}" onclick="bukaModalDetailSkin(${JSON.stringify(skin).replace(/"/g, '&quot;')})">
      <div class="card-image-wrapper">
        <img src="${skin.gambar}" alt="${skin.tag}" loading="lazy">
      </div>
      <div class="card-body">
        <h3 class="card-title">${skin.tag}</h3>
        <div class="card-buttons">
          <button class="card-btn preview" onclick="event.stopPropagation(); bukaModalDetailSkin(${JSON.stringify(skin).replace(/"/g, '&quot;')})">Preview</button>
          <a href="${skin.link_download}" target="_blank" class="card-btn download" onclick="event.stopPropagation();">Unduh</a>
        </div>
      </div>
    </div>
  `).join('');
}

// =============================================
// === BAGIAN: MODAL DETAIL SKIN ===
// =============================================
function bukaModalDetailSkin(skin) {
  const modal = document.getElementById('skinDetailModal');
  const body = document.getElementById('skinDetailBody');
  
  body.innerHTML = `
    <img src="${skin.gambar}" alt="${skin.tag}" class="modal-skin-img">
    <h2 class="modal-skin-name">${skin.tag}</h2>
    <div class="modal-skin-meta">
      ${skin.deskripsi || 'Credit: Pemilik asli'}<br>
      📅 ${skin.tanggal_upload || 'Tanpa tanggal'}
      ${skin.slug ? `<br>🔗 ID: ${skin.slug}` : ''}
    </div>
    <div class="modal-actions">
      <a href="${skin.link_download}" target="_blank" class="modal-btn download">⬇️ Unduh Skin</a>
      <button class="modal-btn share" onclick="bagikanSkin('${skin.slug || ''}', '${skin.tag}')">🔗 Bagikan Link</button>
    </div>
  `;
  
  modal.classList.remove('hidden');
  updateOGImage(skin.gambar);
}

function tutupModalSkin() {
  document.getElementById('skinDetailModal').classList.add('hidden');
}

// =============================================
// === BAGIAN: BAGIKAN LINK SKIN KE SOSMED/WA ===
// =============================================
async function bagikanSkin(slug, nama) {
  const baseUrl = window.location.origin + window.location.pathname;
  const shareUrl = slug ? `${baseUrl}?slug=${slug}` : baseUrl;
  const text = `${nama}\n👉 ${shareUrl}`;

  try {
    if (navigator.share) {
      await navigator.share({
        title: nama,
        text: text,
        url: shareUrl
      });
    } else {
      await navigator.clipboard.writeText(text);
      alert('✅ Link disalin!\n\n' + text);
    }
  } catch (err) {
    await navigator.clipboard.writeText(text).catch(() => {});
    alert('✅ Link disalin ke papan klip!');
  }
}

// =============================================
// === BAGIAN: RENDER KARTU ADDON ===
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
// === BAGIAN: RENDER KARTU GAME ===
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
// === BAGIAN: MODAL GAME FULL SCREEN ===
// =============================================
function bukaGameFull(link, nama) {
  const modal = document.getElementById('gameFullModal');
  const iframe = document.getElementById('gameIframeFull');
  const tabBtn = document.getElementById('gameOpenTabBtn');
  
  iframe.src = link;
  tabBtn.href = link;
  modal.classList.remove('hidden');
}

function tutupGameFull() {
  const modal = document.getElementById('gameFullModal');
  const iframe = document.getElementById('gameIframeFull');
  modal.classList.add('hidden');
  iframe.src = '';
}

// =============================================
// === BAGIAN: NAVIGASI HALAMAN ===
// =============================================
function setupNavigation() {
  const navTabs = document.querySelectorAll('.nav-tab');
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
    });
  });
}

// =============================================
// === BAGIAN: FILTER KATEGORI SKIN ===
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

// =============================================
// === BAGIAN: FILTER KATEGORI ADDON ===
// =============================================
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
// === BAGIAN: SUB-TAB GAME ===
// =============================================
function setupGameSubTabs() {
  const subTabs = document.querySelectorAll('#gameSubTabs .filter-tab');
  
  subTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      subTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentGameSubPage = tab.getAttribute('data-subpage');
      renderGames();
    });
  });
}

// =============================================
// === BAGIAN: SISTEM TEMA ===
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
// === BAGIAN: INISIALISASI PWA / INSTAL APLIKASI ===
// =============================================
let deferredPrompt;

function setupPWA() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('✅ Aplikasi siap untuk dipasang');
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    console.log('✅ Aplikasi berhasil dipasang');
  });
}

// =============================================
// === BAGIAN: KLIK DI LUAR MODAL ===
// =============================================
function setupModalClose() {
  const skinModal = document.getElementById('skinDetailModal');
  
  document.getElementById('closeSkinModal').addEventListener('click', tutupModalSkin);
  
  skinModal.addEventListener('click', (e) => {
    if (e.target === skinModal) tutupModalSkin();
  });
  
  document.getElementById('gameCloseBtn').addEventListener('click', tutupGameFull);
}

// =============================================
// === BAGIAN: MULAI SEMUA SAAT HALAMAN DIBUKA ===
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupSkinFilter();
  setupAddonFilter();
  setupGameSubTabs();
  setupThemes();
  setupModalClose();
  setupPWA();
  loadAllData();
});
