import React from 'react'
import Hero from 'components/LandingPage/Hero'
import ThreeDSwiper from 'components/LandingPage/ThreeDSwiper'
import TopPlayer from 'components/LandingPage/TopPlayer'
import Games from 'components/LandingPage/Games'
import About from 'components/LandingPage/About'
import Cards from 'components/LandingPage/Cards'

const LandingPage : React.FC = () => {
  return (
    <main>
      <Hero />
      <TopPlayer />
      <Games />
      <Cards />
      <About />
      <ThreeDSwiper />
    </main>
  )
}

export default LandingPage
