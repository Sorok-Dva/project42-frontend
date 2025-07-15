'use client'

import type React from 'react'
import { motion } from 'framer-motion'
import { Play, Eye, Users } from 'lucide-react'
import type { UserProfile } from 'components/ProfileModal'
import type { JSX } from 'react/jsx-runtime' // Import JSX to fix the lint error

interface JoinGameProps {
  user: UserProfile
  relation: string
}

const Activity: React.FC<JoinGameProps> = ({ user, relation }) => {
  if (relation === 'me' || !user.activity || user.activity.state === 'none') {
    return null
  }

  const { state, gameId } = user.activity

  let content: JSX.Element | null = null

  if (state === 'ingame') {
    content = (
      <div className="text-center space-y-3">
        <p className="text-gray-300">{user.nickname} est actuellement en jeu.</p>
        <motion.a
          href={`/game/${gameId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Eye size={16} />
          <span>Observer</span>
        </motion.a>
      </div>
    )
  } else if (state === 'pregame') {
    content = (
      <div className="text-center space-y-3">
        <p className="text-gray-300">{user.nickname} est sur le point de commencer une partie.</p>
        <div className="flex justify-center space-x-2">
          <motion.a
            href={`/game/${gameId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Eye size={16} />
            <span>Observer</span>
          </motion.a>
          <motion.form
            method="POST"
            action="/game/join"
            target="_blank"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <input type="hidden" name="room" value={gameId} />
            <button
              type="submit"
              name="player"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all"
            >
              <Play size={16} />
              <span>Rejoindre</span>
            </button>
          </motion.form>
        </div>
      </div>
    )
  } else if (state === 'spectator') {
    content = (
      <div className="text-center space-y-3">
        <p className="text-gray-300">{user.nickname} observe une partie.</p>
        <motion.a
          href={`/game/${gameId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Users size={16} />
          <span>Rejoindre {user.nickname} en spectateur</span>
        </motion.a>
      </div>
    )
  }

  return (
    <motion.div
      className="bg-slate-700/50 rounded-xl p-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {content}
    </motion.div>
  )
}

export default Activity
