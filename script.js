// ==========================================
// ARPIMC ZONE — SCRIPT.JS BAGIAN 1
// ==========================================

let allSkins = [];
let allAddons = [];
let allGames = [];
let infoData = {};
let currentSkinFilter = 'semua';
let currentAddonFilter = 'semua';
let currentGameFilter = 'semua';
let currentData = null;

document.addEventListener('DOMContentLoaded', () => {
    loadAllData();
    initNavigation();
    initSidebar();
    initThemes();
    initCosloTheme();
    handleUrlSlug();
});

// ---------- MUAT SEMUA DATA ----------
async function loadAllData() {
    try {
        const resSkins = await fetch('skins.json');
        allSkins = await resSkins.json();
        
        try {
            const resEmote = await fetch('emote.json');
            const emoteData = await resEmote.json();
            emoteData.forEach((item, idx) => {
                item.kategori = 'emote';
                if (!item.id) item.id = idx + 1;
                allSkins.push(item);
            });
        } catch (e) { console.log('emote.json dilewati'); }

        try {
            const resCouple = await fetch('couple.json');
            const coupleData = await resCouple.json();
            coupleData.forEach((item, idx) => {
                item.kategori = 'couple';
                if (!item.id) item.id = idx + 1;
                allSkins.push(item);
            });
        } catch (e) { console.log('couple.json dilewati'); }

        try {
            const resJJ = await fetch('skinjj.json');
            const jjData = await resJJ.json();
            jjData.forEach((item, idx) => {
                item.kategori = 'jj';
                if (!item.id) item.id = idx + 1;
                allSkins.push(item);
            });
        } catch (e) { console.log('skinjj.json dilewati'); }

        document.getElementById('skinCount').textContent = allSkins.length;
        renderSkins();
    } catch (e) {
        console.error('Gagal memuat skins.json', e);
    }

    try {
        const resAddons = await fetch('addons.json');
        allAddons = await resAddons.json();
        renderAddons();
    } catch (e) { console.error('Addons gagal', e); }

    try {
        const resGames = await fetch('games.json');
        allGames = await resGames.json();
        renderGames();
    } catch (e) { console.error('Games gagal', e); }

    try {
        const resInfo = await fetch('data.json');
        infoData = await resInfo.json();
        renderInfo();
    } catch (e) { console.error('Info gagal', e); }
}

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
            closeSidebar();
            window.scrollTo({ top: 0 });
        });
    });
}

// ---------- SIDEBAR & TEMA ----------
function initSidebar() {
    document.getElementById('menuToggle').onclick = openSidebar;
    const overlay = document.getElementById('sidebarOverlay');
    if (overlay) overlay.onclick = closeSidebar;
    const closeBtn = document.getElementById('closeSidebar');
    if (closeBtn) closeBtn.onclick = closeSidebar;
}

function openSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.add('active');
    if (overlay) overlay.classList.add('active');
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
}

function initThemes() {
    const savedTheme = localStorage.getItem('armc-theme') || 'default';
    document.body.setAttribute('data-theme', savedTheme);
    
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-theme') === savedTheme);
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-theme');
            if (theme === 'coslo') {
                openCosloModal();
                return;
            }
            document.body.setAttribute('data-theme', theme);
            localStorage.setItem('armc-theme', theme);
            document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            localStorage.removeItem('cosloBg');
            document.body.style.backgroundImage = '';
        });
    });
}

// ---------- TEMA COSLO — LATAR KUSTOM ----------
function initCosloTheme() {
    const savedBg = localStorage.getItem('cosloBg');
    if (savedBg) {
        document.body.style.backgroundImage = `url(${savedBg})`;
    }
    
    const fileInput = document.getElementById('cosloImageInput');
    if (fileInput) {
        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const bgUrl = event.target.result;
                    localStorage.setItem('cosloBg', bgUrl);
                    document.body.style.backgroundImage = `url(${bgUrl})`;
                    closeCosloModal();
                    showToast('Latar berhasil diatur! ✅');
                };
                reader.readAsDataURL(file);
            }
        };
    }
}

function openCosloModal() {
    document.getElementById('cosloModal').style.display = 'flex';
}

function closeCosloModal() {
    document.getElementById('cosloModal').style.display = 'none';
    document.getElementById('cosloImageInput').value = '';
}

function resetCoslo() {
    localStorage.removeItem('cosloBg');
    document.body.style.backgroundImage = '';
    closeCosloModal();
    showToast('Latar dihapus!');
}

// ---------- RENDER SKIN ----------
function renderSkins() {
    const grid = document.getElementById('skinGrid');
    if (!grid) return;
    
    let filtered = allSkins;
    if (currentSkinFilter !== 'semua') {
        filtered = allSkins.filter(s => 
            (s.kategori === currentSkinFilter) || 
            (s.tipe === currentSkinFilter)
        );
    }
    if (filtered.length === 0) {
        grid.innerHTML = '<div class="empty-state">Belum ada item</div>';
        return;
    }
    grid.innerHTML = filtered.map((skin, idx) => {
        const displayName = skin.tag || skin.nama || 'Tanpa Nama';
        const imgSrc = skin.gambar || skin.img || '';
        const realIndex = allSkins.indexOf(skin);
        return `
        <div class="card">
            <img src="${imgSrc}" alt="${displayName}" class="card-image" loading="lazy">
            <div class="card-body">
                <h3 class="card-title">${displayName}</h3>
                <div class="card-buttons">
                    <button class="card-btn preview" data-realidx="${realIndex}">Preview</button>
                    <button class="card-btn download" data-realidx="${realIndex}">Unduh</button>
                </div>
            </div>
        </div>`;
    }).join('');

    grid.querySelectorAll('.card-btn.preview').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-realidx'));
            openFullPreview(allSkins[idx], 'skin');
        });
    });
    grid.querySelectorAll('.card-btn.download').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-realidx'));
            handleDownload(allSkins[idx]);
        });
    });

    document.querySelectorAll('#skinFilters .filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('#skinFilters .filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentSkinFilter = tab.getAttribute('data-filter');
            renderSkins();
        });
    });
}
