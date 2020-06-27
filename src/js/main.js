var swiper = new Swiper('.swiper-container', {
    spaceBetween: 135,
    slidesPerView: 2,
    loop: true,
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    }
});

const navigation = document.querySelector('.review__navigation');
const btnPrev = document.querySelector('.swiper-button-prev');
const prev = document.querySelector('.swiper-button-prev svg');
const imgPrev = document.querySelector('.review__img-prev');
const btnNext = document.querySelector('.swiper-button-next');
const next = document.querySelector('.swiper-button-next svg');
const imgNext = document.querySelector('.review__img-next');

navigation.addEventListener('click', event => {
    const target = event.target;
    if (target.closest('.swiper-button-prev')) {
        console.log(imgPrev);
        imgPrev.src = './img/arrow-next-invert.svg';
        imgPrev.alt = 'right arrow';
        imgNext.src = './img/arrow-prev-invert.svg';
        imgNext.alt = '.left arrow';
    }
    if (target.closest('.swiper-button-next')) {
        console.log(imgNext);
        imgPrev.src = './img/arrow-prev.svg';
        imgPrev.alt = 'left arrow';
        imgNext.src = './img/arrow-next.svg';
        imgNext.alt = '.right arrow';
    }

})