'use client'

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useSocket } from './SocketContext'
import { useUser } from './UserContext'
import WarningModal from 'components/Moderation/WarningModal'

interface Warning {
  id: number
  reason: string
  teamComment?: string
  moderatorId: string
  moderator: {
    nickname: string
  }
  createdAt: string
  isRead: boolean
}

interface WarningContextType {
  warnings: Warning[]
  unreadCount: number
  markAsRead: (warningId: number) => void
  markAllAsRead: () => void
}

const WarningContext = createContext<WarningContextType | undefined>(undefined)

export const useWarning = () => {
  const context = useContext(WarningContext)
  if (!context) {
    throw new Error('useWarning must be used within a WarningProvider')
  }
  return context
}

interface WarningProviderProps {
  children: ReactNode
}

export const WarningProvider: React.FC<WarningProviderProps> = ({ children }) => {
  const { socket } = useSocket()
  const { user } = useUser()
  const [warnings, setWarnings] = useState<Warning[]>([])
  const [currentWarning, setCurrentWarning] = useState<Warning | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    console.log('unreadCount', warnings, warnings.filter((warning) => !warning.isRead).length)
    setUnreadCount(warnings.filter((warning) => !warning.isRead).length)
  }, [warnings])

  useEffect(() => {
    if (!socket || !user) return

    const handleNewWarning = (warningData: {
      id: number
      reason: string
      teamComment?: string
      moderatorId: string
      moderator: {
        nickname: string
      }
      createdAt: string
    }) => {
      const newWarning: Warning = {
        ...warningData,
        isRead: false,
      }

      setWarnings((prev) => [newWarning, ...prev])
      setCurrentWarning(newWarning)
      setShowModal(true)

      // Jouer un son d'alerte
      const alertSound = new Audio('/assets/sounds/warning.mp3')
      alertSound.play().catch(console.error)
    }

    socket.on('warning_received', handleNewWarning)

    return () => {
      socket.off('warning_received', handleNewWarning)
    }
  }, [socket, user])

  // Charger les avertissements existants au montage
  useEffect(() => {
    if (!user) return

    const loadWarnings = async () => {
      try {
        const response = await fetch('/api/users/warnings', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setWarnings(data || [])

          if (data.length > 0) {
            setCurrentWarning(data[0])
            setShowModal(true)
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des avertissements:', error)
      }
    }

    loadWarnings()
  }, [user])

  const markAsRead = async (warningId: number) => {
    try {
      const response = await fetch(`/api/users/warnings/${warningId}/read`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (response.ok) {
        setWarnings((prev) =>
          prev.map((warning) => (warning.id === warningId ? { ...warning, isRead: true } : warning)),
        )
      }
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/users/warnings/read-all', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (response.ok) {
        setWarnings((prev) => prev.map((warning) => ({ ...warning, isRead: true })))
      }
    } catch (error) {
      console.error('Erreur lors du marquage de tous comme lus:', error)
    }
  }

  const handleCloseModal = () => {
    if (!currentWarning) return

    markAsRead(currentWarning.id)

    setWarnings(prevWarnings => {
      const remaining = prevWarnings.filter(w => w.id !== currentWarning.id)

      if (remaining.length > 0) {
        setCurrentWarning(remaining[0])
      } else {
        setCurrentWarning(null)
        setShowModal(false)
      }

      return remaining
    })
  }

  const contextValue: WarningContextType = {
    warnings,
    unreadCount,
    markAsRead,
    markAllAsRead,
  }

  return (
    <WarningContext.Provider value={contextValue}>
      {children}

      {/* Modal d'avertissement */}
      {currentWarning && <WarningModal warning={currentWarning} isOpen={showModal} onClose={handleCloseModal} />}
    </WarningContext.Provider>
  )
}

export default WarningContext
