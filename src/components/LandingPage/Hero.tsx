import award from 'assets/img/award.png'
import bg1 from 'assets/img/bg-1.png'
import bigStar from 'assets/img/big-star.png'
import hero from 'assets/img/hero.png'
import smallStar from 'assets/img/small-star.png'
import { Img as Image } from 'react-image'
import React, { useEffect } from 'react'
import Tilt from 'react-parallax-tilt'
import useDropdown from 'hooks/useDropdown'
import axios from 'axios'

interface User {
  id: number
  nickname: string
  isMale: boolean
  role: string
  roleId: number
  isAdmin: boolean
  level: number
  avatar: string
  points: string
}

const Hero: React.FC = () => {
  const { toggleOpen } = useDropdown()

  const [connectedUsers, setConnectedUsers] = React.useState<User[]>([])
  const [registeredUsers, setRegistereddUsers] = React.useState<User[]>([])

  useEffect(() => {
    async function retrieveServerData () {
      const connectedResponse = await axios.get('/api/users/connected')
      const registeredResponse = await axios.get('/api/users/lastRegisteredUsers')
      setConnectedUsers(Object.values(connectedResponse.data.users))
      setRegistereddUsers(Object.values(registeredResponse.data.users))
    }

    retrieveServerData ()
  }, [])

  return (
    <section className="hero-section pt-20 pb-120 position-relative">
      <div className="gradient-bg"></div>
      <div className="gradient-bg2"></div>
      <div className="star-area">
        <div className="big-star">
          <Image className="w-100" src={bigStar} alt="star" />
        </div>
        <div className="small-star">
          <Image className="w-100" src={smallStar} alt="star" />
        </div>
      </div>
      <div className="rotate-award">
        <Image className="w-100" src={award} alt="award" />
      </div>
      <div className="container pt-120 pb-15">
        <div className="row g-6 justify-content-between">
          <div className="col-lg-5 col-md-6 col-sm-8">
            <div className="hero-content">
              <ul className="d-flex gap-3 fs-2xl fw-semibold heading-font mb-5 list-icon title-anim">
                <li>Jouer</li>
                <li>Débattre</li>
                <li>Gagner</li>
              </ul>
              <h1 className="hero-title display-one tcn-1 cursor-scale growUp mb-10">
                <span className="d-block tcp-1">Project 42</span>
              </h1>
              <button
                onClick={toggleOpen}
                className="btn-half-border position-relative d-inline-block py-2 px-6 bgp-1 rounded-pill popupvideo mfp-iframe">
                Jouer maintenant
              </button>
            </div>
          </div>
          <div className="col-xl-3 col-md-2 col-sm-4 order-md-last order-lg-1">
            <div className="hero-banner-area">
              {/*<div className="hero-banner-bg">*/}
              {/*  <Image className="w-100" src={bg1} alt="banner" />*/}
              {/*</div>*/}
              <div className="hero-banner-img">
                <Image className="w-100 hero" src={hero} alt="banner" />
              </div>
            </div>
          </div>
          <div className="col-xl-4 col-lg-5 col-md-6 order-md-1 order-lg-last">
            <div className="hero-content">
              <Tilt
                className="card-area py-lg-8 py-6 px-lg-6 px-3 rounded-5 tilt mb-10"
                data-tilt>
                <h3 className="tcn-1 dot-icon cursor-scale growDown mb-6">
                  Derniers joueurs inscrits
                </h3>
                <div className="hr-line mb-6"></div>
                <div className="card-items d-grid gap-5">
                  {registeredUsers.map((user, id) => (
                    <React.Fragment key={user.id}>
                      <div className="card-item d-flex align-items-center gap-4">
                        <div className="card-img-area rounded-circle overflow-hidden">
                          <Image className="w-100" src={user.avatar} alt="profile" />
                        </div>
                        <div className="card-info">
                          <h4 className="card-title fw-semibold tcn-1 mb-1 cursor-scale growDown2">
                            {user.nickname}
                          </h4>
                          <p className="card-text tcs-3 fw-medium">
                            Niveau: {user.level} ({user.points} points)
                          </p>
                        </div>
                      </div>
                      {id !== 3 && <div className="hr-line"></div>}
                    </React.Fragment>
                  ))}
                </div>
              </Tilt>
              <div className="active-player-list d-grid justify-content-end gap-2">
                <ul className="player-lists d-flex align-items-center">
                  {connectedUsers.slice(0, 5).map((user) => (
                    <li key={user.id} className="rounded-circle overflow-hidden me-n6">
                      <Image src={user.avatar} alt={user.nickname} />
                    </li>
                  ))}
                  {connectedUsers.length > 5 && (
                    <li className="rounded-circle overflow-hidden me-n6 heading-font fs-xl">
                      +{connectedUsers.length - 5}
                    </li>
                  )}
                </ul>
                <span className="d-block tcn-1 dot-icon cursor-scale growDown2 fs-xl text-end">
                  {connectedUsers.length} Joueurs actifs
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid-lines overflow-hidden">
        <div className="lines">
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
        </div>
        <div className="lines">
          <div className="line-vertical"></div>
          <div className="line-vertical"></div>
          <div className="line-vertical"></div>
          <div className="line-vertical"></div>
          <div className="line-vertical"></div>
          <div className="line-vertical"></div>
          <div className="line-vertical"></div>
          <div className="line-vertical"></div>
          <div className="line-vertical"></div>
          <div className="line-vertical"></div>
        </div>
      </div>
    </section>
  )
}

export default Hero
