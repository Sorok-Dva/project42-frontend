import React, { useState } from 'react'
import { Box, Button, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material'
import { useSocket } from 'contexts/SocketContext'
import { useUser } from 'contexts/UserContext'

interface PhaseActionRequestCard5 {
  phase: number;
  action: {
    card: number;
    targetCount: number;
    message: string;
    channel?: string;
  };
  eligibleTargets: { id: number; nickname: string }[];
}

interface PhaseActionCard5Props {
  roomId: number;
  actionRequest: PhaseActionRequestCard5;
  alienVictim: { id: number; nickname: string } | null;
  setAlienVictim: React.Dispatch<React.SetStateAction<{ id: number; nickname: string } | null>>;
  deathElixirUsed: string | null | undefined
  lifeElixirUsed: string | null | undefined
}

const PhaseActionCard5: React.FC<PhaseActionCard5Props> = ({
  roomId,
  actionRequest,
  alienVictim,
  setAlienVictim,
  deathElixirUsed,
  lifeElixirUsed,
}) => {
  const { socket } = useSocket()
  const { user } = useUser()
  const [selectedDeathTarget, setSelectedDeathTarget] = useState<number | ''>('')

  const handleDeathChange = (event: any) => {
    setSelectedDeathTarget(event.target.value)
  }

  const handleDeathSubmit = () => {
    if (!socket || selectedDeathTarget === '' || deathElixirUsed) return
    socket.emit('phaseActionResponse', {
      roomId,
      playerId: user!.id,
      actionCard: actionRequest.action.card,
      targets: [selectedDeathTarget],
      type: 'death'
    })
    console.log('submit phaseActionResponse in death')
  }

  const handleLifeSubmit = () => {
    if (!socket || lifeElixirUsed) return
    socket.emit('phaseActionResponse', {
      roomId,
      playerId: user!.id,
      actionCard: actionRequest.action.card,
      targets: [alienVictim ? alienVictim.id : -1],
      type: 'life'
    })
    setAlienVictim(null)
  }

  console.log('elixirUsed', deathElixirUsed, lifeElixirUsed)
  return (
    <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: '8px', mt: 2 }}>
      <Typography variant="h6">{actionRequest.action.message}</Typography>

      {/* Section Potion de Mort */}
      { !deathElixirUsed && (
        <>
          <Typography variant="subtitle1" sx={{ mt: 2 }}>Elixir de Mort :</Typography>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel id="death-select-label">Sélectionnez une cible</InputLabel>
            <Select
              labelId="death-select-label"
              value={selectedDeathTarget}
              label="Sélectionnez une cible"
              onChange={handleDeathChange}
            >
              {actionRequest.eligibleTargets.map((target) => (
                <MenuItem key={target.id} value={target.id}>
                  {target.nickname}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={handleDeathSubmit}
            disabled={selectedDeathTarget === ''}
          >
            Utiliser Elixir de Mort
          </Button>
        </>
      )}

      {/* Section elixir de Vie */}
      {alienVictim && (
        <>
          <Typography variant="subtitle1" sx={{ mt: 4 }}>Elixir de Vie :</Typography>
          <Button
            variant="contained"
            color="secondary"
            sx={{ mt: 1 }}
            onClick={handleLifeSubmit}
          >
            Sauver {alienVictim.nickname}
          </Button>
        </>
      )}

      {deathElixirUsed && lifeElixirUsed && (
        <Typography variant="subtitle1" sx={{ mt: 4 }}>Vous avez utilisé tout vos elixirs.</Typography>
      )}
    </Box>
  )
}

export default PhaseActionCard5
