const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

const state = {
  route: 'skin',
  filter: 'semua',
  items: [],
  current: null,
  theme: localStorage.getItem('arpimc-theme') || 'default'
};

const views = {
  listing: $('#listingView'),
  detail: $('#detailView'),
  info: $('#infoView')
};

const els = {
  pageTitle: $('#pageTitle'),
  pageDescription: $('#pageDescription'),
  stats: $('#stats'),
  filters: $('#filters'),
  cards: $('#cards'),
  detailType: $('#detailType'),
  detailTitle: $('#detailTitle'),
  detailDescription: $('#detailDescription'),
  detailMeta: $('#detailMeta'),
  detailActions: $('#detailActions'),
  previewWrap: $('#previewWrap'),
  previewFrame: $('#previewFrame'),
  backButton: $('#backButton'),
  backButtonGame: $('#backButtonGame'),
  gameToolbar: $('#gameToolbar'),
  gameNewTab: $('#gameNewTab'),
  toast: $('#toast'),
  themePanel: $('#themePanel'),
  themeOpen: $('#themeOpen'),
  themeClose: $('#themeClose')
};

const routes = {
  skin: {
    title: 'Koleksi Skin',
    desc: 'Temukan skin favoritmu, langsung unduh tanpa ribet.',
    file: '/skins.json',
    typeLabel: 'SKIN'
  },
  addon: {
    title: 'Koleksi Addon',
    desc: 'Kumpulan addon keren untuk Minecraft kamu.',
    file: '/addons.json',
    typeLabel: 'ADDON'
  },
  game: {
    title: 'Koleksi Game',
    desc: 'Mainkan game seru langsung dari browser.',
    file: '/games.json',
    typeLabel: 'GAME'
  },
  info: {
    title: 'Info ArpiMC Zone',
    desc: 'Panduan penggunaan website dan informasi tentang komunitas ArpiMC.',
    file: null,
    typeLabel: 'INFO'
  }
};

function setTheme(name) {
  document.documentElement.setAttribute('data-theme', name === 'default' ? '' : name);
  state.theme = name;
  localStorage.setItem('arpimc-theme', name);
}

function showToast(msg) {
  els.toast.textContent = msg;
  els.toast.classList.remove('hidden');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => els.toast.classList.add('hidden'), 2200);
}

function hideAllViews() {
  views.listing.classList.add('hidden');
  views.detail.classList.add('hidden');
  views.info.classList.add('hidden');
}

function setActiveNav(routeName) {
  $$('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.route === routeName);
  });
}

async function loadJson(url) {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('fetch gagal');
    return await res.json();
  } catch (e) {
    console.warn('Gagal memuat', url, e);
    return window.fallbackData?.[url] ?? [];
  }
}

function renderStats(list) {
  const total = list.length;
  els.stats.innerHTML = `
    <div class="stat-card">
      <strong>${total}</strong>
      <span>Total Item</span>
    </div>
    <div class="stat-card">
      <strong>${new Set(list.map(i => i.category)).size}</strong>
      <span>Kategori</span>
    </div>
    <div class="stat-card">
      <strong>${new Set(list.map(i => i.author)).size}</strong>
      <span>Kreator</span>
    </div>
  `;
}

function renderFilters(categories) {
  const cats = ['semua', ...new Set(categories)];
  els.filters.innerHTML = cats.map(cat => `
    <button class="filter-tab ${state.filter === cat ? 'active' : ''}" data-filter="${cat}">
      ${cat}
    </button>
  `).join('');

  $$('.filter-tab').forEach(btn => {
    btn.onclick = () => {
      state.filter = btn.dataset.filter;
      renderCards(state.items);
      renderFilters(state.items.map(i => i.category));
    };
  });
}

function getItemRatioClass(item) {
  if (state.route === 'skin') return 'skin-ratio';
  if (state.route === 'addon') return 'addon-ratio';
  if (state.route === 'game') return 'game-ratio';
  return '';
}

function renderCards(list) {
  const filtered = state.filter === 'semua'
    ? list
    : list.filter(i => i.category === state.filter);

  if (filtered.length === 0) {
    els.cards.innerHTML = `<p class="empty">Koleksi ini belum ada item.</p>`;
    return;
  }

  els.cards.innerHTML = filtered.map(item => {
    const ratioClass = getItemRatioClass(item);
    return `
      <article class="content-card ${ratioClass}">
        <button class="card-media-button open-detail">
          <div class="card-media">
            <img class="card-image" src="${item.thumb}" alt="${item.name}" loading="lazy" onerror="this.parentElement.classList.add('image-error')">
          </div>
        </button>
        <div class="card-body">
          <p class="card-kicker">${item.category ?? 'Umum'}</p>
          <h3 class="card-title">${item.name}</h3>
          <p class="card-desc">${item.desc}</p>
          <div class="card-actions">
            <a class="card-button" href="${item.download}" target="_blank" rel="noopener">Unduh</a>
            <button class="card-button card-download" data-id="${item.id}">Detail</button>
          </div>
          <button class="card-share" data-share-name="${item.name}" data-share-url="${item.shareUrl ?? location.href}">Bagikan</button>
        </div>
      </article>
    `;
  }).join('');

  $$('.open-detail, .card-download').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id ?? btn.closest('.content-card')?.querySelector('.card-download')?.dataset.id;
      const found = filtered.find(i => i.id == id);
      if (found) openDetail(found);
    };
  });

  $$('.card-share').forEach(btn => {
    btn.onclick = async () => {
      const name = btn.dataset.shareName;
      const url = btn.dataset.shareUrl;
      try {
        await navigator.share({ title: name, url });
      } catch {
        navigator.clipboard?.writeText(url);
        showToast('Link disalin!');
      }
    };
  });
}

