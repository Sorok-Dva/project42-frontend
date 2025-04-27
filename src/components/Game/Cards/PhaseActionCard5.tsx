import React, { useState } from 'react'
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
  gameType: number;
  actionRequest: PhaseActionRequestCard5;
  alienVictim: { id: number; nickname: string } | null;
  setAlienVictim: React.Dispatch<React.SetStateAction<{ id: number; nickname: string } | null>>;
  deathElixirUsed: boolean
  lifeElixirUsed: boolean
  setDeathElixirUsed: React.Dispatch<React.SetStateAction<boolean>>;
  setLifeElixirUsed: React.Dispatch<React.SetStateAction<boolean>>;
}

const PhaseActionCard5: React.FC<PhaseActionCard5Props> = ({
  roomId,
  gameType,
  actionRequest,
  alienVictim,
  setAlienVictim,
  deathElixirUsed,
  lifeElixirUsed,
  setDeathElixirUsed,
  setLifeElixirUsed,
}) => {
  const { socket } = useSocket()
  const { user } = useUser()
  const [selectedDeathTarget, setSelectedDeathTarget] = useState<number | ''>('')

  console.log(deathElixirUsed, lifeElixirUsed)
  const handleDeathChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDeathTarget(Number(event.target.value))
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
    setDeathElixirUsed(true)
  }

  const handleLifeSubmit = () => {
    if (!socket || lifeElixirUsed || gameType === 3) return
    socket.emit('phaseActionResponse', {
      roomId,
      playerId: user!.id,
      actionCard: actionRequest.action.card,
      targets: [alienVictim ? alienVictim.id : -1],
      type: 'life'
    })
    setAlienVictim(null)
    setLifeElixirUsed(true)
  }

  return (
    <div className="p-4 mt-4 border border-blue-500/30 rounded-lg bg-black/40 backdrop-blur-sm">
      <h3 className="text-lg font-bold text-white">{actionRequest.action.message}</h3>

      {/* Section Potion de Mort */}
      {!deathElixirUsed && (
        <div className="mt-4">
          <h4 className="text-base font-medium text-blue-300 mb-2">Elixir de Mort :</h4>
          <div className="relative">
            <select
              className="w-full bg-black/60 border border-blue-500/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
              value={selectedDeathTarget}
              onChange={handleDeathChange}
            >
              <option value="" disabled>Sélectionnez une cible</option>
              {actionRequest.eligibleTargets.map((target) => (
                <option key={target.id} value={target.id}>
                  {target.nickname}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
          <button
            className={`mt-3 px-4 py-2 rounded-lg transition-colors ${
              selectedDeathTarget === ''
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white'
            }`}
            onClick={handleDeathSubmit}
            disabled={selectedDeathTarget === ''}
          >
            Utiliser Elixir de Mort
          </button>
        </div>
      )}

      {/* Section elixir de Vie */}
      {alienVictim && gameType !== 3 && (
        <div className="mt-6">
          <h4 className="text-base font-medium text-blue-300 mb-2">Elixir de Vie :</h4>
          <button
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white rounded-lg transition-colors"
            onClick={handleLifeSubmit}
          >
            Sauver {alienVictim.nickname}
          </button>
        </div>
      )}

      {(deathElixirUsed && lifeElixirUsed) || (gameType === 3 && deathElixirUsed) && (
        <div className="mt-6 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <p className="text-blue-300">Vous avez utilisé tous vos élixirs.</p>
        </div>
      )}
    </div>
  )
}

export default PhaseActionCard5
