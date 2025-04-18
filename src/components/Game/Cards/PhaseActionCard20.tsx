import type React from 'react'
import { useSocket } from 'contexts/SocketContext'
import { useUser } from 'contexts/UserContext'

interface PhaseActionRequestCard20 {
  phase: number
  action: {
    card: number
    targetCount: number
    message: string
    channel?: string
  }
  eligibleTargets: { id: number; nickname: string }[]
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
    <div className="p-4 mt-4 border border-blue-500/30 rounded-lg bg-black/40 backdrop-blur-sm">
      <h3 className="text-lg font-bold text-white">{actionRequest.action.message}</h3>

      {alienVictim && (
        <div className="mt-4">
          <button
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-purple-600 hover:from-green-700 hover:to-purple-700 text-white rounded-lg transition-colors"
            onClick={handleInfect}
          >
            Infecter {alienVictim.nickname}
          </button>
        </div>
      )}

      {/*{hasShot && (
        <div className="mt-6 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <p className="text-blue-300">Vous avez déjà infecté un joueur.</p>
        </div>
      )}*/}
    </div>
  )
}

export default PhaseActionCard20
