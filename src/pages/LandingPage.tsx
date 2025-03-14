import React from 'react'
import Hero from 'components/LandingPage/Hero'
import ThreeDSwiper from 'components/LandingPage/ThreeDSwiper'
import TopPlayer from 'components/LandingPage/TopPlayer'
import Games from 'components/LandingPage/Games'
import NextLevelGaming from 'components/LandingPage/NextLevelGaming'
import Cards from 'components/LandingPage/Cards'

const LandingPage : React.FC = () => {
  return (
    <main>
      <Hero />
      <ThreeDSwiper />
      <TopPlayer />
      <Games />
      <Cards />
      <NextLevelGaming />
    </main>
  )
}

export default LandingPage
