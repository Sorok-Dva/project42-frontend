import 'swiper/css'
import 'swiper/css/navigation'
import React from 'react'
import { Img as Image } from 'react-image'
import { Autoplay, EffectCoverflow, Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import Button from 'components/Layouts/Button'
import sorokDva from 'assets/images/team/42.gif'
import { faCode } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const slides = [
  {
    id: 1,
    img: sorokDva,
    nickname: 'Sorok-Dva',
    role: 'Fondateur / Développeur',
    description: 'Project 42 est le fruit d\'une envie passionnée de voir le jeu LGeL perdurer sur le web, loin des limites d\'une appli mobile aux fonctionnalités restreintes. Développé en solo, ce jeu de rôle vous plonge dans l\'univers énigmatique de la station spatiale Mir, où l\'équipage d\'innocents doit démasquer les aliens infiltrés. Rejoignez-moi dans cette aventure immersive et innovante où chaque décision compte.',
    socialLinks: [
      {
        iconName: 'bx bxl-github',
        url: 'https://github.com/Sorok-Dva',
      },
      {
        iconName: 'bx bxl-patreon',
        url: 'https://www.patreon.com/sorokdva',
      },
    ],
  },
]
const TeamMembers: React.FC = () => {
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
          {slides.map((teamMember) => (
            <SwiperSlide key={teamMember.id}>
              <div className="card-3d d-grid justify-content-center p-3">
                <div className="img-area w-100 mb-8 position-relative">
                  <span className="card-date position-absolute top-0 end-0 py-2 px-3 mt-4 me-5 tcn-1 d-flex align-items-center gap-1 fs-sm">
                    <FontAwesomeIcon icon={faCode} style={{ color: 'darkred' }} /> { teamMember.role }
                  </span>
                  <Image className="w-100" src={teamMember.img} alt="game" />
                </div>
                <h5 className="card-title text-center tcn-1 mb-4 title-anim">
                  {teamMember.nickname}
                </h5>
                <div className="d-center">
                  <div className="card-info d-center gap-3 py-1 px-3">
                    <div className="d-flex align-items-center gap-2">
                      <p>{teamMember.description}</p>
                    </div>
                  </div>
                </div>
                <div className="d-center">
                  <ul>
                    {teamMember.socialLinks.map((value, i) => (
                      <li key={i}>
                        <a href={value.url} target="_blank" rel="noreferrer">
                          <i className={value.iconName}></i>
                        </a>
                      </li>
                    ))}
                  </ul>
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

export default TeamMembers