function openDetail(item) {
  state.current = item;
  hideAllViews();
  views.listing.classList.remove('hidden');
  views.detail.classList.remove('hidden');

  els.detailType.textContent = routes[state.route].typeLabel;
  els.detailTitle.textContent = item.name;
  els.detailDescription.textContent = item.desc;

  els.detailMeta.innerHTML = `
    <div class="meta-line"><b>Kreator:</b> ${item.author ?? 'Anonim'}</div>
    <div class="meta-line"><b>Kategori:</b> ${item.category ?? 'Umum'}</div>
  `;

  els.detailActions.innerHTML = `
    <a class="action-button" href="${item.download}" target="_blank" rel="noopener">Unduh Sekarang</a>
    <button class="action-button secondary" id="copyShareBtn">Salin Link</button>
  `;

  $('#copyShareBtn').onclick = async () => {
    await navigator.clipboard?.writeText(item.shareUrl ?? location.href);
    showToast('Link detail disalin!');
  };

  if (state.route === 'game') {
    els.previewWrap.classList.add('game-preview');
    els.previewWrap.classList.remove('image-preview', 'addon-preview');
    els.gameToolbar.classList.remove('hidden');
    els.previewFrame.src = item.preview;
    els.gameNewTab.href = item.preview;
  } else if (state.route === 'skin') {
    els.previewWrap.classList.add('image-preview');
    els.previewWrap.classList.remove('game-preview', 'addon-preview');
    els.gameToolbar.classList.add('hidden');
    els.previewFrame.srcdoc = `<style>body{margin:0;display:grid;place-items:center;background:var(--bg-alt,#edf4ff)}</style><img src="${item.thumb}" style="max-height:90vh;max-width:100%;">`;
  } else {
    els.previewWrap.classList.add('addon-preview');
    els.previewWrap.classList.remove('game-preview', 'image-preview');
    els.gameToolbar.classList.add('hidden');
    els.previewFrame.src = item.preview;
  }

  history.replaceState({ route: state.route, detailId: item.id }, '', `/${state.route}?id=${item.id}`);
}
 function closeDetail() {
  state.current = null;
  views.detail.classList.add('hidden');
  els.previewWrap.className = 'preview-frame-wrap';
  els.previewFrame.src = '';
  els.previewFrame.srcdoc = '';
  els.gameToolbar.classList.add('hidden');
  history.replaceState({ route: state.route }, '', `/${state.route}`);
}

async function renderRoute(routeName, query = {}) {
  state.route = routeName;
  state.filter = 'semua';
  setActiveNav(routeName);

  hideAllViews();

  if (routeName === 'info') {
    views.info.classList.remove('hidden');
    renderInfoPage();
    return;
  }

  const cfg = routes[routeName];
  views.listing.classList.remove('hidden');
  els.pageTitle.textContent = cfg.title;
  els.pageDescription.textContent = cfg.desc;

  els.cards.innerHTML = `<p class="loading">Memuat koleksi...</p>`;
  state.items = await loadJson(cfg.file);

  renderStats(state.items);
  renderFilters(state.items.map(i => i.category));
  renderCards(state.items);

  if (query.id) {
    const found = state.items.find(i => i.id == query.id);
    if (found) openDetail(found);
  }
}

function parseUrlQuery() {
  const params = new URLSearchParams(location.search);
  const out = {};
  for (const [k, v] of params) out[k] = v;
  return out;
}

function getCurrentRoute() {
  const path = location.pathname.replace('/', '').trim();
  if (routes[path]) return path;
  return 'skin';
}

