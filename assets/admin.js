
document.addEventListener('shopify:block:select', function(e){
    const block = e.target;
    block.classList.add('active');
    
    const el = e.target.closest('slide-section');
    const blockSelected = e.target.getAttribute('data-slide');
    if(el) el.initSlide(blockSelected);

    const tab = block.closest('.tab-section');
    if(tab) block.click();

    if(e.target.querySelector('.lazyload')) initBgimages();
    if(e.target.querySelector('img.svg-icon')) initSvgIcons();
  
});

document.addEventListener("shopify:section:load", function(e){
    if(e.target.querySelector('.lazyload')) initBgimages();
    if(e.target.querySelector('img.svg-icon')) initSvgIcons();
});
document.addEventListener('shopify:section:select', function(e){
  const section = e.target;
  const body = document.querySelector('body');

  section.classList.add('sactive');

    if(e.target.querySelector('.lazyload')) initBgimages();
    if(e.target.querySelector('img.svg-icon')) initSvgIcons();
});
document.addEventListener('shopify:section:deselect', function(e){
  const section = e.target;
  section.classList.remove('sactive');
  
});