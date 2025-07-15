'use client'

import type React from 'react'
import { motion } from 'framer-motion'
import { useEvent } from 'components/EventSystem/EventProvider'
import { Card } from 'components/UI/Card'

interface EventCardProps {
  children: React.ReactNode
  className?: string
}

export const EventCard: React.FC<EventCardProps> = ({ children, className = '' }) => {
  const { currentEvent, isEventActive } = useEvent()

  if (!isEventActive || !currentEvent) {
    return <Card className={className}>{children}</Card>
  }

  const getEventAnimation = () => {
    if (!currentEvent.animations.ui) return {}

    switch (currentEvent.animations.ui.type) {
    case 'glow':
      return {
        boxShadow: [
          `0 0 10px ${currentEvent.colors.primary}20`,
          `0 0 25px ${currentEvent.colors.primary}40`,
          `0 0 10px ${currentEvent.colors.primary}20`,
        ],
        transition: {
          duration: currentEvent.animations.ui.duration / 1000,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        },
      }
    case 'shake':
      return {
        x: [0, -1, 1, -1, 1, 0],
        transition: {
          duration: 0.5,
          repeat: Number.POSITIVE_INFINITY,
          repeatDelay: currentEvent.animations.ui.duration / 1000,
        },
      }
    default:
      return {}
    }
  }

  return (
    <motion.div animate={getEventAnimation()}>
      <Card
        className={`${className} transition-all duration-300`}
        style={{
          borderColor: `${currentEvent.colors.accent}40`,
          background: `linear-gradient(135deg, ${currentEvent.colors.primary}05, ${currentEvent.colors.secondary}05)`,
        }}
      >
        {children}
      </Card>
    </motion.div>
  )
}
