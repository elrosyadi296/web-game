/*!
 * kids-nav.js — Navigasi sidebar bersama untuk Game Anak
 * ------------------------------------------------------------------
 * CARA PAKAI (di setiap file game, tepat sebelum </body> atau di <head>):
 *
 *     <script src="kids-nav.js" defer></script>
 *
 * Opsi (opsional, lewat atribut pada tag script):
 *     data-pos="top-left"      posisi tombol hamburger:
 *                              top-left | top-right | bottom-left | bottom-right
 *                              (default: top-left)
 *     data-home="/kids/"       alamat homepage (default: otomatis dari lokasi script)
 *
 * Daftar game ada di GAMES di bawah. Tambah / ubah game CUKUP DI SINI,
 * homepage (index.html) dan sidebar akan ikut berubah otomatis.
 * ------------------------------------------------------------------
 */
(function () {
  'use strict';
  if (window.KidsNav) return;

  /* ===================== DAFTAR GAME (edit di sini) ===================== */
  var CATEGORIES = [
    { id: 'hitung',  label: 'Berhitung',            emoji: '🔢' },
    { id: 'baca',    label: 'Membaca & Mengeja',    emoji: '🔤' },
    { id: 'kreatif', label: 'Kreatif',              emoji: '🎨' },
    { id: 'kenal',   label: 'Mengenal Dunia',       emoji: '🐾' }
  ];

  // file  : nama file persis seperti di server (boleh ada spasi)
  // c / d : warna utama & warna bayangan tombol 3D
  var GAMES = [
    { file: 'dot-to-dot.html', title: 'Hubungkan Titik Angka', emoji: '🔢', cat: 'hitung',
      desc: 'Sambungkan titik sesuai urutan angka dan temukan gambar kejutan!', c: '#7c5cff', d: '#5237d6' },
    { file: 'fruit-addition-adventure.html', title: 'Petualangan Tambah Buah', emoji: '🍎', cat: 'hitung',
      desc: 'Hitung buah-buahan lucu dan belajar penjumlahan sambil bermain.', c: '#ff6b6b', d: '#d94545' },
    { file: 'math-crossword.html', title: 'TTS Matematika', emoji: '➕', cat: 'hitung',
      desc: 'Isi kotak teka-teki silang dengan jawaban hitungan yang benar.', c: '#19b6a5', d: '#0e8c7e' },

    { file: 'mengeja-kata.html', title: 'Mengeja Kata', emoji: '🔤', cat: 'baca',
      desc: 'Susun huruf demi huruf menjadi kata yang benar.', c: '#ff9f1c', d: '#d97f00' },
    { file: 'spelling-game-id.html', title: 'Spelling Game (Indonesia)', emoji: '🇮🇩', cat: 'baca',
      desc: 'Latihan mengeja kata-kata Bahasa Indonesia.', c: '#f2545b', d: '#c93841' },
    { file: 'spelling-game-en.html', title: 'Spelling Game (English)', emoji: '🇬🇧', cat: 'baca',
      desc: 'Belajar mengeja kata Bahasa Inggris dengan seru.', c: '#3b82f6', d: '#2563c9' },

    { file: 'mewarnai.html', title: 'Mewarnai', emoji: '🎨', cat: 'kreatif',
      desc: 'Pilih warna favoritmu dan hiasi gambarnya.', c: '#ec4899', d: '#c02a7a' },
    { file: 'storybook-coloring.html', title: 'Mewarnai Buku Cerita', emoji: '📖', cat: 'kreatif',
      desc: 'Warnai halaman buku cerita dan hidupkan dongengnya.', c: '#a855f7', d: '#8030cc' },

    { file: 'memory-match.html', title: 'Kartu Suara Hewan', emoji: '🐮', cat: 'kenal',
      desc: 'Cocokkan kartu dan dengarkan suara hewan-hewan lucu.', c: '#84cc16', d: '#5f9c05' },
    { file: 'tebak-hewan.html', title: 'Tebak Hewan', emoji: '🐘', cat: 'kenal',
      desc: 'Uji ingatanmu: kenali dan tebak hewan-hewan favorit.', c: '#14b8c4', d: '#0d8f99' },
    { file: 'pemilah-buah-dan-sayur.html', title: 'Pilah Buah & Sayur', emoji: '🥕', cat: 'kenal',
      desc: 'Mana buah, mana sayur? Pilah ke keranjang yang tepat!', c: '#f97316', d: '#cc5806' }
  ];
  /* ====================================================================== */

  var script = document.currentScript;
  var scriptURL = script && script.src ? script.src : location.href;
  var base = new URL('./', scriptURL).href;               // folder tempat kids-nav.js berada
  var homeAttr = script && script.getAttribute('data-home');
  var homeURL = homeAttr
    ? new URL(homeAttr, location.href).href
    : (location.protocol === 'file:' ? base + 'index.html' : base);
  var pos = (script && script.getAttribute('data-pos')) || 'top-left';

  function urlOf(g) { return base + encodeURIComponent(g.file); }
  function norm(s) { return decodeURIComponent(s).replace(/\.html?$/i, '').toLowerCase(); }
  function currentGame() {
    var last = location.pathname.split('/').pop();
    if (!last) return null;
    var n = norm(last);
    for (var i = 0; i < GAMES.length; i++) if (norm(GAMES[i].file) === n) return GAMES[i];
    return null;
  }
  function randomGame(exclude) {
    var pool = GAMES.filter(function (g) { return !exclude || g.file !== exclude.file; });
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // API publik (dipakai juga oleh index.html)
  window.KidsNav = {
    games: GAMES, categories: CATEGORIES, homeURL: homeURL,
    urlOf: urlOf, randomGame: randomGame, currentGame: currentGame
  };

  // Halaman homepage tidak perlu sidebar
  if (document.documentElement.hasAttribute('data-kids-home')) return;

  /* ============================ UI SIDEBAR ============================ */
  var CSS = '\
:host{all:initial}\
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}\
.root{font-family:"Baloo 2","Nunito",system-ui,sans-serif;color:#3a2d86}\
.fab{position:fixed;z-index:1;width:48px;height:48px;border:0;border-radius:16px;background:#fff;color:#3a2d86;\
cursor:pointer;display:grid;place-items:center;box-shadow:0 4px 0 #cfc3f5,0 8px 14px rgba(58,45,134,.3);\
opacity:.94;transition:transform .15s,opacity .2s}\
.fab:hover{opacity:1;transform:scale(1.06)}\
.fab:active{transform:translateY(3px);box-shadow:0 1px 0 #cfc3f5}\
.fab:focus-visible,.x:focus-visible,.item:focus-visible,.home:focus-visible,.rnd:focus-visible{outline:4px solid #ffc83d;outline-offset:2px}\
.top-left{top:max(10px,env(safe-area-inset-top));left:max(10px,env(safe-area-inset-left))}\
.top-right{top:max(10px,env(safe-area-inset-top));right:max(10px,env(safe-area-inset-right))}\
.bottom-left{bottom:max(10px,env(safe-area-inset-bottom));left:max(10px,env(safe-area-inset-left))}\
.bottom-right{bottom:max(10px,env(safe-area-inset-bottom));right:max(10px,env(safe-area-inset-right))}\
.bars{width:22px;height:16px;display:flex;flex-direction:column;justify-content:space-between}\
.bars i{display:block;height:3.5px;border-radius:4px;background:currentColor}\
.open .fab{opacity:0;pointer-events:none}\
.veil{position:fixed;inset:0;z-index:2;background:rgba(58,45,134,.45);backdrop-filter:blur(3px);opacity:0;pointer-events:none;transition:opacity .25s}\
.open .veil{opacity:1;pointer-events:auto}\
.panel{position:fixed;z-index:3;top:0;bottom:0;left:0;width:min(86vw,330px);display:flex;flex-direction:column;gap:12px;\
padding:max(14px,env(safe-area-inset-top)) 14px max(14px,env(safe-area-inset-bottom)) max(14px,env(safe-area-inset-left));\
background:linear-gradient(180deg,#e6f3ff,#f0e6ff);border-right:4px solid #fff;border-radius:0 28px 28px 0;\
box-shadow:8px 0 0 #cfc3f5,18px 0 40px rgba(58,45,134,.35);transform:translateX(-110%);visibility:hidden;\
transition:transform .3s cubic-bezier(.34,1.2,.64,1),visibility 0s .3s}\
.open .panel{transform:none;visibility:visible;transition:transform .3s cubic-bezier(.34,1.2,.64,1),visibility 0s}\
.head{display:flex;align-items:center;justify-content:space-between;gap:8px}\
.brand{font-weight:800;font-size:1.25rem;line-height:1.1}\
.brand small{display:block;font:700 .75rem "Nunito",system-ui,sans-serif;opacity:.65}\
.x{flex:none;width:44px;height:44px;border:0;border-radius:14px;background:#fff;color:#3a2d86;font-size:1.3rem;font-weight:800;\
cursor:pointer;box-shadow:0 4px 0 #cfc3f5}\
.x:active{transform:translateY(3px);box-shadow:none}\
.home{display:flex;align-items:center;gap:10px;text-decoration:none;color:#fff;font-weight:800;font-size:1.15rem;\
padding:.7rem 1rem;border-radius:18px;background:#1fc8a0;box-shadow:0 6px 0 #0f9f80;transition:transform .12s}\
.home:hover{transform:translateY(-2px)}.home:active{transform:translateY(5px);box-shadow:0 1px 0 #0f9f80}\
.home b{font-size:1.5rem}\
.lbl{font:800 .8rem "Nunito",system-ui,sans-serif;text-transform:uppercase;letter-spacing:.06em;opacity:.6;padding:0 4px}\
.list{flex:1;overflow-y:auto;display:grid;gap:8px;align-content:start;padding:2px 2px 8px;overscroll-behavior:contain}\
.item{display:flex;align-items:center;gap:10px;text-decoration:none;color:#3a2d86;background:#fff;border-radius:16px;\
padding:.45rem .7rem .45rem .45rem;font-weight:800;font-size:1rem;line-height:1.1;box-shadow:0 4px 0 #d8cff7;transition:transform .12s}\
.item:hover{transform:translateX(4px)}.item:active{transform:translateY(3px);box-shadow:none}\
.ico{flex:none;width:42px;height:42px;display:grid;place-items:center;font-size:1.5rem;border-radius:13px;background:var(--c);\
box-shadow:0 3px 0 var(--d)}\
.tag{margin-left:auto;font:800 .65rem "Nunito",system-ui,sans-serif;color:#fff;background:#1fc8a0;border-radius:99px;padding:.15rem .5rem}\
.item.now{background:#fff4c9;box-shadow:0 4px 0 #f3cf62;pointer-events:none}\
.rnd{border:0;cursor:pointer;font-family:inherit;font-weight:800;font-size:1.05rem;color:#fff;background:#ff9f1c;border-radius:18px;\
padding:.6rem 1rem;box-shadow:0 6px 0 #d97f00}\
.rnd:active{transform:translateY(5px);box-shadow:0 1px 0 #d97f00}\
@media(prefers-reduced-motion:reduce){*{transition:none!important}}';

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function mount() {
    if (document.getElementById('kids-nav-host')) return;

    // Font & favicon cadangan (hanya jika game belum punya)
    if (!document.querySelector('link[href*="fonts.googleapis.com"][href*="Baloo"]')) {
      var f = document.createElement('link');
      f.rel = 'stylesheet';
      f.href = 'https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;800&family=Nunito:wght@700;800&display=swap';
      document.head.appendChild(f);
    }
    if (!document.querySelector('link[rel~="icon"]')) {
      var ic = document.createElement('link');
      ic.rel = 'icon'; ic.href = base + 'favicon.svg'; ic.type = 'image/svg+xml';
      document.head.appendChild(ic);
    }

    var host = document.createElement('div');
    host.id = 'kids-nav-host';
    host.style.cssText = 'position:fixed;z-index:2147483000;top:0;left:0;width:0;height:0;';
    var shadow = host.attachShadow({ mode: 'open' });   // terisolasi dari CSS game
    var style = document.createElement('style');
    style.textContent = CSS;

    var cur = currentGame();
    var root = el('div', 'root');

    var fab = el('button', 'fab ' + pos, '<span class="bars"><i></i><i></i><i></i></span>');
    fab.type = 'button';
    fab.setAttribute('aria-label', 'Buka menu game');
    fab.setAttribute('aria-expanded', 'false');

    var veil = el('div', 'veil');

    var panel = el('nav', 'panel');
    panel.setAttribute('aria-label', 'Menu game anak');

    var head = el('div', 'head', '<div class="brand">🎈 Dunia Game Anak<small>Pilih game lain, yuk!</small></div>');
    var x = el('button', 'x', '✕');
    x.type = 'button'; x.setAttribute('aria-label', 'Tutup menu');
    head.appendChild(x);

    var home = el('a', 'home', '<b>🏠</b> Beranda Game');
    home.href = homeURL;

    var list = el('div', 'list');
    GAMES.forEach(function (g) {
      var isNow = cur && cur.file === g.file;
      var a = el('a', 'item' + (isNow ? ' now' : ''),
        '<span class="ico" style="--c:' + g.c + ';--d:' + g.d + '">' + g.emoji + '</span><span>' + g.title + '</span>' +
        (isNow ? '<span class="tag">Main</span>' : ''));
      a.href = urlOf(g);
      if (isNow) a.setAttribute('aria-current', 'page');
      list.appendChild(a);
    });

    var rnd = el('button', 'rnd', '🎲 Kejutkan Aku!');
    rnd.type = 'button';
    rnd.onclick = function () { location.href = urlOf(randomGame(cur)); };

    panel.appendChild(head);
    panel.appendChild(home);
    panel.appendChild(el('div', 'lbl', 'Game lainnya'));
    panel.appendChild(list);
    panel.appendChild(rnd);

    root.appendChild(fab);
    root.appendChild(veil);
    root.appendChild(panel);
    shadow.appendChild(style);
    shadow.appendChild(root);
    document.body.appendChild(host);

    function setOpen(open) {
      root.classList.toggle('open', open);
      fab.setAttribute('aria-expanded', String(open));
      if (open) setTimeout(function () { x.focus(); }, 50); else fab.focus({ preventScroll: true });
    }
    fab.onclick = function () { setOpen(true); };
    x.onclick = veil.onclick = function () { setOpen(false); };
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && root.classList.contains('open')) setOpen(false);
    });
  }

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
