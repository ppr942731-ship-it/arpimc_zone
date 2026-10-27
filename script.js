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
    const [skinsRes, addonsRes, gamesRes, dataRes] = await Promise.all([
      fetch('skins.json'),
      fetch('addons.json'),
      fetch('games.json'),
      fetch('data.json')
    ]);

    allSkins = await skinsRes.json();
    allAddons = await addonsRes.json();
    allGames = await gamesRes.json();
    siteData = await dataRes.json();
    
    // File opsional — kalau belum ada gak eror
    try {
      const couplesRes = await fetch('couple.json');
      allCouples = await couplesRes.json();
    } catch(e) { 
      allCouples = []; 
      console.log('couple.json belum ada atau kosong');
    }
    
    try {
      const skinjjRes = await fetch('skinjj.json');
      allSkinJJ = await skinjjRes.json();
    } catch(e) { 
      allSkinJJ = []; 
      console.log('skinjj.json belum ada atau kosong');
    }
    
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
      
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      
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

// ---------- UPDATE JUMLAH STATISTIK ----------
function updateStats() {
  document.getElementById('totalSkin').textContent = allSkins.length;
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
  
  const regular = filtered.filter(s => s.kategori !== 'pack');
  const packs = filtered.filter(s => s.kategori === 'pack');
  
  let html = '';
  
  if (regular.length === 0 && packs.length === 0) {
    html = '<p style="grid-column:1/-1;text-align:center;color:var(--text-secondary);padding:40px 0;">Belum ada skin di kategori ini</p>';
  } else {
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
  }
  
  grid.innerHTML = html;
}
// ---------- RENDER COUPLE ----------
function renderCouples() {
  const grid = document.getElementById('coupleGrid');
  if (!allCouples || allCouples.length === 0) {
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-secondary);padding:20px 0;">Belum ada skin couple</p>';
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
  if (!allSkinJJ || allSkinJJ.length === 0) {
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-secondary);padding:20px 0;">Belum ada skin JJ</p>';
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
  if (filtered.length === 0) {
    html = '<p style="grid-column:1/-1;text-align:center;color:var(--text-secondary);padding:40px 0;">Belum ada addon di kategori ini</p>';
  } else {
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
  }
  
  grid.innerHTML = html;
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
  if (!filtered || filtered.length === 0) {
    html += '<p style="grid-column:1/-1;text-align:center;color:var(--text-secondary);padding:40px 0;">Belum ada konten</p>';
  } else {
    filtered.forEach(game => {
      html += `
        <div class="skin-card" onclick="openGameFull('${game.link}', '${game.nama.replace(/'/g, "\\'")}')">
          <img src="$${game.gambar 
  ? `<img src="${game.gambar}" alt="${game.nama}" loading="lazy">` 
  : `<div style="height:120px;display:flex;align-items:center;justify-content:center;background:var(--bg-primary);color:var(--text-secondary);font-size:40px;">🎮</div>`
}
">
          <div class="card-body">
            <h3 class="card-title">${game.nama}</h3>
            <p class="card-desc">${game.deskripsi || ''}</p>
            <button class="btn btn-primary btn-full">▶ Mainkan</button>
          </div>
        </div>`;
    });
  }
  html += '</div>';
  
  content.innerHTML = html;
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

// ---------- MODAL DETAIL UMUM ----------
let currentGalleryImages = [];
let currentGalleryIndex = 0;

function openSkinDetail(id) {
  const skin = allSkins.find(s => s.id === id);
  if (!skin) return;
  
  showDetailModal({
    gambar: skin.gambar,
    nama: skin.nama,
    deskripsi: skin.deskripsi || '',
    tanggal: skin.tanggal_upload || '-',
    link_download: skin.link_download || skin.gambar,
    tipe: 'skin'
  });
}

function openSkinJJDetail(id) {
  const skin = allSkinJJ.find(s => s.id === id);
  if (!skin) return;
  
  currentGalleryImages = skin.galeri || [];
  currentGalleryIndex = 0;
  
  showDetailModal({
    gambar: skin.gambar_utama,
    nama: skin.nama,
    deskripsi: skin.deskripsi || '',
    tanggal: skin.tanggal_upload || '-',
    link_download: skin.download_skin || '',
    link_gambar: skin.download_gambar || '',
    link_semua_gambar: skin.download_semua || null,
    galeri: skin.galeri || [],
    tipe: 'skinjj'
  });
}

function openAddonDetail(id) {
  const addon = allAddons.find(a => a.id === id);
  if (!addon) return;
  
  showDetailModal({
    gambar: addon.gambar,
    nama: addon.nama,
    deskripsi: addon.deskripsi || '',
    versi: addon.versi || '-',
    ukuran: addon.ukuran || '-',
    tanggal: addon.tanggal_upload || '-',
    link_download: addon.link_download,
    kategori: addon.kategori,
    tipe: 'addon'
  });
}

function showDetailModal(data) {
  const modal = document.getElementById('detailModal');
  
  document.getElementById('detailImage').src = data.gambar;
  document.getElementById('detailName').textContent = data.nama;
  document.getElementById('detailDesc').textContent = data.deskripsi;
  
  let metaHTML = `<span>📅 ${data.tanggal}</span>`;
  if (data.versi) metaHTML += `<span>📦 Versi ${data.versi}</span>`;
  if (data.ukuran) metaHTML += `<span>📁 ${data.ukuran}</span>`;
  document.getElementById('detailMeta').innerHTML = metaHTML;
  
  const downloadBtn = document.getElementById('detailDownload');
  const gallerySection = document.getElementById('gallerySection');
  
  if (data.tipe === 'skinjj' && data.galeri && data.galeri.length > 0) {
    gallerySection.classList.remove('hidden');
    renderGallery(data.galeri, data.link_gambar, data.link_semua_gambar);
    downloadBtn.href = data.link_download || '#';
    downloadBtn.textContent = '⬇️ Unduh Skin';
  } else {
    gallerySection.classList.add('hidden');
    downloadBtn.href = data.link_download;
    downloadBtn.textContent = '⬇️ Unduh';
  }
  
  // Tombol bagikan
  document.getElementById('shareBtn').onclick = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      showToast('✅ Link disalin!');
    }).catch(() => {
      showToast('❌ Gagal menyalin');
    });
  };
  
  // Tutup modal
  document.getElementById('detailBackBtn').onclick = closeModal;
  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };
  
  modal.classList.add('active');
}

