import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useSocket } from 'contexts/SocketContext'

interface GameTimerProps {
  gameId: string
  gameStarted: boolean
  gameFinished: boolean
}

const GameTimer: React.FC<GameTimerProps> = ({ gameId, gameStarted, gameFinished }) => {
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const { socket } = useSocket()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastSoundPlayed = useRef<number | null>(null)

  const updateTimer = (limitPhase: string) => {
    if (intervalRef.current) clearInterval(intervalRef.current) // Évite les multiples intervals

    const calculateTimeLeft = () => {
      const phaseEndTime = new Date(limitPhase).getTime()
      const diff = phaseEndTime - new Date().getTime()
      const newTimeLeft = diff > 0 ? Math.ceil(diff / 1000) : 0

      setTimeLeft(diff > 0 ? Math.ceil(diff / 1000) : 0)

      // 🔊 Jouer un son quand il reste 3s, 2s, ou 1s (évite de rejouer inutilement)
      if (newTimeLeft > 0 && newTimeLeft <= 3 && lastSoundPlayed.current !== newTimeLeft) {
        if (newTimeLeft === 1 && bip2) {
          bip2.currentTime = 0
          bip2.play().catch(() => {})
        } else if (bip1) {
          bip1.currentTime = 0
          bip1.play().catch(() => {})
        }
        lastSoundPlayed.current = newTimeLeft
      }
    }

    calculateTimeLeft()
    intervalRef.current = setInterval(calculateTimeLeft, 1000)
  }

  useEffect(() => {
    socket.emit('phase:getTimer', { roomId: gameId })
  }, [gameStarted])

  // Sons pour le compte à rebours
  const bip1 = typeof Audio !== 'undefined' ? new Audio('/assets/sounds/bip1.mp3') : null
  const bip2 = typeof Audio !== 'undefined' ? new Audio('/assets/sounds/bip2.mp3') : null

  useEffect(() => {
    if (!gameStarted || gameFinished) return

    socket.on('phase:timer', ({ endTime }) => {
      if (!endTime) return
      updateTimer(endTime)
    })

    socket.on('phase:change', (payload) => {
      console.log('phase:change')
      if (!payload.endTime) return
      updateTimer(payload.endTime)
    })

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      socket.off('phase:timer')
      socket.off('phase:change')
    }
  }, [socket, gameStarted, gameFinished])

  /**
   * Formats a given time in seconds into minutes or seconds as a string.
   */
  const formatTime = (seconds: number, ret: 'min' | 'sec'): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return ret === 'min' ? String(minutes) : remainingSeconds.toString().padStart(2, '0')
  }

  if (!gameStarted || gameFinished || timeLeft === null) return null

  const isLowTime = timeLeft <= 10

  return (
    <div className="mb-4 relative">
      <motion.div
        className={`ribbon-container ${isLowTime ? 'low-time' : ''}`}
        animate={{
          boxShadow: isLowTime
            ? ['0 0 0 rgba(239, 68, 68, 0.4)', '0 0 20px rgba(239, 68, 68, 0.7)', '0 0 0 rgba(239, 68, 68, 0.4)']
            : 'none',
        }}
        transition={{
          duration: 2,
          repeat: isLowTime ? Number.POSITIVE_INFINITY : 0,
          repeatType: 'loop',
        }}
      >
        <div className="ribbon-left"></div>
        <div className="ribbon-content">
          <div className="flex items-center justify-center">
            <div className="timer-display">
              <span className={isLowTime ? 'text-red-400' : 'text-white'}>
                {timeLeft ? formatTime(timeLeft, 'min') : '-'}
              </span>
              <span className="text-gray-300">:</span>
              <span className={isLowTime ? 'text-red-400' : 'text-white'}>
                {timeLeft ? formatTime(timeLeft, 'sec') : '--'}
              </span>
            </div>
          </div>
        </div>
        <div className="ribbon-right"></div>
      </motion.div>
    </div>
  )
}

export default GameTimer
