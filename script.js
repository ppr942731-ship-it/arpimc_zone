// === DATA ===
let allSkins = [];
let allAddons = [];
let allGames = [];

// === ELEMEN ===
const pageSkins = document.getElementById('skinsPage');
const pageAddons = document.getElementById('addonsPage');
const pageGames = document.getElementById('gamesPage');

const navBtns = document.querySelectorAll('.bottom-nav button');
const filterSkinBtns = document.querySelectorAll('#skinFilters button');
const filterAddonBtns = document.querySelectorAll('#addonFilters button');

const skinGrid = document.getElementById('skinGrid');
const addonGrid = document.getElementById('addonGrid');
const gameGrid = document.getElementById('gameGrid');

const totalSkinEl = document.getElementById('totalSkin');
const totalAddonEl = document.getElementById('totalAddon');

const themeBtn = document.getElementById('themeBtn');
const themeMenu = document.getElementById('themeMenu');
const themeOptions = document.querySelectorAll('.theme-menu button');

const previewModal = document.getElementById('previewModal');
const modalTitle = document.getElementById('modalTitle');
const modalImage = document.getElementById('modalImage');
const modalClose = document.getElementById('modalClose');

// === NAVIGASI ===
navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const targetPage = btn.dataset.page;
    // Ganti halaman
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`${targetPage}Page`).classList.add('active');
    // Ganti status tombol aktif
    navBtns.forEach(b => b.classList.remove('nav-active'));
    btn.classList.add('nav-active');
  });
});

// === FILTER SKIN ===
let currentSkinFilter = 'all';

filterSkinBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterSkinBtns.forEach(b => b.classList.remove('filter-active'));
    btn.classList.add('filter-active');
    currentSkinFilter = btn.dataset.cat;
    renderSkins();
  });
});

// === FILTER ADDON ===
let currentAddonFilter = 'all';

filterAddonBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterAddonBtns.forEach(b => b.classList.remove('filter-active'));
    btn.classList.add('filter-active');
    currentAddonFilter = btn.dataset.cat;
    renderAddons();
  });
});

// === FUNGSI RENDER SKIN ===
function renderSkins() {
  let filtered = allSkins;
  if (currentSkinFilter !== 'all') {
    filtered = allSkins.filter(s => s.kategori === currentSkinFilter);
  }
  
  skinGrid.innerHTML = filtered.map(skin => `
    <div class="skin-card">
      <img src="${skin.gambar}" alt="${skin.tag}" loading="lazy">
      <h3>${skin.tag}</h3>
      <div class="skin-buttons">
        <button class="btn btn-secondary" onclick="openPreview('${skin.gambar}', '${skin.tag}')">Preview</button>
        <a href="${skin.link_download}" target="_blank" class="btn btn-primary">Unduh</a>
      </div>
    </div>
  `).join('');
  
  totalSkinEl.textContent = allSkins.length;
}

// === FUNGSI RENDER ADDON ===
function renderAddons() {
  let filtered = allAddons;
  if (currentAddonFilter !== 'all') {
    filtered = allAddons.filter(a => a.kategori === currentAddonFilter);
  }
  
  addonGrid.innerHTML = filtered.map(addon => `
    <div class="addon-card">
      <div class="addon-img-wrapper">
        <img src="${addon.gambar}" alt="${addon.nama}" loading="lazy">
      </div>
      <h3>${addon.nama}</h3>
      <p class="addon-desc">${addon.deskripsi || ''}</p>
      <div class="addon-buttons">
        <button class="btn btn-secondary" onclick="openPreview('${addon.gambar}', '${addon.nama}')">Preview</button>
        <a href="${addon.link_download}" target="_blank" class="btn btn-primary">Unduh</a>
      </div>
    </div>
  `).join('');
  
  totalAddonEl.textContent = allAddons.length;
}

// === FUNGSI RENDER GAME ===
function renderGames() {
  gameGrid.innerHTML = allGames.map(game => `
    <div class="game-card">
      <h3>${game.nama}</h3>
      <p class="game-desc">${game.deskripsi}</p>
      <div class="game-iframe">
        <iframe src="${game.link}" title="${game.nama}" allowfullscreen loading="lazy"></iframe>
      </div>
      <div class="game-links">
        <a href="${game.link}" target="_blank" class="btn btn-primary">Buka Penuh</a>
      </div>
    </div>
  `).join('');
}

// === MODAL PREVIEW ===
function openPreview(src, title) {
  modalImage.src = src;
  modalTitle.textContent = title;
  previewModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

modalClose.addEventListener('click', () => {
  previewModal.classList.remove('active');
  document.body.style.overflow = '';
});

previewModal.addEventListener('click', (e) => {
  if (e.target === previewModal) {
    previewModal.classList.remove('active');
    document.body.style.overflow = '';
  }
});

// === PILIH TEMA ===
themeBtn.addEventListener('click', () => {
  themeMenu.classList.toggle('active');
});

themeOptions.forEach(option => {
  option.addEventListener('click', () => {
    const theme = option.dataset.theme;
    if (theme === 'default') {
      document.documentElement.removeAttribute('data-theme');
      localStorage.removeItem('site-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('site-theme', theme);
    }
    themeMenu.classList.remove('active');
  });
});

// Tutup menu tema kalau klik di luar
document.addEventListener('click', (e) => {
  if (!themeBtn.contains(e.target) && !themeMenu.contains(e.target)) {
    themeMenu.classList.remove('active');
  }
});

// Muat tema tersimpan
const savedTheme = localStorage.getItem('site-theme');
if (savedTheme) {
  document.documentElement.setAttribute('data-theme', savedTheme);
}

// === MUAT DATA DARI JSON ===
async function loadData() {
  try {
    const [skinsRes, addonsRes, gamesRes] = await Promise.all([
      fetch('skins.json'),
      fetch('addons.json'),
      fetch('games.json')
    ]);
    
    allSkins = await skinsRes.json();
    allAddons = await addonsRes.json();
    allGames = await gamesRes.json();
    
    renderSkins();
    renderAddons();
    renderGames();
    
  } catch (err) {
    console.error('Gagal memuat data:', err);
  }
}

// Jalankan saat halaman siap
document.addEventListener('DOMContentLoaded', loadData);
