// ==========================================
// ARPIMC ZONE — SCRIPT.JS VERSI FINAL
// ==========================================

let allSkins = [];
let allAddons = [];
let allGames = [];
let currentSkinFilter = 'semua';
let currentAddonFilter = 'semua';

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    loadAllData();
});

// ---------- NAVIGASI HALAMAN ----------
function initNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const pages = document.querySelectorAll('.page');
    
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetPage = btn.getAttribute('data-page');
            
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            pages.forEach(p => p.classList.remove('active'));
            document.getElementById(targetPage + 'Page').classList.add('active');
        });
    });
}

// ---------- MUAT SEMUA DATA ----------
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
        
        renderSkins();
        renderAddons();
        renderGames();
        initFilters();
        
    } catch (err) {
        console.error('Gagal memuat data:', err);
        document.getElementById('skinGrid').innerHTML = 
            '<div class="empty">Cek file skins.json, addons.json, dan games.json ya</div>';
    }
}

// ---------- FILTER KATEGORI ----------
function initFilters() {
    // Filter Skin
    document.querySelectorAll('#skinPage .filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#skinPage .filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSkinFilter = btn.getAttribute('data-filter');
            renderSkins();
        });
    });
    
    // Filter Addon
    document.querySelectorAll('#addonPage .filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#addonPage .filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentAddonFilter = btn.getAttribute('data-filter');
            renderAddons();
        });
    });
}

// ---------- TAMPILKAN SKIN ----------
function renderSkins() {
    const grid = document.getElementById('skinGrid');
    let data = allSkins;
    
    if (currentSkinFilter !== 'semua') {
        data = allSkins.filter(s => s.jenis === currentSkinFilter);
    }
    
    if (!data.length) {
        grid.innerHTML = '<div class="empty">Belum ada skin di kategori ini</div>';
        return;
    }
    
    grid.innerHTML = data.map(skin => `
        <div class="card">
            <img src="${skin.img}" alt="${skin.nama}" class="card-img" loading="lazy">
            <div class="card-body">
                <h3 class="card-title">${skin.nama}</h3>
                <div class="card-buttons">
                    <button class="btn preview" onclick="openPreview('${skin.img}', '${skin.nama}', '${skin.deskripsi || ''}', '${skin.file || ''}')">Preview</button>
                    <a href="${skin.file || '#'}" target="_blank" class="btn download" style="${!skin.file ? 'opacity:0.6;pointer-events:none;' : ''}">Unduh</a>
                </div>
            </div>
        </div>
    `).join('');
}

// ---------- TAMPILKAN ADDON ----------
function renderAddons() {
    const list = document.getElementById('addonGrid');
    let data = allAddons;
    
    if (currentAddonFilter !== 'semua') {
        data = allAddons.filter(a => a.kategori === currentAddonFilter);
    }
    
    if (!data.length) {
        list.innerHTML = '<div class="empty">Belum ada addon di kategori ini</div>';
        return;
    }
    
    list.innerHTML = data.map(addon => `
        <div class="addon-card">
            <img src="${addon.img}" alt="${addon.nama}" class="addon-img" loading="lazy">
            <div class="addon-body">
                <div>
                    <h3 class="addon-title">${addon.nama}</h3>
                    <p class="addon-desc">${addon.deskripsi || ''}</p>
                </div>
                <div class="card-buttons">
                    <button class="btn preview" onclick="openPreview('${addon.img}', '${addon.nama}', '${addon.deskripsi || ''}', '${addon.file || ''}')">Preview</button>
                    <a href="${addon.file || '#'}" target="_blank" class="btn download" style="${!addon.file ? 'opacity:0.6;pointer-events:none;' : ''}">Unduh</a>
                </div>
            </div>
        </div>
    `).join('');
}

// ---------- TAMPILKAN GAME ----------
function renderGames() {
    const grid = document.getElementById('gameGrid');
    
    if (!allGames.length) {
        grid.innerHTML = '<div class="empty">Belum ada game</div>';
        return;
    }
    
    grid.innerHTML = allGames.map(game => `
        <div class="card">
            <div class="card-body" style="aspect-ratio:4/3;display:flex;flex-direction:column;justify-content:center;background:#eee;">
                <h3 class="card-title">${game.nama}</h3>
                <p style="font-size:12px;color:#666;">${game.deskripsi || ''}</p>
                <button class="btn download" style="margin-top:10px;" onclick="window.open('${game.link || '#'}', '_blank')">▶ Mainkan</button>
            </div>
        </div>
    `).join('');
}

// ---------- PREVIEW MODAL ----------
function openPreview(imgSrc, title, desc, fileLink) {
    const modal = document.getElementById('previewModal');
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalImg').src = imgSrc;
    document.getElementById('modalDesc').textContent = desc;
    document.getElementById('modalDownload').href = fileLink || '#';
    document.getElementById('modalDownload').style.display = fileLink ? 'block' : 'none';
    
    modal.classList.add('show');
}

function closeModal() {
    document.getElementById('previewModal').classList.remove('show');
}

// Tutup modal klik luar
document.getElementById('previewModal').addEventListener('click', e => {
    if (e.target.id === 'previewModal') closeModal();
});
