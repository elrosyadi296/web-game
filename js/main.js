/* ==========================================================================
   296 GAME — main.js
   Entry point aplikasi. Menangani inisialisasi halaman index (katalog)
   dan halaman play (player), serta interaksi UI umum (toast, ripple,
   scroll-to-top, install prompt PWA).
   ========================================================================== */

/* ------------------------------------------------------------------------
   Data katalog game.
   TAHAP B (refactor arsitektur): katalog TIDAK lagi hardcoded di sini.
   Sekarang renderCatalog() membaca langsung dari GameDatabase.getAll(),
   yang meng-fetch data/games.json — satu-satunya sumber kebenaran untuk
   seluruh daftar game (dipakai juga oleh play.html). Ini menghilangkan
   duplikasi data yang sebelumnya harus disinkronkan manual dan menjadi
   prasyarat agar katalog bisa berkembang ke ribuan game (mis. lewat
   pagination/kategori) tanpa menyentuh main.js lagi.
   ------------------------------------------------------------------------ */
const CATALOG_ICON_FALLBACK = "🎮";

/* Beberapa game lama masih dirender dengan ikon emoji spesifik alih-alih
   thumbnail gambar. Mapping ini murni kosmetik & opsional — kalau field
   "icon" tidak ada di games.json, fallback ke ikon generik di atas. */
const CATALOG_ICON_MAP = {
  "mahjong-collapse": "🀄",
  "bubble-shooter": "🔮",
  "sudoku": "🔢",
  "2048": "🎯",
  "solitaire-klondike": "🃏",
  "fruit-slice": "🍉",
  "tetris-classic": "🧱",
  "chess-online": "♟️",
  "word-search": "🔤",
  "pacman-classic": "👻",
  "candy-match-3": "🍬",
  "snake-arena": "🐍",
  "Endless-Dimensions": "🌌",
};

/* ===== Toast Notification ===== */
const Toast = (() => {
  let hideTimeout = null;

  function show(message, type = "info", duration = 2600) {
    const el = document.getElementById("toast");
    if (!el) return;

    el.textContent = message;
    el.classList.remove("toast-error");
    if (type === "error") el.classList.add("toast-error");

    el.classList.add("show");

    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(() => el.classList.remove("show"), duration);
  }

  return { show };
})();

/* ===== Ripple Effect ===== */
function attachRipple(el) {
  el.addEventListener("click", (e) => {
    const rect = el.getBoundingClientRect();
    const circle = document.createElement("span");
    const size = Math.max(rect.width, rect.height);
    circle.className = "ripple-circle";
    circle.style.width = circle.style.height = `${size}px`;
    circle.style.left = `${e.clientX - rect.left - size / 2}px`;
    circle.style.top = `${e.clientY - rect.top - size / 2}px`;
    el.appendChild(circle);
    setTimeout(() => circle.remove(), 650);
  });
}

function initRipples() {
  document.querySelectorAll(".ripple").forEach(attachRipple);
}

/* ===== Scroll to Top ===== */
function initScrollTop() {
  const btn = document.getElementById("scrollTopBtn");
  if (!btn) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 400) btn.classList.remove("hidden");
    else btn.classList.add("hidden");
  });

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ===== Footer Year ===== */
function initFooterYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
}

/* ===== Catalog Rendering (index.html) ===== */
async function renderCatalog() {
  const grid = document.getElementById("gameGrid");
  if (!grid) return; // bukan halaman index

  try {
    await GameDatabase.load();
  } catch (err) {
    console.error("[296GAME] Katalog gagal dimuat:", err);
    grid.innerHTML = `<p class="catalog-error">Gagal memuat daftar game. Coba muat ulang halaman.</p>`;
    return;
  }

  const games = GameDatabase.getAll();

  grid.innerHTML = games
    .map((g, i) => {
      const icon = CATALOG_ICON_MAP[g.id] || CATALOG_ICON_FALLBACK;
      return `
    <a
      href="./play.html?id=${encodeURIComponent(g.id)}"
      class="game-card"
      role="listitem"
      style="animation-delay:${Math.min(i, 30) * 40}ms"
      aria-label="Main ${g.title}"
    >
      <div class="game-card-thumb" aria-hidden="true">${icon}</div>
      <div class="game-card-body">
        <p class="game-card-title">${g.title}</p>
      </div>
      <span class="game-card-play" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
      </span>
    </a>`;
    })
    .join("");
}

