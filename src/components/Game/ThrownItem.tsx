'use client'
import React, { useRef } from 'react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ThrownItemProps {
  src: string
  onComplete: () => void
  targetX?: number
  targetY?: number
}

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  life: number
}

const ThrownItem: React.FC<ThrownItemProps> = ({
  src,
  onComplete,
  targetX = 50,
  targetY = 50,
}) => {
  const [showImpact, setShowImpact] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])
  const [screenShake, setScreenShake] = useState(false)

  const type = src.split('/assets/images/custom/throwable/')[1].replace('.png', '')

  const getItemConfig = (itemType: string) => {
    switch (itemType) {
    case 'tomato':
      return {
        impactColor: '#ff4444',
        particleColors: ['#ff4444', '#ff6666', '#cc2222', '#ff8888'],
        splashSize: 120,
        particleCount: 15,
        sound: 'tomato',
      }
    case 'heart':
      return {
        impactColor: '#ff4d88',
        particleColors: ['#ff4d88', '#ff6699', '#ff85a2', '#ff3366'],
        splashSize: 100,
        particleCount: 20,
        sound: 'heart',
      }
    case 'confetti':
      return {
        impactColor: '#ffdd44',
        particleColors: ['#ff4444', '#44ff44', '#4444ff', '#ffdd44', '#ff44ff', '#44ffff'],
        splashSize: 100,
        particleCount: 25,
        sound: 'pop',
      }
    case 'snowball':
      return {
        impactColor: '#ffffff',
        particleColors: ['#ffffff', '#f0f8ff', '#e6f3ff', '#ccddff'],
        splashSize: 80,
        particleCount: 12,
        sound: 'thud',
      }
    case 'pie':
      return {
        impactColor: '#ffd700',
        particleColors: ['#ffd700', '#ffed4e', '#fff59d', '#f9a825'],
        splashSize: 140,
        particleCount: 20,
        sound: 'splat',
      }
    default:
      return {
        impactColor: '#888888',
        particleColors: ['#888888', '#aaaaaa', '#666666', '#999999'],
        splashSize: 100,
        particleCount: 10,
        sound: 'thud',
      }
    }
  }

  const config = getItemConfig(type)

  const hasPlayedSound = useRef(false)

  useEffect(() => {
    if (!config || !config.sound || hasPlayedSound.current) return
    hasPlayedSound.current = true
    try {
      new Audio(`/assets/sounds/custom/throwable/${ config.sound }.wav`).play().then().catch()
    } catch {
      console.error('fail to load sound')
    }
  }, [config])

  // Départ aléatoire hors écran
  const startX = Math.random() * 20 + 10 // entre 10% et 30% de la largeur
  const startY = -10 // au-dessus de l'écran

  // Point le plus haut de la parabole
  const midX = (startX + targetX) / 2 + (Math.random() - 0.5) * 20
  const midY = Math.min(startY, targetY) - 20

  const generateParticles = () => {
    const newParticles: Particle[] = []
    for (let i = 0; i < config.particleCount; i++) {
      newParticles.push({
        id: i,
        x: targetX,
        y: targetY,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 15,
        color: config.particleColors[Math.floor(Math.random() * config.particleColors.length)],
        size: Math.random() * 8 + 4,
        life: 1,
      })
    }
    setParticles(newParticles)
  }

  useEffect(() => {
    if (particles.length === 0) return
    const interval = setInterval(() => {
      setParticles(prev =>
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.5,
            vx: p.vx * 0.98,
            life: p.life - 0.02,
          }))
          .filter(p => p.life > 0)
      )
    }, 16)
    return () => clearInterval(interval)
  }, [particles])

  const handleImpact = () => {
    setShowImpact(true)
    setScreenShake(true)
    generateParticles()

    setTimeout(() => setScreenShake(false), 200)
    setTimeout(() => {
      setShowImpact(false)
      setParticles([])
      onComplete()
    }, 2000)
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Lancer de l'objet (pas de shake, caché pendant l'impact) */}
      {!showImpact && (
        <motion.div
          className="absolute"
          style={{ left: `${startX}vw`, top: `${startY}vh` }}
          animate={{
            x: ['0vw', `${midX - startX}vw`, `${targetX - startX}vw`],
            y: ['0vh', `${midY - startY}vh`, `${targetY - startY}vh`],
            scale: [0.6, 1.2, 1.6], // effet de rapprochement
          }}
          transition={{
            duration: 1.2,
            ease: [0.25, 0.46, 0.45, 0.94],
            times: [0, 0.5, 1],
          }}
          onAnimationComplete={handleImpact}
        >
          <motion.img
            src={src}
            className="w-36 h-36 object-contain"
            style={{ filter: 'drop-shadow(2px 4px 8px rgba(0,0,0,0.3))' }}
            animate={{ rotate: [0, 720] }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </motion.div>
      )}

      {/* Écran secoué + impact + particules */}
      <motion.div
        className="fixed inset-0"
        animate={
          screenShake
            ? { x: [0, -2, 2, -2, 2, 0], y: [0, -1, 1, -1, 1, 0] }
            : {}
        }
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      >
        {/* Agrandissement XXL de l'image finale */}
        <AnimatePresence>
          {showImpact && type === 'heart' && (
            <motion.img
              src={src}
              className="absolute object-contain"
              style={{
                left: `${targetX}vw`,
                top: `${targetY}vh`,
                width: '120px',
                height: '120px',
                transform: 'translate(-50%, -50%)',
                filter: 'drop-shadow(2px 4px 8px rgba(0,0,0,0.4))',
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{
                scale: [1, 1.4, 1, 1.4, 1, 1.4, 1],
                opacity: [0, 1, 1, 1, 1, 1, 0],
              }}
              transition={{
                duration: 6,
                ease: 'easeInOut',
              }}
            />
          )}
          {showImpact && type === 'tomato' && (
            <motion.img
              src={src}
              className="absolute object-contain"
              style={{
                left: `${targetX}vw`,
                top: `${targetY}vh`,
                width: '150px',
                height: '150px',
                transform: 'translate(-50%, -50%)',
                filter: 'drop-shadow(2px 4px 8px rgba(0,0,0,0.3))',
              }}
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 5, opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          )}
        </AnimatePresence>

        {/* Impact cercle */}
        <AnimatePresence>
          {showImpact && (
            <motion.div
              className="absolute rounded-full"
              style={{
                left: `${targetX}vw`,
                top: `${targetY}vh`,
                backgroundColor: config.impactColor,
                transform: 'translate(-50%, -50%)',
              }}
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: [0, 1.5, 2], opacity: [0.8, 0.6, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <div
                className="rounded-full"
                style={{
                  width: `${config.splashSize}px`,
                  height: `${config.splashSize}px`,
                  background: `radial-gradient(circle, ${config.impactColor}80, ${config.impactColor}40, transparent)`,
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Particules */}
        <AnimatePresence>
          {particles.map(p => (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{
                left: `${p.x}vw`,
                top: `${p.y}vh`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                transform: 'translate(-50%, -50%)',
              }}
              animate={{ opacity: p.life, scale: [1, 0.5] }}
              transition={{ duration: 0.1 }}
            />
          ))}
        </AnimatePresence>

        {/* Ondes d'impact */}
        <AnimatePresence>
          {showImpact &&
            [0, 0.2, 0.4].map((delay, i) => (
              <motion.div
                key={i}
                className="absolute border-2 rounded-full"
                style={{
                  left: `${targetX}vw`,
                  top: `${targetY}vh`,
                  borderColor: config.impactColor,
                  transform: 'translate(-50%, -50%)',
                }}
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: 3, opacity: 0 }}
                transition={{ duration: 1, delay, ease: 'easeOut' }}
              >
                <div className="w-20 h-20" />
              </motion.div>
            ))}
        </AnimatePresence>

        {/* Fumée/poussière */}
        <AnimatePresence>
          {showImpact && type !== 'confetti' && (
            <motion.div
              className="absolute"
              style={{
                left: `${targetX}vw`,
                top: `${targetY}vh`,
                transform: 'translate(-50%, -50%)',
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.5], opacity: [0, 0.3, 0], y: [0, -20] }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            >
              <div
                className="rounded-full blur-sm"
                style={{
                  width: '60px',
                  height: '60px',
                  background: `radial-gradient(circle, ${config.impactColor}40, transparent)`,
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default ThrownItem
