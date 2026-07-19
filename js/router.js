/* ==========================================================================
   296 GAME — router.js
   Tanggung jawab TUNGGAL: membaca parameter ?id= dari URL dan
   mengembalikan id mentahnya. Tidak tahu soal game, provider, database,
   ataupun meta SEO — semua itu ditangani layer lain (main.js/database.js).
   ========================================================================== */

const Router = (() => {
  /**
   * Ambil id game dari query string.
   * Contoh: play.html?id=mahjong-collapse -> "mahjong-collapse"
   */
  function getGameId() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    return id ? id.trim() : null;
  }

  return { getGameId };
})();