/* ==========================================================================
   PLAY PAGE LOGIC
   ========================================================================== */

/**
 * Perbarui meta tag SEO (title, description, OG, Twitter Card, canonical)
 * berdasarkan data game ASLI dari database (bukan hasil tebakan dari URL).
 * Dipindahkan dari router.js ke sini agar router.js murni hanya urusan URL.
 */
function updateGameMeta(gameData) {
  const title = `Main ${gameData.title} — 296 GAME`;
  const desc = `Mainkan ${gameData.title} gratis langsung di browser tanpa install. Ringan dan cepat hanya di 296 GAME.`;
  const url = `https://296.web.id/play.html?id=${encodeURIComponent(gameData.id)}`;

  document.title = title;
  setMetaContent("pageDescription", desc);
  setMetaContent("ogTitleTag", title);
  setMetaContent("ogDescTag", desc);
  setMetaContent("ogUrlTag", url);
  setMetaContent("twTitleTag", title);
  setMetaContent("twDescTag", desc);

  const canonical = document.getElementById("canonicalLink");
  if (canonical) canonical.setAttribute("href", url);
}

function setMetaContent(id, value) {
  const el = document.getElementById(id);
  if (el) el.setAttribute("content", value);
}

/**
 * Definisi teks untuk tiap skenario error, supaya panel yang sama
 * (#errorState) bisa menampilkan pesan yang berbeda tanpa mengubah CSS.
 */
const ERROR_MESSAGES = {
  not_found: {
    title: "Game Tidak Ditemukan",
    message: "Game dengan id tersebut tidak ada di database kami. Coba pilih game lain dari katalog.",
  },
  provider_unsupported: {
    title: "Provider Tidak Didukung",
    message: "Game ini menggunakan penyedia yang belum didukung sistem. Silakan pilih game lain.",
  },
  load_failed: {
    title: "Game Tidak Tersedia",
    message: "Terjadi kendala saat memuat game ini. Coba muat ulang atau pilih game lain.",
  },
};

