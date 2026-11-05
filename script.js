// ===== MUAT DATA DARI data.json =====
let skinData = [];

fetch('data.json')
  .then(res => res.json())
  .then(data => {
    skinData = data;
    renderSkins('all');
    updateCounter();
  })
  .catch(err => console.error('Error memuat data:', err));

// ===== RENDER DAFTAR SKIN =====
function renderSkins(category) {
  const list = document.getElementById('skinList');
  list.innerHTML = '';

  const filtered = category === 'all' 
    ? skinData 
    : skinData.filter(s => s.kategori === category);

  filtered.forEach(skin => {
    list.innerHTML += `
      <div class="card" data-cat="${skin.kategori}" data-id="${skin.id}">
        <span class="tag">${skin.tag}</span>
        <img loading="lazy" src="${skin.gambar}" alt="${skin.tag}">
        <div class="meta">
          <span>👁 <span class="views">0</span></span>
          <span>⬇ <span class="downloads">0</span></span>
        </div>
        <a href="${skin.link_download}" target="_blank" class="btn download-btn">DOWNLOAD</a>
      </div>
    `;
  });

  // Pasang event listener untuk tombol download
  document.querySelectorAll('.download-btn').forEach(btn => {
    btn.onclick = () => {
      const card = btn.parentElement;
      const id = card.dataset.id;
      const key = 'skin_' + id + '_dl';
      let dl = parseInt(localStorage.getItem(key) || 0) + 1;
      localStorage.setItem(key, dl);
      card.querySelector('.downloads').innerText = dl;
    };
  });
}

// ===== THEME SWITCHER =====
const body = document.body;
const themeBtn = document.getElementById('themeToggle');

if(localStorage.theme === 'dark') body.classList.add('dark');

themeBtn.onclick = () => {
  body.classList.toggle('dark');
  localStorage.theme = body.classList.contains('dark') ? 'dark' : 'light';
};

// ===== UPDATE PENGHITUNG =====
function updateCounter() {
  document.querySelectorAll('.card').forEach((card) => {
    const id = card.dataset.id;
    const viewKey = 'skin_' + id + '_views';
    const dlKey = 'skin_' + id + '_dl';

    let views = localStorage.getItem(viewKey) || Math.floor(Math.random() * 500);
    let downloads = localStorage.getItem(dlKey) || Math.floor(Math.random() * 100);

    card.querySelector('.views').innerText = views;
    card.querySelector('.downloads').innerText = downloads;

    localStorage.setItem(viewKey, parseInt(views) + 1);
  });

  // Total Views
  let total = 0;
  for(let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if(key.includes('_views')) total += parseInt(localStorage.getItem(key));
  }
  document.getElementById('totalViews').innerText = total.toLocaleString('id');
}

// ===== FILTER KATEGORI =====
document.querySelectorAll('.cat-btn').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderSkins(btn.dataset.cat);
    setTimeout(updateCounter, 100);
  };
});

// ===== Q&A ACCORDION =====
document.querySelectorAll('.qa-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    item.classList.toggle('active');
    btn.setAttribute('aria-expanded', item.classList.contains('active'));
  });
});
