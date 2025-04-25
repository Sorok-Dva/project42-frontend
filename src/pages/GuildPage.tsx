import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Container, Spinner } from 'reactstrap'
import PlayerDetails from 'components/Guilds/Details'
import StationBanner from 'components/Guilds/StationBanner'
import { Guild } from 'components/Guilds/Guilds'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { staticStars, parallaxStars, orbitingStations } from 'utils/animations'

const GuildDetailsView = () => {
  const { id: tag } = useParams<{ id : string }>()

  const [guild, setGuild] = useState<Guild | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGuild = async () => {
      try {
        setLoading(true)
        const response = await axios.get<Guild>(`/api/guilds/info/${ tag }`)
        setGuild(response.data)
        document.title = `Station ${response.data.name} [${response.data.tag}] - Project 42`
      } catch (err : any) {
        console.log('failed to fetch guild data', err)
      } finally {
        setLoading(false)
      }
    }

    fetchGuild()

    window.addEventListener('reloadGuildData', fetchGuild)

    return () => {
      window.removeEventListener('reloadGuildData', fetchGuild)
      document.title = 'Project 42'
    }
  }, [])
  return (
    <>
      <motion.div className="relative flex min-h-screen pt-100 flex-col items-center justify-center overflow-hidden bg-black bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black px-4 text-white">
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

        {/* Station spatiale principale au centre */ }
        <div
          className="absolute z-5 h-full flex items-center pointer-events-none"
          style={ { left: '1%', width: '100%' } }>
          <motion.div
            animate={{
              scale: [1, 1.08, 1.02, 1.08, 1], // Augmentation de l'effet d'échelle
              rotate: [0, 2, 0, -2, 0], // Rotation plus prononcée
              y: [0, -15, 5, -15, 0], // Ajout d'un mouvement vertical
            }}
            transition={{
              duration: 60, // Durée plus longue pour un effet plus majestueux
              repeat: Number.POSITIVE_INFINITY,
              ease: 'easeInOut',
              times: [0, 0.25, 0.5, 0.75, 1], // Synchronisation des mouvements
            }}
            className="relative"
            style={ { width: '100%', maxWidth: '730px' } }
          >
            <img src="/images/station.png"
              alt="Station spatiale principale"
              className="opacity-80" style={{ width: '750px' }} />
            <div
              className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 mix-blend-overlay rounded-full blur-xl"></div>
          </motion.div>
        </div>

        {/* Stations spatiales en orbite */ }
        <div className="absolute inset-0 z-10 flex items-center justify-center">{ orbitingStations }</div>
        <motion.div
          className="relative z-20 w-full max-w-7xl mx-auto my-8 p-8 md:p-12 bg-black/40 backdrop-blur-md rounded-2xl border border-gray-800/50 shadow-xl"
          initial={ { opacity: 0, y: 20 } }
          animate={ { opacity: 1, y: 0 } }
          transition={ { duration: 0.8 } }
        >

          { loading || !guild ? (
            <Container className="loader-container">
              <div className="spinner-wrapper">
                <Spinner type="border" role="status" className="custom-spinner">
                  <span className="sr-only">Chargement des informations de la station...</span>
                </Spinner>
                <div className="loading-text">Chargement des informations de la station...</div>
              </div>
            </Container>
          ) : (
            <>
              <StationBanner guild={ guild }/>
              <PlayerDetails guild={ guild }/>
            </>
          ) }
        </motion.div>
      </motion.div>
    </>
  )
}

export default GuildDetailsView
