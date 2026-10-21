"use strict";

var wl = "at_wishlist";

class WishlistItems extends HTMLElement {

  constructor() {
    super();

    this.init();
  }

  init() {

    const wlProducts = JSON.parse(localStorage.getItem(wl)) || [];

    this.getWlProducts(wlProducts);
  }

  getWlProducts(products) {

    const loading = document.querySelector(".wishlist-loading");
    const emptyMessage = document.querySelector(".wlnull");

    let query = "";
    let ajaxURL = "";

    /* No wishlist products */
    if (!products || products.length === 0) {

      this.showEmpty();

      return;
    }

    query = products.join("%20OR%20id:");
    ajaxURL = `?q=id:${query}`;

    fetch(`${this.dataset.url}${ajaxURL}`)
      .then((response) => response.text())

      .then((text) => {

        const html = document.createElement("div");

        html.innerHTML = text;

        const wlProducts = html.querySelector("#collection-products");

        /* Products exist */
        if (wlProducts && wlProducts.innerHTML.trim().length) {

          this.innerHTML = wlProducts.innerHTML;

          /* Hide loading */
          if (loading) {
            loading.style.display = "none";
          }

          /* Hide empty message */
          if (emptyMessage) {
            emptyMessage.classList.remove("show");
            emptyMessage.style.display = "none";
          }

          /* Show wishlist */
          this.style.display = "";

          this.addRemoveButtons();
          this.addClearAllButton();
        }

        /* No valid products returned */
        else {

          this.showEmpty();
        }
      })

      .catch((error) => {

        console.error("Wishlist error:", error);

        this.showEmpty();
      })

      .finally(() => {

        if (typeof checkWishlist === "function") {
          checkWishlist();
        }

        if (typeof initializeScrollAnimationTrigger === "function") {
          initializeScrollAnimationTrigger();
        }

      });
  }


  /* --------------------------------
     EMPTY WISHLIST
  -------------------------------- */

  showEmpty() {

    const loading = document.querySelector(".wishlist-loading");
    const emptyMessage = document.querySelector(".wlnull");

    if (loading) {
      loading.style.display = "none";
    }

    this.style.display = "none";

    if (emptyMessage) {

      emptyMessage.classList.add("show");
      emptyMessage.style.display = "block";
    }
  }


  /* --------------------------------
     INDIVIDUAL REMOVE BUTTON
  -------------------------------- */

  addRemoveButtons() {

    const cards = this.querySelectorAll(".gitem");

    cards.forEach((card) => {

      /* Don't add twice */
      if (card.querySelector(".wishlist-remove-item")) {
        return;
      }

      const productLink = card.querySelector("a[href*='/products/']");

      if (!productLink) {
        return;
      }

      const productUrl = productLink.getAttribute("href");

      if (!productUrl) {
        return;
      }

      const productHandle = productUrl
        .split("/products/")[1]
        ?.split("?")[0]
        ?.split("#")[0];

      if (!productHandle) {
        return;
      }

      const button = document.createElement("button");

      button.type = "button";

      button.className = "wishlist-remove-item";

      button.setAttribute(
        "aria-label",
        "Remove from wishlist"
      );

      button.innerHTML = `
        <svg class="at-icon">
          <use xlink:href="#icon-close"></use>
        </svg>
      `;

      card.appendChild(button);

      button.addEventListener("click", (event) => {

        event.preventDefault();
        event.stopPropagation();

        this.removeProduct(
          productHandle,
          card
        );

      });

    });
  }


  /* --------------------------------
     REMOVE PRODUCT
  -------------------------------- */

