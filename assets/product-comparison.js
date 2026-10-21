if (!customElements.get('product-comparison')) {
  customElements.define('product-comparison', class ProductComparison extends HTMLElement {
    constructor() {
      super();

      this.max = parseInt(this.dataset.max, 10) || 3;
      this.checkboxes = this.querySelectorAll('.comparison-toggle');
      this.removeButtons = this.querySelectorAll('.comparison-remove');
      this.variantSelects = this.querySelectorAll('.comparison-variant-select');

      this.checkboxes.forEach((checkbox) => {
        checkbox.addEventListener('change', this.updateState.bind(this));
      });
      this.removeButtons.forEach((button) => {
        button.addEventListener('click', this.onRemove.bind(this));
      });
      this.variantSelects.forEach((select) => {
        select.addEventListener('change', this.onVariantChange.bind(this));
      });

      this.updateState();
    }

    onVariantChange(evt) {
      const select = evt.currentTarget;
      const index = select.dataset.index;
      const json = this.querySelector(`.comparison-variant-json[data-index="${index}"]`);
      if (!json) return;

      let variants;
      try {
        variants = JSON.parse(json.textContent);
      } catch (e) {
        return;
      }
      const variant = variants.find((v) => String(v.id) === String(select.value));
      if (!variant) return;

      const moneyFormat = (window.theme && window.theme.moneyFormat) || '${{amount}}';
      const formatMoney = (cents) =>
        window.theme && window.theme.Currency ? window.theme.Currency.formatMoney(cents, moneyFormat) : cents;

      const priceEl = this.querySelector(`.comparison-var-price[data-cmp-price$="-${index}"]`);
      if (priceEl) {
        priceEl.innerHTML =
          variant.compare_at_price > variant.price
            ? `<span class="product-price sale">${formatMoney(variant.price)}</span> <s class="product-price">${formatMoney(variant.compare_at_price)}</s>`
            : `<span class="product-price">${formatMoney(variant.price)}</span>`;
      }

      const cell = this.querySelector(`.comparison-col[data-index="${index}"]`);
      if (!cell) return;

      const hiddenInput = cell.querySelector('.product-variant-id');
      if (hiddenInput) hiddenInput.value = variant.id;

      const button = cell.querySelector('button[type="submit"]');
      if (button) {
        button.disabled = !variant.available;
        const txt = button.querySelector('.txt');
        if (txt) txt.textContent = variant.available ? this.dataset.addText : this.dataset.soldText;
      }
    }

    onRemove(evt) {
      const index = evt.currentTarget.dataset.index;
      const checkbox = this.querySelector(`.comparison-toggle[data-index="${index}"]`);
      if (!checkbox) return;
      checkbox.checked = false;
      this.updateState();
    }

    updateState() {
      const checkedCount = Array.from(this.checkboxes).filter((checkbox) => checkbox.checked).length;

      this.checkboxes.forEach((checkbox) => {
        const index = checkbox.dataset.index;
        const isChecked = checkbox.checked;

        this.querySelectorAll(`.comparison-col[data-index="${index}"]`).forEach((cell) => {
          cell.hidden = !isChecked;
        });

        const item = checkbox.closest('.comparison-picker__item');
        if (item) item.classList.toggle('active', isChecked);

        checkbox.disabled = !isChecked && checkedCount >= this.max;
      });
    }
  });
}
