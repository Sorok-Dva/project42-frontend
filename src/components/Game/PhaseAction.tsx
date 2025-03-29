import React, { useEffect, useState } from 'react'
import { Box, Button, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material'
import { useSocket } from 'contexts/SocketContext'
import { useUser } from 'contexts/UserContext'
import { PlayerType } from 'hooks/useGame'
import PhaseActionCard5 from 'components/Game/Cards/PhaseActionCard5'
import PhaseActionCard20 from 'components/Game/Cards/PhaseActionCard20'

interface PhaseActionRequest {
  phase: number;
  action: {
    card: number;
    targetCount: number;
    message: string;
    channel?: string;
  };
  eligibleTargets: { id: number; nickname: string }[];
  deathElixirUsed?: string | null;
  lifeElixirUsed?: string | null;
}

interface PhaseActionProps {
  player: PlayerType
  roomId: number
  isInn: boolean
}

const PhaseAction: React.FC<PhaseActionProps> = ({
  player,
  roomId,
  isInn,
}) => {
  const { socket } = useSocket()
  const { user } = useUser()
  const [actionRequest, setActionRequest] = useState<PhaseActionRequest | null>(null)
  const [selectedTargets, setSelectedTargets] = useState<number[]>([])
  const [selectedNickname, setSelectedNickname] = useState<string | null>(null)
  const [selectedNicknames, setSelectedNicknames] = useState<string[]>([])
  const [alienVictim, setAlienVictim] = useState<{nickname: string, id: number} | null>(null)
  const [showForm, setShowForm] = useState<boolean>(true)
  const [hint, setHint] = useState<string | null>(null)

  useEffect(() => {
    if (!socket || !user || !player || !roomId) return

    socket.on('phaseActionRequest', (data: PhaseActionRequest) => {
      if (!data) {
        setActionRequest(null)
        setHint(null)
        return
      }
      if (
        (((data.action.card === player?.card?.id || data.action.card === -1)
         || (data.action.card === 2 && ([2, 9, 20, 21].includes(player.card?.id || -1) || player.isInfected))))
        || (data.action.card === 6 && !player.alive)) {
        setActionRequest(data)
      }
    })

    socket.on('phaseEnded', () => {
      setActionRequest(null)
    })

    socket.on('alienElimination', (victim) => {
      if (victim.id) {
        setAlienVictim({ nickname: victim.nickname, id: victim.id })
      } else setAlienVictim(null)
    })

    return () => {
      socket.off('phaseActionRequest')
      socket.off('phaseEnded')
      socket.off('alienElimination')
    }
  }, [socket, user, player, roomId])

  const handleSelectionChange = (event: any) => {
    const { value } = event.target
    setSelectedTargets(typeof value === 'string' ? value.split(',').map(Number) : value)

    const targetNicknames = (typeof value === 'string' ? value.split(',').map(Number) : value)
    setSelectedNicknames(targetNicknames.map((id: number) => {
      const selectedTarget = actionRequest
        ?.eligibleTargets.find(target => target.id === id)
      if (selectedTarget) return selectedTarget.nickname
    }).join(', '))
    if (typeof value === 'number') {
      const selectedTarget = actionRequest
        ?.eligibleTargets.find(target => target.id === value)
      if (selectedTarget) {
        setSelectedNickname(selectedTarget.nickname)
      }
    }
  }

  const handleSubmit = () => {
    if (!socket || !actionRequest) return
    const payload: any = {
      roomId,
      playerId: user!.id,
      actionCard: actionRequest.action.card,
    }

    // Gestion spécifique pour Cupidon (carte 7)
    if (actionRequest.action.card === 7) {
      if (selectedTargets.length !== 2) {
        alert('Veuillez sélectionner exactement deux joueurs.')
        return
      }
      socket.emit('phaseActionResponse', {
        ...payload,
        targets: selectedTargets,
      })
    } else if (actionRequest.action.card === 15 && selectedTargets) { // Gestion pour le maitre des ondes
      if (selectedTargets.length > 2) {
        alert('Veuillez sélectionner exactement deux joueurs ou moins.')
        return
      }
      socket.emit('phaseActionResponse', {
        ...payload,
        targets: selectedTargets,
      })
    } else if (actionRequest.action.card === 23) {
      if (selectedTargets.length > 3) {
        alert('Veuillez sélectionner exactement trois joueurs ou moins.')
        return
      }
      socket.emit('phaseActionResponse', {
        ...payload,
        targets: selectedTargets,
      })
    } else {
      socket.emit('phaseActionResponse', {
        ...payload,
        targetId: selectedTargets ?? -1,
      })
    }

    const resetAction = [3, 4, 6, 7, 8, 15, 20].includes(actionRequest.action.card)
    if (resetAction) setActionRequest(null)

    if (actionRequest.action.card === 22 && selectedNickname) {
      setHint(`Vous avez sélectionner <strong>${selectedNickname}</strong>. Vous pouvez maintenant lui envoyer un message via le tchat.`)
      setShowForm(false)
    }

    if (actionRequest.action.card === 23 && selectedNicknames) {
      setHint(`Vous avez invité <strong>${selectedNicknames}</strong>. Vous pouvez maintenant discuter entre vous via le tchat.`)
      setShowForm(false)
    }

    setSelectedTargets([])
    setSelectedNickname(null)
  }

  if (!actionRequest) return null

  if (actionRequest && actionRequest.action.card === 5) {
    return <PhaseActionCard5
      roomId={roomId}
      actionRequest={actionRequest as any}
      alienVictim={alienVictim}
      setAlienVictim={setAlienVictim}
      deathElixirUsed={actionRequest.deathElixirUsed}
      lifeElixirUsed={actionRequest.lifeElixirUsed}
    />
  }

  if (actionRequest && actionRequest.action.card === 20) {
    return <PhaseActionCard20
      roomId={roomId}
      actionRequest={actionRequest as any}
      alienVictim={alienVictim}
      setAlienVictim={setAlienVictim}
    />
  }

  return (
    <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: '8px', mt: 2 }}>
      <Typography variant="h6">{actionRequest.action.message}</Typography>
      { hint && (<Box className='mt-2'><b dangerouslySetInnerHTML={{ __html: hint }} /></Box>) }
      { isInn && (<Box className='mt-2'>Vous avez été invité par l'aubergiste de la station ! Vous pouvez maintenant discuter entre vous.</Box>) }
      { showForm && actionRequest.action.targetCount > 0 && (
        <>
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
        </>
      )}
    </Box>
  )
}

export default PhaseAction
