// === ROUTING ===
function handleRoute() {
  const path = window.location.pathname;
  
  // Halaman Utama / Skin
  if (path === '/' || path === '/index.html') {
    showPage('skins');
    return;
  }
  
  // Halaman Skin
  if (path.startsWith('/skin')) {
    showPage('skins');
    if (path === '/skin-cowok') setSkinFilter('cowok');
    else if (path === '/skin-cewek') setSkinFilter('cewek');
    else if (path === '/skin-pvp') setSkinFilter('pvp');
    else if (path === '/skin-template') setSkinFilter('template');
    else if (path === '/skin-pack') setSkinFilter('pack');
    return;
  }
  
  // Halaman Addon
  if (path.startsWith('/addon')) {
    showPage('addons');
    if (path === '/addon') setAddonFilter('all');
    else if (path === '/addon-item') setAddonFilter('addon');
    else if (path === '/addon-pack') setAddonFilter('pack');
    else if (path === '/addon-shader') setAddonFilter('shader');
    else if (path === '/addon-ui') setAddonFilter('ui');
    else if (path === '/addon-lain') setAddonFilter('lain');
    return;
  }
  
  // Halaman Game
  if (path === '/game' || path.startsWith('/game-')) {
    showPage('games');
    return;
  }
}

function showPage(pageName) {
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  document.querySelector(`.nav-item[data-page="${pageName}"]`)?.classList.add('active');
  
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`${pageName}Page`).classList.add('active');
}

function setSkinFilter(cat) {
  document.querySelectorAll('#skinFilters .filter-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`#skinFilters .filter-btn[data-cat="${cat}"]`)?.classList.add('active');
  currentSkinFilter = cat;
  renderSkins();
}

function setAddonFilter(cat) {
  document.querySelectorAll('#addonFilters .filter-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`#addonFilters .filter-btn[data-cat="${cat}"]`)?.classList.add('active');
  currentAddonFilter = cat;
  renderAddons();
}

// Jalankan saat halaman dimuat
document.addEventListener('DOMContentLoaded', handleRoute);
window.addEventListener('popstate', handleRoute);

// === DATA ===
let skins = [];
let addons = [];
let games = [];
let currentSkinFilter = 'all';
let currentAddonFilter = 'all';

// === MUAT SEMUA DATA ===
Promise.all([
  fetch('skins.json').then(r => r.json()),
  fetch('addons.json').then(r => r.json()),
  fetch('games.json').then(r => r.json())
])
.then(([skinData, addonData, gameData]) => {
  skins = skinData;
  addons = addonData;
  games = gameData;
  
  document.getElementById('totalSkin').textContent = skins.length;
  document.getElementById('totalAddon').textContent = addons.length;
  
  renderSkins();
  renderAddons();
  renderGames();
})
.catch(err => console.error('Gagal memuat data:', err));

// === RENDER SKIN ===
function renderSkins() {
  const grid = document.getElementById('skinGrid');
  const filtered = currentSkinFilter === 'all' 
    ? skins 
    : skins.filter(s => s.kategori === currentSkinFilter);
  
  grid.innerHTML = filtered.map(item => `
  <div class="skin-card">
    <img src="${item.gambar}" alt="${item.tag}" class="skin-image" loading="lazy">
    <h3 class="skin-title">${item.tag}</h3>
    <div class="skin-buttons">
      <button class="btn btn-secondary" data-preview="${item.gambar}" data-title="${item.tag}">Preview</button>
      <a href="${item.link_download}" target="_blank" class="btn btn-primary">Unduh</a>
      <button class="btn btn-secondary" onclick="shareToWhatsApp('${item.tag}', window.location.href)">📤</button>
    </div>
  </div>
`).join('');

  
  attachPreviewEvents();
}

// === RENDER ADDON ===
function renderAddons() {
  const grid = document.getElementById('addonGrid');
  const filtered = currentAddonFilter === 'all' 
    ? addons 
    : addons.filter(a => a.kategori === currentAddonFilter);
  
  grid.innerHTML = filtered.map(item => `
  <div class="addon-card">
    <div class="addon-image-wrapper">
      ${item.gambar 
        ? `<img src="${item.gambar}" alt="${item.nama}" class="addon-image" loading="lazy">`
        : `<span style="font-size:2rem;color:var(--text-alt)">📦</span>`
      }
    </div>
    <h3 class="addon-title">${item.nama}</h3>
    ${item.deskripsi ? `<p class="addon-desc">${item.deskripsi}</p>` : ''}
    ${item.versi_mc ? `<div class="addon-meta"><span class="meta-tag">MC: ${item.versi_mc}</span></div>` : ''}
    <a href="${item.link_download || '#'}" target="_blank" class="btn btn-primary" style="width:100%;margin-bottom:8px">Unduh</a>
    <button class="btn btn-secondary" style="width:100%" onclick="shareToWhatsApp('${item.nama}', window.location.href)">📤 Bagikan ke WhatsApp</button>
  </div>
`).join('');
}

// === RENDER GAME — DENGAN IFRAME PREVIEW ===
function renderGames() {
  const grid = document.getElementById('gameGrid');
  grid.innerHTML = games.map(item => `
    <div class="game-card">
      <h3 class="game-title">${item.nama}</h3>
      <p class="game-desc">${item.deskripsi}</p>
      <div class="game-iframe-container">
        <iframe src="${item.link}" title="${item.nama}" loading="lazy"
          sandbox="allow-same-origin allow-scripts"></iframe>
      </div>
      <div class="game-links">
        <a href="${item.link}" target="_blank" class="btn btn-primary">Buka Penuh</a>
        <a href="${item.link}" target="_blank" class="btn btn-secondary btn-small">Tab Baru</a>
      </div>
    </div>
  `).join('');
}

// === PREVIEW MODAL ===
const modal = document.getElementById('previewModal');
const modalTitle = document.getElementById('modalTitle');
const modalImage = document.getElementById('modalImage');
const modalClose = document.getElementById('modalClose');

function attachPreviewEvents() {
  document.querySelectorAll('[data-preview]').forEach(btn => {
    btn.addEventListener('click', () => {
      modalTitle.textContent = btn.dataset.title;
      modalImage.src = btn.dataset.preview;
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });
}

modalClose.addEventListener('click', () => {
  modal.classList.remove('active');
  document.body.style.overflow = '';
  modalImage.src = '';
  modalTitle.textContent = '';
});

modal.addEventListener('click', (e) => {
  if (e.target === modal) modalClose.click();
});

// === NAVIGASI BAWAH ===
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    
    const page = item.dataset.page;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`${page}Page`).classList.add('active');
  });
});

