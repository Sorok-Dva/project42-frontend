import React, { useEffect, useState } from 'react'
import { Box, Button, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material'
import { useSocket } from 'contexts/SocketContext'
import { useUser } from 'contexts/UserContext'
import { PlayerType } from 'hooks/useGame'

interface PhaseActionRequest {
  phase: number;
  action: {
    card: number;
    targetCount: number;
    message: string;
    channel?: string;
  };
  eligibleTargets: { id: number; nickname: string }[];
}

interface PhaseActionProps {
  player: PlayerType
  roomId: number
}

const PhaseAction: React.FC<PhaseActionProps> = ({
  player,
  roomId,
}) => {
  const { socket } = useSocket()
  const { user } = useUser()
  const [actionRequest, setActionRequest] = useState<PhaseActionRequest | null>(null)
  const [selectedTargets, setSelectedTargets] = useState<number[]>([])

  useEffect(() => {
    if (!socket) return

    socket.on('phaseActionRequest', (data: PhaseActionRequest) => {
      console.log(data.action.card, player?.card, data.action.card === player?.card)
      if (data.action.card === player?.card || data.action.card === -1) {
        setActionRequest(data)
      }
    })

    return () => {
      socket.off('phaseActionRequest')
    }
  }, [socket, user])

  const handleSelectionChange = (event: any) => {
    setSelectedTargets(event.target.value)
  }

  const handleSubmit = () => {
    if (!socket || !actionRequest) return
    socket.emit('phaseActionResponse', {
      roomId,
      playerId: user!.id,
      phase: actionRequest.phase,
      targets: selectedTargets,
    })
  }

  if (!actionRequest) return null

  return (
    <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: '8px', mt: 2 }}>
      <Typography variant="h6">{actionRequest.action.message}</Typography>
      <FormControl fullWidth sx={{ mt: 1 }}>
        <InputLabel id="phase-action-select-label">Sélectionnez</InputLabel>
        <Select
          labelId="phase-action-select-label"
          multiple={actionRequest.action.targetCount > 1}
          value={selectedTargets}
          label="Sélectionnez"
          onChange={handleSelectionChange}
        >
          {actionRequest.eligibleTargets.map((target) => (
            <MenuItem key={target.id} value={target.id}>
              {target.nickname}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleSubmit}>
        Valider
      </Button>
    </Box>
  )
}

export default PhaseAction