function renderGallery(images, linkGambar, linkSemua) {
  const thumbs = document.getElementById('galleryImages');
  thumbs.innerHTML = '';
  
  images.forEach((img, idx) => {
    const thumb = document.createElement('img');
    thumb.src = img;
    thumb.alt = `Gambar ${idx + 1}`;
    if (idx === 0) thumb.classList.add('active-thumb');
    thumb.onclick = () => {
      document.querySelector('.gallery-thumbs img.active-thumb')?.classList.remove('active-thumb');
      thumb.classList.add('active-thumb');
      document.getElementById('detailImage').src = img;
      currentGalleryIndex = idx;
    };
    thumbs.appendChild(thumb);
  });
  
  document.getElementById('downloadSingleBtn').onclick = () => {
    window.open(images[currentGalleryIndex], '_blank');
  };
  
  const allBtn = document.getElementById('downloadAllBtn');
  if (linkSemua) {
    allBtn.classList.remove('hidden');
    allBtn.onclick = () => window.open(linkSemua, '_blank');
    allBtn.textContent = '📦 Unduh Semua Gambar';
  } else {
    allBtn.classList.remove('hidden');
    allBtn.onclick = () => {
      images.forEach(url => window.open(url, '_blank'));
      showToast('✅ Semua gambar dibuka di tab baru');
    };
    allBtn.textContent = '📂 Buka Semua di Tab Baru';
  }
}

function closeModal() {
  document.getElementById('detailModal').classList.remove('active');
  document.getElementById('gallerySection').classList.add('hidden');
}

// ---------- TOAST NOTIFIKASI ----------
function showToast(pesan) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = pesan;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
}
