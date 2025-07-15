'use client'

import type React from 'react'
import { createContext, useContext } from 'react'
import { useEventSystem } from 'hooks/useEventSystem'
import { ParticleSystem } from './ParticleSystem'
import { EventDecorations } from './EventDecorations'
import { EventNotifications } from './EventNotifications'
import { EventBackground } from './EventBackground'
import type { EventTheme } from 'types/events'

interface EventContextType {
  currentEvent: EventTheme | null
  isEventActive: boolean
  getEventStyles: () => React.CSSProperties
}

const EventContext = createContext<EventContextType | null>(null)

export const useEvent = () => {
  const context = useContext(EventContext)
  if (!context) {
    throw new Error('useEvent must be used within EventProvider')
  }
  return context
}

interface EventProviderProps {
  children: React.ReactNode
}

export const EventProvider: React.FC<EventProviderProps> = ({ children }) => {
  const { currentEvent, isEventActive, notifications, dismissNotification, getEventStyles } = useEventSystem()

  return (
    <EventContext.Provider value={{ currentEvent, isEventActive, getEventStyles }}>
      <div style={getEventStyles()}>
        {/* Système de particules */}
        {currentEvent?.animations.particles && (
          <ParticleSystem config={currentEvent.animations.particles} isActive={isEventActive} />
        )}

        {/* Animation de fond */}
        {currentEvent?.animations.background && (
          <EventBackground animation={currentEvent.animations.background} isActive={isEventActive} />
        )}

        {/* Décorations */}
        {currentEvent?.decorations && (
          <EventDecorations decorations={currentEvent.decorations} isActive={isEventActive} />
        )}

        {/* Notifications */}
        <EventNotifications notifications={notifications} onDismiss={dismissNotification} />

        {children}
      </div>
    </EventContext.Provider>
  )
}
