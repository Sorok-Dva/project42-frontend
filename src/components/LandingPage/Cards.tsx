import 'swiper/css'
import 'swiper/css/pagination'

import React, { useEffect, useState } from 'react'
import { Img as Image } from 'react-image'
import { Link } from 'react-router-dom'
import { Autoplay, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import axios from 'axios'

const Cards: React.FC = () => {
  const [cards, setCards] = useState<{ id: number, name: string, description: string }[]>([])

  useEffect(() => {
    async function getCards () {
      const response = await axios.get('/api/games/cards')
      const { cards } = response.data

      setCards(cards)
    }

    getCards()
  }, [])
  return (
    <section className="game-section">
      <div className="red-ball bottom-0 end-0"></div>
      <div className="container">
        <div className="row justify-content-between align-items-center mb-15">
          <div className="col-6">
            <h2 className="display-four tcn-1 cursor-scale growUp title-animate">
              Cartes du jeu
            </h2>
          </div>
          <div className="col-6 text-end">
            <Link
              to="/game-cards"
              className="btn-half-border position-relative d-inline-block py-2 px-6 bgp-1 rounded-pill">
              Voir toutes les cartes
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
              {cards.map((card) => (
                <SwiperSlide key={card.id}>
                  <div className="game-card-wrapper mx-auto">
                    <div className="game-card mb-5 p-2">
                      <div className="game-card-border"></div>
                      <div className="game-card-border-overlay"></div>
                      <div className="game-img alt">
                        <Image className="w-100 h-100" src={`/assets/images/carte${card.id}.png`} alt="game" />
                      </div>
                      <div className="game-link d-center p-4">
                        <i className="ti ti-info-circle fs-2xl"></i>
                        {card.description}
                      </div>
                    </div>
                    <h3 className="game-title mb-0 tcn-1 cursor-scale growDown2 title-animate">
                      {card.name}
                    </h3>
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

export default Cards
