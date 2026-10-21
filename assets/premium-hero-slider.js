document.addEventListener("DOMContentLoaded", function () {

    new Swiper(".premiumHeroSwiper", {

        effect: "fade",
        fadeEffect: {
            crossFade: true
        },

        slidesPerView: 1,

        loop: true,

        speed: 1200,

        grabCursor: true,

        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
        },

        navigation: {
            nextEl: ".premiumHeroSwiper .swiper-button-next",
            prevEl: ".premiumHeroSwiper .swiper-button-prev",
        },

        pagination: {
            el: ".premiumHeroSwiper .swiper-pagination",
            clickable: true
        },

        keyboard: {
            enabled: true
        }

    });

});