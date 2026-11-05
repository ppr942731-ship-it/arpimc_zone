// Baca file data.json
fetch('data.json')
  .then(res => res.json())
  .then(data => {
    const daftar = document.getElementById('daftar');
    document.getElementById('total').textContent = data.length;

    data.forEach(item => {
      daftar.innerHTML += `
        <div class="card">
          <h3>${item.nama}</h3>
          <span class="cat">${item.kategori}</span>
          <p class="dl">⬇️ ${item.unduhan} unduhan</p>
          <a href="${item.link}" target="_blank">Download</a>
        </div>
      `;
    });
  })
  .catch(err => console.log('Error:', err));
