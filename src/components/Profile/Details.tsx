'use client'

import type React from 'react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Award, BarChart3 } from 'lucide-react'
import { usePermissions } from 'hooks/usePermissions'

import AchievementBadge from 'components/Profile/AchievementBadge'
import ModerationPanel from 'components/Moderation/Actions'
import type { UserProfile } from 'components/ProfileModal'
import { Tooltip } from 'react-tooltip'

interface ProfileDetailsProps {
  user: UserProfile
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
    { id: 'player', label: 'JOUEUR' },
    { id: 'badge', label: 'BADGES' },
    { id: 'stats', label: 'STATS' },
  ]

  return (
    <div className="space-y-4">
      {/* Toggle Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        {isModerator && (
          <motion.button
            onClick={() => setModerationIsShown(!moderationIsShown)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {moderationIsShown ? 'FERMER' : 'MODÉRATION'}
          </motion.button>
        )}

        <motion.button
          onClick={() => setDetailsIsShown(!detailsIsShown)}
          className="px-6 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm font-medium transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {detailsIsShown ? 'MASQUER LES DÉTAILS' : 'VOIR PLUS DE DÉTAILS'}
        </motion.button>
      </div>

      {/* Details Content */}
      <AnimatePresence>
        {detailsIsShown && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-[#172247] rounded-xl overflow-hidden"
          >
            {/* Tab Navigation */}
            <div className="flex items align-items-center text-center border-b border-slate-600">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-6 py-4 font-bold text-sm transition-all ${
                    activeTab === tab.id
                      ? 'text-white bg-[#172247]'
                      : 'text-gray-400 bg-[#0e1735] hover:text-white hover:bg-slate-600/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6 bg-[#172247]">
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
                        <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-400">
                          {relation === 'me'
                            ? 'Tu viens seulement de débarquer sur Project 42. Rejoins vite les autres membres d\'équipage en partie !'
                            : `${user.nickname} vient seulement de débarquer sur Project 42. ${user.isMale ? 'Il' : 'Elle'} n'a pas encore joué de partie.`}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Game History in two columns */}
                        <div className="grid grid-cols-1 lg:grid-cols-2">
                          {user.gamesHistoryFull.map((game: any, index: number) => (
                            <div
                              key={game.id}
                              className="flex items-center justify-between p-2 hover:bg-slate-600/30 rounded"
                            >
                              <div className="flex items-center space-x-3">
                                <img
                                  src={`/assets/images/miniatures/carte${game.idRole}_90_90.png`}
                                  alt="Card"
                                  className="w-8 h-8 rounded"
                                />
                                <div className="flex items-center space-x-2">
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      game.type === 'carnage'
                                        ? 'bg-red-500'
                                        : game.type === 'fun'
                                          ? 'bg-green-500'
                                          : game.type === 'sérieuse'
                                            ? 'bg-purple-500'
                                            : 'bg-blue-500'
                                    }`}
                                  ></div>
                                  <span className="text-gray-300 text-sm capitalize">{game.type}</span>
                                </div>
                                <span className="text-gray-400 text-xs">{game.date}</span>
                              </div>
                              <span
                                className={`text-xs font-medium ${
                                  game.result === 'Victoire'
                                    ? 'text-green-400'
                                    : game.result === 'Égalité'
                                      ? 'text-yellow-400'
                                      : 'text-red-400'
                                }`}
                              >
                                {game.result}
                              </span>
                            </div>
                          ))}
                        </div>

                        {relation === 'me' && (
                          <div className="text-center">
                            <button className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded text-sm">
                              Voir toutes mes parties
                            </button>
                          </div>
                        )}
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
                    className="space-y-8 bg-[#172247]"
                  >
                    {/* Regular Badges */}
                    <div>
                      {badgesArray.length > 0 && badgesArray.filter((b: any) => b.level > 0).length !== 0 ? (
                        <div className="flex flex-wrap justify-center relative rounded-[10px] bg-[#0e1735] my-[2vh] py-[1vh] pt-[1.5vh] gap-2 justify-items-center">
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
                          <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-400">
                            {relation === 'me'
                              ? 'Tu n\'as pas encore remporté de badge. Joue une partie pour commencer ta collection !'
                              : `${user.nickname} n'a pas encore remporté de badge. Invite ${user.isMale ? 'le' : 'la'} à jouer pour l'aider à débuter sa collection !`}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Memory Badges */}
                    <div className="text-center p-4 rounded bg-[#0e1735]">
                      <h4 className="text-white font-bold text-2xl mb-2">Souvenirs</h4>
                      <p className="text-gray-400 text-sm mb-6">Pour montrer que tu étais là au bon moment</p>
                      {memoriesArray.length > 0 ? (
                        <div className="flex justify-center">
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
                        <p className="text-gray-400">
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
                        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-400">{user.nickname} n'a joué aucune partie.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 lg:grid-cols-6 gap-4">
                        {Object.entries(user.cardsStatistics.statsByRole).map(([cardId, stats], index) => {
                          if (cardId === 'unknown') return null
                          const { cardsPlayed, wins, losses, winRate } = stats as any
                          return (
                            <>
                              <motion.div
                                key={index}
                                className="bg-slate-600/50 rounded-lg p-3 text-center hover:bg-slate-600/70 transition-colors"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                data-tooltip-content={`Statistique pour la carte ${cardsPlayed}`}
                                data-tooltip-id={`c_${index}`}
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
                              <Tooltip id={`c_${index}`} />
                            </>
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
            className="bg-red-900/20 border border-red-500/50 rounded-xl p-6"
          >
            <ModerationPanel targetUser={user} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProfileDetails
