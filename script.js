// ==========================================
// ARPIMC ZONE — SCRIPT.JS LENGKAP
// ==========================================

let allSkins = [];
let allAddons = [];
let allGames = [];
let currentSkinSubpage = 'semua';
let currentAddonSubpage = 'semua';
let currentGameSubpage = 'semua';
let currentPreviewData = null;
let cosloVideoEl = null;

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initSidebar();
    initCoslo();
    loadData();
    handleUrlSlug();
});

// ---------- NAVIGASI BAWAH ----------
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetPage = item.getAttribute('data-page');
            
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            
            pages.forEach(p => p.classList.remove('active'));
            document.getElementById(targetPage).classList.add('active');
            
            closePreviewPage();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}

// ---------- SIDEBAR & TEMA ----------
function initSidebar() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const sidebar = document.querySelector('.sidebar');
    const closeSidebar = document.getElementById('closeSidebar');
    const themeBtns = document.querySelectorAll('.theme-btn');
    
    function toggleSidebar(open) {
        if (open) {
            sidebar.classList.add('active');
            sidebarOverlay.classList.add('active');
        } else {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        }
    }
    
    menuToggle.addEventListener('click', () => toggleSidebar(true));
    closeSidebar.addEventListener('click', () => toggleSidebar(false));
    sidebarOverlay.addEventListener('click', () => toggleSidebar(false));
    
    // Muat tema tersimpan
    const savedTheme = localStorage.getItem('arpimc_theme') || 'default';
    document.body.setAttribute('data-theme', savedTheme);
    updateThemeButtons(savedTheme);
    
    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-theme');
            if (theme === 'coslo') return;
            
            document.body.setAttribute('data-theme', theme);
            localStorage.setItem('arpimc_theme', theme);
            updateThemeButtons(theme);
            toggleSidebar(false);
            
            if (theme === 'default' || theme === 'gelap' || theme === 'pink' || theme === 'neobrutaslim') {
                disableCoslo();
            }
        });
    });
}

function updateThemeButtons(activeTheme) {
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-theme') === activeTheme) {
            btn.classList.add('active');
        }
    });
}

// ---------- COSLO — GAMBAR + VIDEO LATAR ----------
function initCoslo() {
    const fileInput = document.getElementById('cosloMediaFile');
    const contrast = document.getElementById('cosloContrast');
    const blur = document.getElementById('cosloBlur');
    const bright = document.getElementById('cosloBright');
    const volume = document.getElementById('cosloVolume');
    
    fileInput.addEventListener('change', handleCosloMediaSelect);
    
    contrast.addEventListener('input', () => {
        document.getElementById('contrastVal').textContent = contrast.value;
        updateCosloEffects();
    });
    blur.addEventListener('input', () => {
        document.getElementById('blurVal').textContent = blur.value;
        updateCosloEffects();
    });
    bright.addEventListener('input', () => {
        document.getElementById('brightVal').textContent = bright.value;
        updateCosloEffects();
    });
    volume.addEventListener('input', () => {
        document.getElementById('volVal').textContent = volume.value;
        if (cosloVideoEl) cosloVideoEl.volume = volume.value / 100;
    });
    
    // Muat pengaturan tersimpan
    loadCosloSettings();
}

function openCosloModal() {
    const modal = document.getElementById('cosloModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCosloModal() {
    const modal = document.getElementById('cosloModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    stopCosloPreview();
}

function handleCosloMediaSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const previewWrap = document.getElementById('cosloPreviewWrap');
    const imgPreview = document.getElementById('cosloPreviewImg');
    const videoPreview = document.getElementById('cosloPreviewVideo');
    const volumeGroup = document.getElementById('videoVolGroup');
    
    stopCosloPreview();
    imgPreview.style.display = 'none';
    videoPreview.style.display = 'none';
    volumeGroup.style.display = 'none';
    
    const reader = new FileReader();
    
    if (file.type.startsWith('image/')) {
        reader.onload = function(event) {
            imgPreview.src = event.target.result;
            imgPreview.style.display = 'block';
            previewWrap.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else if (file.type.startsWith('video/')) {
        reader.onload = function(event) {
            videoPreview.src = event.target.result;
            videoPreview.style.display = 'block';
            previewWrap.style.display = 'block';
            volumeGroup.style.display = 'block';
            cosloVideoEl = videoPreview;
            videoPreview.play();
        };
        reader.readAsDataURL(file);
    }
}

function stopCosloPreview() {
    const videoPreview = document.getElementById('cosloPreviewVideo');
    if (videoPreview) {
        videoPreview.pause();
        videoPreview.currentTime = 0;
    }
    cosloVideoEl = null;
}

function updateCosloEffects() {
    const contrast = document.getElementById('cosloContrast').value;
    const blur = document.getElementById('cosloBlur').value;
    const bright = document.getElementById('cosloBright').value;
    
    document.body.style.filter = `contrast(${contrast}%) blur(${blur}px) brightness(${bright}%)`;
    document.body.style.transform = 'translateZ(0)';
}

function saveCosloSetting() {
    const fileInput = document.getElementById('cosloMediaFile');
    if (!fileInput.files[0]) {
        showToast('Pilih gambar atau video dulu ya!');
        return;
    }
    
    const file = fileInput.files[0];
    const contrast = document.getElementById('cosloContrast').value;
    const blur = document.getElementById('cosloBlur').value;
    const bright = document.getElementById('cosloBright').value;
    const volume = document.getElementById('cosloVolume').value;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        localStorage.setItem('coslo_media', event.target.result);
        localStorage.setItem('coslo_media_type', file.type);
        localStorage.setItem('coslo_contrast', contrast);
        localStorage.setItem('coslo_blur', blur);
        localStorage.setItem('coslo_bright', bright);
        localStorage.setItem('coslo_volume', volume);
        
        applyCosloBackground();
        document.body.setAttribute('data-theme', 'coslo');
        updateThemeButtons('coslo');
        closeCosloModal();
        showToast('Coslo disimpan! ✅');
    };
    reader.readAsDataURL(file);
}

function loadCosloSettings() {
    const media = localStorage.getItem('coslo_media');
    if (!media) return;
    
    applyCosloBackground();
}

function applyCosloBackground() {
    const media = localStorage.getItem('coslo_media');
    const type = localStorage.getItem('coslo_media_type') || 'image';
    const contrast = localStorage.getItem('coslo_contrast') || '100';
    const blur = localStorage.getItem('coslo_blur') || '0';
    const bright = localStorage.getItem('coslo_bright') || '100';
    const volume = localStorage.getItem('coslo_volume') || '0';
    
    if (!media) return;
    
    document.body.classList.add('coslo-active');
    
    if (type.startsWith('image/')) {
        document.body.style.backgroundImage = `url(${media})`;
    }
    
    updateCosloEffects();
    
    if (localStorage.getItem('arpimc_theme') === 'coslo') {
        document.body.setAttribute('data-theme', 'coslo');
        updateThemeButtons('coslo');
    }
}

function disableCoslo() {
    document.body.classList.remove('coslo-active');
    document.body.style.backgroundImage = '';
    document.body.style.filter = '';
}

function resetCoslo() {
    localStorage.removeItem('coslo_media');
    localStorage.removeItem('coslo_media_type');
    localStorage.removeItem('coslo_contrast');
    localStorage.removeItem('coslo_blur');
    localStorage.removeItem('coslo_bright');
    localStorage.removeItem('coslo_volume');
    
    disableCoslo();
    document.getElementById('cosloPreviewWrap').style.display = 'none';
    document.getElementById('cosloMediaFile').value = '';
    document.getElementById('cosloContrast').value = 100;
    document.getElementById('cosloBlur').value = 0;
    document.getElementById('cosloBright').value = 100;
    document.getElementById('cosloVolume').value = 0;
    document.getElementById('contrastVal').textContent = '100';
    document.getElementById('blurVal').textContent = '0';
    document.getElementById('brightVal').textContent = '100';
    document.getElementById('volVal').textContent = '0';
    document.getElementById('videoVolGroup').style.display = 'none';
    
    closeCosloModal();
    showToast('Coslo direset! ✅');
}

// ==========================================
// ########## BAGIAN 1 SELESAI ##########
// ==========================================
 // ==========================================
// ARPIMC ZONE — SCRIPT.JS
// BAGIAN 2
// ==========================================

// ---------- MUAT DATA DARI FILE JSON ----------
async function loadData() {
    try {
        const [skinsRes, addonsRes, gamesRes, infoRes] = await Promise.all([
            fetch('skins.json'),
            fetch('addons.json'),
            fetch('games.json'),
            fetch('data.json')
        ]);

        allSkins = await skinsRes.json();
        allAddons = await addonsRes.json();
        allGames = await gamesRes.json();
        const infoData = await infoRes.json();

        document.getElementById('skinCount').textContent = allSkins.length;
        
        renderSkins();
        renderAddons();
        renderGames();
        renderInfo(infoData);
        setupFilters();
        handleUrlSlug();
        
    } catch (err) {
        console.error('Gagal memuat data:', err);
        showToast('Cek file JSON kamu ya');
    }
}

// ---------- SETUP FILTER ----------
function setupFilters() {
    document.getElementById('skinFilters').addEventListener('click', e => {
        if (e.target.classList.contains('filter-tab')) {
            document.querySelectorAll('#skinFilters .filter-tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            currentSkinSubpage = e.target.getAttribute('data-filter');
            renderSkins();
        }
    });

    document.getElementById('addonFilters').addEventListener('click', e => {
        if (e.target.classList.contains('filter-tab')) {
            document.querySelectorAll('#addonFilters .filter-tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            currentAddonSubpage = e.target.getAttribute('data-filter');
            renderAddons();
        }
    });

    document.getElementById('gameFilters').addEventListener('click', e => {
        if (e.target.classList.contains('filter-tab')) {
            document.querySelectorAll('#gameFilters .filter-tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            currentGameSubpage = e.target.getAttribute('data-filter');
            renderGames();
        }
    });
}

// ---------- RENDER SKIN ----------
function renderSkins() {
    const grid = document.getElementById('skinGrid');
    let filtered = allSkins;

    if (currentSkinSubpage !== 'semua') {
        filtered = allSkins.filter(s => s.jenis === currentSkinSubpage);
    }

    if (!filtered.length) {
        grid.innerHTML = '<div class="empty-state"><p>Belum ada skin di kategori ini</p></div>';
        return;
    }

    grid.innerHTML = filtered.map(skin => `
        <div class="card">
            <img src="${skin.img}" alt="${skin.nama}" class="card-img" loading="lazy">
            <div class="card-body">
                <h3 class="card-title">${skin.nama}</h3>
                <div class="card-buttons">
                    <button class="card-btn preview" onclick="openPreview('skin', '${skin.img}', '${skin.nama}', \`${skin.deskripsi || ''}\`, '${skin.file || ''}', '${skin.id || ''}', '${skin.slug || ''}')">Preview</button>
                    <a href="${skin.file || '#'}" target="_blank" class="card-btn download" ${!skin.file ? 'style="pointer-events:none;opacity:0.6"' : ''}>Unduh</a>
                </div>
            </div>
        </div>
    `).join('');
}

// ---------- RENDER ADDON — LANDSCAPE ----------
function renderAddons() {
    const list = document.getElementById('addonGrid');
    let filtered = allAddons;

    if (currentAddonSubpage !== 'semua') {
        filtered = allAddons.filter(a => a.kategori === currentAddonSubpage);
    }

    if (!filtered.length) {
        list.innerHTML = '<div class="empty-state"><p>Belum ada addon di kategori ini</p></div>';
        return;
    }

    list.innerHTML = filtered.map(addon => `
        <div class="addon-card">
            <img src="${addon.img}" alt="${addon.nama}" class="addon-img" loading="lazy">
            <div class="addon-body">
                <div>
                    <h3 class="addon-title">${addon.nama}</h3>
                    <p class="addon-desc">${addon.deskripsi || ''}</p>
                </div>
                <div class="addon-buttons">
                    <button class="addon-btn preview" onclick="openPreview('addon', '${addon.img}', '${addon.nama}', \`${addon.deskripsi || ''}\`, '${addon.file || ''}', '${addon.id || ''}', '${addon.slug || ''}')">Preview</button>
                    <a href="${addon.file || '#'}" target="_blank" class="addon-btn download" ${!addon.file ? 'style="pointer-events:none;opacity:0.6"' : ''}>Unduh</a>
                </div>
            </div>
        </div>
    `).join('');
}

// ---------- RENDER GAME — BUKA DI IFRAME ----------
function renderGames() {
    const grid = document.getElementById('gameGrid');
    let filtered = allGames;

    if (currentGameSubpage !== 'semua') {
        filtered = allGames.filter(g => g.tipe === currentGameSubpage);
    }

    if (!filtered.length) {
        grid.innerHTML = '<div class="empty-state"><p>Belum ada game di kategori ini</p></div>';
        return;
    }

    grid.innerHTML = filtered.map(game => `
        <div class="card">
            <div class="card-body" style="aspect-ratio:4/3;display:flex;flex-direction:column;justify-content:center;text-align:center;background:var(--secondary);">
                <h3 class="card-title" style="font-size:16px;margin-bottom:8px;">${game.nama}</h3>
                <p style="font-size:12px;color:var(--text-secondary);">${game.deskripsi || ''}</p>
            </div>
            <div class="card-body">
                <button class="card-btn download" style="width:100%;" onclick="openPreview('game', '${game.link || ''}', '${game.nama}', '', '', '${game.id || ''}', '${game.slug || ''}')">▶ Mainkan</button>
            </div>
        </div>
    `).join('');
}

// ---------- RENDER INFO — AKORDEON ----------
function renderInfo(data) {
    const container = document.getElementById('infoContent');
    
    if (!data.sections || !data.sections.length) {
        container.innerHTML = '<div class="empty-state"><p>Belum ada informasi</p></div>';
        return;
    }

    container.innerHTML = data.sections.map(sec => `
        <div class="accordion-item">
            <button class="accordion-header" onclick="toggleAccordion(this)">
                <span>${sec.judul}</span>
                <span class="accordion-icon">▼</span>
            </button>
            <div class="accordion-content">
                <div class="accordion-inner">
                    ${sec.item.map(i => `
                        <div class="info-item">
                            <span class="info-name">${i.nama}</span>
                            <a href="${i.link}" target="_blank" class="info-link">Buka →</a>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

function toggleAccordion(btn) {
    btn.parentElement.classList.toggle('open');
}

// ---------- BUKA PREVIEW ----------
function openPreview(tipe, media, nama, desc, file, id, slug) {
    currentPreviewData = { type: tipe, media, nama, desc, file, id, slug };
    showPreviewPage();
}

function showPreviewPage() {
    const previewPage = document.getElementById('previewPage');
    const pageTitle = document.getElementById('previewPageTitle');
    const imgSection = document.getElementById('previewMediaSection');
    const previewImg = document.getElementById('previewImage');
    const gameFrame = document.getElementById('previewGameFrame');
    const infoText = document.querySelector('.preview-text-info');
    const previewName = document.getElementById('previewName');
    const previewDesc = document.getElementById('previewDescription');
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    const shareWABtn = document.getElementById('shareWABtn');
    const downloadBtn = document.getElementById('previewDownloadBtn');

    // Reset tampilan
    imgSection.style.display = 'none';
    previewImg.style.display = 'none';
    gameFrame.style.display = 'none';
    gameFrame.src = '';
    infoText.style.display = 'none';
    downloadBtn.style.display = 'none';

    const { type, media, nama, desc, file, id, slug } = currentPreviewData;

    pageTitle.textContent = nama;

    if (type === 'game') {
        gameFrame.style.display = 'block';
        gameFrame.src = media;
    } else {
        imgSection.style.display = 'block';
        previewImg.style.display = 'block';
        previewImg.src = media;
        previewImg.alt = nama;
    }

    // Info teks
    if (desc || nama) {
        infoText.style.display = 'block';
        previewName.textContent = nama;
        previewDesc.textContent = desc || '';
    }

    // Buat link share
    let shareUrl = window.location.origin;
    if (slug) {
        shareUrl += `?${slug}`;
    } else if (id) {
        if (type === 'skin') shareUrl += `?skin-id=${id}`;
        else if (type === 'addon') shareUrl += `?addon-id=${id}`;
        else if (type === 'game') shareUrl += `?game-id=${id}`;
    }

    // Salin link
    copyLinkBtn.onclick = () => {
        navigator.clipboard.writeText(shareUrl).then(() => {
            showToast('Link disalin! ✅');
        });
    };

    // Share WA
    shareWABtn.onclick = () => {
        const text = encodeURIComponent(`${nama}\n${shareUrl}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    // Tombol unduh
    if (file && file !== '#') {
        downloadBtn.href = file;
        downloadBtn.style.display = 'flex';
    }

    // Tampilkan halaman preview
    previewPage.classList.add('active');
    document.body.style.overflow = 'hidden';
    history.pushState({ preview: true }, '', shareUrl);
}

// ---------- TUTUP PREVIEW ----------
function closePreviewPage() {
    const previewPage = document.getElementById('previewPage');
    const gameFrame = document.getElementById('previewGameFrame');
    
    previewPage.classList.remove('active');
    document.body.style.overflow = '';
    gameFrame.src = '';
    currentPreviewData = null;
    
    history.back();
}

// Tutup preview pakai tombol kembali browser
window.addEventListener('popstate', () => {
    if (document.getElementById('previewPage').classList.contains('active')) {
        closePreviewPage();
    }
});

// ---------- BUKA LANGSUNG DARI LINK ----------
function handleUrlSlug() {
    const params = new URLSearchParams(window.location.search);
    
    for (const [key, value] of params.entries()) {
        // Cari pakai slug
        if (key === 'slug') {
            const skin = allSkins.find(s => s.slug === value);
            if (skin) return setTimeout(() => openPreview('skin', skin.img, skin.nama, skin.deskripsi || '', skin.file || '', skin.id || '', skin.slug), 200);
            
            const addon = allAddons.find(a => a.slug === value);
            if (addon) return setTimeout(() => openPreview('addon', addon.img, addon.nama, addon.deskripsi || '', addon.file || '', addon.id || '', addon.slug), 200);
            
            const game = allGames.find(g => g.slug === value);
            if (game) return setTimeout(() => openPreview('game', game.link, game.nama, '', '', game.id || '', game.slug), 200);
        }
        
        // Cari pakai id
        const match = key.match(/^(.+)-id$/);
        if (match) {
            const id = value;
            const skin = allSkins.find(s => String(s.id) === String(id));
            if (skin) return setTimeout(() => openPreview('skin', skin.img, skin.nama, skin.deskripsi || '', skin.file || '', skin.id, `${key}=${id}`), 200);
            
            const addon = allAddons.find(a => String(a.id) === String(id));
            if (addon) return setTimeout(() => openPreview('addon', addon.img, addon.nama, addon.deskripsi || '', addon.file || '', addon.id, `${key}=${id}`), 200);
            
            const game = allGames.find(g => String(g.id) === String(id));
            if (game) return setTimeout(() => openPreview('game', game.link, game.nama, '', '', game.id, `${key}=${id}`), 200);
        }
    }
}

// ---------- MODAL COUPLE & JJ (kalau dibutuhkan) ----------
function openCoupleModal() {
    document.getElementById('coupleModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}
function closeCoupleModal() {
    document.getElementById('coupleModal').classList.remove('active');
    document.body.style.overflow = '';
}
function openJJModal() {
    document.getElementById('jjModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}
function closeJJModal() {
    document.getElementById('jjModal').classList.remove('active');
    document.body.style.overflow = '';
}

// ---------- NOTIFIKASI ----------
function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
}

// ==========================================
// ########## AKHIR FILE ##########
// ==========================================
