'use client'

import type React from 'react'
import { motion } from 'framer-motion'
import type { BackgroundAnimation } from 'types/events'

interface EventBackgroundProps {
  animation: BackgroundAnimation
  isActive: boolean
}

export const EventBackground: React.FC<EventBackgroundProps> = ({ animation, isActive }) => {
  if (!isActive) return null

  const getBackgroundAnimation = () => {
    switch (animation.type) {
    case 'aurora':
      return (
        <motion.div
          className="fixed inset-0 pointer-events-none z-0"
          animate={{
            background: [
              `linear-gradient(45deg, ${animation.colors[0]}20, ${animation.colors[1]}20, ${animation.colors[2] || animation.colors[0]}20)`,
              `linear-gradient(135deg, ${animation.colors[1]}20, ${animation.colors[2] || animation.colors[0]}20, ${animation.colors[0]}20)`,
              `linear-gradient(225deg, ${animation.colors[2] || animation.colors[0]}20, ${animation.colors[0]}20, ${animation.colors[1]}20)`,
              `linear-gradient(315deg, ${animation.colors[0]}20, ${animation.colors[1]}20, ${animation.colors[2] || animation.colors[0]}20)`,
            ],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
          }}
        />
      )

    case 'lightning':
      return (
        <motion.div
          className="fixed inset-0 pointer-events-none z-0"
          animate={{
            opacity: [0, 0, 0, 1, 0, 0, 0],
            background: `radial-gradient(circle, ${animation.colors[0]}40, transparent 70%)`,
          }}
          transition={{
            duration: 0.2,
            repeat: Number.POSITIVE_INFINITY,
            repeatDelay: Math.random() * 5 + 2,
          }}
        />
      )

    case 'fog':
      return (
        <motion.div
          className="fixed inset-0 pointer-events-none z-0"
          animate={{
            background: [
              `radial-gradient(ellipse at 20% 50%, ${animation.colors[0]}15, transparent 50%)`,
              `radial-gradient(ellipse at 80% 50%, ${animation.colors[1]}15, transparent 50%)`,
              `radial-gradient(ellipse at 50% 20%, ${animation.colors[0]}15, transparent 50%)`,
              `radial-gradient(ellipse at 50% 80%, ${animation.colors[1]}15, transparent 50%)`,
            ],
          }}
          transition={{
            duration: 12,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
          }}
        />
      )

    default:
      return null
    }
  }

  return getBackgroundAnimation()
}
