'use client'

import type React from 'react'
import { motion } from 'framer-motion'
import { staticStars, parallaxStars, orbitingStations } from 'utils/animations'
import Hero from 'components/LandingPage/Hero'
import TeamMembers from 'components/LandingPage/TeamMembers'
import TopPlayer from 'components/LandingPage/TopPlayer'
import Games from 'components/LandingPage/Games'
import About from 'components/LandingPage/About'
import Cards from 'components/LandingPage/Cards'
import { useEvent } from 'components/EventSystem/EventProvider'

const LandingPage: React.FC = () => {
  const { currentEvent, isEventActive, getEventStyles } = useEvent()

  return (
    <>
      <motion.div
        className={`relative min-h-screen overflow-hidden text-white ${
          isEventActive && currentEvent
            ? `bg-gradient-to-b ${currentEvent.colors.background}`
            : 'bg-black bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black'
        }`}
        style={getEventStyles()}
      >  {/* Fond étoilé statique */}
        <div className="absolute inset-0 z-0">{staticStars}</div>

        {/* Nébuleuses colorées */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background:
                isEventActive && currentEvent
                  ? `radial-gradient(circle at 20% 80%, ${currentEvent.colors.primary}30, transparent 50%), radial-gradient(circle at 80% 20%, ${currentEvent.colors.secondary}30, transparent 50%), radial-gradient(circle at 40% 40%, ${currentEvent.colors.accent}20, transparent 50%)`
                  : 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3), transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3), transparent 50%), radial-gradient(circle at 40% 40%, rgba(59, 130, 246, 0.2), transparent 50%)',            }}
          />
        </div>

        {/* Étoiles avec parallaxe */}
        <div className="absolute inset-0 z-1">{parallaxStars}</div>

        {/* Station spatiale principale */}
        <div
          className="absolute z-5 h-full flex items-center pointer-events-none"
          style={{ left: '1%', width: '100%' }}
        >
          <motion.div
            animate={{
              scale: [1, 1.05, 1.02, 1.05, 1],
              rotate: [0, 1, 0, -1, 0],
              y: [0, -10, 5, -10, 0],
              filter:
                isEventActive && currentEvent
                  ? [
                    'hue-rotate(0deg)',
                    `hue-rotate(${currentEvent.id === 'christmas' ? '120deg' : currentEvent.id === 'halloween' ? '30deg' : '0deg'})`,
                  ]
                  : ['hue-rotate(0deg)'],
            }}
            transition={{
              duration: 45,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'easeInOut',
              times: [0, 0.25, 0.5, 0.75, 1],
            }}
            className="relative opacity-60"
            style={{ width: '100%', maxWidth: '600px' }}
          >
            <img src="/images/station.png" alt="Station spatiale principale" className="w-full" />
            <div
              className="absolute inset-0 mix-blend-overlay rounded-full blur-xl"
              style={{
                background:
                  isEventActive && currentEvent
                    ? `linear-gradient(to right, ${currentEvent.colors.primary}10, ${currentEvent.colors.secondary}10)`
                    : 'linear-gradient(to right, rgba(147, 51, 234, 0.1), rgba(59, 130, 246, 0.1))',
              }}
            />          </motion.div>
        </div>

        {/* Stations en orbite */}
        <div className="absolute h-full flex items-center pointer-events-none" style={{ left: '5%', width: '40%' }}>
          {orbitingStations}
        </div>

        {/* Contenu principal */}
        <main className="relative z-20">
          <Hero />
          <TopPlayer />
          <Games />
          <Cards />
          <About />
          <TeamMembers />
        </main>
      </motion.div>
    </>
  )
}

export default LandingPage