function renderInfoPage() {
  const tutorialPanel = $('#infoTutorial');
  const aboutPanel = $('#infoAbout');

  $$('.info-tab').forEach(tab => {
    tab.onclick = () => {
      $$('.info-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      if (tab.dataset.infoTab === 'tutorial') {
        tutorialPanel.classList.remove('hidden');
        aboutPanel.classList.add('hidden');
      } else {
        tutorialPanel.classList.add('hidden');
        aboutPanel.classList.remove('hidden');
      }
    };
  });

  tutorialPanel.innerHTML = `
    <div class="tutorial-intro">
      <div class="tutorial-mark">
        <svg viewBox="0 0 24 24"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Z"/><path d="M4 6h13M8 9h8M8 13h6"/></svg>
      </div>
      <div>
        <p class="eyebrow">PANDUAN</p>
        <h2>Cara Pakai ArpiMC Zone</h2>
        <p>Ikuti langkah-langkah berikut agar kamu bisa mengunduh dan memakai konten Minecraft dengan benar.</p>
      </div>
    </div>
    <div class="tutorial-list">
      <div class="tutorial-card">
        <div class="tutorial-number">1</div>
        <div>
          <h3>Pilih Koleksi</h3>
          <p>Buka tab Skin, Addon, atau Game lalu pilih konten yang kamu suka.</p>
        </div>
      </div>
      <div class="tutorial-card">
        <div class="tutorial-number">2</div>
        <div>
          <h3>Buka Detail</h3>
          <p>Klik tombol Detail untuk melihat pratinjau dan informasi lengkap item tersebut.</p>
        </div>
      </div>
      <div class="tutorial-card">
        <div class="tutorial-number">3</div>
        <div>
          <h3>Unduh File</h3>
          <p>Tekan tombol Unduh, simpan filenya, lalu pasang ke Minecraft kamu.</p>
        </div>
      </div>
    </div>
    <div class="tutorial-note">
      <b>Catatan:</b> Beberapa file membutuhkan Minecraft versi tertentu agar bisa berjalan normal.
    </div>
  `;

  $('#aboutContent').innerHTML = `
    <div class="about-hero">
      <div class="about-logo">
        <img src="https://files.catbox.moe/7vkqqk.jpg" alt="Logo ArpiMC Zone">
      </div>
      <div class="about-copy">
        <p class="eyebrow">TENTANG KAMI</p>
        <h2>ArpiMC Zone</h2>
        <p class="about-lead">Pusat koleksi skin, addon, dan game untuk komunitas pecinta Minecraft.</p>
        <p>ArpiMC Zone dibuat supaya teman-teman bisa mendapatkan konten Minecraft berkualitas dengan cepat dan mudah.</p>
      </div>
    </div>
    <div class="about-feature-grid">
      <div class="about-feature"><span>⚡</span><b>Cepat</b></div>
      <div class="about-feature"><span>🆓</span><b>Gratis</b></div>
      <div class="about-feature"><span>📱</span><b>Mobile</b></div>
      <div class="about-feature"><span>❤️</span><b>Komunitas</b></div>
    </div>
    <div class="about-story">
      <h3>Sejarah Singkat</h3>
      <p>ArpiMC Zone mulai dibuat sebagai tempat kumpulan skin pribadi, lalu berkembang menjadi situs koleksi publik.</p>
      <h3>Harapan Kami</h3>
      <p>Semoga situs ini bisa terus bermanfaat dan menjadi rumah nyaman bagi semua pecinta Minecraft di Indonesia.</p>
      <div class="about-disclaimer">
        ArpiMC Zone adalah proyek komunitas independen, bukan bagian resmi Mojang Studios.
      </div>
    </div>
  `;

  $('#infoGroups').innerHTML = `
    <div class="info-card">
      <div class="info-card-head">
        <div class="info-icon">
          <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <div>
          <h2>Grup Komunitas</h2>
          <p>Gabung supaya tidak ketinggalan update baru</p>
        </div>
      </div>
      <div class="info-links">
        <a class="info-link" href="#" target="_blank" rel="noopener">
          <div class="info-link-copy">
            <b>Saluran WhatsApp</b>
            <small>Update konten terbaru</small>
          </div>
          <div class="info-arrow">›</div>
        </a>
      </div>
    </div>
  `;
}

function bindEvents() {
  els.backButton.onclick = closeDetail;
  els.backButtonGame.onclick = closeDetail;

  els.themeOpen.onclick = () => els.themePanel.classList.remove('hidden');
  els.themeClose.onclick = () => els.themePanel.classList.add('hidden');

  $$('.theme-choice').forEach(btn => {
    btn.onclick = () => {
      setTheme(btn.dataset.theme);
      els.themePanel.classList.add('hidden');
    };
  });

  $$('.nav-item').forEach(item => {
    item.onclick = e => {
      e.preventDefault();
      const routeName = item.dataset.route;
      renderRoute(routeName, {});
      history.pushState({ route: routeName }, '', `/${routeName}`);
    };
  });

  window.addEventListener('popstate', () => {
    const routeName = getCurrentRoute();
    renderRoute(routeName, parseUrlQuery());
  });
}

async function init() {
  setTheme(state.theme);
  bindEvents();

  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/sw.js');
      console.log('SW terdaftar');
    } catch (e) {
      console.warn('SW gagal daftar', e);
    }
  }

  const routeName = getCurrentRoute();
  renderRoute(routeName, parseUrlQuery());
}

document.addEventListener('DOMContentLoaded', init);
