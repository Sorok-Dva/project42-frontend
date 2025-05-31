'use client'

import axios from 'axios'
import type React from 'react'
import { type FC, useEffect, useState } from 'react'
import { useAuth } from 'contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, Users, Calendar, Trophy, Zap, Shield, Crown } from 'lucide-react'

import { rolify } from 'utils/rolify'
import RenderGameLine from 'components/Profile/RenderGameLine'
import AchievementBadge from 'components/Profile/AchievementBadge'
import Actions from './Profile/Actions'
import Details from './Profile/Details'
import Activity from 'components/Profile/Activity'

interface AchievementResult {
  [favorite: number]: {
    id: number
    description: string
    total: number
    unique: boolean
    memory: boolean
    level: number
    title?: string | { [level: number]: string }
    nextLevelTo?: number
  }
}

export interface User {
  id: number
  nickname: string
  points: number
  level: number
  isPremium: boolean
  title: string
  signature: string
  avatar: string
  isMale: boolean
  rank: string
  playedGames: number
  canGuildInvite: boolean
  role: { name: string }
  summaryHistory: [
    {
      id: string
      date: string
      result: string
      name: string
      link: string
      type: string
      idRole: number
      meanClaps: number
    },
  ]
  stats: [
    {
      type: number | 'all'
      playedGames: number
    },
  ]
  guild: {
    id: number
    name: string
    banner: string | null
    tag: string
    picture: string
    border: string
    role: string
    membersCount: string
  }
  achievements: {
    favorites: AchievementResult
    possessed: [
      {
        id: string
        title: string
        description: string
        unique: boolean
        level: number
        total?: number
        nextLevelTo?: number
      },
    ]
  }
  cardsStatistics: {
    statsByRole: { cardsPlayed: number; wins: number; losses: number; winRate: number; lossRate: number }[]
    topCard: {
      name: string
      playedCount: 50
    }
  }
  gamesStatistics: []
  gamesHistoryFull: {
    id: string
    idRole: number
    date: string
    link: string
    meanClaps: number
    name: string
    result: string
    type: string
  }[]
  activity: {
    state: 'ingame' | 'pregame' | 'spectator' | 'none' | string
    gameId?: number
  }
  createdAt: Date
}

interface ProfileModalProps {
  nickname: string
  onClose: () => void
}

