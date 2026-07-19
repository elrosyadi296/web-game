/* ==========================================================================
   296 GAME — database.js
   Lapisan data. Tanggung jawabnya HANYA:
     1. Memuat data/games.json
     2. Menyimpan hasilnya di memory
     3. Mencari game berdasarkan id
   Tidak ada logika provider, tidak ada logika UI, tidak ada logika URL
   di dalam file ini.
   ========================================================================== */

const GameDatabase = (() => {
  let games = [];
  let loaded = false;
  let loadPromise = null;

  const DATA_URL = "./data/games.json";

  /**
   * Muat games.json sekali saja. Pemanggilan berikutnya akan
   * mengembalikan promise/cache yang sama (tidak fetch berulang).
   */
  async function load() {
    if (loaded) return games;
    if (loadPromise) return loadPromise;

    loadPromise = fetch(DATA_URL)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`DATABASE_LOAD_FAILED (status ${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        games = Array.isArray(data) ? data : [];
        loaded = true;
        return games;
      })
      .catch((err) => {
        loadPromise = null; // izinkan retry di percobaan berikutnya
        throw err;
      });

    return loadPromise;
  }

  /**
   * Cari satu game berdasarkan id. Mengembalikan object game
   * atau null jika tidak ditemukan. Wajib panggil load() dahulu.
   */
  function getById(id) {
    if (!id) return null;
    return games.find((g) => g.id === id) || null;
  }

  /**
   * Kembalikan seluruh daftar game (salinan array, bukan referensi
   * langsung) — dipakai oleh katalog di halaman utama.
   */
  function getAll() {
    return games.slice();
  }

  return { load, getById, getAll };
})();