  removeProduct(handle, card) {

    let products =
      JSON.parse(localStorage.getItem(wl)) || [];

    /*
      Find product ID by matching
      product URL against the card.
    */

    const productLink =
      card.querySelector("a[href*='/products/']");

    if (!productLink) {
      return;
    }

    const productUrl =
      productLink.getAttribute("href");

    const match =
      productUrl.match(/\/products\/([^?/#]+)/);

    if (!match) {
      return;
    }

    const currentHandle = match[1];

    /*
      Fetch product to get ID
    */

    fetch(`/products/${currentHandle}.js`)
      .then((response) => response.json())

      .then((product) => {

        const productId =
          String(product.id);

        products =
          products.filter(
            (id) => String(id) !== productId
          );

        localStorage.setItem(
          wl,
          JSON.stringify(products)
        );

        /* Remove visually */
        card.remove();

        /* Update wishlist count */
        if (typeof checkWishlist === "function") {
          checkWishlist();
        }

        /* No products left */
        if (
          this.querySelectorAll(".gitem").length === 0
        ) {

          this.showEmpty();
        }

      })

      .catch((error) => {

        console.error(
          "Unable to remove wishlist product:",
          error
        );

      });
  }


  /* --------------------------------
     CLEAR ALL BUTTON
  -------------------------------- */

  addClearAllButton() {

    if (
      !this.querySelector(".gitem")
    ) {
      return;
    }

    if (
      this.querySelector(".wishlist-clear-wrap")
    ) {
      return;
    }

    const wrap =
      document.createElement("div");

    wrap.className =
      "wishlist-clear-wrap";

    const button =
      document.createElement("button");

    button.type = "button";

    button.className =
      "wishlist-clear-all";

    button.textContent =
      "CLEAR WISHLIST";

    wrap.appendChild(button);

    /*
      Put clear button BEFORE
      the first product.
    */

    this.insertBefore(
      wrap,
      this.firstChild
    );

    /*
      Open custom confirmation modal
    */

    button.addEventListener(
      "click",
      () => {

        this.openClearWishlistModal();

      }
    );
  }


  /* --------------------------------
     CUSTOM CLEAR WISHLIST MODAL
  -------------------------------- */

  openClearWishlistModal() {

    let overlay =
      document.querySelector(
        ".wishlist-confirm-overlay"
      );

    /*
      Create modal only once
    */

    if (!overlay) {

      overlay =
        document.createElement("div");

      overlay.className =
        "wishlist-confirm-overlay";

      overlay.setAttribute(
        "role",
        "dialog"
      );

      overlay.setAttribute(
        "aria-modal",
        "true"
      );

      overlay.setAttribute(
        "aria-labelledby",
        "wishlist-confirm-title"
      );

      overlay.innerHTML = `

        <div class="wishlist-confirm-modal">

          <button
            type="button"
            class="wishlist-confirm-close"
            aria-label="Close"
          >
            <svg
              class="at-icon"
              aria-hidden="true"
            >
              <use xlink:href="#icon-close"></use>
            </svg>
          </button>

          <div class="wishlist-confirm-icon">
            <svg
              class="at-icon"
              aria-hidden="true"
            >
              <use xlink:href="#icon-trash"></use>
            </svg>
          </div>

          <h2 id="wishlist-confirm-title">
            Clear Wishlist
          </h2>

          <p>
            Are you sure you want to remove all products
            from your wishlist?
          </p>

          <div class="wishlist-confirm-actions">

            <button
              type="button"
              class="wishlist-confirm-cancel"
            >
              CANCEL
            </button>

            <button
              type="button"
              class="wishlist-confirm-submit"
            >
              CLEAR WISHLIST
            </button>

          </div>

        </div>
      `;

      document.body.appendChild(overlay);

      /*
        Inject modal CSS only once
      */

      const style =
        document.createElement("style");

      style.id =
        "wishlist-confirm-modal-styles";

      style.textContent = `

        .wishlist-confirm-overlay {
          position: fixed;
          inset: 0;
          z-index: 999999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(0, 0, 0, 0.55);
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transition:
            opacity 0.25s ease,
            visibility 0.25s ease;
          box-sizing: border-box;
        }

        .wishlist-confirm-overlay.is-open {
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
        }

        .wishlist-confirm-modal {
          position: relative;
          width: 100%;
          max-width: 440px;
          padding: 38px 35px 32px;
          background: #ffffff;
          border: 1px solid #e5e5e5;
          border-radius: 4px;
          box-shadow:
            0 20px 60px rgba(0, 0, 0, 0.18);
          text-align: center;
          box-sizing: border-box;
          transform: translateY(15px);
          transition: transform 0.25s ease;
        }

        .wishlist-confirm-overlay.is-open
        .wishlist-confirm-modal {
          transform: translateY(0);
        }

        .wishlist-confirm-close {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 34px;
          height: 34px;
          padding: 0;
          border: 0;
          background: transparent;
          color: #111111;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .wishlist-confirm-close:hover {
          opacity: 0.65;
        }

        .wishlist-confirm-close .at-icon {
          width: 16px;
          height: 16px;
        }

        .wishlist-confirm-icon {
          width: 52px;
          height: 52px;
          margin: 0 auto 18px;
          border: 1px solid #dddddd;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .wishlist-confirm-icon .at-icon {
          width: 20px;
          height: 20px;
        }

        .wishlist-confirm-modal h2 {
          margin: 0 0 12px;
          color: #111111;
          font-size: 22px;
          line-height: 1.3;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .wishlist-confirm-modal p {
          margin: 0 auto 28px;
          max-width: 350px;
          color: #555555;
          font-size: 14px;
          line-height: 1.7;
        }

        .wishlist-confirm-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .wishlist-confirm-actions button {
          width: 100%;
          min-height: 50px;
          padding: 12px 15px;
          border-radius: 0;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition:
            background 0.2s ease,
            color 0.2s ease,
            border-color 0.2s ease;
          box-sizing: border-box;
        }

        .wishlist-confirm-cancel {
          border: 1px solid #111111;
          background: #ffffff;
          color: #111111;
        }

        .wishlist-confirm-cancel:hover {
          background: #111111;
          color: #ffffff;
        }

        .wishlist-confirm-submit {
          border: 1px solid #111111;
          background: #111111;
          color: #ffffff;
        }

        .wishlist-confirm-submit:hover {
          background: #333333;
          border-color: #333333;
        }

        @media screen and (max-width: 480px) {

          .wishlist-confirm-overlay {
            padding: 16px;
          }

          .wishlist-confirm-modal {
            max-width: 100%;
            padding: 34px 22px 24px;
          }

          .wishlist-confirm-modal h2 {
            font-size: 19px;
          }

          .wishlist-confirm-modal p {
            font-size: 13px;
            line-height: 1.6;
            margin-bottom: 22px;
          }

          .wishlist-confirm-actions {
            grid-template-columns: 1fr;
          }

          .wishlist-confirm-actions button {
            min-height: 48px;
          }

        }

        body.wishlist-modal-open {
          overflow: hidden;
        }

      `;

      document.head.appendChild(style);

      /*
        Close button
      */

      overlay
        .querySelector(".wishlist-confirm-close")
        .addEventListener(
          "click",
          () => {
            this.closeClearWishlistModal();
          }
        );

      /*
        Cancel button
      */

      overlay
        .querySelector(".wishlist-confirm-cancel")
        .addEventListener(
          "click",
          () => {
            this.closeClearWishlistModal();
          }
        );

      /*
        Confirm button
      */

      overlay
        .querySelector(".wishlist-confirm-submit")
        .addEventListener(
          "click",
          () => {

            this.clearAllWishlist();

          }
        );

      /*
        Close when clicking overlay
      */

      overlay.addEventListener(
        "click",
        (event) => {

          if (
            event.target === overlay
          ) {

            this.closeClearWishlistModal();

          }

        }
      );

    }

    /*
      Open modal
    */

    overlay.classList.add("is-open");

    document.body.classList.add(
      "wishlist-modal-open"
    );

    /*
      Focus cancel button
    */

    const cancelButton =
      overlay.querySelector(
        ".wishlist-confirm-cancel"
      );

    if (cancelButton) {
      setTimeout(() => {
        cancelButton.focus();
      }, 50);
    }

    /*
      ESC key
    */

    this._wishlistEscapeHandler =
      (event) => {

        if (
          event.key === "Escape"
        ) {

          this.closeClearWishlistModal();

        }

      };

    document.addEventListener(
      "keydown",
      this._wishlistEscapeHandler
    );
  }


  /* --------------------------------
     CLOSE MODAL
  -------------------------------- */

  closeClearWishlistModal() {

    const overlay =
      document.querySelector(
        ".wishlist-confirm-overlay"
      );

    if (!overlay) {
      return;
    }

    overlay.classList.remove(
      "is-open"
    );

    document.body.classList.remove(
      "wishlist-modal-open"
    );

    if (
      this._wishlistEscapeHandler
    ) {

      document.removeEventListener(
        "keydown",
        this._wishlistEscapeHandler
      );

      this._wishlistEscapeHandler =
        null;
    }
  }


  /* --------------------------------
     CLEAR WISHLIST
  -------------------------------- */

  clearAllWishlist() {

    /*
      Close modal first
    */

    this.closeClearWishlistModal();

    /*
      Keep existing wishlist logic
    */

    localStorage.removeItem(wl);

    this.innerHTML = "";

    this.showEmpty();

    /*
      Update wishlist count
    */

    if (
      typeof checkWishlist === "function"
    ) {

      checkWishlist();

    }

  }

}


customElements.define(
  "wishlist-items",
  WishlistItems
);