// === FILTER SKIN ===
document.addEventListener('click', (e) => {
  if (e.target.matches('#skinFilters .filter-btn')) {
    document.querySelectorAll('#skinFilters .filter-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    currentSkinFilter = e.target.dataset.cat;
    renderSkins();
  }
});

// === FILTER ADDON ===
document.addEventListener('click', (e) => {
  if (e.target.matches('#addonFilters .filter-btn')) {
    document.querySelectorAll('#addonFilters .filter-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    currentAddonFilter = e.target.dataset.cat;
    renderAddons();
  }
});

// === MENU TEMA ===
const menuToggle = document.getElementById('menuToggle');
const themeMenu = document.getElementById('themeMenu');

menuToggle.addEventListener('click', () => {
  themeMenu.classList.toggle('active');
});

themeMenu.addEventListener('click', (e) => {
  if (e.target === themeMenu) themeMenu.classList.remove('active');
});

document.querySelectorAll('.theme-option').forEach(btn => {
  btn.addEventListener('click', () => {
    const theme = btn.dataset.theme;
    if (theme === 'default') {
      document.documentElement.removeAttribute('data-theme');
      localStorage.removeItem('theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    }
    themeMenu.classList.remove('active');
  });
});

// === MUAT TEMA YANG DISIMPAN ===
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  document.documentElement.setAttribute('data-theme', savedTheme);

// === BAGIKAN KE WHATSAPP ===
function shareToWhatsApp(judul, link) {
  const pesan = encodeURIComponent(`Hai! Lihat nih ${judul} di ArpiMC Zone 😍\n${link}`);
  window.open(`https://wa.me/?text=${pesan}`, '_blank');
}
