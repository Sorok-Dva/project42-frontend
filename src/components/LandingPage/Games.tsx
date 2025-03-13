import gamex1 from 'assets/img/game-x1.png'
import gamex2 from 'assets/img/game-x2.png'
import gamex3 from 'assets/img/game-x3.png'
import gamex4 from 'assets/img/game-x4.png'
import gamex5 from 'assets/img/game-x5.png'
import gamex6 from 'assets/img/game-x6.png'
import { Img as Image } from 'react-image'
import { Link } from 'react-router-dom'
import 'swiper/css'
import 'swiper/css/pagination'
import { Autoplay, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import React from 'react'
const gameList = [
  {
    id: 1,
    img: gamex1,
    title: 'Free Fire',
  },
  {
    id: 2,
    img: gamex2,
    title: 'Fortnite',
  },
  {
    id: 3,
    img: gamex3,
    title: 'Free Fire',
  },
  {
    id: 4,
    img: gamex4,
    title: 'AAG Axie Cup',
  },
  {
    id: 5,
    img: gamex5,
    title: 'Fort Nite',
  },
  {
    id: 6,
    img: gamex6,
    title: 'Fort Nite',
  },
]
const Games: React.FC = () => {
  return (
    <section className="game-section">
      <div className="red-ball bottom-0 end-0"></div>
      <div className="container">
        <div className="row justify-content-between align-items-center mb-15">
          <div className="col-6">
            <h2 className="display-four tcn-1 cursor-scale growUp title-anim">
              Games
            </h2>
          </div>
          <div className="col-6 text-end">
            <Link
              to="/game"
              className="btn-half-border position-relative d-inline-block py-2 px-6 bgp-1 rounded-pill">
              View More
            </Link>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <Swiper
              slidesPerView={1}
              loop={true}
              spaceBetween={24}
              speed={1000}
              freeMode={true}
              modules={[Autoplay, Pagination]}
              autoplay={{
                delay: 2000,
              }}
              pagination={{
                el: '.game-swiper-pagination',
                clickable: true,
              }}
              breakpoints={{
                1200: {
                  slidesPerView: 4,
                },
                992: {
                  slidesPerView: 3,
                },
                575: {
                  slidesPerView: 2,
                },
              }}
              wrapperClass="mb-lg-15 mb-10"
              className="swiper game-swiper">
              {gameList.map(({ id, img, title }) => (
                <SwiperSlide key={id}>
                  <div className="game-card-wrapper mx-auto">
                    <div className="game-card mb-5 p-2">
                      <div className="game-card-border"></div>
                      <div className="game-card-border-overlay"></div>
                      <div className="game-img alt">
                        <Image className="w-100 h-100" src={img} alt="game" />
                      </div>
                      <div className="game-link d-center">
                        <Link to="/game" className="btn2">
                          <i className="ti ti-arrow-right fs-2xl"></i>
                        </Link>
                      </div>
                    </div>
                    <Link to="/game">
                      <h3 className="game-title mb-0 tcn-1 cursor-scale growDown2">
                        {title}
                      </h3>
                    </Link>
                  </div>
                </SwiperSlide>
              ))}
              <div className="text-center d-center">
                <div className="game-swiper-pagination"></div>
              </div>
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Games
