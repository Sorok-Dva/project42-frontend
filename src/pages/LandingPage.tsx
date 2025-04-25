import React from 'react'
import Hero from 'components/LandingPage/Hero'
import TeamMembers from 'components/LandingPage/TeamMembers'
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
      <TeamMembers />
    </main>
  )
}

export default LandingPage
