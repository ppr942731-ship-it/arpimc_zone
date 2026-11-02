// ==========================================
// ARPIMC ZONE — SCRIPT.JS
// BAGIAN 1
// ==========================================

let allSkins = [];
let allAddons = [];
let allGames = [];
let currentSkinSubpage = 'semua';
let currentAddonSubpage = 'semua';
let currentGameSubpage = 'semua';
let currentPreviewData = null;

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initSidebar();
    initCoslo();
    loadData();
    handleUrlSlug();
});

// ---------- NAVIGASI BAWAH ----------
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const targetPage = link.getAttribute('data-page');
            
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            pages.forEach(p => p.classList.remove('active'));
            document.getElementById(targetPage).classList.add('active');
            
            closePreviewPage();
            window.scrollTo(0, 0);
        });
    });
}

// ---------- SIDEBAR & TEMA ----------
function initSidebar() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const sidebar = document.querySelector('.sidebar');
    const closeSidebarBtn = document.getElementById('closeSidebar');
    const themeButtons = document.querySelectorAll('.theme-option');
    
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
    closeSidebarBtn.addEventListener('click', () => toggleSidebar(false));
    sidebarOverlay.addEventListener('click', () => toggleSidebar(false));
    
    // Muat tema tersimpan
    const savedTheme = localStorage.getItem('arpimc_theme') || 'default';
    document.body.setAttribute('data-theme', savedTheme);
    updateThemeButtons(savedTheme);
    
    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-theme');
            document.body.setAttribute('data-theme', theme);
            localStorage.setItem('arpimc_theme', theme);
            updateThemeButtons(theme);
            toggleSidebar(false);
            
            if (theme === 'coslo') {
                openCosloModal();
                loadCosloSettings();
            } else {
                disableCoslo();
            }
        });
    });
}

function updateThemeButtons(activeTheme) {
    document.querySelectorAll('.theme-option').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-theme') === activeTheme) {
            btn.classList.add('active');
        }
    });
}

// ---------- COSLO — Pengaturan Latar & Efek ----------
function initCoslo() {
    const cosloFile = document.getElementById('cosloFile');
    const cosloContrast = document.getElementById('cosloContrast');
    const cosloBlur = document.getElementById('cosloBlur');
    const cosloBright = document.getElementById('cosloBright');
    
    cosloFile.addEventListener('change', handleCosloFileSelect);
    
    cosloContrast.addEventListener('input', () => {
        document.getElementById('contrastVal').textContent = cosloContrast.value;
        updateCosloPreview();
    });
    cosloBlur.addEventListener('input', () => {
        document.getElementById('blurVal').textContent = cosloBlur.value;
        updateCosloPreview();
    });
    cosloBright.addEventListener('input', () => {
        document.getElementById('brightVal').textContent = cosloBright.value;
        updateCosloPreview();
    });
}

let cosloImageData = null;

function openCosloModal() {
    document.getElementById('cosloModal').style.display = 'flex';
    loadCosloSettings();
}

function closeCosloModal() {
    document.getElementById('cosloModal').style.display = 'none';
}

function handleCosloFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        cosloImageData = event.target.result;
        const previewImg = document.getElementById('cosloPreviewImg');
        const previewWrap = document.getElementById('cosloPreviewWrap');
        previewImg.src = cosloImageData;
        previewWrap.style.display = 'block';
        updateCosloPreview();
    };
    reader.readAsDataURL(file);
}

function updateCosloPreview() {
    const contrast = document.getElementById('cosloContrast').value;
    const blur = document.getElementById('cosloBlur').value;
    const bright = document.getElementById('cosloBright').value;
    
    let filterStr = `contrast(${contrast}%) brightness(${bright}%)`;
    if (parseInt(blur) > 0) {
        filterStr += ` blur(${blur}px)`;
    }
    document.body.style.filter = filterStr;
}

function saveCosloSetting() {
    if (!cosloImageData) {
        showToast('Pilih gambar dulu ya!');
        return;
    }
    
    const contrast = document.getElementById('cosloContrast').value;
    const blur = document.getElementById('cosloBlur').value;
    const bright = document.getElementById('cosloBright').value;
    
    localStorage.setItem('coslo_bg', cosloImageData);
    localStorage.setItem('coslo_contrast', contrast);
    localStorage.setItem('coslo_blur', blur);
    localStorage.setItem('coslo_bright', bright);
    
    applyCosloBackground(cosloImageData, contrast, blur, bright);
    closeCosloModal();
    showToast('Pengaturan Coslo tersimpan! ✅');
}

function loadCosloSettings() {
    const bg = localStorage.getItem('coslo_bg');
    const contrast = localStorage.getItem('coslo_contrast') || '100';
    const blur = localStorage.getItem('coslo_blur') || '0';
    const bright = localStorage.getItem('coslo_bright') || '100';
    
    if (bg) {
        applyCosloBackground(bg, contrast, blur, bright);
    }
    
    document.getElementById('cosloContrast').value = contrast;
    document.getElementById('cosloBlur').value = blur;
    document.getElementById('cosloBright').value = bright;
    document.getElementById('contrastVal').textContent = contrast;
    document.getElementById('blurVal').textContent = blur;
    document.getElementById('brightVal').textContent = bright;
}

function applyCosloBackground(imgData, contrast, blur, bright) {
    document.body.classList.add('coslo-active');
    document.body.style.backgroundImage = `url(${imgData})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
    
    let filterStr = `contrast(${contrast}%) brightness(${bright}%)`;
    if (parseInt(blur) > 0) {
        filterStr += ` blur(${blur}px)`;
    }
    document.body.style.filter = filterStr;
}

function disableCoslo() {
    document.body.classList.remove('coslo-active');
    document.body.style.backgroundImage = '';
    document.body.style.filter = '';
}

function resetCoslo() {
    localStorage.removeItem('coslo_bg');
    localStorage.removeItem('coslo_contrast');
    localStorage.removeItem('coslo_blur');
    localStorage.removeItem('coslo_bright');
    disableCoslo();
    
    document.getElementById('cosloPreviewWrap').style.display = 'none';
    document.getElementById('cosloFile').value = '';
    document.getElementById('cosloContrast').value = 100;
    document.getElementById('cosloBlur').value = 0;
    document.getElementById('cosloBright').value = 100;
    document.getElementById('contrastVal').textContent = '100';
    document.getElementById('blurVal').textContent = '0';
    document.getElementById('brightVal').textContent = '100';
    cosloImageData = null;
    
    showToast('Coslo direset! ✅');
}

// ==========================================
// ########## BATAS — BAGIAN 1 SELESAI ##########
// ==========================================
