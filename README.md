# 296 GAME

Game player HTML5 ringan berbasis browser. Dibangun murni dengan **HTML5, CSS3, dan Vanilla JavaScript** — tanpa framework, tanpa Bootstrap, tanpa jQuery. Siap deploy langsung ke **GitHub Pages**.

296 GAME hanya berfungsi sebagai **pemutar (player)**, bukan penyedia game. Game dimuat langsung dari CDN [HTMLGames](https://www.htmlgames.com/) berdasarkan parameter URL, contoh:

```
play.html?game=MahjongCollapse
```

---

## 📁 Struktur Proyek

```
296-game/
├── index.html           # Halaman utama / katalog
├── play.html             # Halaman pemutar game
├── offline.html          # Halaman fallback saat offline (PWA)
├── manifest.json          # Manifest PWA
├── service-worker.js      # Service worker (cache app shell)
├── css/
│   ├── style.css          # Style utama (tema, layout, komponen)
│   └── responsive.css     # Breakpoint responsive
├── js/
│   ├── main.js             # Bootstrap aplikasi, katalog, interaksi UI
│   ├── player.js           # Loader dinamis embed.js dari HTMLGames CDN
│   ├── fullscreen.js       # Wrapper Fullscreen API
│   └── router.js           # Parsing parameter URL & SEO meta dinamis
└── assets/
    ├── logo.png
    ├── favicon.png
    └── loading.svg
```

---

## 🚀 Cara Deploy ke GitHub Pages

1. Buat repository baru di GitHub, misalnya `296-game`.
2. Upload seluruh isi folder `296-game/` ke root repository tersebut (bukan di dalam subfolder).
3. Buka tab **Settings → Pages** di repository.
4. Pada bagian **Source**, pilih branch `main` dan folder `/ (root)`.
5. Klik **Save**. Tunggu beberapa menit hingga GitHub Pages selesai membangun situs.
6. Situs akan aktif di:
   ```
   https://<username>.github.io/296-game/
   ```
7. (Opsional) Jika menggunakan domain custom seperti `296.web.id`, tambahkan file `CNAME` berisi domain tersebut di root repository, lalu atur DNS record (CNAME) mengarah ke `<username>.github.io`.

> **Catatan:** Karena situs menggunakan path relatif (`./`), pastikan struktur folder tidak diubah agar semua tautan CSS/JS/asset tetap berfungsi.

---

## 🎨 Cara Mengganti Logo

1. Siapkan gambar logo baru (disarankan format PNG, rasio 1:1, minimal 512×512px).
2. Ganti file `assets/logo.png` dengan logo baru (gunakan nama file yang sama, atau ubah referensinya di `index.html` dan `play.html` pada tag `<img class="brand-logo" ...>`).
3. Jika ingin mengganti ikon PWA juga, perbarui `assets/favicon.png` dan referensi `icons` di `manifest.json`.

---

## 🎨 Cara Mengganti Warna

Semua warna dikendalikan lewat CSS variable di bagian atas `css/style.css`:

```css
:root {
  --color-bg: #0a0a0a;        /* Warna latar utama */
  --color-surface: #1a1a1a;   /* Warna kartu/panel */
  --color-accent: #ff9800;    /* Warna aksen (orange) */
  --color-text: #f5f5f5;      /* Warna teks utama */
  --color-text-muted: #9a9a9a;/* Warna teks sekunder */
}
```

Ubah nilai hex sesuai kebutuhan — seluruh komponen (tombol, kartu game, ikon, dsb.) akan otomatis mengikuti karena semua menggunakan variable ini.

---

## ➕ Cara Menambahkan Halaman Baru

1. Buat file HTML baru di root folder, misalnya `about.html`, dan salin struktur `<head>` dari `index.html` (meta SEO, favicon, font, CSS).
2. Sertakan `<header>` dan `<footer>` yang sama agar navigasi konsisten.
3. Tambahkan link ke halaman baru pada `<nav class="main-nav">` di `index.html`.
4. Jika halaman baru memerlukan interaksi JS, buat file baru di folder `js/` lalu impor dengan `<script src="./js/nama-file.js" defer></script>`.

---

## 🔖 Cara Mengganti Favicon

1. Siapkan gambar favicon baru (format PNG, disarankan 512×512px, latar transparan atau solid).
2. Timpa file `assets/favicon.png` dengan gambar baru menggunakan nama file yang sama.
3. Tidak perlu mengubah kode — seluruh referensi favicon di `index.html`, `play.html`, `offline.html`, dan `manifest.json` sudah menunjuk ke path yang sama.

---

## 🏗️ Arsitektur Player (v2)

Sejak refactor arsitektur, alur pemuatan game mengikuti pipeline berikut:

```
play.html → router.js → database.js → data/games.json → provider.js → player.js → embed script
```

| Layer | Tanggung jawab | Tidak boleh tahu soal |
|---|---|---|
| `router.js` | Baca parameter `?id=` dari URL | game, database, provider, SEO |
| `database.js` | Muat `data/games.json`, cari game by id | provider, URL, UI |
| `provider.js` | Ubah data game jadi URL embed sesuai `provider` | database, UI |
| `player.js` | Suntikkan embed URL ke DOM, tangani loading/error | provider, database, JSON |
| `main.js` | Orchestrator: hubungkan semua layer + urus UI/meta SEO | — |

## 🕹️ Cara Menggunakan Parameter Game

Sejak v2, `play.html` **tidak lagi memakai `?game=`**, melainkan `?id=` yang menunjuk ke `id` di `data/games.json`:

```
play.html?id=mahjong-collapse
play.html?id=bubble-shooter
play.html?id=sudoku
play.html?id=2048
```

`router.js` hanya membaca id mentah ini — ia sama sekali tidak tahu nama teknis game atau provider mana yang dipakai.

### Menambahkan game baru

1. Tambahkan entri baru di `data/games.json`:
   ```json
   {
     "id": "nama-game-baru",
     "game": "NamaGameBaru",
     "title": "Nama Game Baru",
     "category": "Puzzle",
     "thumbnail": "assets/thumbs/nama-game-baru.webp",
     "provider": "htmlgames"
   }
   ```
2. (Opsional) Tambahkan kartu di katalog `index.html` dengan menambah entri di array `GAME_CATALOG` pada `js/main.js`, memakai `id` yang sama:
   ```js
   { id: "nama-game-baru", title: "Nama Game Baru", icon: "🎮" }
   ```
   > Catatan: array ini hanya untuk tampilan katalog di `index.html` dan perlu disinkronkan manual dengan `games.json`. Untuk skala ribuan game, katalog sebaiknya dirender langsung dari `GameDatabase` — ini perubahan terpisah yang belum dikerjakan agar lingkup refactor tetap fokus pada alur `play.html`.

Tidak perlu mengubah `player.js` sama sekali — ia generik untuk provider apa pun.

### Menambahkan provider baru

Cukup tambah satu adapter di `PROVIDER_ADAPTERS` pada `js/provider.js`:

```js
gamedistribution: (gameData) => {
  return `https://html5.gamedistribution.com/${gameData.game}/`;
},
```

Lalu set `"provider": "gamedistribution"` pada entri game terkait di `games.json`. Tidak ada file lain yang perlu diubah — ini prinsip Open/Closed yang jadi dasar refactor ini.

### Penanganan Error

| Kondisi | Pesan yang tampil |
|---|---|
| `?id=` kosong | "Belum Ada Game Dipilih" (No Game Selected) |
| `id` tidak ada di `games.json` | "Game Tidak Ditemukan" (Game Not Found) |
| `provider` tidak dikenal `provider.js` | "Provider Tidak Didukung" (Provider Unsupported) |
| Embed script gagal/timeout dimuat | "Game Tidak Tersedia" (Game Failed To Load) |

---

## ✨ Fitur Utama

- ✅ Player generik berbasis parameter URL (tanpa hardcode nama game)
- ✅ Fullscreen API dengan fallback notifikasi
- ✅ Loading progress & animasi transisi halus
- ✅ Penanganan error (game kosong / gagal dimuat) dengan tampilan yang rapi
- ✅ SEO dinamis (title, description, Open Graph, Twitter Card, canonical)
- ✅ Tombol Kembali, Refresh, Copy Link, Share (Web Share API)
- ✅ Scroll to top, ripple effect, toast notification
- ✅ Progressive Web App (installable, offline fallback)
- ✅ 100% responsive — desktop, tablet, Android, iPhone, landscape & portrait
- ✅ Aksesibilitas: semantic HTML, aria-label, navigasi keyboard

---

## 🛠️ Teknologi

HTML5 · CSS3 · Vanilla JavaScript (ES6+) · Google Fonts (Poppins) · Fullscreen API · Web Share API · Service Worker

---

© 296 GAME — [296.web.id](https://296.web.id)
