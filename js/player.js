/* ==========================================================================
   296 GAME — player.js
   Tanggung jawab TUNGGAL: mengambil embed URL yang SUDAH JADI (dari
   provider.js) lalu memuatnya ke dalam DOM. Player tidak tahu apa-apa
   soal JSON, database, ataupun provider — ia hanya tahu cara memuat
   game ke dalam container dan melaporkan sukses/gagal.

   CATATAN ARSITEKTUR (fix bug "Please provide a 'game' argument!"):
   Provider embed-script legacy (mis. cdn.htmlgames.com/embed.js) sering
   mendeteksi dirinya sendiri lewat
     document.getElementsByTagName('script')[scripts.length - 1]
   dan mengasumsikan dirinya adalah <script> TERAKHIR di dokumen, lalu
   membaca query string dari src-nya sendiri untuk tahu game apa yang
   harus dimuat. Asumsi itu hanya benar jika ia satu-satunya/​terakhir
   script di dokumen tempat ia berjalan.

   Kalau kita suntik <script src="embedUrl"> langsung ke #gameContainer
   di halaman utama, ia TIDAK akan jadi script terakhir di document
   order (karena router.js/database.js/provider.js/player.js/main.js
   sudah ada di bawahnya di HTML) — akibatnya provider salah mendeteksi
   dirinya sendiri, "game" dianggap kosong, dan muncul alert error.

   Solusi: isolasi game ke dalam <iframe srcdoc="...">. Di dalam
   dokumen iframe itu, embed script yang kita suntik BENAR-BENAR
   menjadi satu-satunya <script> di document — persis kondisi yang
   diasumsikan oleh provider. Ini juga otomatis mengamankan document.write()
   yang biasa dipakai provider lama (aman karena jadi bagian dari
   parsing sinkron dokumen iframe, bukan disuntik setelah halaman load).
   ========================================================================== */

const GamePlayer = (() => {
  const LOAD_TIMEOUT_MS = 15000;

  // Sandbox permission default untuk game HTML5 pihak ketiga:
  // - allow-scripts       : game hampir selalu butuh JS untuk jalan
  // - allow-same-origin    : sebagian provider butuh akses storage/cookie
  //                          miliknya sendiri (skor, save state) di origin CDN-nya
  // - allow-popups         : beberapa game/provider buka tab baru (link "more games", ads)
  // - allow-forms           : sebagian game pakai <form> internal (leaderboard, dsb)
  // Kalau nanti ada game/provider spesifik yang butuh izin tambahan
  // (mis. allow-popups-to-escape-sandbox, allow-orientation-lock),
  // ini titik tunggal yang perlu disesuaikan.
  const SANDBOX_PERMISSIONS =
    "allow-scripts allow-same-origin allow-popups allow-forms";

  let currentFrameEl = null;
  let loadTimeoutId = null;

  /**
   * Bersihkan container game & iframe sebelumnya (dipakai juga oleh
   * fitur Refresh Game).
   */
  function cleanup(containerEl) {
    if (loadTimeoutId) {
      clearTimeout(loadTimeoutId);
      loadTimeoutId = null;
    }
    currentFrameEl = null;
    if (containerEl) containerEl.innerHTML = "";
  }

  /**
   * Bangun dokumen HTML minimal untuk isi iframe. embedUrl dimuat
   * sebagai satu-satunya <script> di document ini.
   */
  function buildFrameDocument(embedUrl) {
    // embedUrl datang dari provider.js (URL.toString()), aman untuk
    // disisipkan ke src attribute karena sudah URL-encoded dengan benar.
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  /* Provider embed-script legacy biasanya menulis elemen game
     (canvas/div/iframe) dengan lebar-tinggi fixed dalam px, bukan
     100%. Aturan ini memastikan elemen itu tidak melebihi area iframe
     dan tetap proporsional, sambil tetap di-center oleh flexbox induk. */
  body > * {
    max-width: 100%;
    max-height: 100%;
  }
</style>
</head>
<body>
<script src="${embedUrl}"><\/script>
</body>
</html>`;
  }

  /**
   * Muat game ke dalam container menggunakan embed URL yang sudah
   * disiapkan oleh Provider.
   * @param {string} embedUrl - URL script embed hasil akhir dari provider.js
   * @param {HTMLElement} containerEl - elemen tempat game dirender
   * @param {Function} onSuccess - callback saat berhasil dimuat
   * @param {Function} onError - callback saat gagal dimuat / timeout
   */
  function load(embedUrl, containerEl, onSuccess, onError) {
    if (!embedUrl || !containerEl) {
      onError && onError(new Error("Embed URL atau container tidak valid."));
      return;
    }

    cleanup(containerEl);

    const frame = document.createElement("iframe");
    frame.setAttribute("sandbox", SANDBOX_PERMISSIONS);
    frame.setAttribute("allow", "fullscreen; autoplay; gamepad");
    frame.setAttribute("allowfullscreen", "");
    frame.setAttribute("title", "Game player");
    frame.loading = "eager";

    let settled = false;

    frame.onload = () => {
      // onload iframe ber-srcdoc terpicu begitu dokumen iframe (termasuk
      // parsing awal <script src="embedUrl">) selesai. Ini cukup untuk
      // menandakan game sudah mulai dimuat di dalam iframe-nya sendiri.
      if (settled) return;
      settled = true;
      clearTimeout(loadTimeoutId);
      onSuccess && onSuccess();
    };

    frame.onerror = () => {
      if (settled) return;
      settled = true;
      clearTimeout(loadTimeoutId);
      onError && onError(new Error("Gagal memuat game."));
    };

    // Timeout guard: jika sumber embed lambat/tidak merespons
    loadTimeoutId = setTimeout(() => {
      if (settled) return;
      settled = true;
      onError && onError(new Error("Waktu tunggu memuat game habis."));
    }, LOAD_TIMEOUT_MS);

    // srcdoc di-set SETELAH elemen di-append ke DOM supaya event onload
    // konsisten ter-attach sebelum browser mulai parsing dokumen iframe.
    currentFrameEl = frame;
    containerEl.appendChild(frame);
    frame.srcdoc = buildFrameDocument(embedUrl);
  }

  return { load, cleanup };
})();