const ProfileModal: FC<ProfileModalProps> = ({ nickname, onClose }) => {
  const { token } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [relation, setRelation] = useState<'me' | 'friend' | 'waiting' | 'none'>('none')
  const [error, setError] = useState<string | null>(null)
  const [role, setRole] = useState<{ name: string; color: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchuser = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get(
          `/api/users/${nickname}`,
          token
            ? {
              headers: { Authorization: `Bearer ${token}` },
            }
            : {},
        )
        setUser(response.data.user)
        setRelation(response.data.relation)
        setRole(rolify(response.data.user.role.name, response.data.user.isMale))
      } catch (e: any) {
        if (e.response?.data.error) {
          setError(e.response.data.error)
        }
        console.error('Erreur lors de la récupération des données :', e)
      } finally {
        setIsLoading(false)
      }
    }

    fetchuser()
  }, [nickname, token])

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  const getStatusColor = (activity: string) => {
    switch (activity) {
    case 'ingame':
      return 'bg-green-500'
    case 'pregame':
      return 'bg-yellow-500'
    case 'spectator':
      return 'bg-blue-500'
    default:
      return 'bg-gray-500'
    }
  }

  const getStatusText = (activity: string) => {
    switch (activity) {
    case 'ingame':
      return 'En jeu'
    case 'pregame':
      return 'En attente'
    case 'spectator':
      return 'Spectateur'
    default:
      return 'Hors ligne'
    }
  }

  const calculateWinRate = () => {
    if (!user || user.playedGames === 0) return 0
    const wins = user.summaryHistory.filter((game) => game.result === 'Victoire').length
    return Math.round((wins / user.playedGames) * 100)
  }

  if (error) {
    return (
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleOverlayClick}
        >
          <motion.div
            className="bg-gray-900/95 backdrop-blur-md border border-red-500/50 rounded-2xl p-8 max-w-md mx-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Erreur</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-4">{error}</div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleOverlayClick}
      >
        <motion.div
          className="bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Profil de {nickname}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800/50 rounded-lg"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400">Chargement du profil...</p>
              </div>
            ) : user ? (
              <div className="p-6 space-y-6">
                {/* Profile Header */}
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {/* Profile Info */}
                  <div className="relative -mt-16 px-6">
                    <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-6">
                      {/* Avatar */}
                      <div className="relative">
                        <div className="w-24 h-24 rounded-2xl border-4 border-gray-700 bg-gray-800 overflow-hidden">
                          <img
                            src={user.avatar || '/placeholder.svg'}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {/* Status Indicator */}
                        <div
                          className={`absolute -bottom-1 -right-1 w-6 h-6 ${getStatusColor(user.activity.state)} rounded-full border-2 border-gray-900 flex items-center justify-center`}
                        >
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-3">
                          <h1 className="text-2xl font-bold text-white">{user.nickname}</h1>
                          {user.isPremium && (
                            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-2 py-1 rounded-lg text-xs font-bold flex items-center space-x-1">
                              <Crown size={12} />
                              <span>PREMIUM</span>
                            </div>
                          )}
                          {role && (
                            <div
                              className="px-3 py-1 rounded-lg text-xs font-bold text-white"
                              style={{ backgroundColor: role.color }}
                            >
                              {role.name}
                            </div>
                          )}
                        </div>

                        <p className="text-blue-400 font-medium">{user.title}</p>
                        <p className="text-gray-400 italic">« {user.signature || '...'} »</p>

                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Calendar size={14} />
                            <span>Inscrit le {new Date(user.createdAt).toLocaleDateString('fr-FR')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(user.activity.state)}`}></div>
                            <span>{getStatusText(user.activity.state)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                  className="grid grid-cols-2 md:grid-cols-4 gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Zap className="text-yellow-500" size={20} />
                      <span className="text-gray-400 text-sm">Points</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{user.points.toLocaleString()}</p>
                  </div>

                  <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="text-blue-500" size={20} />
                      <span className="text-gray-400 text-sm">Niveau</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{user.level}</p>
                  </div>

                  <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Trophy className="text-green-500" size={20} />
                      <span className="text-gray-400 text-sm">Parties</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{user.playedGames}</p>
                  </div>

                  <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="text-purple-500" size={20} />
                      <span className="text-gray-400 text-sm">Victoires</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{calculateWinRate()}%</p>
                  </div>
                </motion.div>

                {/* Favorite Badges */}
                {Object.values(user.achievements.favorites).length > 0 && (
                  <motion.div
                    className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                      <Trophy className="text-yellow-500" size={20} />
                      <span>Badges favoris</span>
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {Object.values(user.achievements.favorites).map((achievement, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                        >
                          <AchievementBadge achievement={achievement} isMemory={achievement.memory} aKey="fav" />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Guild Info */}
                {user.guild && (
                  <motion.div
                    className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                      <Users className="text-blue-500" size={20} />
                      <span>Station spatiale</span>
                    </h3>
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-xl bg-gray-700 overflow-hidden">
                        <img
                          src={user.guild.banner || '/placeholder.svg?height=64&width=64'}
                          alt="Guild Banner"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-gray-400 text-sm">[{user.guild.tag}]</span>
                          <h4 className="text-white font-bold">{user.guild.name}</h4>
                        </div>
                        <p className="text-blue-400 text-sm">{user.guild.role}</p>
                        <p className="text-gray-400 text-sm">{user.guild.membersCount}/50 membres</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Recent Games */}
                {user.summaryHistory.length > 0 && (
                  <motion.div
                    className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h3 className="text-lg font-bold text-white mb-4">Dernières parties</h3>
                    <div className="space-y-2">
                      {user.summaryHistory.slice(0, 5).map((game, index) => (
                        <motion.div
                          key={game.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + index * 0.1 }}
                        >
                          <RenderGameLine game={game} key="recent" />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Activity */}
                {user.activity.state !== 'none' && relation !== 'me' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Activity user={user} relation={relation} />
                  </motion.div>
                )}

                {/* Actions */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                  <Actions data={user} relation={relation} />
                </motion.div>

                {/* Detailed Tabs */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                  <Details user={user} relation={relation} />
                </motion.div>
              </div>
            ) : null}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ProfileModal
