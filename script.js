// ========================================
// ARPIMC ZONE — SCRIPT.JS
// ========================================

// ---------- DATA GLOBAL ----------
let allSkins = [];
let allAddons = [];
let allGames = [];
let allCouples = [];
let allSkinJJ = [];
let siteData = {};
let currentPage = 'skins';
let currentSkinFilter = 'all';
let currentAddonFilter = 'all';
let currentGameSubpage = 'games';
let currentGalleryImages = [];
let currentGalleryIndex = 0;

// ---------- INISIALISASI SAAT HALAMAN DIMUAT ----------
document.addEventListener('DOMContentLoaded', initApp);

async function initApp() {
  await loadAllData();
  setupThemes();
  setupNavigation();
  setupInfoTabs();
  renderSkins();
  renderAddons();
  renderGames();
  renderCouples();
  renderSkinJJ();
  updateStats();
}

// ---------- MUAT SEMUA DATA JSON ----------
async function loadAllData() {
  try {
    const [skinsRes, addonsRes, gamesRes, couplesRes, skinjjRes, dataRes] = await Promise.all([
      fetch('skins.json'),
      fetch('addons.json'),
      fetch('games.json'),
      fetch('couple.json'),
      fetch('skinjj.json'),
      fetch('data.json')
    ]);

    allSkins = await skinsRes.json();
    allAddons = await addonsRes.json();
    allGames = await gamesRes.json();
    try { allCouples = await couplesRes.json(); } catch(e) { allCouples = []; }
    try { allSkinJJ = await skinjjRes.json(); } catch(e) { allSkinJJ = []; }
    siteData = await dataRes.json();
    
    renderInfoPage();
  } catch (err) {
    console.error('Gagal memuat data:', err);
    showToast('⚠️ Beberapa data belum tersedia');
  }
}

// ---------- SISTEM TEMA ----------
function setupThemes() {
  const savedTheme = localStorage.getItem('arpi_theme') || 'default';
  document.documentElement.setAttribute('data-theme', savedTheme);

  const themeBtn = document.querySelector('.theme-toggle-btn');
  const sidebar = document.getElementById('themeSidebar');
  const overlay = document.getElementById('themeOverlay');
  const closeBtn = document.getElementById('closeThemeSidebar');
  const themeOptions = document.querySelectorAll('.theme-option');

  themeBtn.addEventListener('click', () => sidebar.classList.add('active'));
  overlay.addEventListener('click', () => sidebar.classList.remove('active'));
  closeBtn.addEventListener('click', () => sidebar.classList.remove('active'));

  themeOptions.forEach(option => {
    option.addEventListener('click', () => {
      const theme = option.getAttribute('data-theme');
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('arpi_theme', theme);
      sidebar.classList.remove('active');
      showToast('✅ Tema diperbarui');
    });
  });
}

// ---------- NAVIGASI BAWAH ----------
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const pages = {
    skins: document.getElementById('skinsPage'),
    addons: document.getElementById('addonsPage'),
    game: document.getElementById('gamePage'),
    info: document.getElementById('infoPage')
  };

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetPage = item.getAttribute('data-page');
      
      // Update nav aktif
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      
      // Sembunyikan semua halaman
      Object.entries(pages).forEach(([key, page]) => {
        page.classList.toggle('active', key === targetPage);
      });
      
      currentPage = targetPage;
    });
  });
}

// ---------- HALAMAN INFO ----------
function setupInfoTabs() {
  const tabs = document.querySelectorAll('.info-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const infoType = tab.getAttribute('data-info');
      renderInfoContent(infoType);
    });
  });
}

function renderInfoPage() {
  if (!siteData) return;
  document.querySelector('.info-tab[data-info="saluran"]').classList.add('active');
  renderInfoContent('saluran');
}

function renderInfoContent(type) {
  const container = document.getElementById('infoContent');
  const data = siteData[type];
  
  if (!data) {
    container.innerHTML = '<p>Belum ada data</p>';
    return;
  }

  let html = `<div class="info-card">
    <h3>${data.judul || ''}</h3>
    <p>${data.deskripsi || ''}</p>`;

  if (data.daftar) {
    html += '<div class="info-link-list">';
    data.daftar.forEach(item => {
      html += `
        <a href="${item.link}" target="_blank" class="info-link-item">
          <span>${item.nama}</span>
          <span class="external-icon">↗</span>
        </a>`;
    });
    html += '</div>';
  } else if (type === 'dukungan' && data.tautan) {
    html += `<a href="${data.tautan}" target="_blank" class="btn btn-primary">💚 Dukung Sekarang</a>`;
  } else if (type === 'website') {
    html += `
      <p><strong>Domain:</strong> ${data.domain || 'arpimc.zone.id'}</p>
      <p><strong>Sejak:</strong> ${data.sejak || '2026'}</p>
    `;
  }

  html += '</div>';
  container.innerHTML = html;
}

