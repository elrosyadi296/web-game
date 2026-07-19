/* ==========================================================================
   296 GAME — fullscreen.js
   Wrapper untuk Fullscreen API dengan fallback notifikasi jika
   browser tidak mendukung.
   ========================================================================== */

const FullscreenManager = (() => {
  function isSupported() {
    return !!(
      document.documentElement.requestFullscreen ||
      document.documentElement.webkitRequestFullscreen ||
      document.documentElement.msRequestFullscreen
    );
  }

  function isFullscreen() {
    return !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement
    );
  }

  async function enter(el) {
    if (!el) return false;
    try {
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      else if (el.msRequestFullscreen) await el.msRequestFullscreen();
      else return false;
      return true;
    } catch (err) {
      console.error("[296GAME] Gagal masuk fullscreen:", err);
      return false;
    }
  }

  async function exit() {
    try {
      if (document.exitFullscreen) await document.exitFullscreen();
      else if (document.webkitExitFullscreen) await document.webkitExitFullscreen();
      else if (document.msExitFullscreen) await document.msExitFullscreen();
    } catch (err) {
      console.error("[296GAME] Gagal keluar fullscreen:", err);
    }
  }

  async function toggle(el) {
    if (!isSupported()) {
      return { ok: false, reason: "unsupported" };
    }
    if (isFullscreen()) {
      await exit();
      return { ok: true, state: "exited" };
    }
    const success = await enter(el);
    return { ok: success, state: success ? "entered" : "failed" };
  }

  return { isSupported, isFullscreen, enter, exit, toggle };
})();
