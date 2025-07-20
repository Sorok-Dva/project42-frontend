'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { PremiumPlayerStats } from 'types/premium'
import { Clock, MessageCircle, ThumbsUp, ThumbsDown, Minus, Skull } from 'lucide-react'

interface PremiumPanelProps {
  data: PremiumPlayerStats[]
}

const formatTimeAgo = (timestamp: number | null): string => {
  if (timestamp === null || timestamp === undefined) return 'Jamais'

  const now = Date.now()
  const secondsPast = Math.floor((now - timestamp) / 1000)

  if (secondsPast < 60) {
    return `${secondsPast}s`
  }
  if (secondsPast < 3600) {
    return `${Math.floor(secondsPast / 60)}m`
  }
  if (secondsPast < 86400) {
    return `${Math.floor(secondsPast / 3600)}h`
  }
  return `${Math.floor(secondsPast / 86400)}j`
}

const getTimeColor = (timestamp: number | null): string => {
  if (timestamp === null || timestamp === undefined) return 'text-gray-500'

  const now = Date.now()
  const secondsPast = (now - timestamp) / 1000

  if (secondsPast < 30) return 'text-green-400'
  if (secondsPast < 120) return 'text-yellow-400'
  if (secondsPast < 300) return 'text-orange-400'
  return 'text-red-400'
}

const PremiumPanel: React.FC<PremiumPanelProps> = ({ data }) => {
  const [currentTime, setCurrentTime] = useState(Date.now())

  // Mise à jour du timer en temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Séparer et trier les joueurs
  const alivePlayers = data
    .filter((player) => player.isAlive)
    .sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0))

  const deadPlayers = data
    .filter((player) => !player.isAlive)
    .sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0))

  const sortedData = [...alivePlayers, ...deadPlayers]

  return (
    <motion.div
      className="bg-gradient-to-br from-slate-900/95 to-purple-900/95 backdrop-blur-md rounded-lg border border-purple-500/30 shadow-2xl overflow-hidden max-w-md w-full"
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600/30 to-fuchsia-600/30 px-3 py-2 border-b border-purple-500/30">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
          <h3 className="text-sm font-bold text-white">Panel Premium</h3>
          <div className="ml-auto text-xs text-purple-300">
            {alivePlayers.length} vivants • {deadPlayers.length} morts
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-h-80 overflow-y-auto custom-scrollbar">
        <div className="p-2 space-y-1">
          <AnimatePresence>
            {sortedData.map((player, index) => (
              <motion.div
                key={player.id}
                className={`
                  relative rounded-md p-2 border transition-all duration-200
                  ${
              player.isAlive
                ? 'bg-slate-800/50 border-slate-600/30 hover:bg-slate-700/50'
                : 'bg-red-900/20 border-red-500/20 hover:bg-red-900/30'
              }
                `}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                layout
              >
                {/* Séparateur visuel entre vivants et morts */}
                {index === alivePlayers.length && deadPlayers.length > 0 && (
                  <motion.div
                    className="absolute -top-3 left-0 right-0 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="bg-red-500/20 px-2 py-1 rounded-full border border-red-500/30">
                      <div className="flex items-center gap-1 text-xs text-red-300">
                        <Skull size={12} />
                        <span>Éliminés</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="flex items-center justify-between">
                  {/* Nom du joueur */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className={`w-2 h-2 rounded-full ${player.isAlive ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span
                      className={`
                      font-medium text-sm truncate
                      ${player.isAlive ? 'text-white' : 'text-red-300 line-through'}
                    `}
                    >
                      {player.nickname}
                    </span>
                  </div>

                  {/* Stats compactes */}
                  <div className="flex items-center gap-3 text-xs">
                    {/* Messages */}
                    <div className="flex items-center gap-1">
                      <MessageCircle size={12} className="text-blue-400" />
                      <span className="text-blue-300 font-medium">{player.messageCount}</span>
                    </div>

                    {/* Timer dernière activité */}
                    <div className="flex items-center gap-1">
                      <Clock size={12} className={getTimeColor(player.lastMessageTime)} />
                      <span className={`font-mono ${getTimeColor(player.lastMessageTime)}`}>
                        {formatTimeAgo(player.lastMessageTime)}
                      </span>
                    </div>

                    {/* Votes */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <ThumbsUp size={10} className="text-green-400" />
                        <span className="text-green-300">{player.goodVotes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsDown size={10} className="text-red-400" />
                        <span className="text-red-300">{player.badVotes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Minus size={10} className="text-gray-400" />
                        <span className="text-gray-300">{player.neutralVotes}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Barre d'activité */}
                <div className="mt-2">
                  <div className="w-full bg-slate-700/30 rounded-full h-1">
                    <motion.div
                      className={`h-1 rounded-full ${
                        player.lastMessageTime === null
                          ? 'bg-gray-500'
                          : getTimeColor(player.lastMessageTime).includes('green')
                            ? 'bg-green-400'
                            : getTimeColor(player.lastMessageTime).includes('yellow')
                              ? 'bg-yellow-400'
                              : getTimeColor(player.lastMessageTime).includes('orange')
                                ? 'bg-orange-400'
                                : 'bg-red-400'
                      }`}
                      initial={{ width: 0 }}
                      animate={{
                        width:
                          player.lastMessageTime === null
                            ? '5%'
                            : `${Math.max(5, Math.min(100, (player.messageCount / Math.max(...data.map((p) => p.messageCount))) * 100))}%`,
                      }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer avec légende */}
      <div className="bg-slate-800/30 px-3 py-2 border-t border-purple-500/20">
        <div className="flex items-center justify-between text-xs text-purple-300">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
              <span>Vivant</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
              <span>Mort</span>
            </div>
          </div>
          <div className="text-purple-400">Mis à jour en temps réel</div>
        </div>
      </div>
    </motion.div>
  )
}

export default React.memo(PremiumPanel)
