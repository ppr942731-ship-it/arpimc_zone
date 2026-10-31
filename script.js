// =============================================
// ARPIMC ZONE — script.js
// =============================================

let skinsData = [];
let addonsData = [];
let gamesData = [];

// === INISIALISASI ===
document.addEventListener('DOMContentLoaded', () => {
  loadSkins();
  loadAddons();
  loadGames();
  setupNavigation();
  setupThemePanel();
  handleDirectSkinLink();
});

// === NAVIGASI BAWAH ===
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.page-section');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetPage = item.getAttribute('data-page');
      
      // Update nav state
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      
      // Tampilkan halaman yang dipilih
      sections.forEach(sec => sec.classList.remove('active'));
      document.getElementById(`page-${targetPage}`).classList.add('active');
    });
  });
}

// === MUAT DATA SKIN ===
async function loadSkins() {
  try {
    const res = await fetch('skins.json');
    skinsData = await res.json();
    document.getElementById('totalSkin').textContent = skinsData.length;
    renderSkins('all');
    setupSkinFilters();
  } catch (err) {
    console.error('Gagal memuat skin:', err);
    document.getElementById('skinContent').innerHTML = 
      '<p class="loading-text">❌ Gagal memuat data skin</p>';
  }
}

// === FILTER KATEGORI SKIN ===
function setupSkinFilters() {
  const tabs = document.querySelectorAll('#page-skin .filter-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const cat = tab.getAttribute('data-filter');
      renderSkins(cat);
    });
  });
}

// === TAMPILKAN DAFTAR SKIN ===
function renderSkins(category) {
  const container = document.getElementById('skinContent');
  let filtered = skinsData;
  
  if (category !== 'all') {
    filtered = skinsData.filter(s => s.kategori === category);
  }
  
  if (filtered.length === 0) {
    container.innerHTML = '<p class="loading-text">Belum ada skin di kategori ini</p>';
    return;
  }
  
  container.innerHTML = filtered.map(skin => `
    <div class="skin-card">
      <div class="card-img-wrap" onclick="bukaPreviewSkin(${skin.id})">
        <img src="${skin.gambar}" alt="${skin.tag}" loading="lazy">
      </div>
      <div class="card-body">
        <p class="card-name">${skin.tag}</p>
        <div class="card-buttons">
          <button class="card-btn preview" onclick="bukaPreviewSkin(${skin.id})">Preview</button>
          <a href="${skin.link_download}" target="_blank" class="card-btn download">Unduh</a>
        </div>
      </div>
    </div>
  `).join('');
}

// === BUKA PREVIEW SKIN ===
function bukaPreviewSkin(id) {
  const skin = skinsData.find(s => s.id === id);
  if (!skin) return;
  
  const modal = document.getElementById('skinFullModal');
  const baseUrl = window.location.origin + window.location.pathname;
  const shareUrl = `${baseUrl}?id=${skin.id}`;
  
  // Update meta share untuk WhatsApp
  updateMetaShare(skin.gambar, skin.tag, shareUrl);
  
  // Isi data ke modal
  document.getElementById('skinTitle').textContent = skin.tag;
  document.getElementById('skinPreviewImage').src = skin.gambar;
  document.getElementById('skinPreviewImage').alt = skin.tag;
  document.getElementById('skinInfo').innerHTML = `
    ${skin.deskripsi || 'Credit: Pemilik asli'}<br>
    📅 ${skin.tanggal_upload || 'Tanggal tidak diketahui'}
  `;
  document.getElementById('skinDownloadTop').href = skin.link_download;
  document.getElementById('skinDownloadBtn').href = skin.link_download;
  
  // Tombol Salin Link
  document.getElementById('skinCopyBtn').onclick = async () => {
    const teks = `✨ ${skin.tag}\n👉 ${shareUrl}`;
    try {
      await navigator.clipboard.writeText(teks);
      alert('✅ Link disalin!');
    } catch {
      alert('❌ Gagal menyalin');
    }
  };
  
  // Tombol Bagikan ke WhatsApp
  document.getElementById('skinShareWaBtn').onclick = () => {
    const teks = encodeURIComponent(`✨ ${skin.tag}\n👉 ${shareUrl}`);
    window.open(`https://wa.me/?text=${teks}`, '_blank');
  };
  
  // Update URL tanpa reload
  history.replaceState({ skinId: id }, '', `?id=${skin.id}`);
  
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

// === TUTUP PREVIEW SKIN ===
function tutupModalSkin() {
  document.getElementById('skinFullModal').classList.add('hidden');
  document.body.style.overflow = '';
  // Kembalikan URL normal
  history.replaceState({}, '', window.location.pathname);
  // Kembalikan meta share ke default
  resetMetaShare();
}

// === UPDATE META SHARE ===
function updateMetaShare(imageUrl, title, url) {
  const getMeta = (prop) => document.querySelector(`meta[property="${prop}"]`);
  
  if (getMeta('og:image')) getMeta('og:image').content = imageUrl;
  if (getMeta('og:title')) getMeta('og:title').content = title;
  if (getMeta('og:url')) getMeta('og:url').content = url;
}

// === KEMBALIKAN META SHARE KE DEFAULT ===
function resetMetaShare() {
  const getMeta = (prop) => document.querySelector(`meta[property="${prop}"]`);
  
  if (getMeta('og:image')) getMeta('og:image').content = 'https://files.catbox.moe/7vkqqk.jpg';
  if (getMeta('og:title')) getMeta('og:title').content = 'ArpiMC Zone';
  if (getMeta('og:url')) getMeta('og:url').content = window.location.origin;
}

// === BUKA LANGSUNG SKIN DARI URL (?id=...) ===
function handleDirectSkinLink() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (id) {
    setTimeout(() => bukaPreviewSkin(parseInt(id)), 300);
  }
}

