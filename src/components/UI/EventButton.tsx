'use client'

import type React from 'react'
import { motion } from 'framer-motion'
import { useEvent } from 'components/EventSystem/EventProvider'
import { Button } from 'components/UI/Button'
import type { ButtonProps } from 'components/UI/Button'

interface EventButtonProps extends ButtonProps {
  children: React.ReactNode
}

export const EventButton: React.FC<EventButtonProps> = ({ children, className = '', ...props }) => {
  const { currentEvent, isEventActive } = useEvent()

  if (!isEventActive || !currentEvent) {
    return (
      <Button className={className} {...props}>
        {children}
      </Button>
    )
  }

  const getEventAnimation = () => {
    if (!currentEvent.animations.ui) return {}

    switch (currentEvent.animations.ui.type) {
    case 'glow':
      return {
        boxShadow: [
          `0 0 5px ${currentEvent.colors.primary}40`,
          `0 0 20px ${currentEvent.colors.primary}60`,
          `0 0 5px ${currentEvent.colors.primary}40`,
        ],
        transition: {
          duration: currentEvent.animations.ui.duration / 1000,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        },
      }
    case 'pulse':
      return {
        scale: [1, 1.05, 1],
        transition: {
          duration: currentEvent.animations.ui.duration / 1000,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        },
      }
    case 'bounce':
      return {
        y: [0, -5, 0],
        transition: {
          duration: currentEvent.animations.ui.duration / 1000,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        },
      }
    default:
      return {}
    }
  }

  return (
    <motion.div animate={getEventAnimation()}>
      <Button
        className={`${className} transition-all duration-300`}
        style={{
          borderColor: currentEvent.colors.accent,
          background: `linear-gradient(135deg, ${currentEvent.colors.primary}20, ${currentEvent.colors.secondary}20)`,
        }}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  )
}
