import Button from 'components/Layouts/Button'
import sword from 'assets/img/sword.png'
import topplayer1 from 'assets/img/top-player1.png'
import topplayer2 from 'assets/img/top-player2.png'
import topplayer3 from 'assets/img/top-player3.png'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Img as Image } from 'react-image'
import React, { useEffect } from 'react'
import 'swiper/css'
import 'swiper/css/navigation'
import { Autoplay, Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

const topPlayers = [
  {
    id: 1,
    img: topplayer1,
    title: 'Jane Cooper',
    team: 'Fire',
  },
  {
    id: 2,
    img: topplayer2,
    title: 'Jane Cooper',
    team: 'Fire',
  },
  {
    id: 3,
    img: topplayer3,
    title: 'Jane Cooper',
    team: 'Fire',
  },
  {
    id: 4,
    img: topplayer1,
    title: 'Jane Cooper',
    team: 'Fire',
  },
  {
    id: 5,
    img: topplayer2,
    title: 'Jane Cooper',
    team: 'Fire',
  },
  {
    id: 6,
    img: topplayer3,
    title: 'Jane Cooper',
    team: 'Fire',
  },
]
const TopPlayer: React.FC = () => {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const swordTL = gsap.timeline()

    // Scene 1
    swordTL.to('.sword-area', {
      scrollTrigger: {
        trigger: '#swiper-3d',
        start: 'top 20%',
        end: '+=1000',
        scrub: 1,
      },
      right: 'unset',
      left: '0%',
      bottom: '0%',
      opacity: 1,
      scale: 1,
    })

    // Scene 2
    swordTL.to('.sword-area', {
      scrollTrigger: {
        trigger: '#top-player',
        start: 'top 25%',
        end: '+=100',
        scrub: 1,
      },
      rotation: 180,
    })

    // Clean up on component unmount
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        trigger.kill() // Kill all ScrollTriggers
      })
    }
  }, [])
  return (
    <section className="top-player-section pt-120 pb-120" id="top-player">
      {/* <!-- sword animation --> */}
      <div className="sword-area" id="sword-area">
        <Image className="w-100" src={sword} alt="sword" />
      </div>
      <div className="red-ball end-0"></div>
      <div className="container">
        <div className="row justify-content-between mb-15">
          <div className="col-sm-6">
            <h2 className="display-four tcn-1 cursor-scale growUp title-anim">
              Top Player
            </h2>
          </div>
          <div className="col-sm-6 d-none d-sm-block">
            <div className="d-flex justify-content-end align-items-center gap-6">
              <Button classes="swiper-btn top-player-prev">
                <i className="ti ti-chevron-left fs-xl"></i>
              </Button>
              <Button classes="swiper-btn top-player-next">
                <i className="ti ti-chevron-right fs-xl"></i>
              </Button>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <Swiper
              slidesPerView="auto"
              loop={true}
              centeredSlides={true}
              spaceBetween={24}
              freeMode={true}
              speed={1000}
              modules={[Autoplay, Navigation]}
              autoplay={{
                delay: 2000,
              }}
              navigation={{
                prevEl: '.top-player-prev',
                nextEl: '.top-player-next',
              }}
              breakpoints={{
                1024: {
                  slidesPerView: 3,
                },
                768: {
                  slidesPerView: 2,
                },
              }}
              wrapperClass="my-1"
              className="swiper swiper-top-player">
              {topPlayers.map(({ id, img, team, title }) => (
                <SwiperSlide key={id}>
                  <div
                    className="player-card d-grid gap-6 p-6 card-tilt"
                    data-tilt>
                    <div className="player-info-area d-between w-100">
                      <div className="player-info d-flex align-items-center gap-4">
                        <div className="player-img position-relative">
                          <Image
                            className="w-100 rounded-circle"
                            src={img}
                            alt="player"
                          />
                          <span className="player-status position-absolute end-0 bottom-0 tcn-1 fs-xs d-center">
                            1
                          </span>
                        </div>
                        <div>
                          <h5 className="player-name tcn-1 mb-1 title-anim">
                            {title}
                          </h5>
                          <span className="tcn-6 fs-sm">Duelist</span>
                        </div>
                      </div>
                      <form action="#">
                        <Button classes="follow-btn">
                          <i className="ti ti-user-plus fs-xl"></i>
                        </Button>
                      </form>
                    </div>
                    <div className="player-score-details d-flex align-items-center flex-wrap gap-3">
                      <div className="score">
                        <h6 className="score-title tcn-6 mb-2">Score</h6>
                        <ul className="d-flex align-items-center gap-1 tcp-2">
                          <li>
                            <i className="ti ti-star-filled"></i>
                          </li>
                          <li>
                            <i className="ti ti-star-filled"></i>
                          </li>
                          <li>
                            <i className="ti ti-star-filled"></i>
                          </li>
                          <li>
                            <i className="ti ti-star-half-filled"></i>
                          </li>
                          <li>
                            <i className="ti ti-star"></i>
                          </li>
                        </ul>
                      </div>
                      <div className="rank">
                        <h6 className="rank-title tcn-6 mb-2">Rank</h6>
                        <span className="tcn-1 fs-sm">
                          <i className="ti ti-diamond"></i> Diamond
                        </span>
                      </div>
                      <div className="region">
                        <h6 className="region-title tcn-6 mb-2">Region</h6>
                        <span className="tcn-1 fs-sm text-uppercase"> EUW</span>
                      </div>
                      <div className="team">
                        <h6 className="team-title tcn-6 mb-2">Team</h6>
                        <span className="tcs-1 fs-sm text-uppercase">
                          {team}
                        </span>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TopPlayer
