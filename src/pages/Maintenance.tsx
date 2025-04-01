import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Container, Spinner } from 'reactstrap'
import { useMaintenance } from 'contexts/MaintenanceContext'

export default function MaintenancePage() {
  const { maintenanceMessage } = useMaintenance()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <Container className="loader-container">
        <div className="spinner-wrapper">
          <Spinner className="custom-spinner" />
        </div>
      </Container>
    )
  }

  // Générer des étoiles statiques
  const staticStars = Array.from({ length: 600 }).map((_, i) => {
    const size = Math.random() * 4 + 1
    const color = i % 20 === 0 ? '#8bdfff' : i % 15 === 0 ? '#ffcf8b' : i % 10 === 0 ? '#ff8bab' : '#ffffff'

    return (
      <div
        key={`star-${i}`}
        className="absolute rounded-full"
        style={{
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: color,
          boxShadow: i % 8 === 0 ? `0 0 ${size + 3}px ${size}px rgba(255, 255, 255, 0.7)` : 'none',
          opacity: Math.random() * 0.8 + 0.2,
          animation: `twinkle ${Math.random() * 5 + 3}s infinite ${Math.random() * 5}s`,
        }}
      />
    )
  })

  // Générer des étoiles avec parallaxe
  const parallaxStars = Array.from({ length: 50 }).map((_, i) => {
    const size = Math.random() * 3 + 2
    const depth = Math.random() * 5 + 1
    const color = i % 3 === 0 ? '#8bdfff' : i % 5 === 0 ? '#ffcf8b' : '#ffffff'

    return (
      <motion.div
        key={`parallax-${i}`}
        className="absolute rounded-full"
        style={{
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: color,
          boxShadow: `0 0 ${size}px ${size / 2}px rgba(255, 255, 255, 0.5)`,
          zIndex: 1,
        }}
        animate={{
          x: [0, Math.random() * 20 - 10],
          y: [0, Math.random() * 20 - 10],
        }}
        transition={{
          duration: 20 / depth,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
      />
    )
  })

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black px-4 py-12 text-white">
      {/* Fond étoilé statique */}
      <div className="absolute inset-0 z-0">{staticStars}</div>

      {/* Nébuleuses colorées */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(circle at 70% 30%, rgba(111, 66, 193, 0.6), transparent 60%), radial-gradient(circle at 30% 70%, rgba(59, 130, 246, 0.6), transparent 60%), radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.3), transparent 70%)',
          }}
        />
      </div>

      {/* Étoiles avec parallaxe */}
      <div className="absolute inset-0 z-1">{parallaxStars}</div>

      {/* Station spatiale principale */}
      <motion.div
        className="absolute z-10"
        style={{ x: -180, y: -100 }}
        animate={{
          y: [-100, -80, -100],
          rotate: [0, 2, 0],
        }}
        transition={{
          duration: 15,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        }}
      >
        <img src="/images/station.png" alt="Station spatiale" className="h-auto w-auto" style={{ maxWidth: '850px' }} />
      </motion.div>

      {/* Petite station spatiale */}
      <motion.div
        className="absolute right-10 top-20 z-10"
        animate={{
          y: [0, 20, 0],
          x: [0, -10, 0],
          rotate: [0, -3, 0],
        }}
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        }}
      >
        <img src="/images/small_station.png" alt="Petite station spatiale" className="h-auto w-auto" style={{ maxWidth: '180px' }} />
      </motion.div>

      {/* Satellite */}
      <motion.div
        className="absolute bottom-20 left-10 z-10"
        animate={{
          y: [0, 15, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        }}
      >
        <img src="/images/satellite.png" alt="Satellite" className="h-auto w-auto" style={{ maxWidth: '120px' }} />
      </motion.div>

      <motion.div
        className="z-20 mx-auto max-w-3xl rounded-xl bg-black/60 p-8 text-center backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="mb-6 text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">Project 42 est en maintenance</h1>
        <div className="mb-8 h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full"></div>
        <p className="mb-8 text-xl text-gray-300 md:text-2xl">
          {maintenanceMessage}
        </p>
        <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          <a
            href="https://discord.gg/35NK7yQ8m3"
            className="discord-button inline-flex h-12 items-center justify-center rounded-md border border-transparent bg-discord hover:bg-discord-dark px-6 font-medium text-white shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-discord focus:ring-offset-2"
          >
            <svg
              className="mr-2 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 127.14 96.36"
              fill="currentColor"
            >
              <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
            </svg>
            Rejoindre le serveur Discord
          </a>
          <div className="flex items-center space-x-2 text-gray-400">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-green-400"></span>
            <span>Retour estimé: 24 heures</span>
          </div>
        </div>
      </motion.div>

      {/* Planète en bas */}
      <div className="absolute -bottom-32 left-1/2 z-0 h-64 w-full max-w-3xl -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-900 to-purple-900 opacity-20 blur-3xl"></div>
    </div>
  )
}

