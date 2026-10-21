document.addEventListener("DOMContentLoaded", function () {

    new Swiper(".premiumSwiper", {

        slidesPerView:4,

        spaceBetween:0,

        loop:true,

        speed:800,

        autoplay:{
            delay:3000,
            disableOnInteraction:false,
            pauseOnMouseEnter:true
        },

        navigation:{
            nextEl:".premiumSwiper .swiper-button-next",
            prevEl:".premiumSwiper .swiper-button-prev"
        },

        a11y:{
            prevSlideMessage:"Previous products",
            nextSlideMessage:"Next products"
        },

        breakpoints:{

            0:{
                slidesPerView:1
            },

            768:{
                slidesPerView:2
            },

            1200:{
                slidesPerView:4
            }

        }

    });

});