/* ==========================================================================
   296 GAME — provider.js
   Adapter layer (Open/Closed Principle).
   Satu-satunya tempat di seluruh project yang boleh tahu bagaimana
   cara membangun URL embed untuk masing-masing penyedia game.

   Menambah provider baru (GameDistribution, GameMonetize, CrazyGames,
   Poki, GamePix, dst) HANYA dilakukan dengan menambah entri baru di
   PROVIDER_ADAPTERS di bawah ini. Tidak ada file lain yang perlu diubah.
   ========================================================================== */

const Provider = (() => {
  /**
   * Setiap adapter menerima objek gameData (dari database.js) dan
   * mengembalikan URL embed script siap pakai (string).
   */
  const PROVIDER_ADAPTERS = {
    htmlgames: (gameData) => {
      const url = new URL("https://cdn.htmlgames.com/embed.js");
      url.searchParams.set("game", gameData.game);
      url.searchParams.set("bgcolor", "black");
      return url.toString();
    },

    // Contoh titik ekstensi untuk provider berikutnya, non-aktif sampai
    // benar-benar dibutuhkan:
    //
    // gamedistribution: (gameData) => {
    //   return `https://html5.gamedistribution.com/${gameData.game}/`;
    // },
    // gamemonetize: (gameData) => {
    //   return `https://html5.gamemonetize.com/${gameData.game}/`;
    // },
  };

  /**
   * Cek apakah nama provider dikenali/didukung.
   */
  function isSupported(providerName) {
    return typeof PROVIDER_ADAPTERS[providerName] === "function";
  }

  /**
   * Hasilkan URL embed final dari data game.
   * Melempar error jika provider tidak dikenal — pemanggil (main.js)
   * bertanggung jawab menampilkan pesan "Provider Unsupported".
   */
  function getEmbedUrl(gameData) {
    const adapter = PROVIDER_ADAPTERS[gameData.provider];
    if (!adapter) {
      throw new Error(`PROVIDER_UNSUPPORTED: "${gameData.provider}"`);
    }
    return adapter(gameData);
  }

  return { isSupported, getEmbedUrl };
})();
