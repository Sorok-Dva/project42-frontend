'use client'

import type React from 'react'
import { motion } from 'framer-motion'
import type { DecorationConfig } from 'types/events'

interface EventDecorationsProps {
  decorations: DecorationConfig[]
  isActive: boolean
}

export const EventDecorations: React.FC<EventDecorationsProps> = ({ decorations, isActive }) => {
  if (!isActive) return null

  const getAnimationVariants = (animation?: string) => {
    switch (animation) {
    case 'bounce':
      return {
        animate: {
          y: [0, -10, 0],
          transition: {
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
          },
        },
      }
    case 'pulse':
      return {
        animate: {
          scale: [1, 1.1, 1],
          transition: {
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
          },
        },
      }
    case 'shake':
      return {
        animate: {
          x: [0, -2, 2, -2, 2, 0],
          transition: {
            duration: 0.5,
            repeat: Number.POSITIVE_INFINITY,
            repeatDelay: 3,
          },
        },
      }
    default:
      return {}
    }
  }

  const getPositionClasses = (position: string) => {
    switch (position) {
    case 'top':
      return 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50'
    case 'bottom':
      return 'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50'
    case 'left':
      return 'fixed left-4 top-1/2 transform -translate-y-1/2 z-50'
    case 'right':
      return 'fixed right-4 top-1/2 transform -translate-y-1/2 z-50'
    case 'center':
      return 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none'
    case 'corners':
      return 'fixed z-50'
    default:
      return 'fixed z-50'
    }
  }

  return (
    <>
      {decorations.map((decoration, index) => {
        if (decoration.position === 'corners') {
          return (
            <div key={index}>
              {/* Coin supérieur gauche */}
              <motion.div
                className="fixed top-4 left-4 z-50 text-4xl pointer-events-none"
                {...getAnimationVariants(decoration.animation)}
              >
                {decoration.element}
              </motion.div>
              {/* Coin supérieur droit */}
              <motion.div
                className="fixed top-4 right-4 z-50 text-4xl pointer-events-none"
                {...getAnimationVariants(decoration.animation)}
              >
                {decoration.element}
              </motion.div>
              {/* Coin inférieur gauche */}
              <motion.div
                className="fixed bottom-4 left-4 z-50 text-4xl pointer-events-none"
                {...getAnimationVariants(decoration.animation)}
              >
                {decoration.element}
              </motion.div>
              {/* Coin inférieur droit */}
              <motion.div
                className="fixed bottom-4 right-4 z-50 text-4xl pointer-events-none"
                {...getAnimationVariants(decoration.animation)}
              >
                {decoration.element}
              </motion.div>
            </div>
          )
        }

        if (decoration.type === 'banner') {
          return (
            <motion.div
              key={index}
              className={`mt-24 ${getPositionClasses(decoration.position)} bg-gradient-to-r from-black/80 via-black/60 to-black/80 backdrop-blur-sm rounded-lg px-6 py-3 border border-white/20`}
              {...getAnimationVariants(decoration.animation)}
            >
              <div className="text-white font-bold text-lg text-center">{decoration.element}</div>
            </motion.div>
          )
        }

        return (
          <motion.div
            key={index}
            className={`${getPositionClasses(decoration.position)} text-6xl pointer-events-none`}
            {...getAnimationVariants(decoration.animation)}
          >
            {decoration.element}
          </motion.div>
        )
      })}
    </>
  )
}
