import React from 'react'
import { motion } from 'framer-motion'

// Générer des étoiles statiques
export const staticStars = Array.from({ length: 600 }).map((_, i) => {
  const size = Math.random() * 4 + 1
  const color = i % 20 === 0 ? '#8bdfff': i % 15 === 0 ? '#ffcf8b': i % 10 === 0 ? '#ff8bab': '#ffffff'

  return (
    <div
      key={ `star-${ i }` }
      className="absolute rounded-full"
      style={ {
        top: `${ Math.random() * 100 }%`,
        left: `${ Math.random() * 100 }%`,
        width: `${ size }px`,
        height: `${ size }px`,
        backgroundColor: color,
        boxShadow: i % 8 === 0 ? `0 0 ${ size + 3 }px ${ size }px rgba(255, 255, 255, 0.7)`: 'none',
        opacity: Math.random() * 0.8 + 0.2,
        animation: `twinkle ${ Math.random() * 5 + 3 }s infinite ${ Math.random() * 5 }s`,
      } }
    />
  )
})

// Générer des étoiles avec parallaxe
export const parallaxStars = Array.from({ length: 50 }).map((_, i) => {
  const size = Math.random() * 3 + 2
  const depth = Math.random() * 5 + 1
  const color = i % 3 === 0 ? '#8bdfff': i % 5 === 0 ? '#ffcf8b': '#ffffff'

  return (
    <motion.div
      key={ `parallax-${ i }` }
      className="absolute rounded-full"
      style={ {
        top: `${ Math.random() * 100 }%`,
        left: `${ Math.random() * 100 }%`,
        width: `${ size }px`,
        height: `${ size }px`,
        backgroundColor: color,
        boxShadow: `0 0 ${ size }px ${ size / 2 }px rgba(255, 255, 255, 0.5)`,
        zIndex: 1,
      } }
      animate={ {
        x: [0, Math.random() * 20 - 10],
        y: [0, Math.random() * 20 - 10],
      } }
      transition={ {
        duration: 20 / depth,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: 'reverse',
        ease: 'easeInOut',
      } }
    />
  )
})

export const orbitingStations = Array.from({ length: 8 }).map((_, i) => {
  // Paramètres de l'orbite
  const radius = 150 + i * 30 // Rayon de l'orbite
  const duration = 30 + i * 15 // Durée de l'orbite
  const delay = i * 2 // Délai pour que les stations ne commencent pas toutes au même point
  const size = 25 + Math.random() * 30 // Taille variable des stations
  const stationImage =
    i % 3 === 0 ? '/images/small_station.png': i % 3 === 1 ? '/images/satellite.png': '/images/small_station2.png' // Trois types d'images

  // Angle d'inclinaison de l'orbite (pour créer des orbites sur différents plans)
  const tiltX = i % 2 === 0 ? 0 : 15 // Inclinaison sur l'axe X
  const tiltY = i % 3 === 0 ? 0 : i % 3 === 1 ? 10: -10 // Inclinaison sur l'axe Y

  // Créer un tableau de points pour l'animation circulaire
  const steps = 60 // Nombre de points dans l'orbite
  const xPoints = []
  const yPoints = []

  for (let step = 0; step <= steps; step++) {
    const angle = (step / steps) * Math.PI * 2
    xPoints.push(Math.cos(angle) * radius)
    yPoints.push(Math.sin(angle) * radius)
  }

  return (
    <motion.div
      key={ `station-${ i }` }
      className="absolute z-10"
      style={ {
        width: `${ size }px`,
        height: `${ size }px`,
        top: `calc(50% - ${ size / 2 }px)`,
        left: `calc(25% - ${ size / 2 }px)`, // Centré sur la station principale (25% de la page)
        perspective: '1000px',
      } }
      animate={ {
        x: xPoints,
        y: yPoints,
        rotateX: tiltX,
        rotateY: tiltY,
        rotate: [0, 360], // Rotation de la station sur elle-même
      } }
      transition={ {
        duration: duration,
        times: Array(steps + 1)
          .fill(0)
          .map((_, i) => i / steps), // Répartition uniforme des points dans le temps
        delay: delay,
        repeat: Number.POSITIVE_INFINITY,
        ease: 'linear',
      } }
    >
      <img
        src={ stationImage || '/placeholder.svg' }
        alt={ `Station spatiale ${ i }` }
        className="h-auto w-auto"
        style={ { maxWidth: '100%', maxHeight: '100%' } }
      />
    </motion.div>
  )
})
