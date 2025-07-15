'use client'

import type React from 'react'

import { useState, useEffect, useMemo } from 'react'
import type { EventTheme, EventNotification } from 'types/events'

const EVENT_THEMES: EventTheme[] = [
  {
    id: 'christmas',
    name: 'Noël',
    startDate: new Date(new Date().getFullYear(), 11, 15), // 15 décembre
    endDate: new Date(new Date().getFullYear() + 1, 0, 7), // 7 janvier
    isActive: false,
    colors: {
      primary: '#dc2626',
      secondary: '#16a34a',
      accent: '#fbbf24',
      background: 'from-red-900/20 via-green-900/20 to-red-900/20',
    },
    animations: {
      particles: {
        type: 'snow',
        count: 250,
        speed: 2,
        size: { min: 2, max: 6 },
        colors: ['#ffffff', '#e0f2fe', '#bae6fd'],
        opacity: { min: 0.3, max: 0.8 },
      },
      background: {
        type: 'aurora',
        intensity: 0.3,
        colors: ['#dc2626', '#16a34a', '#fbbf24'],
      },
      ui: {
        type: 'glow',
        elements: ['button', 'card'],
        duration: 2000,
      },
    },
    sounds: {
      ambient: '/sounds/christmas-ambient.mp3',
      interaction: '/sounds/bell.mp3',
    },
    decorations: [
      {
        type: 'overlay',
        position: 'corners',
        element: '🎄',
        animation: 'bounce',
      },
      {
        type: 'banner',
        position: 'top',
        element: '🎅 Joyeux Noël ! 🎁',
        animation: 'pulse',
      },
    ],
  },
  {
    id: 'halloween',
    name: 'Halloween',
    startDate: new Date(new Date().getFullYear(), 9, 20), // 20 octobre
    endDate: new Date(new Date().getFullYear(), 10, 2), // 2 novembre
    isActive: false,
    colors: {
      primary: '#f97316',
      secondary: '#7c2d12',
      accent: '#a855f7',
      background: 'from-orange-900/30 via-purple-900/30 to-orange-900/30',
    },
    animations: {
      particles: {
        type: 'pumpkins',
        count: 20,
        speed: 1,
        size: { min: 15, max: 25 },
        colors: ['#f97316', '#ea580c'],
        opacity: { min: 0.4, max: 0.7 },
      },
      background: {
        type: 'fog',
        intensity: 0.4,
        colors: ['#7c2d12', '#a855f7'],
      },
      ui: {
        type: 'shake',
        elements: ['card'],
        duration: 3000,
      },
    },
    decorations: [
      {
        type: 'overlay',
        position: 'corners',
        element: '🎃',
        animation: 'bounce',
      },
      {
        type: 'banner',
        position: 'top',
        element: '👻 Happy Halloween! 🦇',
        animation: 'shake',
      },
    ],
  },
  {
    id: 'new-year',
    name: 'Nouvel An',
    startDate: new Date(new Date().getFullYear(), 11, 31), // 31 décembre
    endDate: new Date(new Date().getFullYear() + 1, 0, 2), // 2 janvier
    isActive: false,
    colors: {
      primary: '#fbbf24',
      secondary: '#8b5cf6',
      accent: '#ec4899',
      background: 'from-yellow-900/20 via-purple-900/20 to-pink-900/20',
    },
    animations: {
      particles: {
        type: 'fireworks',
        count: 30,
        speed: 3,
        size: { min: 3, max: 8 },
        colors: ['#fbbf24', '#8b5cf6', '#ec4899', '#10b981'],
        opacity: { min: 0.6, max: 1 },
      },
      background: {
        type: 'lightning',
        intensity: 0.5,
        colors: ['#fbbf24', '#8b5cf6'],
      },
      ui: {
        type: 'bounce',
        elements: ['button'],
        duration: 1500,
      },
    },
    decorations: [
      {
        type: 'overlay',
        position: 'corners',
        element: '🎆',
        animation: 'pulse',
      },
      {
        type: 'banner',
        position: 'top',
        element: '🥳 Bonne Année ! 🎊',
        animation: 'bounce',
      },
    ],
  },
  {
    id: 'valentines',
    name: 'Saint-Valentin',
    startDate: new Date(new Date().getFullYear(), 1, 10), // 10 février
    endDate: new Date(new Date().getFullYear(), 1, 16), // 16 février
    isActive: false,
    colors: {
      primary: '#ec4899',
      secondary: '#be185d',
      accent: '#fbbf24',
      background: 'from-pink-900/20 via-rose-900/20 to-pink-900/20',
    },
    animations: {
      particles: {
        type: 'hearts',
        count: 50,
        speed: 1,
        size: { min: 8, max: 25 },
        colors: ['#ec4899', '#be185d', '#f472b6'],
        opacity: { min: 0.4, max: 0.8 },
      },
      ui: {
        type: 'pulse',
        elements: ['button', 'card'],
        duration: 2500,
      },
    },
    decorations: [
      {
        type: 'overlay',
        position: 'corners',
        element: '💖',
        animation: 'pulse',
      },
      {
        type: 'banner',
        position: 'top',
        element: '💕 Joyeuse Saint-Valentin ! 💝',
        animation: 'pulse',
      },
    ],
  },
  {
    id: 'bastille-day',
    name: 'Fête Nationale',
    startDate: new Date(new Date().getFullYear(), 6, 14), // 14 juillet
    endDate: new Date(new Date().getFullYear(), 6, 15), // 15 juillet
    isActive: false,
    colors: {
      primary: '#1d4ed8',
      secondary: '#dc2626',
      accent: '#ffffff',
      background: 'from-blue-900/20 via-white/10 to-red-900/20',
    },
    animations: {
      particles: {
        type: 'confetti',
        count: 40,
        speed: 2.5,
        size: { min: 4, max: 10 },
        colors: ['#1d4ed8', '#dc2626', '#ffffff'],
        opacity: { min: 0.6, max: 1 },
      },
      ui: {
        type: 'glow',
        elements: ['button'],
        duration: 2000,
      },
    },
    decorations: [
      {
        type: 'banner',
        position: 'top',
        element: '🇫🇷 Vive la France ! 🎆',
        animation: 'bounce',
      },
    ],
  },
]

