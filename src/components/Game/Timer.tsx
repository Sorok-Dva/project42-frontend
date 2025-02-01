import React, { useEffect, useState } from 'react'
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

  useEffect(() => {
    if (!socket || !gameStarted) return

    socket.on('timerUpdated', ({ limitPhase }) => {
      const updateTime = () => {
        const diff = new Date(limitPhase).getTime() - new Date().getTime()
        setTimeLeft(diff > 0 ? Math.ceil(diff / 1000) : 0)
      }
      updateTime()
      const interval = setInterval(updateTime, 1000)
      return () => clearInterval(interval)
    })

    socket.on('phaseUpdated', ({ phase }) => {
      setPhase(phase)
    })

    socket.on('playCountdownSound', (finalSecond: boolean) => {
      const audio = new Audio(`/sounds/${finalSecond ? 'bip2' : 'bip1'}.mp3`)
      audio.play()
    })

    return () => {
      socket.off('timerUpdated')
      socket.off('phaseUpdated')
      socket.off('playCountdownSound')
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
