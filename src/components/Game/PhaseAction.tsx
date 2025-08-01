import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useSocket } from 'contexts/SocketContext'
import { useUser } from 'contexts/UserContext'
import PhaseActionCard5 from 'components/Game/Cards/PhaseActionCard5'
import PhaseActionCard20 from 'components/Game/Cards/PhaseActionCard20'
import { Player } from 'types/room'

interface PhaseActionRequest {
  phase: number
  action: {
    roleId: number
    targetCount: number
    message: string
    channel?: string
    faction?: string
  }
  targets: { id: number; nickname: string }[]
}

interface PhaseActionProps {
  player: Player
  roomId: number
  gameType: number
  isInn: boolean
}

const PhaseAction: React.FC<PhaseActionProps> = ({ player, roomId, isInn, gameType }) => {
  const { socket } = useSocket()
  const { user } = useUser()
  const [actionRequest, setActionRequest] = useState<PhaseActionRequest | null>(null)
  const [selectedTargets, setSelectedTargets] = useState<number[]>([])
  const [selectedNickname, setSelectedNickname] = useState<string | null>(null)
  const [selectedNicknames, setSelectedNicknames] = useState<string[]>([])
  const [alienVictim, setAlienVictim] = useState<{
    nickname: string
    id: number
  } | null>(null)
  const [showForm, setShowForm] = useState<boolean>(true)
  const [deathElixirUsed, setDeathElixirUsed] = useState<boolean>(false)
  const [lifeElixirUsed, setLifeElixirUsed] = useState<boolean>(false)
  const [hint, setHint] = useState<string | null>(null)

  useEffect(() => {
    // Réinitialise toujours la sélection lorsqu'une nouvelle action débute
    setSelectedTargets([])
    setSelectedNickname(null)
    setSelectedNicknames([])

    if (
      actionRequest &&
      actionRequest.targets.length > 0 &&
      actionRequest.action.targetCount === 1
    ) {
      const firstTargetId = actionRequest.targets[0].id
      setSelectedTargets([firstTargetId])

      // Mettre à jour également le nickname sélectionné
      const selectedTarget = actionRequest.targets.find(
        (target) => target.id === firstTargetId,
      )
      if (selectedTarget) {
        setSelectedNickname(selectedTarget.nickname)
      }
    }
  }, [actionRequest])

  useEffect(() => {
    if (!socket || !user || !player || !roomId) return

    socket.on('game:action_required', (data: PhaseActionRequest) => {
      if (
        data.action.roleId === player?.card?.id ||
        data.action.roleId === -1 ||
        (data.action.roleId === 2 && ([2, 9, 20, 21].includes(player.card?.id || -1) || player.isInfected || player.faction === 'Alien')) ||
        (data.action.roleId === 6 && (!player.alive)) ||
        (data.action.faction === 'Alien' && player.isInfected)
      ) {
        setActionRequest(data)
        setDeathElixirUsed(false)
        setLifeElixirUsed(false)
      }
    })

    socket.on('game:alien_victim', (victim) => {
      if (victim.id) {
        setAlienVictim({ nickname: victim.nickname, id: victim.id })
      } else setAlienVictim(null)
    })

    socket.on('game:reset_action', (victim) => {
      setActionRequest(null)
    })

    return () => {
      socket.off('game:action_required')
      socket.off('game:reset_action')
      socket.off('game:alien_victim')
    }
  }, [socket, user, player, roomId])

  const handleSelectionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    // Récupérer toutes les options sélectionnées
    const selectedValues = Array.from(event.target.selectedOptions, (option) => option.value)

    // Comme vos IDs sont des nombres, on peut faire une conversion
    const selectedIds = selectedValues.map((val) => Number(val))

    setSelectedTargets(selectedIds)

    // Construction de la chaîne des nicknames à partir des ids.
    setSelectedNicknames(
      selectedIds.map((id) => {
        const selectedTarget = actionRequest?.targets.find((target) => target.id === id)
        return selectedTarget ? selectedTarget.nickname : ''
      }),
    )

    // Pour la sélection unique, on peut mettre à jour selectedNickname si besoin
    if (selectedIds.length === 1) {
      const selectedTarget = actionRequest?.targets.find((target) => target.id === selectedIds[0])
      if (selectedTarget) {
        setSelectedNickname(selectedTarget.nickname)
      }
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLSelectElement>, targetCount: number) => {
    e.preventDefault()
    const option = e.target as HTMLOptionElement
    const value = Number(option.value)
    if (selectedTargets.length + 1 > targetCount && !selectedTargets.includes(value)) {
      alert(`Vous ne pouvez pas sélectionner plus de ${targetCount} joueurs`)
      return
    }
    // Modification de la sélection
    setSelectedTargets((prev) => (prev.includes(value) ? prev.filter((id) => id !== value) : [...prev, value]))
  }

  const handleSubmit = () => {
    if (!socket || !actionRequest) return

    const payload: any = {
      gameId: roomId,
      playerId: user!.id,
      roleId: actionRequest.action.roleId,
    }

    // Gestion spécifique pour Cupidon (carte 7)
    if (actionRequest.action.roleId === 7) {
      if (selectedTargets.length !== 2) {
        alert('Veuillez sélectionner exactement deux joueurs.')
        return
      }
      socket.emit('game:submit_action', {
        ...payload,
        targets: selectedTargets,
      })
    } else if (actionRequest.action.roleId === 15 && selectedTargets) {
      // Gestion pour le maitre des ondes
      if (selectedTargets.length > 2) {
        alert('Veuillez sélectionner exactement deux joueurs ou moins.')
        return
      }
      socket.emit('game:submit_action', {
        ...payload,
        targets: selectedTargets,
      })
    } else if (actionRequest.action.roleId === 23) {
      if (selectedTargets.length > 3) {
        alert('Veuillez sélectionner exactement trois joueurs ou moins.')
        return
      }
      socket.emit('game:submit_action', {
        ...payload,
        targets: selectedTargets,
      })
    } else {
      socket.emit('game:submit_action', {
        ...payload,
        targetId: Number(selectedTargets[0]) ?? -1,
      })
    }

    // Réinitialiser l'action pour certaines cartes
    const resetAction = [3, 6, 7, 8, 9, 15, 20].includes(actionRequest.action.roleId)
    if (resetAction) setActionRequest(null)

    // Afficher des indications pour certaines cartes
    if (actionRequest.action.roleId === 22 && selectedNickname) {
      setHint(
        `Vous avez sélectionné <strong>${selectedNickname}</strong>. Vous pouvez maintenant lui envoyer un message via le tchat.`,
      )
      setShowForm(false)
    }

    if (actionRequest.action.roleId === 23 && selectedNicknames.length > 0) {
      setHint(
        `Vous avez invité <strong>${selectedNicknames.join(', ')}</strong>. Vous pouvez maintenant discuter entre vous via le tchat.`,
      )
      setShowForm(false)
    }

    // setSelectedTargets([])
    // setSelectedNickname(null)
  }

  useEffect(() => {
    const handleResize = () => {
      // La hauteur sera gérée par la propriété size et le style maxHeight
      // Pas besoin de calculer une hauteur spécifique
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [actionRequest])

  // Display a message if the Galactic Jester has lost their vote
  if (player.card?.id === 14 && player.canVote === false) {
    return (
      <motion.div
        className="bg-black/40 backdrop-blur-sm rounded-lg border border-yellow-500/30 p-4 mt-4 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="text-lg font-bold text-yellow-300">Vous avez perdu votre pouvoir de vote.</h3>
      </motion.div>
    )
  }

  if (!actionRequest) return null

  if (actionRequest && actionRequest.action.roleId === 5) {
    return (
      <PhaseActionCard5
        roomId={roomId}
        gameType={gameType}
        actionRequest={actionRequest as any}
        alienVictim={alienVictim}
        setAlienVictim={setAlienVictim}
        deathElixirUsed={deathElixirUsed}
        lifeElixirUsed={lifeElixirUsed}
        setDeathElixirUsed={setDeathElixirUsed}
        setLifeElixirUsed={setLifeElixirUsed}
      />
    )
  }

  if (actionRequest && actionRequest.action.roleId === 20) {
    return (
      <PhaseActionCard20
        roomId={roomId}
        player={player}
        actionRequest={actionRequest as any}
        alienVictim={alienVictim}
        setAlienVictim={setAlienVictim}
      />
    )
  }

  // Gestion spéciale pour certaines cartes
  if (actionRequest && (actionRequest.action.roleId === 5 || actionRequest.action.roleId === 20)) {
    return (
      <motion.div
        className="bg-black/40 backdrop-blur-sm rounded-lg border border-blue-500/30 p-4 mt-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="text-lg font-bold text-white mb-2">{actionRequest.action.message}</h3>

        {alienVictim ? (
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 mb-3">
            <p className="text-green-300">
              Vous avez choisi d'éliminer <strong>{alienVictim.nickname}</strong>.
            </p>
          </div>
        ) : (
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
            <p className="text-blue-300">En attente de votre décision...</p>
          </div>
        )}
      </motion.div>
    )
  }

  return (
    <motion.div
      className="bg-black/40 backdrop-blur-sm rounded-lg border border-blue-500/30 p-4 mt-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-lg font-bold text-white mb-2">{actionRequest.action.message}</h3>

      {hint && (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 mb-3">
          <p className="text-blue-300" dangerouslySetInnerHTML={{ __html: hint }} />
        </div>
      )}

      {isInn && (
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 mb-3">
          <p className="text-yellow-300">
            Vous avez été invité par l'aubergiste de la station ! Vous pouvez maintenant discuter entre vous.
          </p>
        </div>
      )}

      {showForm && actionRequest.action.targetCount > 0 && (
        <div className="space-y-4">
          <div className="relative">
            <select
              multiple={actionRequest.action.targetCount > 1}
              value={selectedTargets.map(String)}
              onChange={handleSelectionChange}
              {...(actionRequest.action.targetCount > 1
                ? { onMouseDown: (e: any) => handleMouseDown(e, actionRequest.action.targetCount) }
                : {})}
              className="w-full bg-black/60 border border-blue-500/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              size={Math.min(actionRequest.targets.length, Math.max(5, Math.floor(window.innerHeight * 0.05)))}
              style={{
                height: 'auto',
                maxHeight: 'min(40vh, 300px)',
                overflow: 'auto'
              }}
            >
              {actionRequest.targets.map((target) => (
                <option key={target.id} value={target.id} className="p-2 hover:bg-blue-900/30">
                  {target.nickname}
                </option>
              ))}
            </select>

            {actionRequest.action.targetCount > 1 && (
              <div className="text-xs text-blue-300 mt-1">
                {actionRequest.action.roleId === 7
                  ? 'Sélectionnez exactement 2 joueurs'
                  : actionRequest.action.roleId === 15
                    ? 'Sélectionnez jusqu\'à 2 joueurs'
                    : actionRequest.action.roleId === 23
                      ? 'Sélectionnez jusqu\'à 3 joueurs'
                      : `Sélectionnez jusqu'à ${actionRequest.action.targetCount} joueurs`}
              </div>
            )}
          </div>

          <motion.button
            className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all shadow-lg shadow-blue-500/20"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={selectedTargets.length === 0}
          >
            Valider
          </motion.button>
        </div>
      )}
    </motion.div>
  )
}

export default PhaseAction
