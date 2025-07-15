'use client'

import axios from 'axios'
import type React from 'react'
import { type FC, useEffect, useState } from 'react'
import { useAuth } from 'contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Star,
  Users,
  Calendar,
  Trophy,
  Zap,
  Crown,
  User,
} from 'lucide-react'

import { rolify } from 'utils/rolify'
import AchievementBadge from 'components/Profile/AchievementBadge'
import Actions from './Profile/Actions'
import Details from './Profile/Details'
import Activity from 'components/Profile/Activity'
import { AvatarCanvas } from './Avatar/Animated'
import RenderGameLine from 'components/Profile/RenderGameLine'

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

export interface UserProfile {
  id: number
  nickname: string
  points: number
  level: number
  isPremium: boolean
  title: string
  signature: string
  avatar: string
  avatarAnimation: string
  rpmAvatarId?: string
  rpmUserId?: string
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
  const [user, setUser] = useState<UserProfile | null>(null)
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

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
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
            className="bg-slate-800 border border-red-500/50 rounded-2xl p-8 max-w-md mx-4"
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
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[999] p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleOverlayClick}
      >
        <motion.div
          className="border border-slate-600 rounded-2xl w-2/4 max-h-[90vh] overflow-hidden"
          style={{ backgroundColor: '#1f2b44' }}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-600">
            <h2 className="text-xl font-bold text-white">Profil de {nickname}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-slate-700 rounded"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-60px)]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400">Chargement du profil...</p>
              </div>
            ) : user ? (
              <div className="p-6 space-y-6">
                <div className="flex flex-col md:flex-row items-start md:items-stretch justify-center gap-6 text-left">

                  {/* Section Avatar */}
                  <div className="w-full md:w-1/3 rounded-xl">
                    <motion.div
                      className="rounded-xl mt-2 h-96 overflow-hidden"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      {user.rpmAvatarId ? (
                        <AvatarCanvas
                          avatarUrl={`https://models.readyplayer.me/${user.rpmAvatarId}.glb`}
                          animation={user.avatarAnimation}
                          options={{
                            ctrlMinDist: 2,
                            ctrlMaxDist: 5,
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-400">Avatar 3D non disponible</p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </div>

                  {/* Section Infos Utilisateur */}
                  <div className="w-full md:w-2/3 rounded-xl p-6" style={{ backgroundColor: '#0e1735' }}>
                    <div className="flex flex-col items-center text-center space-y-4">
                      {role && (
                        <div className="left-4" style={{ marginTop: '-7%' }}>
                          <span
                            className="px-3 py-1 rounded-lg text-xs font-bold text-white"
                            style={{ backgroundColor: role.color }}
                          >
                            {role.name}
                          </span>
                        </div>
                      )}

                      <div className="w-32 h-32 rounded-full border-4 border-slate-600 overflow-hidden bg-slate-600">
                        <img
                          src={user.avatar || '/placeholder.svg'}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-center space-x-2">
                          <h1 className="text-2xl font-bold text-white">{user.nickname}</h1>
                          {user.isPremium && <Crown className="w-5 h-5 text-yellow-500" />}
                        </div>
                        <p className="text-blue-400 font-medium">{user.title}</p>
                        <p className="text-gray-400 italic text-sm">« {user.signature || '...'} »</p>
                      </div>

                      <div className="flex items-center justify-center space-x-8 text-sm">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-white">Niveau {user.level}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Trophy className="w-4 h-4 text-green-500" />
                          <span className="text-white">{user.playedGames} parties jouées</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Zap className="w-4 h-4 text-blue-500" />
                          <span className="text-white">{user.points} points</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(user.activity.state)}`}></div>
                        <span>{getStatusText(user.activity.state)}</span>
                      </div>
                      <div className="text-gray-400 text-sm flex items-center space-x-1">
                        <Calendar size={14} />
                        <small>Inscrit le {new Date(user.createdAt).toLocaleDateString('fr-FR')}</small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Favorite Badges */}
                {Object.values(user.achievements.favorites).length > 0 && (
                  <div className="w-2/3 mx-auto rounded-xl p-4" style={{ backgroundColor: '#0e1735' }}>
                    <div className="flex justify-center space-x-2">
                      {Object.values(user.achievements.favorites)
                        .slice(0, 5)
                        .map((achievement, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <AchievementBadge achievement={achievement} isMemory={achievement.memory} aKey="fav" />
                          </motion.div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Recent Games and Guild Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 items items-center gap-4 mx-auto rounded-xl w-3/4">
                  <div className="bg-[#0e1735] rounded-[15px] block h-[124px] mr-[1vh] p-0">
                    <div className="text-center">
                      {user.playedGames === 0 && relation === 'me' ? (
                        <p className="text-gray-400 text-sm py-4">
                          Tu viens seulement de débarquer dans la station Mir.
                          <br />
                          Rejoins vite les autres explorateurs en partie !
                        </p>
                      ) : user.playedGames === 0 ? (
                        <p className="text-gray-400 text-sm py-4">
                          <strong>{user.nickname}</strong> vient seulement de débarquer dans la station Mir.
                          <br />
                          {user.isMale ? 'Il' : 'Elle'} n'a pas encore joué de partie.
                        </p>
                      ) : (
                        <>
                          {/* Barre de répartition des types de parties */}
                          <div className="flex h-[8px] w-full overflow-hidden rounded-t-[15px] mb-0">
                            {user.stats
                              .filter(s => s.type !== 'all')
                              .map((stat: { type: number | 'all'; playedGames: number }) => {
                                const flexValue = Math.round((stat.playedGames / user.playedGames) * 100)
                                return (
                                  <div
                                    key={stat.type}
                                    className={`h-full type-${stat.type}`}
                                    style={{ flex: flexValue }}
                                  ></div>
                                )
                              })}
                          </div>

                          {/* Liste des dernières parties */}
                          <div className="w-full min-h-[100px] mt-[2px] p-0 rounded-none [text-shadow:none]">
                            <ul className="p-0 m-0">
                              {user.summaryHistory.map((game) => (
                                <li key={game.id} className="bg-transparent text-[12px] p-0 w-full m-0">
                                  <RenderGameLine game={game} key="fav" />
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Guild Info */}
                  <div className="rounded-xl p-4" style={{ backgroundColor: '#0e1735' }}>
                    {user.guild ? (
                      <div>
                        <div
                          className={`h-16 rounded-lg mb-3 bg-cover bg-center relative hamlet-banner ${
                            user.guild.border ? `hamlet-border-${user.guild.border}` : ''
                          }`}
                          style={{ backgroundImage: `url(${user.guild.banner ? user.guild.banner : '/img/stations_banner.png'})` }}
                        >
                          <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              [{user.guild.tag}] {user.guild.name}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-blue-400"><img className="h-6" src="/assets/images/icon-capitaine.png" alt="Rôle" />{' '}{user.guild.role}</span>
                          <span className="text-gray-400"><img className="h-6" src="/assets/images/icon-people.png" alt="Membres" /> {user.guild.membersCount}/50</span>
                        </div>
                      </div>
                    ) : relation === 'me' ? (
                      <div>
                        <p>
                          <strong>Tu n’as pas de station spatiale.</strong>{' '}
                          {user.level >= 3 ? (
                            <>
                          Rejoins-en un dès maintenant pour faire de nouvelles rencontres !
                            </>
                          ) : (
                            <>Atteins le niveau 3 pour pouvoir en rejoindre une !</>
                          )}
                        </p>
                        {user.level >= 3 && (
                          <a className="button" href="/stations" target="_blank" rel="noopener noreferrer">
                      Voir les stations spatiales
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">{user.nickname} n'a aucune station.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Activity */}
                {user.activity.state !== 'none' && relation !== 'me' && <Activity user={user} relation={relation} />}

                {/* Actions */}
                <Actions data={user} relation={relation} />

                {/* Details */}
                <Details user={user} relation={relation} />
              </div>
            ) : null}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ProfileModal
