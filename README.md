# ArpiMC Zone — Caca Edition

Versi alternatif independen untuk ArpiMC Zone. Data koleksi dipisah dalam JSON agar mudah diperbarui lewat GitHub.

## Isi repo
- `index.html` — struktur halaman
- `style.css` — desain responsif dan tema gelap/terang
- `script.js` — filter, pencarian, preview, favorit, dan navigasi
- `skins.json` — data skin
- `addons.json` — data addon
- `games.json` — data mini game

## Deploy ke Vercel
1. Buat repository GitHub baru, misalnya `arpimc-caca-edition`.
2. Upload semua 6 file website (jangan upload folder pembungkus ZIP).
3. Import repo tersebut ke Vercel.
4. Framework Preset: **Other**; Build Command dan Output Directory dikosongkan.
5. Deploy.

Untuk menambah skin, tambahkan objek baru ke `skins.json` dan gunakan kategori persis: `cowok`, `cewek`, `pvp`, `template`, atau `pack`. Untuk membuka website, gunakan URL hasil deploy, bukan `file://`, karena data dimuat dengan `fetch()`.

## Catatan fitur
- Favorit tersimpan di perangkat/browser pengguna (localStorage), belum tersinkron lintas perangkat.
- Tombol berbagi menggunakan Web Share API jika didukung; fallback menyalin link situs dengan catatan bahwa halaman item khusus belum dibuat.
- Statistik yang ditampilkan adalah jumlah item dari JSON, bukan jumlah pengunjung.
- Tidak ada backend atau panel admin dalam versi ini.
