import React from 'react'
import { Box, Button, Typography } from '@mui/material'
import { useSocket } from 'contexts/SocketContext'
import { useUser } from 'contexts/UserContext'

interface PhaseActionRequestCard20 {
  phase: number;
  action: {
    card: number;
    targetCount: number;
    message: string;
    channel?: string;
  };
  eligibleTargets: { id: number; nickname: string }[];
}

interface PhaseActionCard20Props {
  roomId: number
  actionRequest: PhaseActionRequestCard20
  alienVictim: { id: number; nickname: string } | null
  setAlienVictim: React.Dispatch<React.SetStateAction<{ id: number; nickname: string } | null>>
  // hasShot: boolean
}

const PhaseActionCard20: React.FC<PhaseActionCard20Props> = ({
  roomId,
  actionRequest,
  alienVictim,
  setAlienVictim,
  // hasShot,
}) => {
  const { socket } = useSocket()
  const { user } = useUser()

  const handleInfect = () => {
    if (!socket) return
    socket.emit('phaseActionResponse', {
      roomId,
      playerId: user!.id,
      actionCard: actionRequest.action.card,
      targets: [alienVictim ? alienVictim.id : -1],
    })
    setAlienVictim(null)
  }

  return (
    <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: '8px', mt: 2 }}>
      <Typography variant="h6">{actionRequest.action.message}</Typography>

      {alienVictim && (
        <>
          <Button
            variant="contained"
            color="secondary"
            sx={{ mt: 1 }}
            onClick={handleInfect}
          >
            Infecter {alienVictim.nickname}
          </Button>
        </>
      )}

      {/*{hasShot && (
        <Typography variant="subtitle1" sx={{ mt: 4 }}>Vous avez déjà infecté un joueur.</Typography>
      )}*/}
    </Box>
  )
}

export default PhaseActionCard20
