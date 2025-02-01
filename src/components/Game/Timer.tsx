import React, { useEffect, useRef, useState } from 'react'
import { Box, Typography } from '@mui/material'
import { useSocket } from 'contexts/SocketContext'

interface GameTimerProps {
  gameStarted: boolean
}

const GameTimer: React.FC<GameTimerProps> = ({
  gameStarted,
}) => {
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [phase, setPhase] = useState<number | null>(null)
  const { socket } = useSocket()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastSoundPlayed = useRef<number | null>(null)

  useEffect(() => {
    if (!socket || !gameStarted) return

    const updateTimer = (limitPhase: string) => {
      if (intervalRef.current) clearInterval(intervalRef.current) // Évite les multiples intervals

      const calculateTimeLeft = () => {
        const phaseEndTime = new Date(limitPhase).getTime()
        const diff = phaseEndTime - new Date().getTime()
        const newTimeLeft = diff > 0 ? Math.ceil(diff / 1000) : 0

        setTimeLeft(diff > 0 ? Math.ceil(diff / 1000) : 0)

        // 🔊 Jouer un son quand il reste 3s, 2s, ou 1s (évite de rejouer inutilement)
        if (newTimeLeft > 0 && newTimeLeft <= 3 && lastSoundPlayed.current !== newTimeLeft) {
          const audio = new Audio(`/assets/sounds/${newTimeLeft === 1 ? 'bip2' : 'bip1'}.mp3`)
          audio.play()
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
   * Converts a given time in seconds to a formatted string representation in minutes and seconds.
   *
   * The resulting string will display the time in the format of "Xmin YYsec",
   * where `X` represents the number of minutes and `YY` represents the
   * zero-padded number of remaining seconds.
   *
   * @param {number} seconds - The total time in seconds to be formatted.
   * @returns {string} A string formatted as "Xmin YYsec" representing the input time.
   */
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}min ${remainingSeconds.toString().padStart(2, '0')}sec`
  }

  return gameStarted && (
    <Box textAlign="center" mt={2}>
      <Typography variant="h6">Phase {phase !== null ? phase : 'Chargement...'}</Typography>
      {timeLeft !== null && <Typography variant="h4">{formatTime(timeLeft)}</Typography>}
    </Box>
  )
}

export default GameTimer
