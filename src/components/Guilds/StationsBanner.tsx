import React from 'react'
import { Img as Image } from 'react-image'

const Banner = () => {
  return (
    <section className="teams-section pb-sm-10 pb-6 mt-lg-0 mt-sm-15 mt-10">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="parallax-banner-area parallax-container">
              <Image
                className="w-100 rounded-5 parallax-img"
                src='/img/stations_banner2.png'
                alt="Bannieres des stations"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Banner
