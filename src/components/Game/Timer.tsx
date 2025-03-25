import React, { useEffect, useRef, useState } from 'react'
import { useSocket } from 'contexts/SocketContext'

interface GameTimerProps {
  gameStarted: boolean
  gameFinished: boolean
}

const GameTimer: React.FC<GameTimerProps> = ({
  gameStarted,
  gameFinished,
}) => {
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [phase, setPhase] = useState<number | null>(null)
  const { socket } = useSocket()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastSoundPlayed = useRef<number | null>(null)

  const bip1 = new Audio('/assets/sounds/bip1.mp3')
  const bip2 = new Audio('/assets/sounds/bip2.mp3')

  useEffect(() => {
    if (!socket || !gameStarted|| gameFinished) return

    const updateTimer = (limitPhase: string) => {
      if (intervalRef.current) clearInterval(intervalRef.current) // Évite les multiples intervals

      const calculateTimeLeft = () => {
        const phaseEndTime = new Date(limitPhase).getTime()
        const diff = phaseEndTime - new Date().getTime()
        const newTimeLeft = diff > 0 ? Math.ceil(diff / 1000) : 0

        setTimeLeft(diff > 0 ? Math.ceil(diff / 1000) : 0)

        // 🔊 Jouer un son quand il reste 3s, 2s, ou 1s (évite de rejouer inutilement)
        if (newTimeLeft > 0 && newTimeLeft <= 3 && lastSoundPlayed.current !== newTimeLeft) {
          if (newTimeLeft === 1) {
            bip2.currentTime = 0
            bip2.play().catch(() => {})
          } else {
            bip1.currentTime = 0
            bip1.play().catch(() => {})
          }
          lastSoundPlayed.current = newTimeLeft
        }
      }

      calculateTimeLeft()
      intervalRef.current = setInterval(calculateTimeLeft, 1000)
    }

    socket.on('timerUpdated', ({ limitPhase }) => {
      if (!limitPhase) return
      updateTimer(limitPhase)
    })

    socket.on('phaseUpdated', ({ phase }) => {
      setPhase(phase)
    })

    return () => {
      socket.off('timerUpdated')
      socket.off('phaseUpdated')
    }
  }, [socket])

  /**
   * Formats a given time in seconds into minutes or seconds as a string.
   *
   * @param {number} seconds - The total time in seconds to format.
   * @param {'min' | 'sec'} ret - Specifies the format of the resulting string:
   *                              'min' for minutes or 'sec' for padded seconds.
   * @returns {string} The formatted time as a string based on the specified format.
   */
  const formatTime = (seconds: number, ret: 'min' | 'sec'): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return ret === 'min' ? String(minutes) : remainingSeconds.toString().padStart(2, '0')
  }

  return gameStarted && !gameFinished && (
    <div id="block_interactions_wrapper">
      <div id="block_chrono_parent">
        <div id="block_chrono">
          <span id="chrono_min">{ timeLeft ? formatTime(timeLeft, 'min') : '-' }</span>
          <span>min</span>
          <span id="chrono_sec">{ timeLeft ? formatTime(timeLeft, 'sec') : '--' }</span>
          <span>sec</span>
        </div>
      </div>
      <div className="block_scrollable_wrapper scrollbar-light">
        <div id="block_interactions" className="block_scrollable_content"></div>
      </div>
    </div>
  )
}

export default GameTimer
