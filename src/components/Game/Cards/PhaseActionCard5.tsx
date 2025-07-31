import React, { useState } from 'react'
import { useSocket } from 'contexts/SocketContext'
import { useUser } from 'contexts/UserContext'
import { motion } from 'framer-motion'

interface PhaseActionRequestCard5 {
  action: {
    roleId: number;
    targetCount: number;
    message: string;
    channel?: string;
  };
  targets: { id: number; nickname: string }[];
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

  const handleDeathChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDeathTarget(Number(event.target.value))
  }

  const handleDeathSubmit = () => {
    if (!socket || selectedDeathTarget === '' || deathElixirUsed) return
    socket.emit('game:submit_action', {
      gameId: roomId,
      playerId: user!.id,
      roleId: actionRequest.action.roleId,
      targetId: selectedDeathTarget,
      ability: 'alchemist_potions_death',
    })
    setDeathElixirUsed(true)
  }

  const handleLifeSubmit = () => {
    if (!socket || lifeElixirUsed || gameType === 3) return
    socket.emit('game:submit_action', {
      gameId: roomId,
      playerId: user!.id,
      roleId: actionRequest.action.roleId,
      targetId: alienVictim ? alienVictim.id : -1,
      ability: 'alchemist_potions_life',
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
              value={selectedDeathTarget}
              onChange={handleDeathChange}
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
          </div>

          <motion.button
            className={`mt-3 px-4 py-2 rounded-lg transition-colors ${
              selectedDeathTarget === ''
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDeathSubmit}
            disabled={selectedDeathTarget === ''}
          >
            Empoisonner
          </motion.button>
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
