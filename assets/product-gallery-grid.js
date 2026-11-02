/* Product page two-column image grid (Gallery style "Two columns list").
   1. Smart sticky columns: each column sticks below the header; a column
      taller than the screen gets a negative top so it scrolls to its end
      first and then holds while the other column keeps scrolling.
   2. Multi-colour products: shows only the selected colour's images
      (tagged data-pd-color in sections/main-product.liquid). */
(function () {
  var mq = window.matchMedia('(min-width: 768px)');
  var GAP = 16;

  function grid() {
    return document.querySelector('.product-single.pd-grid');
  }

  function headerOffset() {
    var hd = document.querySelector('.header-wrap');
    if (!hd) return 0;
    var cfg = hd.querySelector('[data-sticky]') || hd;
    if (cfg.getAttribute('data-sticky') === 'none' || hd.classList.contains('header-hidden')) return 0;
    return hd.offsetHeight;
  }

  function updateSticky() {
    var root = grid();
    if (!root) return;
    var cols = root.querySelectorAll(':scope > .product-gallery, :scope > .product-meta__column');
    cols.forEach(function (col) {
      if (!mq.matches) {
        col.style.removeProperty('--pd-sticky-top');
        return;
      }
      var top = headerOffset() + GAP;
      var room = window.innerHeight - top - GAP;
      var h = col.offsetHeight;
      col.style.setProperty('--pd-sticky-top', (h <= room ? top : window.innerHeight - h - GAP) + 'px');
    });
  }

  var queued = false;
  function queueUpdate() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () {
      queued = false;
      updateSticky();
    });
  }

  function applyColor(gallery, color) {
    var tiles = gallery.querySelectorAll('[data-pd-color]');
    var match = Array.prototype.some.call(tiles, function (t) { return t.dataset.pdColor === color; });
    tiles.forEach(function (t) {
      t.toggleAttribute('data-pd-off', match && t.dataset.pdColor !== color);
    });
  }

  function onVariantChange(payload) {
    var d = payload && payload.data;
    if (!d || !d.variant || !d.variant.options) return;
    var gallery = document.getElementById('MediaGallery-' + d.sectionId) ||
      document.querySelector('.product-single.pd-grid media-gallery[data-pd-color-pos]');
    if (!gallery || !gallery.dataset.pdColorPos) return;
    var color = d.variant.options[gallery.dataset.pdColorPos - 1];
    if (color == null || gallery.dataset.pdColor === color) return;
    gallery.dataset.pdColor = color;
    applyColor(gallery, color);
    if (!mq.matches) return;
    // New colour: bring the top of the gallery back into view
    var root = grid();
    var top = root ? root.getBoundingClientRect().top : 0;
    var offset = headerOffset() + GAP;
    if (top < offset) window.scrollTo({ top: window.pageYOffset + top - offset, behavior: 'smooth' });
  }

  function boot() {
    var root = grid();
    if (!root) return;
    var gallery = root.querySelector('media-gallery[data-pd-color-pos]');
    if (gallery) {
      var on = gallery.querySelector('[data-pd-color]:not([data-pd-off])');
      if (on) gallery.dataset.pdColor = on.dataset.pdColor;
      if (typeof subscribe === 'function' && typeof PUB_SUB_EVENTS !== 'undefined') {
        subscribe(PUB_SUB_EVENTS.variantChange, onVariantChange);
      }
    }

    updateSticky();
    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(queueUpdate);
      root.querySelectorAll(':scope > .product-gallery, :scope > .product-meta__column').forEach(function (c) { ro.observe(c); });
    }
    window.addEventListener('resize', queueUpdate);
    window.addEventListener('load', queueUpdate);
    if (mq.addEventListener) mq.addEventListener('change', queueUpdate);
    var hd = document.querySelector('.header-wrap');
    if (hd && 'MutationObserver' in window) {
      new MutationObserver(queueUpdate).observe(hd, { attributes: true, attributeFilter: ['class'] });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
