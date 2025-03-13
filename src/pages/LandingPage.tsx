import React from 'react'
import Hero from 'components/LandingPage/Hero'
import ThreeDSwiper from 'components/LandingPage/ThreeDSwiper'
import TopPlayer from 'components/LandingPage/TopPlayer'
import Tournaments from 'components/LandingPage/Tournaments'
import NextLevelGaming from 'components/LandingPage/NextLevelGaming'
import Games from 'components/LandingPage/Games'

const LandingPage : React.FC = () => {
  return (
    <main>
      <Hero />
      <ThreeDSwiper />
      <TopPlayer />
      <Tournaments />
      <Games />
      <NextLevelGaming />
    </main>
  )
}

export default LandingPage
