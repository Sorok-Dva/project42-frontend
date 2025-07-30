'use client'

import type React from 'react'
import { motion } from 'framer-motion'
import { Trophy, Crown, Skull } from 'lucide-react'

interface GameResultPlayer {
  id: number
  nickname: string
  realNickname?: string
  cardId: number
  cardName: string
  isInfected: boolean
  points: number
  alive: boolean
  winner?: boolean
}

interface GameResultsProps {
  gameId: number
  players: GameResultPlayer[]
  couple?: [number, number]
  gameType?: string
  winner?: string
  whiteFlag?: boolean
  pointsMultiplier: number
}

const GameResults: React.FC<GameResultsProps> = ({ gameId, players, couple, whiteFlag, pointsMultiplier, gameType = 'Normal', winner }) => {
  // Trier les joueurs par points décroissants
  const sortedPlayers = [...players].sort((a, b) => b.points - a.points)

  // Déterminer les gagnants (ceux avec winner: true)
  const winners = sortedPlayers.filter((p) => p.winner)
  const losers = sortedPlayers.filter((p) => !p.winner)

  const getPointsColor = (points: number) => {
    if (points > 0) return 'text-green-400'
    if (points < 0) return 'text-red-400'
    return 'text-gray-400'
  }

  const getPointsIcon = (points: number) => {
    if (points > 0) return '+'
    return ''
  }

  return (
    <motion.div
      className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-sm rounded-xl border border-slate-600/50 p-4 my-2 mx-auto shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-center mb-4 pb-3 border-b border-slate-600/30">
        <Trophy className="w-6 h-6 text-yellow-400 mr-2" />
        <h3 className="text-xl font-bold text-white">Résultats de la partie</h3>
        <Trophy className="w-6 h-6 text-yellow-400 ml-2" />
      </div>

      {/* Winner Team */}
      {winner && (
        <div className="text-center mb-4">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-lg">
            <span className="text-yellow-300 font-semibold">{winner}</span>
            <Crown className="w-5 h-5 text-yellow-400 mr-2" />
          </div>
        </div>
      )}

      {/* Players List */}
      <div className="space-y-2">
        {/* Winners */}
        {winners.length > 0 && (
          <div className="mb-4">
            <h4 className="text-green-400 font-semibold mb-2 flex items-center">
              <Crown className="w-4 h-4 mr-1" />
              Gagnants
            </h4>
            {winners.map((player, index) => (
              <motion.div
                key={`winner-${player.id}`}
                className="flex items-center p-3 bg-gradient-to-r from-green-900/20 to-green-800/20 border border-green-500/30 rounded-lg mb-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Card Image */}
                <div className="relative mr-3 flex-shrink-0">
                  <img
                    src={`/assets/images/carte${player.cardId}.png`}
                    alt={player.cardName || 'Carte'}
                    className="w-12 h-12 rounded-lg border-2 border-green-400/50 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg?height=48&width=48'
                    }}
                  />
                  {!player.alive && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                      <Skull className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>

                {/* Player Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white truncate cursor-pointer sound-tick" data-profile={player.realNickname}>{player.nickname}</span>
                    {player.realNickname && player.realNickname !== player.nickname && (
                      <span className="text-xs text-gray-400 truncate">({player.realNickname})</span>
                    )}
                  </div>
                  <div className="text-sm text-green-300">
                    {player.cardName || 'Rôle inconnu'}
                    {couple && couple.includes(player.id) && (
                      <span className="text-sm text-pink-500"> • 💞 Joueur en couple</span>
                    )}
                    {player.isInfected && (
                      <span className="text-sm text-orange-400"> • 🦠 Joueur infecté</span>
                    )}
                  </div>
                </div>

                {/* Points */}
                <div className="flex-shrink-0 text-right">
                  {whiteFlag ? (
                    <div className="text-center">
                      <div className="text-sm text-gray-400 line-through">
                        {getPointsIcon(player.points)}
                        {player.points}
                        {pointsMultiplier > 1 && player.points > 0 && (
                          <span className="text-xs"> x{pointsMultiplier}</span>
                        )}
                      </div>
                      <div className="text-xs text-orange-400 font-medium">Sans points</div>
                      <div className="text-xs text-gray-500">Info seulement</div>
                    </div>
                  ) : (
                    <div>
                      <div className={`font-bold text-lg ${getPointsColor(player.points)}`}>
                        {getPointsIcon(player.points)}
                        {player.points}
                        {pointsMultiplier > 1 && player.points > 0 && (
                          <span className="text-xs"> x{pointsMultiplier}</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">points</div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Losers */}
        {losers.length > 0 && (
          <div>
            <h4 className="text-red-400 font-semibold mb-2 flex items-center">
              <Skull className="w-4 h-4 mr-1" />
              Autres joueurs
            </h4>
            {losers.map((player, index) => (
              <motion.div
                key={`loser-${player.id}`}
                className="flex items-center p-3 bg-gradient-to-r from-slate-800/40 to-slate-700/40 border border-slate-600/30 rounded-lg mb-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (winners.length + index) * 0.1 }}
              >
                {/* Card Image */}
                <div className="relative mr-3 flex-shrink-0">
                  <img
                    src={`/assets/images/carte${player.cardId}.png`}
                    alt={player.cardName || 'Carte'}
                    className="w-12 h-12 rounded-lg border-2 border-slate-500/50 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg?height=48&width=48'
                    }}
                  />
                  {!player.alive && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                      <Skull className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>

                {/* Player Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white truncate cursor-pointer sound-tick" data-profile={player.realNickname}>{player.nickname}</span>
                    {player.realNickname && player.realNickname !== player.nickname && (
                      <span className="text-xs text-gray-400 truncate">({player.realNickname})</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-300">
                    {player.cardName || 'Rôle inconnu'}
                    {couple && couple.includes(player.id) && (
                      <span className="text-sm text-pink-500"> • 💞 Joueur en couple</span>
                    )}
                    {player.isInfected && (
                      <span className="text-sm text-orange-400"> • 🦠 Joueur infecté</span>
                    )}
                  </div>

                </div>

                {/* Points */}
                <div className="flex-shrink-0 text-right">
                  {whiteFlag ? (
                    <div className="text-center">
                      <div className="text-sm text-gray-400 line-through">
                        {getPointsIcon(player.points)}
                        {player.points}
                        {pointsMultiplier > 1 && player.points > 0 && (
                          <span className="text-xs"> x{pointsMultiplier}</span>
                        )}
                      </div>
                      <div className="text-xs text-orange-400 font-medium">Sans points</div>
                      <div className="text-xs text-gray-500">Info seulement</div>
                    </div>
                  ) : (
                    <div>
                      <div className={`font-bold text-lg ${getPointsColor(player.points)}`}>
                        {getPointsIcon(player.points)}
                        {player.points}
                        {pointsMultiplier > 1 && player.points > 0 && (
                          <span className="text-xs"> x{pointsMultiplier}</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">points</div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-600/30 text-center">
        <span className="text-xs text-gray-400">
          Partie {gameId} ($gameType)
          {whiteFlag && (
            <span className="text-orange-400 ml-2">• Partie sans points (points affichés à titre informatif)</span>
          )}
          • {players.length} joueur{players.length > 1 ? 's' : ''}
        </span>
      </div>
    </motion.div>
  )
}

export default GameResults
