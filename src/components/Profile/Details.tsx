'use client'

import type React from 'react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, User, Award, BarChart3, Shield } from 'lucide-react'
import { usePermissions } from 'hooks/usePermissions'

import AchievementBadge from 'components/Profile/AchievementBadge'
import ModerationPanel from 'components/Moderation/ProfilePanel'
import RenderGameLine from 'components/Profile/RenderGameLine'
import type { User as UserType } from 'components/ProfileModal'

interface ProfileDetailsProps {
  user: UserType
  relation: string
}

const ProfileDetails: React.FC<ProfileDetailsProps> = ({ user, relation }) => {
  const { checkPermission } = usePermissions()
  const [detailsIsShown, setDetailsIsShown] = useState(false)
  const [moderationIsShown, setModerationIsShown] = useState(false)
  const [activeTab, setActiveTab] = useState('player')
  const isModerator = checkPermission('site', 'warn')

  const badgesArray = Object.values(user.achievements.possessed).filter((a: any) => !a.memory)
  const memoriesArray = Object.values(user.achievements.possessed).filter((a: any) => a.memory)

  const tabs = [
    { id: 'player', label: 'Joueur', icon: User },
    { id: 'badge', label: 'Badges', icon: Award },
    { id: 'stats', label: 'Statistiques', icon: BarChart3 },
  ]

  return (
    <div className="space-y-4">
      {/* Toggle Buttons */}
      <div className="flex flex-wrap gap-3">
        <motion.button
          onClick={() => setDetailsIsShown(!detailsIsShown)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-600/50 rounded-lg transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>{detailsIsShown ? 'Masquer les détails' : 'Voir plus de détails'}</span>
          {detailsIsShown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </motion.button>

        {isModerator && (
          <motion.button
            onClick={() => setModerationIsShown(!moderationIsShown)}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 border border-red-500/50 rounded-lg transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Shield size={16} />
            <span>{moderationIsShown ? 'Fermer' : 'Modération'}</span>
          </motion.button>
        )}
      </div>

      {/* Details Content */}
      <AnimatePresence>
        {detailsIsShown && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden"
          >
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-700/50">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all ${
                    activeTab === tab.id
                      ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                  }`}
                >
                  <tab.icon size={16} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {activeTab === 'player' && (
                  <motion.div
                    key="player"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {user.playedGames === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <User className="text-gray-400" size={24} />
                        </div>
                        <p className="text-gray-400">
                          {relation === 'me'
                            ? 'Tu viens seulement de débarquer sur Project 42. Rejoins vite les autres villageois en partie !'
                            : `${user.nickname} vient seulement de débarquer sur Project 42. ${user.isMale ? 'Il' : 'Elle'} n'a pas encore joué de partie.`}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Game Statistics */}
                        <div>
                          <h4 className="text-white font-bold mb-4">Répartition des parties</h4>
                          <div className="space-y-3">
                            {user.gamesStatistics.map((stat: any, index: number) => {
                              const percentage =
                                user.playedGames > 0 ? Math.round((stat.playedGames / user.playedGames) * 100) : 0
                              return (
                                <div key={index} className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className={'w-3 h-3 rounded-full bg-blue-500'}></div>
                                    <span className="text-gray-300">{stat.type}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-white font-medium">{percentage}%</span>
                                    <span className="text-gray-400 text-sm">
                                      ({stat.playedGames}/{user.playedGames})
                                    </span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Game History */}
                        <div>
                          <h4 className="text-white font-bold mb-4">Historique des parties</h4>
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {user.gamesHistoryFull.map((game: any) => (
                              <RenderGameLine game={game} key="all" />
                            ))}
                          </div>
                          {relation === 'me' && (
                            <div className="mt-4 text-center">
                              <a
                                href="/game/archives"
                                target="_blank"
                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                rel="noreferrer"
                              >
                                Voir toutes mes parties →
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'badge' && (
                  <motion.div
                    key="badge"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    {/* Regular Badges */}
                    <div>
                      <h4 className="text-white font-bold mb-4">Badges</h4>
                      {badgesArray.length > 0 && badgesArray.filter((b: any) => b.level > 0).length !== 0 ? (
                        <div className="grid grid-cols-8 gap-3">
                          {badgesArray.map((achievement: any, index: number) => {
                            if (achievement.level > 0) {
                              return (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: index * 0.05 }}
                                >
                                  <AchievementBadge
                                    achievement={achievement}
                                    isMemory={achievement.memory}
                                    aKey="all"
                                  />
                                </motion.div>
                              )
                            }
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Award className="text-gray-400" size={24} />
                          </div>
                          <p className="text-gray-400">
                            {relation === 'me'
                              ? 'Tu n\'as pas encore remporté de badge. Joue une partie pour commencer ta collection !'
                              : `${user.nickname} n'a pas encore remporté de badge. Invite ${user.isMale ? 'le' : 'la'} à jouer pour l'aider à débuter sa collection !`}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Memory Badges */}
                    <div>
                      <h4 className="text-white font-bold mb-2">Souvenirs</h4>
                      <p className="text-gray-400 text-sm mb-4">Pour montrer que tu étais là au bon moment</p>
                      {memoriesArray.length > 0 ? (
                        <div className="grid grid-cols-8 gap-3">
                          {memoriesArray.map((achievement: any, index: number) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <AchievementBadge achievement={achievement} isMemory={true} aKey="memory" />
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-center py-4">
                          {relation === 'me'
                            ? 'Tu n\'as pas encore remporté de souvenirs.'
                            : `${user.nickname} n'a pas encore remporté de souvenirs.`}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'stats' && (
                  <motion.div
                    key="stats"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h4 className="text-white font-bold mb-4">Statistiques par cartes</h4>
                    {Object.keys(user.cardsStatistics.statsByRole).length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <BarChart3 className="text-gray-400" size={24} />
                        </div>
                        <p className="text-gray-400">{user.nickname} n'a joué aucune partie.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-6 gap-4">
                        {Object.entries(user.cardsStatistics.statsByRole).map(([cardId, stats], index) => {
                          if (cardId === 'unknown') return null
                          const { cardsPlayed, wins, losses, winRate } = stats as any
                          return (
                            <motion.div
                              key={index}
                              className="bg-gray-700/30 rounded-lg p-3 text-center hover:bg-gray-700/50 transition-colors"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <img
                                src={`/assets/images/carte${cardId}.png`}
                                alt="Card"
                                className="w-12 h-12 mx-auto mb-2 rounded"
                              />
                              <div className="text-xs space-y-1">
                                <div className="text-white font-medium">{cardsPlayed} parties</div>
                                <div className="text-green-400">{wins} victoires</div>
                                <div className="text-red-400">{losses} défaites</div>
                                <div className="text-blue-400">{winRate}% réussite</div>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Moderation Panel */}
      <AnimatePresence>
        {moderationIsShown && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-red-900/20 backdrop-blur-sm border border-red-500/50 rounded-xl p-6"
          >
            <ModerationPanel />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProfileDetails
