'use client'

import React from 'react'
import { Img as Image } from 'react-image'
import { Link } from 'react-router-dom'


import bannerMainImg from '../../assets/images/home-page/main-img2.png'

// Banner Shape Images
import bannerShape1 from '../../assets/images/home-page/shape1.png'
import bannerShape2 from '../../assets/images/home-page/shape2.png'
import bannerShape3 from '../../assets/images/home-page/Dream 1.png'
import bannerShape4 from '../../assets/images/home-page/moon.png'
import bannerShape5 from '../../assets/images/home-page/shape5.png'
import bannerShape6 from '../../assets/images/home-page/shape6.png'
import bannerShape7 from '../../assets/images/home-page/shape7.png'
import bannerShape8 from '../../assets/images/home-page/shape8.png'
import bannerShape9 from '../../assets/images/home-page/shape9.png'
import bannerShape10 from '../../assets/images/home-page/shape10.png'

// Animate Shape Images
import animateShape1 from '../../assets/images/landing-page/shape/animate1.png'
import animateShape2 from '../../assets/images/landing-page/shape/animate2.png'
import animateShape3 from '../../assets/images/landing-page/shape/animate3.png'
import { useUser } from 'context/UserContext'
import { FaDiscord } from 'react-icons/fa6'
import { Button } from 'reactstrap'

const MainBanner: React.FC = () => {
  const { user } = useUser()
  return (
    <>
      <div className="main-banner-area main-banner-area-two">
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-6">
              <div className="banner-text">
                <h1
                  data-aos="fade-up"
                  data-aos-duration="800"
                  data-aos-delay="100"
                >
                  Bonjour, { user!.nickname } !
                </h1>

                <p
                  data-aos="fade-up"
                  data-aos-duration="800"
                  data-aos-delay="200"
                >
                  Trouvez une partie et jouez avec la communauté. <br/>
                  <b>Votre aventure démarre maintenant !</b>
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}

export default MainBanner
