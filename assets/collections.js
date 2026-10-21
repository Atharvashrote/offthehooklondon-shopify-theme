"use strict";
function pagination(){
    document.querySelectorAll(".load-more").forEach((btn) => {
      btn.classList.remove('loading');
      var url = btn.getAttribute('href');
      if (btn.classList.contains("infinite")){
        var observer = new IntersectionObserver(
          function(entries){
            entries.forEach((entry) => {
              if (entry.intersectionRatio === 1){
                loadMoreproducts(url);
              }
            });
          },
          { threshold: 1.0 }
        );
        observer.observe(btn);
      } else {
        btn.addEventListener("click",(e) => {
            e.preventDefault();
            btn.classList.add('loading');
            loadMoreproducts(url);
          },
          false
        );
      }
    });
}
pagination();
function loadMoreproducts(url){
    fetch(url).then((response) => response.text()).then((responseText) => {
      const html = new DOMParser().parseFromString(responseText, 'text/html'),
        products = document.getElementById('collection-products'),
        productsSource = html.querySelector('#collection-products').innerHTML,
        pagination = document.getElementById('pagination'),
        paginationSource = html.querySelector('#pagination');

      if(products) products.insertAdjacentHTML('beforeend', productsSource);
      if(pagination && paginationSource) {
        pagination.innerHTML = paginationSource.innerHTML;
      } else {
        pagination.innerHTML = '';
      }
    })
    .finally(() => {
      pagination();
      if(theme.mlcurrency) currenciesChange(document.querySelectorAll('product-card span.money'));
      initializeVideos();initBgimages();
      initializeScrollAnimationTrigger();
    })
    .catch((e) => {
      console.error(e);
    });
}

class FiltersForm extends HTMLElement {
  constructor() {
      super();
      var _this = this,
        fbtns = document.querySelectorAll(".btn-filter"),
        topFilters = document.querySelector(".filter-horizontal");

      this.secId = this.dataset.id;
      this.mql = window.matchMedia('(min-width: 767px)');
  
      fbtns.forEach((btn) =>
        btn.addEventListener('click', this.mobileFilters.bind(this))
      );
      if(topFilters && this.mql.matches === true) this.blockToggle();
      this.selectFilters();
      this.priceRangeSlider();
      this.removeFilters();
      this.selectSort();

      document.addEventListener('change', function(e){
        if (!e.target.classList.contains('optTag')) return;

        var URL = _this.dataset.url,
            paramString = new URLSearchParams(window.location.search),
            productFilters = document.querySelectorAll('input.optTag'),
            newTags = [],
            bytags = true;

        productFilters.forEach(function(el){
            if(el.value && el.checked){
                newTags.push(el.value);
            }
        });

        if (newTags.length) {
            var tags = newTags.join('+');
            _this.renderSectionFromFetch(URL + '/' + tags + '?' + paramString, bytags);
        } else {
            _this.renderSectionFromFetch(URL + '?' + paramString, bytags);
        }
      });

  }
  selectSort(){
    var shortby = document.getElementById('sort-by');
    shortby.addEventListener('change', this.onFormSubmit.bind(this));
  }
  selectFilters(){
    var filters = this.querySelectorAll('input.dyfl, .price-range');
    filters.forEach((filter) =>
       filter.addEventListener('change', this.onFormSubmit.bind(this))
    );
  }
  priceRangeSlider(){
    const isPriceRange = document.getElementById('priceSlider');
    if(!isPriceRange) return;
    const priceSlider = document.getElementById('priceSlider'),
      min = document.getElementById('Filter-Price-GTE'),
      max = document.getElementById('Filter-Price-LTE');

    priceSlider.addEventListener('change', (evt) => {
        min.value = evt.detail.value1.toString();
        max.value = evt.detail.value2.toString();
    });
    priceSlider.addEventListener('onMouseUp', (evt) => {
      min.dispatchEvent(new Event("change"));
      max.dispatchEvent(new Event("change"));
    });
    priceSlider.addEventListener('touchend', (evt) => {
      min.dispatchEvent(new Event("change"));
      max.dispatchEvent(new Event("change"));
    });
  }
  onFormSubmit(e){
    const flForm = this.querySelector('form'),
      formData = new FormData(flForm),
      params = new URLSearchParams(formData);
      this.renderSectionFromFetch(params);
  }
  renderSectionFromFetch(params,tags){
    var url = `${window.location.pathname}?section_id=${this.secId}&${params.toString()}`
    if(tags){
        var url = `${params}&section_id=${this.secId}`
    }

    document.body.classList.add('load-filters');
    fetch(url).then((response) => response.text()).then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, 'text/html'),
          products = document.getElementById('collection-products'),
          filters = this.querySelector('.filters-item__wrapper'),
          counts = document.getElementById('itemsCount'),
          pagination = document.getElementById('pagination'),
          paginationSource =  html.querySelector('#pagination'),
          activeFilters =  document.getElementById('active-filters');

        if(counts) counts.innerHTML = html.querySelector('#itemsCount').innerHTML;
        if(activeFilters) activeFilters.innerHTML = html.querySelector('#active-filters').innerHTML;
        if(products) products.innerHTML = html.querySelector('#collection-products').innerHTML;
        if(filters) filters.innerHTML = html.querySelector('.filters-item__wrapper').innerHTML;
        if(pagination && paginationSource) {
          pagination.innerHTML = paginationSource.innerHTML;
        } else if(pagination) {
          pagination.innerHTML = ' ';
        }
      })
      .finally(() => {
        if(tags){
            var url = `${params.toString()}`
        } else {
            var url = `${window.location.pathname}?${params.toString()}`
        }
        history.pushState({ page: url }, url, url);
        document.body.classList.remove('load-filters');
        this.selectFilters();this.priceRangeSlider();this.removeFilters();pagination();
        if(theme.mlcurrency) currenciesChange(document.querySelectorAll('product-card span.money'));
        initializeVideos();initBgimages();
        initializeScrollAnimationTrigger();
      })
      .catch((e) => {
        console.error(e);
      });
  }
  removeFilters(){
    var _this = this,
        activeFl = document.querySelectorAll(".active-fl");
    activeFl.forEach((btn) => {
        btn.addEventListener("click",(e) => {
          e.preventDefault();
          var params = btn.getAttribute('href').split('?')[1];
          _this.renderSectionFromFetch(params);
        })
      });
  }
  mobileFilters(){
    var html = document.documentElement;
    html.classList.add('activ-filter','show-overly');
    const blocks = this.querySelectorAll('.filters-item');
    blocks.forEach((blk) => {
      blk.open = true;
    });
    document.querySelector(".closeFilter").addEventListener('click', function(e){
        html.classList.remove('activ-filter','show-overly');
    });
  }
  blockToggle(){
      const body = document.body,
        filters = document.querySelectorAll(".filter-horizontal .filters-title"),
        blocks = this.querySelectorAll('.filters-item');
      filters.forEach((blk) => {
        const act = blk.closest('.filters-item[open]');
        blocks.forEach((other) => {
           if(other !== act){
             other.removeAttribute('open');
           }
        });
      });
      body.addEventListener('click', function(e){
          blocks.forEach((blk) => {
            if(e.target.closest('.filters-item[open]')) return;
             blk.removeAttribute('open');
        });
      });
  }
}
customElements.define("filters-form", FiltersForm);

document.querySelectorAll(".change-view").forEach((btn) => {
  btn.addEventListener("click",(e) => {
     e.preventDefault();
      var view = btn.dataset.view,
        href = new URL(window.location.href);
      href.searchParams.set("type", view);
      window.location = href.toString();
  });
});