// ---------- RENDER SKIN ----------
function renderSkins() {
  const grid = document.getElementById('skinGrid');
  const filterBtns = document.querySelectorAll('#skinFilters .filter-tab');

  filterBtns.forEach(btn => {
    btn.onclick = () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSkinFilter = btn.getAttribute('data-filter');
      applySkinFilter();
    };
  });

  applySkinFilter();
}

function applySkinFilter() {
  const grid = document.getElementById('skinGrid');
  let filtered = allSkins;
  
  if (currentSkinFilter !== 'all') {
    filtered = allSkins.filter(s => s.kategori === currentSkinFilter);
  }
  
  // Skin Pack pakai tampilan landscape
  const regular = filtered.filter(s => s.kategori !== 'pack');
  const packs = filtered.filter(s => s.kategori === 'pack');
  
  let html = '';
  
  // Skin biasa
  regular.forEach(skin => {
    html += `
      <div class="skin-card" onclick="openSkinDetail(${skin.id})">
        <img src="${skin.gambar}" alt="${skin.nama}" loading="lazy">
        <div class="card-body">
          <h3 class="card-title">${skin.nama}</h3>
          <p class="card-desc">${skin.deskripsi || ''}</p>
        </div>
      </div>`;
  });
  
  // Skin Pack (landscape)
  packs.forEach(pack => {
    html += `
      <div class="landscape-card" onclick="openSkinDetail(${pack.id})">
        <img src="${pack.gambar}" alt="${pack.nama}" loading="lazy">
        <div class="card-body">
          <h3 class="card-title">${pack.nama}</h3>
          <p class="card-desc">${pack.deskripsi || ''}</p>
        </div>
      </div>`;
  });
  
  grid.innerHTML = html || '<p style="grid-column:1/-1;text-align:center;color:var(--text-secondary)">Belum ada skin di kategori ini</p>';
}

// ---------- RENDER COUPLE ----------
function renderCouples() {
  const grid = document.getElementById('coupleGrid');
  if (!allCouples.length) {
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-secondary)">Belum ada skin couple</p>';
    return;
  }
  
  let html = '';
  allCouples.forEach(couple => {
    html += `
      <div class="couple-card">
        <div class="couple-images">
          <img src="${couple.gambar_cowok}" alt="Cowok" loading="lazy">
          <img src="${couple.gambar_cewek}" alt="Cewek" loading="lazy">
        </div>
        <div class="card-body">
          <h3 class="card-title">${couple.nama}</h3>
          <p class="card-desc">${couple.deskripsi || ''}</p>
          <div class="card-buttons">
            <a href="${couple.download_cowok}" target="_blank" class="btn btn-primary">Cowok</a>
            <a href="${couple.download_cewek}" target="_blank" class="btn btn-primary">Cewek</a>
          </div>
        </div>
      </div>`;
  });
  grid.innerHTML = html;
}

// ---------- RENDER SKIN JJ ----------
function renderSkinJJ() {
  const grid = document.getElementById('skinjjGrid');
  if (!allSkinJJ.length) {
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-secondary)">Belum ada skin JJ</p>';
    return;
  }
  
  let html = '';
  allSkinJJ.forEach(skin => {
    html += `
      <div class="skin-card" onclick="openSkinJJDetail(${skin.id})">
        <img src="${skin.gambar_utama}" alt="${skin.nama}" loading="lazy">
        <div class="card-body">
          <h3 class="card-title">${skin.nama}</h3>
          <p class="card-desc">${skin.deskripsi || ''}</p>
        </div>
      </div>`;
  });
  grid.innerHTML = html;
}

// ---------- RENDER ADDON ----------
function renderAddons() {
  const grid = document.getElementById('addonGrid');
  const filterBtns = document.querySelectorAll('#addonFilters .filter-tab');

  filterBtns.forEach(btn => {
    btn.onclick = () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentAddonFilter = btn.getAttribute('data-filter');
      applyAddonFilter();
    };
  });

  applyAddonFilter();
}

function applyAddonFilter() {
  const grid = document.getElementById('addonGrid');
  let filtered = allAddons;
  
  if (currentAddonFilter !== 'all') {
    filtered = allAddons.filter(a => a.kategori === currentAddonFilter);
  }
  
  let html = '';
  filtered.forEach(addon => {
    html += `
      <div class="landscape-card" onclick="openAddonDetail(${addon.id})">
        <img src="${addon.gambar}" alt="${addon.nama}" loading="lazy">
        <div class="card-body">
          <span style="font-size:11px;color:var(--accent);text-transform:uppercase">${addon.kategori || 'Addon'}</span>
          <h3 class="card-title">${addon.nama}</h3>
          <p class="card-desc">${addon.deskripsi || ''}</p>
        </div>
      </div>`;
  });
  
  grid.innerHTML = html || '<p style="grid-column:1/-1;text-align:center;color:var(--text-secondary)">Belum ada addon di kategori ini</p>';
}

