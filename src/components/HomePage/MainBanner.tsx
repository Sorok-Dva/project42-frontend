'use client'

import React from 'react'
import { useUser } from 'contexts/UserContext'

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
