/* Products carousel, "Portrait peek layout": continuous glide on top of the theme's Swiper (vendor.js).
   The section sets autoplay delay 0 + a long linear `speed`, so slides glide back to back.
   This file keeps arrows and swipes snappy (short eased transition, then resume gliding)
   and switches the glide off for visitors who prefer reduced motion. */
(function () {
  var QUICK = 600;
  var RESUME_AFTER = 2000;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  function setup(el) {
    var sw = el.swiper;
    if (!sw || el._pcGlide === sw) return;
    el._pcGlide = sw;

    var root = el.closest('.pc-peek');
    var glide = parseInt(root.getAttribute('data-glide-ms'), 10);
    if (!glide || !sw.params.autoplay || !sw.params.autoplay.enabled) return;
    var timer;

    function freeze() {
      /* Stop the in-flight linear glide where it is, so a click or drag starts from what is on screen */
      clearTimeout(timer);
      sw.autoplay.stop();
      root.classList.remove('pc-glide');
      sw.setTranslate(sw.getTranslate());
      sw.setTransition(0);
      sw.animating = false;
      sw.params.speed = QUICK;
    }

    function resume() {
      clearTimeout(timer);
      if (reduce.matches) return;
      timer = setTimeout(function () {
        sw.params.speed = glide;
        root.classList.add('pc-glide');
        sw.autoplay.start();
      }, RESUME_AFTER);
    }

    el.addEventListener('click', function (e) {
      if (e.target.closest('.swiper-button-next, .swiper-button-prev')) freeze();
    }, true);
    sw.on('touchStart', freeze);
    sw.on('touchEnd', resume);
    el.addEventListener('click', function (e) {
      if (e.target.closest('.swiper-button-next, .swiper-button-prev')) resume();
    });

    function applyMotionPreference() {
      if (reduce.matches) {
        freeze();
      } else {
        sw.params.speed = glide;
        root.classList.add('pc-glide');
        if (!sw.autoplay.running) sw.autoplay.start();
      }
    }
    if (reduce.addEventListener) reduce.addEventListener('change', applyMotionPreference);
    applyMotionPreference();
  }

  function init() {
    document.querySelectorAll('.pc-peek slide-section').forEach(setup);
  }

  init();
  document.addEventListener('DOMContentLoaded', init);
  document.addEventListener('shopify:section:load', init);
})();