function initPlayPage() {
  const gameContainer = document.getElementById("gameContainer");
  const loadingState = document.getElementById("loadingState");
  const emptyState = document.getElementById("emptyState");
  const errorState = document.getElementById("errorState");
  const errorTitleEl = document.getElementById("errorTitle");
  const errorMessageEl = document.getElementById("errorMessage");
  const loadingBar = document.getElementById("loadingBar");

  if (!gameContainer) return; // bukan halaman play

  let currentGameData = null; // dipakai oleh Copy Link / Share setelah game termuat

  function showOnly(section) {
    [gameContainer, loadingState, emptyState, errorState].forEach((el) => {
      if (!el) return;
      el.classList.toggle("hidden", el !== section);
    });
  }

  function showError(kind) {
    const msg = ERROR_MESSAGES[kind] || ERROR_MESSAGES.load_failed;
    if (errorTitleEl) errorTitleEl.textContent = msg.title;
    if (errorMessageEl) errorMessageEl.textContent = msg.message;
    showOnly(errorState);
    Toast.show(msg.title, "error");
  }

  function animateProgress() {
    let progress = 0;
    const interval = setInterval(() => {
      progress = Math.min(progress + Math.random() * 25, 90);
      if (loadingBar) loadingBar.style.width = `${progress}%`;
      if (progress >= 90) clearInterval(interval);
    }, 300);
    return interval;
  }

  /**
   * Orchestrator utama: Router -> Database -> Provider -> Player.
   * Setiap layer hanya dipanggil lewat kontraknya masing-masing;
   * main.js tidak tahu detail implementasi internal tiap layer.
   */
  async function startLoad() {
    const id = Router.getGameId();

    if (!id) {
      showOnly(emptyState); // "No Game Selected"
      return;
    }

    showOnly(loadingState);
    if (loadingBar) loadingBar.style.width = "0%";
    const progressInterval = animateProgress();

    // 1) DATABASE: pastikan games.json sudah dimuat, lalu cari by id
    try {
      await GameDatabase.load();
    } catch (err) {
      clearInterval(progressInterval);
      console.error("[296GAME] Database gagal dimuat:", err);
      showError("load_failed");
      return;
    }

    const gameData = GameDatabase.getById(id);
    if (!gameData) {
      clearInterval(progressInterval);
      showError("not_found"); // "Game Not Found"
      return;
    }

    // 2) PROVIDER: pastikan provider dikenal, lalu bangun embed URL
    if (!Provider.isSupported(gameData.provider)) {
      clearInterval(progressInterval);
      showError("provider_unsupported"); // "Provider Unsupported"
      return;
    }

    let embedUrl;
    try {
      embedUrl = Provider.getEmbedUrl(gameData);
    } catch (err) {
      clearInterval(progressInterval);
      console.error("[296GAME] Provider gagal membangun embed URL:", err);
      showError("provider_unsupported");
      return;
    }

    currentGameData = gameData;
    updateGameMeta(gameData);

    // 3) PLAYER: player hanya menerima embedUrl jadi, tidak tahu soal provider
    GamePlayer.load(
      embedUrl,
      gameContainer,
      () => {
        clearInterval(progressInterval);
        if (loadingBar) loadingBar.style.width = "100%";
        setTimeout(() => {
          showOnly(gameContainer);
          Toast.show(`${gameData.title} siap dimainkan!`);
        }, 250);
      },
      (err) => {
        clearInterval(progressInterval);
        console.error("[296GAME] Player gagal memuat game:", err);
        showError("load_failed"); // "Game Failed To Load"
      }
    );
  }

  startLoad();

  // ===== Toolbar actions =====
  const btnBack = document.getElementById("btnBack");
  const btnRefresh = document.getElementById("btnRefresh");
  const btnFullscreen = document.getElementById("btnFullscreen");
  const btnCopyLink = document.getElementById("btnCopyLink");
  const btnShare = document.getElementById("btnShare");
  const btnRetry = document.getElementById("btnRetry");

  btnBack?.addEventListener("click", () => {
    window.location.href = "./index.html";
  });

  btnRefresh?.addEventListener("click", () => {
    Toast.show("Memuat ulang game...");
    startLoad();
  });

  btnRetry?.addEventListener("click", startLoad);

  btnFullscreen?.addEventListener("click", async () => {
    const target = gameContainer.classList.contains("hidden")
      ? document.getElementById("playerMain")
      : gameContainer;
    const result = await FullscreenManager.toggle(target);
    if (!result.ok && result.reason === "unsupported") {
      Toast.show("Fullscreen tidak didukung di browser ini.", "error");
    }
  });

  btnCopyLink?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      Toast.show("Tautan berhasil disalin!");
    } catch {
      Toast.show("Gagal menyalin tautan.", "error");
    }
  });

  btnShare?.addEventListener("click", async () => {
    const shareData = {
      title: document.title,
      text: `Yuk main ${currentGameData ? currentGameData.title : "game ini"} di 296 GAME!`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        /* user membatalkan share, abaikan */
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        Toast.show("Tautan disalin (Share API tidak tersedia).");
      } catch {
        Toast.show("Berbagi tidak didukung di browser ini.", "error");
      }
    }
  });
}

/* ==========================================================================
   PWA: Service Worker & Install Prompt
   ========================================================================== */

function initServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch((err) => {
      console.warn("[296GAME] Service worker gagal didaftarkan:", err);
    });
  });
}

let deferredInstallPrompt = null;
function initInstallPrompt() {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
  });
}

/* ===== Bootstrap ===== */
document.addEventListener("DOMContentLoaded", () => {
  initFooterYear();
  renderCatalog();
  initPlayPage();
  initScrollTop();
  initRipples();
  initServiceWorker();
  initInstallPrompt();
});
