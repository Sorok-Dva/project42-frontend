import type React from 'react'
import { useSocket } from 'contexts/SocketContext'
import { useUser } from 'contexts/UserContext'
import { Player } from 'types/room'

interface PhaseActionRequestCard20 {
  phase: number
  action: {
    roleId: number;
    targetCount: number;
    message: string;
    channel?: string;
  }
  eligibleTargets: { id: number; nickname: string }[]
}

interface PhaseActionCard20Props {
  roomId: number
  player: Player
  actionRequest: PhaseActionRequestCard20
  alienVictim: { id: number; nickname: string } | null
  setAlienVictim: React.Dispatch<React.SetStateAction<{ id: number; nickname: string } | null>>
}

const PhaseActionCard20: React.FC<PhaseActionCard20Props> = ({
  roomId,
  player,
  actionRequest,
  alienVictim,
  setAlienVictim,
}) => {
  const { socket } = useSocket()
  const { user } = useUser()

  const handleInfect = () => {
    if (!socket) return
    socket.emit('game:submit_action', {
      gameId: roomId,
      playerId: user!.id,
      roleId: actionRequest.action.roleId,
      targetId: alienVictim ? alienVictim.id : -1,
      ability: 'infection_pionnier_infect'
    })
    setAlienVictim(null)
  }

  return (
    <div className="p-4 mt-4 border border-blue-500/30 rounded-lg bg-black/40 backdrop-blur-sm">
      <h3 className="text-lg font-bold text-white">{actionRequest.action.message}</h3>

      {alienVictim && !player.hasUsedAbility && (
        <div className="mt-4">
          <button
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-purple-600 hover:from-green-700 hover:to-purple-700 text-white rounded-lg transition-colors"
            onClick={handleInfect}
          >
            Infecter {alienVictim.nickname}
          </button>
        </div>
      )}

      {player.hasUsedAbility && (
        <div className="mt-6 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <p className="text-blue-300">Vous avez déjà infecté un joueur.</p>
        </div>
      )}
    </div>
  )
}

export default PhaseActionCard20