export const useEventSystem = () => {
  const [currentEvent, setCurrentEvent] = useState<EventTheme | null>(null)
  const [notifications, setNotifications] = useState<EventNotification[]>([])
  const [isEventActive, setIsEventActive] = useState(false)

  // Vérifier les événements actifs
  const checkActiveEvents = useMemo(() => {
    const now = new Date()
    return EVENT_THEMES.find((event) => {
      const start = new Date(event.startDate)
      const end = new Date(event.endDate)

      return now >= start && now <= end
    })
  }, [])

  useEffect(() => {
    const activeEvent = checkActiveEvents

    if (activeEvent && (!currentEvent || currentEvent.id !== activeEvent.id)) {
      setCurrentEvent(activeEvent)
      setIsEventActive(true)

      // Créer une notification pour le nouvel événement
      const notification: EventNotification = {
        id: `${activeEvent.id}-${Date.now()}`,
        eventId: activeEvent.id,
        title: `Événement spécial : ${activeEvent.name}`,
        message: 'Profitez de l\'ambiance festive avec des animations et décorations spéciales !',
        type: 'celebration',
        icon: getEventIcon(activeEvent.id),
        showOnce: true,
        priority: 1,
      }

      // Vérifier si cette notification n'a pas déjà été affichée
      const hasShown = localStorage.getItem(`event-notification-${activeEvent.id}`)
      if (!hasShown) {
        setNotifications((prev) => [...prev, notification])
        localStorage.setItem(`event-notification-${activeEvent.id}`, 'true')
      }
    } else if (!activeEvent && currentEvent) {
      setCurrentEvent(null)
      setIsEventActive(false)
    }
  }, [checkActiveEvents, currentEvent])

  const getEventIcon = (eventId: string): string => {
    const icons: Record<string, string> = {
      christmas: '🎄',
      halloween: '🎃',
      'new-year': '🎆',
      valentines: '💖',
      'bastille-day': '🇫🇷',
    }
    return icons[eventId] || '🎉'
  }

  const dismissNotification = (notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
  }

  const getEventStyles = () => {
    if (!currentEvent) return {}

    return {
      '--event-primary': currentEvent.colors.primary,
      '--event-secondary': currentEvent.colors.secondary,
      '--event-accent': currentEvent.colors.accent,
      '--event-background': currentEvent.colors.background,
    } as React.CSSProperties
  }

  return {
    currentEvent,
    isEventActive,
    notifications,
    dismissNotification,
    getEventStyles,
    getEventIcon,
  }
}
