document.addEventListener("DOMContentLoaded", function () {

    new Swiper(".premiumReels", {

        slidesPerView: 5,
        spaceBetween: 20,

        loop: true,

        speed: 800,

        grabCursor: true,

        centeredSlides: false,

        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
        },

        navigation: {
            nextEl: ".premium-reels-carousel .swiper-button-next",
            prevEl: ".premium-reels-carousel .swiper-button-prev",
        },

        breakpoints: {

            0: {
                slidesPerView: 1.2,
                spaceBetween: 12
            },

            576: {
                slidesPerView: 2,
                spaceBetween: 15
            },

            768: {
                slidesPerView: 3,
                spaceBetween: 18
            },

            1200: {
                slidesPerView: 5,
                spaceBetween: 20
            }

        }

    });

});