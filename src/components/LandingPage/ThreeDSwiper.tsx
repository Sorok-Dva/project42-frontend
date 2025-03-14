'use client'
import bitcoin from 'assets/img/bitcoin.png'
import slide3d1 from 'assets/img/slide-3d-1.png'
import slide3d2 from 'assets/img/slide-3d-2.png'
import slide3d3 from 'assets/img/slide-3d-3.png'
import slide3d4 from 'assets/img/slide-3d-4.png'
import slide3d5 from 'assets/img/slide-3d-5.png'
import slide3d6 from 'assets/img/slide-3d-6.png'
import slide3d7 from 'assets/img/slide-3d-7.png'
import tether from 'assets/img/tether.png'
import { Img as Image } from 'react-image'
import 'swiper/css'
import 'swiper/css/navigation'
import { Autoplay, EffectCoverflow, Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import Button from 'components/Layouts/Button'
import React from 'react'

// staff website
const slides = [
  {
    id: 1,
    img: slide3d1,
    title: 'Super Mario Odessy',
  },
  {
    id: 2,
    img: slide3d2,
    title: 'Ghost of Tsusima',
  },
  {
    id: 3,
    img: slide3d3,
    title: 'Apex Legends',
  },
  {
    id: 4,
    img: slide3d4,
    title: 'Super Mario Odessy',
  },
  {
    id: 5,
    img: slide3d5,
    title: 'Apex Legends',
  },
  {
    id: 6,
    img: slide3d6,
    title: 'Super Mario Odessy',
  },
  {
    id: 7,
    img: slide3d7,
    title: 'Ghost of Tsusima',
  },
  {
    id: 8,
    img: slide3d1,
    title: 'Super Mario Odessy',
  },
  {
    id: 9,
    img: slide3d2,
    title: 'Ghost of Tsusima',
  },
  {
    id: 10,
    img: slide3d3,
    title: 'Apex Legends',
  },
  {
    id: 11,
    img: slide3d4,
    title: 'Super Mario Odessy',
  },
  {
    id: 12,
    img: slide3d5,
    title: 'Apex Legends',
  },
  {
    id: 13,
    img: slide3d6,
    title: 'Super Mario Odessy',
  },
  {
    id: 14,
    img: slide3d7,
    title: 'Ghost of Tsusima',
  },
]
const ThreeDSwiper: React.FC = () => {
  return (
    <section className="swiper-3d-section position-relative z-1" id="swiper-3d">
      <div className="container px-0 px-sm-3">
        <div className="row justify-content-between mb-15">
          <div className="col-lg-6 col-sm-10">
            <h2 className="display-four tcn-1 cursor-scale growUp title-anim">
              <span className="d-block">L'équipe</span> de Project 42
            </h2>
          </div>
        </div>
        {/* <!-- Slider main container --> */}
        <Swiper
          slidesPerView="auto"
          loop={true}
          centeredSlides={true}
          speed={1000}
          freeMode={true}
          effect="coverflow"
          modules={[Autoplay, Navigation, EffectCoverflow]}
          autoplay={{ delay: 3000 }}
          coverflowEffect={{
            rotate: 5,
            stretch: 30,
            depth: 0,
            modifier: 1,
            slideShadows: false,
          }}
          navigation={{
            prevEl: '.swiper-3d-button-prev',
            nextEl: '.swiper-3d-button-next',
          }}
          breakpoints={{
            1400: {
              slidesPerView: 4,
            },
            1024: {
              slidesPerView: 3,
            },
            768: {
              slidesPerView: 2.4,
            },
            640: {
              slidesPerView: 2,
            },
          }}
          className="swiper swiper-3d-container"
        >
          {slides.map(({ id, img, title }) => (
            <SwiperSlide key={id}>
              <div className="card-3d d-grid justify-content-center p-3">
                <div className="img-area w-100 mb-8 position-relative">
                  <span className="card-date position-absolute top-0 end-0 py-2 px-3 mt-4 me-5 tcn-1 d-flex align-items-center gap-1 fs-sm">
                    <i className="ti ti-calendar-due"></i> 15.02.2022
                  </span>
                  <Image className="w-100" src={img} alt="game" />
                  <span className="card-status position-absolute start-0 py-2 px-6 tcn-1 fs-sm">
                    <span className="dot-icon alt-icon ps-3">Playing</span>
                  </span>
                </div>
                <h5 className="card-title text-center tcn-1 mb-4 title-anim">
                  {title}
                </h5>
                <div className="d-center">
                  <div className="card-info d-center gap-3 py-1 px-3">
                    <div className="d-flex align-items-center gap-2">
                      <Image className="w-100" src={bitcoin} alt="bitcoin" />
                      <span className="tcn-1 fs-xs">75</span>
                    </div>
                    <div className="v-line"></div>
                    <div className="d-flex align-items-center gap-2">
                      <Image className="w-100" src={tether} alt="tether" />
                      <span className="tcn-1 fs-xs">$49.97</span>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="swiper-btn-area d-center gap-6">
          <Button classes="swiper-btn swiper-3d-button-prev">
            <i className="ti ti-chevron-left fs-xl"></i>
          </Button>
          <Button classes="swiper-btn swiper-3d-button-next">
            <i className="ti ti-chevron-right fs-xl"></i>
          </Button>
        </div>
      </div>
    </section>
  )
}

export default ThreeDSwiper