// === MUAT DATA ADDON ===
async function loadAddons() {
  try {
    const res = await fetch('addons.json');
    addonsData = await res.json();
    renderAddons('all');
    setupAddonFilters();
  } catch (err) {
    console.error('Gagal memuat addon:', err);
    document.getElementById('addonContent').innerHTML = 
      '<p class="loading-text">Memuat addon...</p>';
  }
}

function setupAddonFilters() {
  const tabs = document.querySelectorAll('#page-addon .filter-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const cat = tab.getAttribute('data-filter');
      renderAddons(cat);
    });
  });
}

function renderAddons(category) {
  const container = document.getElementById('addonContent');
  let filtered = addonsData;
  
  if (category !== 'all') {
    filtered = addonsData.filter(a => a.kategori === category);
  }
  
  if (filtered.length === 0) {
    container.innerHTML = '<p class="loading-text">Belum ada addon di kategori ini</p>';
    return;
  }
  
  container.innerHTML = filtered.map(addon => `
    <div class="addon-card">
      <div class="card-img-wrap" style="aspect-ratio:16/9;">
        <img src="${addon.gambar}" alt="${addon.nama || addon.tag}" loading="lazy">
      </div>
      <div class="card-body">
        <p class="card-name">${addon.nama || addon.tag}</p>
        <div class="card-buttons">
          <a href="${addon.link_download || addon.link}" target="_blank" class="card-btn download">Unduh</a>
        </div>
      </div>
    </div>
  `).join('');
}

// === MUAT DATA GAME ===
async function loadGames() {
  try {
    const res = await fetch('games.json');
    gamesData = await res.json();
    renderGames();
  } catch (err) {
    console.error('Gagal memuat game:', err);
    document.getElementById('gameContent').innerHTML = 
      '<p class="loading-text">Memuat game...</p>';
  }
}

function renderGames() {
  const container = document.getElementById('gameContent');
  
  if (gamesData.length === 0) {
    container.innerHTML = '<p class="loading-text">Belum ada game</p>';
    return;
  }
  
  container.innerHTML = gamesData.map(game => `
    <div class="game-card">
      <div class="card-img-wrap" style="aspect-ratio:16/9;cursor:pointer;" onclick="bukaGame('${game.link}','${game.nama}')">
        <img src="${game.gambar}" alt="${game.nama}" loading="lazy">
      </div>
      <div class="card-body">
        <p class="card-name">${game.nama}</p>
        <p style="font-size:12px;color:var(--text-secondary);margin-bottom:8px;">${game.deskripsi || ''}</p>
        <button class="card-btn preview" style="width:100%;" onclick="bukaGame('${game.link}','${game.nama}')">Mainkan ▶</button>
      </div>
    </div>
  `).join('');
}

// === BUKA GAME DI IFRAME ===
function bukaGame(link, nama) {
  const modal = document.getElementById('gameModal');
  document.getElementById('gameTitle').textContent = nama;
  document.getElementById('gameIframe').src = link;
  document.getElementById('gameNewTab').href = link;
  
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function tutupModalGame() {
  document.getElementById('gameModal').classList.add('hidden');
  document.getElementById('gameIframe').src = '';
  document.body.style.overflow = '';
}

// === PANEL TEMA ===
function setupThemePanel() {
  const themeBtn = document.getElementById('themeToggle');
  const panel = document.getElementById('themePanel');
  const closeBtn = document.getElementById('closeThemePanel');
  const choices = document.querySelectorAll('.theme-choice');
  
  // Muat tema yang tersimpan
  const savedTheme = localStorage.getItem('arpimc-theme') || 'default';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  themeBtn.addEventListener('click', () => {
    panel.classList.remove('hidden');
  });
  
  closeBtn.addEventListener('click', () => {
    panel.classList.add('hidden');
  });
  
  // Tutup saat klik luar panel
  panel.addEventListener('click', (e) => {
    if (e.target === panel) panel.classList.add('hidden');
  });
  
  choices.forEach(choice => {
    choice.addEventListener('click', () => {
      const theme = choice.getAttribute('data-theme');
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('arpimc-theme', theme);
      panel.classList.add('hidden');
    });
  });
}

// === TUTUP MODAL DENGAN TOMBOL ESC ===
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    tutupModalSkin();
    tutupModalGame();
  }
});