// ---------- RENDER GAME ----------
function renderGames() {
  const content = document.getElementById('gameContent');
  const subTabs = document.querySelectorAll('#gameSubTabs .filter-tab');
  
  subTabs.forEach(tab => {
    tab.onclick = () => {
      subTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentGameSubpage = tab.getAttribute('data-subpage');
      renderGameContent();
    };
  });
  
  renderGameContent();
}

function renderGameContent() {
  const content = document.getElementById('gameContent');
  let filtered = allGames;
  
  if (currentGameSubpage !== 'all') {
    filtered = allGames.filter(g => g.tipe === currentGameSubpage);
  }
  
  let html = '<div class="cards-grid">';
  filtered.forEach(game => {
    html += `
      <div class="skin-card" onclick="openGameFull('${game.link}','${game.nama.replace(/'/g, "\\'")}')">
        <img src="${game.gambar}" alt="${game.nama}" loading="lazy">
        <div class="card-body">
          <h3 class="card-title">${game.nama}</h3>
          <p class="card-desc">${game.deskripsi || ''}</p>
          <button class="btn btn-primary btn-full">▶ Mainkan</button>
        </div>
      </div>`;
  });
  html += '</div>';
  
  content.innerHTML = html || '<p style="text-align:center;color:var(--text-secondary)">Belum ada konten</p>';
}

// ---------- BUKA GAME DI IFRAME PENUH ----------
function openGameFull(link, nama) {
  const fullscreen = document.getElementById('gameFullscreen');
  const iframe = document.getElementById('gameIframe');
  const titleBar = document.getElementById('gameTitleBar');
  
  titleBar.textContent = nama;
  iframe.src = link;
  fullscreen.classList.remove('hidden');
  
  document.getElementById('gameBackBtn').onclick = () => {
    fullscreen.classList.add('hidden');
    iframe.src = '';
  };
}

// ---------- BUKA DETAIL SKIN ----------
function openSkinDetail(id) {
  const skin = allSkins.find(s => s.id === id);
  if (!skin) return;
  
  showDetailModal({
    gambar: skin.gambar,
    nama: skin.nama,
    deskripsi: skin.deskripsi,
    tanggal: skin.tanggal_upload || '-',
    link_download: skin.link_download || skin.link_gambar,
    tipe: 'skin'
  });
}

// ---------- BUKA DETAIL SKIN JJ ----------
function openSkinJJDetail(id) {
  const skin = allSkinJJ.find(s => s.id === id);
  if (!skin) return;
  
  currentGalleryImages = skin.galeri || [];
  currentGalleryIndex = 0;
  
  showDetailModal({
    gambar: skin.gambar_utama,
    nama: skin.nama,
    deskripsi: skin.deskripsi,
    tanggal: skin.tanggal_upload || '-',
    link_download: skin.download_skin,
    link_gambar: skin.download_gambar,
    link_semua_gambar: skin.download_semua || null,
    galeri: skin.galeri || [],
    tipe: 'skinjj'
  });
}

// ---------- BUKA DETAIL ADDON ----------
function openAddonDetail(id) {
  const addon = allAddons.find(a => a.id === id);
  if (!addon) return;
  
  showDetailModal({
    gambar: addon.gambar,
    nama: addon.nama,
    deskripsi: addon.deskripsi,
    versi: addon.versi || '-',
    ukuran: addon.ukuran || '-',
    tanggal: addon.tanggal_upload || '-',
    link_download: addon.link_download,
    kategori: addon.kategori,
    tipe: 'addon'
  });
}

// ---------- MODAL DETAIL UMUM ----------
function showDetailModal(data) {
  const modal = document.getElementById('detailModal');
  const overlay = modal;
  
  document.getElementById('detailImage').src = data.gambar;
  document.getElementById('detailName').textContent = data.nama;
  document.getElementById('detailDesc').textContent = data.deskripsi || 'Tidak ada deskripsi';
  
  // Meta info
  let metaHTML = `<span>📅 ${data.tanggal}</span>`;
  if (data.versi) metaHTML += `<span>📦 Versi ${data.versi}</span>`;
  if (data.ukuran) metaHTML += `<span>📁 ${data.ukuran}</span>`;
  document.getElementById('detailMeta').innerHTML = metaHTML;
  
  // Tombol unduh
  const downloadBtn = document.getElementById('detailDownload');
  downloadBtn.href = data.link_download;
  
  // Khusus Skin JJ: tampilkan galeri & 2 opsi unduh
  const gallerySection = document.getElementById('gallerySection');
  if (data.tipe
