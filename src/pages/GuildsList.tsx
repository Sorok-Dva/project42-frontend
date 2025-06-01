'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { staticStars, parallaxStars, orbitingStations } from 'utils/animations'
import { Search, Trophy, Users, Star, Crown, Calendar, Plus } from 'lucide-react'
import { useUser } from 'contexts/UserContext'
import { useAuth } from 'contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ToastDefaultOptions } from 'utils/toastOptions'
import CreateGuildModal from 'components/Guilds/CreateModal'
import JoinGuildModal from 'components/Guilds/JoinModal'
import { Tooltip } from 'react-tooltip'

interface Guild {
  id: number
  name: string
  tag: string
  description: string
  signature: string
  leader: number
  banner: string
  points: number
  money: number
  createdAt: Date
  members: Array<{
    isOnline: boolean
    id: number
    userId: number
    role: string
    user: {
      id: number
      nickname: string
      avatar: string
      points: number
    }
  }>
}

const GuildsList = () => {
  const { token } = useAuth()
  const { user, reloadUser } = useUser()
  const navigate = useNavigate()

  const [guilds, setGuilds] = useState<Guild[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [canCreateStation, setCanCreateStation] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
  const [joinGuild, setJoinGuild] = useState<Guild | null>(null)

  useEffect(() => {
    const now = new Date()
    if (user?.premium && !user.guildMembership) {
      const premiumDate = new Date(user.premium)
      if (premiumDate.getTime() - now.getTime() > 7 * 24 * 60 * 60 * 1000) {
        if (user.level >= 3) {
          setCanCreateStation(true)
        }
      }
    }
  }, [user])

  useEffect(() => {
    const fetchGuilds = async () => {
      try {
        const response = await axios.get<Guild[]>('/api/guilds/')
        // Trier par points pour le classement
        const sortedGuilds = response.data.sort((a, b) => b.points - a.points)
        setGuilds(sortedGuilds)
      } catch (err: any) {
        console.log('failed to fetch guilds', err)
      } finally {
        setLoading(false)
      }
    }

    fetchGuilds()
  }, [])

  const filteredGuilds = guilds.filter((guild) => {
    const leaderNickname = guild.members.find((m) => guild.leader === m.userId)?.user.nickname || ''
    return (
      guild.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guild.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leaderNickname.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const handleCreateGuild = () => {
    if (!user || !canCreateStation) return
    setIsCreateModalOpen(true)
  }

  const handleJoinGuild = (guild: Guild) => {
    if (!user) return
    setIsJoinModalOpen(true)
    setJoinGuild(guild)
  }

  const handleLeaveGuild = async () => {
    try {
      if (confirm('Voulez vous vraiment quitter votre station ?')) {
        const response = await axios.post(
          '/api/guilds/leave',
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )
        if (response.status === 200) {
          toast.warn('Vous avez bien quitté votre station', ToastDefaultOptions)
          reloadUser(true)
          // Recharger les guildes
          const guildsResponse = await axios.get<Guild[]>('/api/guilds/')
          setGuilds(guildsResponse.data.sort((a, b) => b.points - a.points))
        }
      }
    } catch (err: any) {
      console.log('failed to leave guild', err)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
    case 1:
      return <Crown className="w-8 h-8 text-yellow-400" />
    case 2:
      return <Trophy className="w-8 h-8 text-gray-300" />
    case 3:
      return <Trophy className="w-8 h-8 text-amber-600" />
    default:
      return <div className="w-8 h-8 flex items-center justify-center text-2xl font-bold text-gray-400">#{rank}</div>
    }
  }

  const getRankBorder = (rank: number) => {
    switch (rank) {
    case 1:
      return 'border-l-yellow-400 bg-gradient-to-r from-yellow-400/10 to-transparent'
    case 2:
      return 'border-l-gray-300 bg-gradient-to-r from-gray-300/10 to-transparent'
    case 3:
      return 'border-l-amber-600 bg-gradient-to-r from-amber-600/10 to-transparent'
    default:
      return 'border-l-blue-500 bg-gradient-to-r from-blue-500/5 to-transparent'
    }
  }

  return (
    <motion.div className="relative flex min-h-screen pt-100 flex-col items-center justify-center overflow-hidden bg-black bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black px-4 text-white">
      {/* Fond étoilé statique */}
      <div className="absolute inset-0 z-0">{staticStars}</div>

      {/* Nébuleuses colorées */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(circle at 70% 30%, rgba(111, 66, 193, 0.6), transparent 60%), radial-gradient(circle at 30% 70%, rgba(59, 130, 246, 0.6), transparent 60%), radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.3), transparent 70%)',
          }}
        />
      </div>

      {/* Étoiles avec parallaxe */}
      <div className="absolute inset-0 z-1">{parallaxStars}</div>

      {/* Station spatiale principale */}
      <div className="absolute z-5 h-full flex items-center pointer-events-none" style={{ left: '1%', width: '100%' }}>
        <motion.div
          animate={{
            scale: [1, 1.08, 1.02, 1.08, 1],
            rotate: [0, 2, 0, -2, 0],
            y: [0, -15, 5, -15, 0],
          }}
          transition={{
            duration: 60,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
            times: [0, 0.25, 0.5, 0.75, 1],
          }}
          className="relative"
          style={{ width: '100%', maxWidth: '730px' }}
        >
          <img
            src="/images/station.png"
            alt="Station spatiale principale"
            className="opacity-80"
            style={{ width: '750px' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 mix-blend-overlay rounded-full blur-xl"></div>
        </motion.div>
      </div>

      {/* Stations spatiales en orbite */}
      <div className="absolute h-full flex items-center pointer-events-none" style={{ left: '5%', width: '40%' }}>
        {orbitingStations}
      </div>

      <motion.div
        className="relative z-20 w-full max-w-7xl mx-auto my-8 p-8 md:p-12 bg-black/40 backdrop-blur-md rounded-2xl border border-gray-800/50 shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Header avec titre et recherche */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text mb-2">
              Classement des Stations
            </h1>
            <p className="text-gray-400">Découvrez les stations de Project 42</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher une station..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 w-80"
              />
            </div>

            {!user?.guildMembership && (
              <button
                onClick={handleCreateGuild}
                disabled={!canCreateStation}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  canCreateStation
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
                data-tooltip-content={
                  user!.level < 3 ? 'Vous devez être niveau 3 pour créer une station.' : !canCreateStation ? 'Tu dois posséder minimum 7 jours premium pour créer ta propre station.' : ''
                }
                data-tooltip-id="createGuild"
              >
                <Plus className="w-4 h-4" />
                <span>Créer une station</span>
                <Tooltip id="createGuild" />
              </button>
            )}
          </div>
        </div>

        {/* Message si pas de guilde */}
        {!user?.guildMembership && (
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-6 mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Tu n'as pas encore de station !</h3>
                <p className="text-gray-300">Rejoins-en une existante ou crée la tienne pour commencer l'aventure.</p>
              </div>
            </div>
          </div>
        )}

        {/* Liste des guildes */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
            <span className="ml-3 text-gray-300">Chargement des stations...</span>
          </div>
        ) : filteredGuilds.length > 0 ? (
          <div className="space-y-4">
            {filteredGuilds.map((guild, index) => {
              const rank = index + 1
              const leaderNickname = guild.members.find((m) => guild.leader === m.userId)?.user.nickname || ''
              const isUserGuild = user?.guildMembership?.guild.id === guild.id

              return (
                <motion.div
                  key={guild.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`relative overflow-hidden rounded-xl border-l-4 ${getRankBorder(rank)} backdrop-blur-sm`}
                >
                  {/* Bannière de fond */}
                  <div className="absolute inset-0 opacity-20">
                    <img
                      src={guild.banner || '/img/stations_banner.png'}
                      alt={`Bannière ${guild.name}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
                  </div>

                  <div className="relative p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        {/* Rang */}
                        <div className="flex items-center justify-center w-16">{getRankIcon(rank)}</div>

                        {/* Informations de la guilde */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3
                              className="text-2xl font-bold text-white cursor-pointer hover:text-blue-400 transition-colors"
                              onClick={() => navigate(`/station/${guild.tag}`)}
                            >
                              {guild.name}
                            </h3>
                            <span className="px-2 py-1 bg-blue-600/80 text-blue-100 rounded text-sm font-medium">
                              [{guild.tag.toUpperCase()}]
                            </span>
                            {isUserGuild && (
                              <span className="px-2 py-1 bg-green-600/80 text-green-100 rounded text-sm">
                                Ma station
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-6 text-sm text-gray-300">
                            <div className="flex items-center space-x-2">
                              <Crown className="w-4 h-4 text-yellow-400" />
                              <span className="cursor-pointer hover:text-white" data-profile={leaderNickname}>
                                {leaderNickname}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4" />
                              <span>{guild.members.length} / 50 membres</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4" />
                              <span>Créée le {new Date(guild.createdAt).toLocaleDateString('fr-FR')}</span>
                            </div>
                          </div>

                          {guild.description && <p className="text-gray-400 mt-2 max-w-2xl">{guild.description}</p>}
                        </div>
                      </div>

                      {/* Points et actions */}
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text">
                            {guild.points.toLocaleString()}
                          </div>
                          <div className="text-gray-400 text-sm">points</div>
                        </div>

                        <div className="flex flex-col space-y-2">
                          {!user?.guildMembership && (
                            <button
                              onClick={() => handleJoinGuild(guild)}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                            >
                              Rejoindre
                            </button>
                          )}
                          {isUserGuild && (
                            <>
                              <button
                                onClick={() => navigate(`/station/${guild.tag}`)}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                              >
                                Voir ma station
                              </button>
                              <button
                                onClick={handleLeaveGuild}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                              >
                                Quitter
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Membres preview */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700/50">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">Membres actifs :</span>
                        <div className="flex -space-x-2">
                          {guild.members.slice(0, 5).map((member) => (
                            <div
                              key={member.id}
                              className="w-8 h-8 rounded-full border-2 border-gray-700 overflow-hidden"
                              title={member.user.nickname}
                            >
                              <img
                                src={member.user.avatar || '/placeholder.svg'}
                                alt={member.user.nickname}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                          {guild.members.length > 5 && (
                            <div className="w-8 h-8 rounded-full border-2 border-gray-700 bg-gray-600 flex items-center justify-center text-xs text-white">
                              +{guild.members.length - 5}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span>{guild.points} pts</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>💰</span>
                          <span>{guild.money} crédits</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Aucune station trouvée</h3>
            <p className="text-gray-400">Essayez de modifier votre recherche ou créez votre propre station.</p>
          </div>
        )}

        {/* Pagination ou "Voir plus" */}
        {filteredGuilds.length > 0 && (
          <div className="text-center mt-8">
            <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-colors">
              Voir plus de stations
            </button>
          </div>
        )}
      </motion.div>

      {/* Modales */}
      {isCreateModalOpen && (
        <CreateGuildModal canCreate={canCreateStation} onClose={() => setIsCreateModalOpen(false)} />
      )}

      {isJoinModalOpen && <JoinGuildModal guild={joinGuild} onClose={() => setIsJoinModalOpen(false)} />}
    </motion.div>
  )
}

export default GuildsList
