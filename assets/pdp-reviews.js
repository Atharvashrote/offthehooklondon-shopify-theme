/* OFF THE HOOK - PDP reviews: show 4 Judge.me review cards at a time (see pdp-reviews.css).
   Judge.me renders and initialises every card it has loaded; this only toggles data-oth-hidden on them.
   When the loaded cards run out, Judge.me's own "Show more" (.jdgm-masonry-grid__btn) is used so it
   fetches the next page itself. That button is a "peek": each click raises the inline max-height of
   .jdgm-masonry-grid by one step and only fetches once it reaches the masonry height, so it is clicked
   until then. Its footer gets --disabled when every page is loaded.
   Sorting or filtering replaces the list, which resets to 4. */
(function () {
  var STEP = 4;
  var LABEL = 'Show more reviews';
  var LOADING = 'Loading…';

  function setup(panel) {
    if (panel.dataset.othReviews) return;
    panel.dataset.othReviews = '1';

    var shown = STEP, lastFirst = null, lastSig = '', lastCount = 0, waiting = false, waitTimer = null, pumpTimer = null, queued = false;

    var wrap = document.createElement('div');
    wrap.className = 'oth-rv-more';
    wrap.hidden = true;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'oth-rv-more__btn';
    btn.textContent = LABEL;
    wrap.appendChild(btn);

    function items() { return panel.querySelectorAll('.jdgm-masonry-grid__masonry-item'); }
    function nativeMore() {
      var footer = panel.querySelector('.jdgm-masonry-grid__footer');
      if (!footer || footer.classList.contains('jdgm-masonry-grid__footer--disabled')) return null;
      return footer.querySelector('.jdgm-masonry-grid__btn');
    }
    function peekAtEnd() {
      var grid = panel.querySelector('.jdgm-masonry-grid');
      var cont = panel.querySelector('.jdgm-masonry-grid__container');
      if (!grid || !cont) return true;
      /* inline values written by Judge.me (pdp-reviews.css overrides how they render, not what they are) */
      return !(parseFloat(grid.style.maxHeight) < parseFloat(cont.style.height));
    }
    function fetchNextPage() {
      var tries = 0;
      (function pump() {
        if (!waiting) return;
        var more = nativeMore();
        if (!more) { setLoading(false); apply(); return; }
        more.click();
        if (!peekAtEnd() && ++tries < 40) pumpTimer = setTimeout(pump, 120);
      })();
    }

    function placeButton() {
      /* after Judge.me's mount point, so its re-renders never remove the button */
      var widget = panel.querySelector('#judgeme_product_reviews, .jdgm-review-widget');
      if (widget && widget.nextElementSibling !== wrap) widget.insertAdjacentElement('afterend', wrap);
    }

    function setLoading(on) {
      waiting = on;
      clearTimeout(waitTimer);
      clearTimeout(pumpTimer);
      btn.disabled = on;
      btn.setAttribute('aria-busy', on ? 'true' : 'false');
      btn.textContent = on ? LOADING : LABEL;
      if (on) waitTimer = setTimeout(function () { setLoading(false); apply(); }, 12000);
    }

    function apply() {
      queued = false;
      var list = items();
      var first = list[0] || null;
      /* name + stars only: "Read more" inside a card changes its text but is not a new list */
      var sig = first ? [first.querySelector('.jdgm-review-card__name'), first.querySelector('.jm-star-rating')].map(function (el) {
        return el ? (el.textContent + (el.getAttribute('aria-label') || '')).trim() : '';
      }).join('|') : '';
      /* a different first card or fewer cards = Judge.me rebuilt the list (sort, filter, rating click) */
      if (first !== lastFirst || sig !== lastSig || list.length < lastCount) {
        shown = STEP;
        if (waiting) setLoading(false);
      }
      if (waiting && list.length > lastCount) setLoading(false);
      lastFirst = first;
      lastSig = sig;
      lastCount = list.length;

      for (var i = 0; i < list.length; i++) {
        if (i < shown) list[i].removeAttribute('data-oth-hidden');
        else if (!list[i].hasAttribute('data-oth-hidden')) list[i].setAttribute('data-oth-hidden', '');
      }
      placeButton();
      wrap.hidden = !list.length || (shown >= list.length && !nativeMore() && !waiting);
    }

    function schedule() {
      if (queued) return;
      queued = true;
      requestAnimationFrame(apply);
    }

    btn.addEventListener('click', function () {
      if (waiting) return;
      shown += STEP;
      var list = items();
      var more = nativeMore();
      if (shown > list.length && more) {
        setLoading(true);
        fetchNextPage();
      }
      apply();
    });

    /* childList only: Judge.me's masonry rewrites inline styles constantly, which needn't trigger anything */
    new MutationObserver(schedule).observe(panel, { childList: true, subtree: true });
    apply();
  }

  function init() {
    document.querySelectorAll('.oth-reviews').forEach(setup);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
