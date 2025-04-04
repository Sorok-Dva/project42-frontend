import 'styles/Room.scss'

import React from 'react'
import RoomList from 'components/Game/Rooms'
import { useUser } from 'contexts/UserContext'
import { staticStars, parallaxStars } from 'utils/animations'
import { Tooltip } from 'react-tooltip'
import { motion } from 'framer-motion'
import hero from 'assets/img/hero.png'
import { Img as Image } from 'react-image'

const HomePage = () => {
  const { user } = useUser()
  return (
    <>
      <div
        className="relative min-h-screen overflow-hidden bg-black bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black text-white">
        {/* Fond étoilé statique */ }
        <div className="absolute inset-0 z-0">{ staticStars }</div>

        {/* Nébuleuses colorées */ }
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 opacity-40"
            style={ {
              background:
                'radial-gradient(circle at 70% 30%, rgba(111, 66, 193, 0.6), transparent 60%), radial-gradient(circle at 30% 70%, rgba(59, 130, 246, 0.6), transparent 60%), radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.3), transparent 70%)',
            } }
          />
        </div>

        {/* Étoiles avec parallaxe */ }
        <div className="absolute inset-0 z-1">{ parallaxStars }</div>

        {/* Vaisseau spatial animé au centre */}
        <motion.div
          className="absolute z-10 lg:block"
          style={{ left: '60%', top: '10%', width: '15%', transform: 'translateX(-50%)' }}
          animate={{
            y: [0, -20, 0],
            rotate: [-2, 2, -2],
            x: ['-50%', 'calc(-50% + 15px)', '-50%'],
          }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
          }}
        >
          <img src="/images/spaceship.png" alt="Vaisseau spatial" className="w-full h-auto" />
          <div className="absolute -bottom-5 -left-5 right-0 h-full bg-blue-500/20 rounded-full blur-3xl opacity-30"></div>
        </motion.div>

        {/* Station spatiale animée à gauche */ }
        <motion.div
          className="absolute z-5 lg:block"
          style={ { left: '2%', bottom: '10%', width: '50%' } }
          animate={ {
            scale: [1, 1.05, 1],
            rotate: [0, 1, 0, -1, 0],
            y: [0, -10, 0],
          } }
          transition={ {
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
            times: [0, 0.25, 0.5, 0.75, 1],
          } }
        >
          <img src="/images/station.png" alt="Station spatiale"
            className="h-auto opacity-80" style={{ width: '1000px' }} />
          <div
            className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-blue-500/30 mix-blend-overlay rounded-full blur-2xl"></div>
          <div
            className="absolute inset-0 animate-pulse-slow bg-gradient-to-tr from-blue-500/5 to-purple-500/5 mix-blend-overlay rounded-full blur-xl"></div>
        </motion.div>

        <section className="relative z-20 pt-10 px-4">
          <div className="container mx-auto">
            <div
              className="flex flex-col md:flex-row items-center justify-between">
              <div className="md:w-1/2 mb-10 md:mb-0">
                <motion.div initial={ { opacity: 0, y: 20 } } animate={ { opacity: 1, y: 0 } } transition={ { duration: 0.8 } }>
                  <h1
                    className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                    Bienvenue,{ ' ' }
                    <span
                      className="bg-clip-text gradient-text">
                      { user?.nickname }
                    </span>
                  </h1>
                  <p className="text-xl text-gray-300 mb-8 max-w-lg">
                    Ton aventure spatiale continue. Choisis un salon et
                    rejoins la partie !
                  </p>
                  <div className="flex flex-wrap gap-6 mb-8">
                    <div
                      className="bg-black/40 backdrop-blur-sm p-4 rounded-xl border border-gray-800">
                      <div className="text-sm text-gray-400">Niveau</div>
                      <div className="text-2xl font-bold">{ user?.level }</div>
                    </div>
                    <div
                      className="bg-black/40 backdrop-blur-sm p-4 rounded-xl border border-gray-800">
                      <div className="text-sm text-gray-400">Crédits</div>
                      <div className="text-2xl font-bold">0</div>
                    </div>
                    <div
                      className="bg-black/40 backdrop-blur-sm p-4 rounded-xl border border-gray-800">
                      <div className="text-sm text-gray-400">Parties jouées
                      </div>
                      <div className="text-2xl font-bold">A venir</div>
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    {/*<button
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-3 rounded-lg transition-all font-medium">
                      Partie rapide
                    </button>*/}
                    <button
                      data-tooltip-content="Cette fonctionnalité sera bientôt disponible !"
                      data-tooltip-id="soon"
                      className="border border-gray-700 hover:border-gray-500 px-6 py-3 rounded-lg transition-all font-medium disabled"
                      disabled={ true }
                      style={{ cursor: 'not-allowed' }}
                    >
                      Missions quotidiennes
                    </button>
                    <Tooltip id="soon"/>
                  </div>
                </motion.div>
              </div>
              <div className="md:w-1/2 flex justify-center md:justify-end">
                <motion.div
                  className="relative"
                  initial={ { opacity: 0, scale: 0.9 } }
                  animate={ { opacity: 1, scale: 1 } }
                  transition={ { duration: 0.8, delay: 0.2 } }
                  style={{ minHeight: '500px' }}
                >
                  <Image className="max-w-full md:max-w-md h-auto hero"
                    src={ hero } alt="banner"/>
                  <div
                    className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-2xl -z-10"></div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Section des salons de jeu */ }
        <section className="relative" style={{ marginTop: '-5%', zIndex: 99 }}>
          <motion.div
            className="container mx-auto bg-black/50 backdrop-blur-md rounded-2xl border border-gray-800/50 shadow-xl p-8"
            initial={ { opacity: 0, y: 20 } }
            animate={ { opacity: 1, y: 0 } }
            transition={ { duration: 0.8, delay: 0.4 } }
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold">Salons de jeu</h2>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400">Trier par:</span>
                <select
                  className="bg-black/60 border border-gray-700 rounded-lg px-3 py-1 text-sm">
                  <option>Popularité</option>
                  <option>Récent</option>
                  <option>Alphabétique</option>
                </select>
              </div>
            </div>

            <div>
              <RoomList/>
            </div>
          </motion.div>
        </section>
      </div>
    </>
  )
}

export default HomePage
