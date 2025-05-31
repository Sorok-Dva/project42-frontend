'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from 'components/UI/Card'
import { Button } from 'components/UI/Button'
import { Input } from 'components/UI/Input'
import { Badge } from 'components/UI/Badge'
import {
  Search,
  Trophy,
  Medal,
  Award,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Users,
  Target,
  Zap,
  Crown,
  Star,
  Gamepad2,
} from 'lucide-react'
import { Img as Image } from 'react-image'
import { useUser } from 'contexts/UserContext'
import axios from 'axios'
import { useAuth } from 'contexts/AuthContext'

interface Player {
  id: number
  rank: number
  nickname: string
  avatar?: string
  points: number
  gamesPlayed: number
  gamesWon: number
  gamesAbandoned: number
  winRate: number
  abandonRate: number
  level: number
  eloFunRating: number
  eloSeriousRating: number
  title?: string
  guild?: {
    name: string,
    tag: string,
  }
  isOnline: boolean
  lastSeen: string
}

interface LeaderboardResponse {
  players: Player[]
  totalPlayers: number
  currentPage: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
  gamesCount: number
  myRank: number
}

interface SortConfig {
  key: keyof Player
  direction: 'asc' | 'desc'
}

const LeaderboardPage: React.FC = () => {
  const { token } = useAuth()
  const { user } = useUser()
  const [data, setData] = useState<LeaderboardResponse | null>(null)
  const [gamesCount, setGamesCount] = useState(0)
  const [myRank, setMyRank] = useState(0)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'points', direction: 'desc' })
  const itemsPerPage = 20

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const response = await axios.get<LeaderboardResponse>('/api/users/leaderboard', {
          ...(token ? {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          } : {}),
          params: {
            page: currentPage,
            limit: itemsPerPage,
            search,
            sortKey: sortConfig.key,
            sortDir: sortConfig.direction,
          },
        })

        const result = response.data
        setData(result)
        setGamesCount(result.gamesCount)
        setMyRank(result.myRank)
      } catch (error) {
        console.error('Erreur lors du chargement du leaderboard:', error)
        // tu peux ajouter un setError(error) ici si tu gères un état d'erreur
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentPage, search, sortConfig])

  // Handlers
  const handleSort = (key: keyof Player) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
    }))
    setCurrentPage(1)
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  // Get rank icon
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />
    if (rank <= 10) return <Trophy className="w-4 h-4 text-blue-400" />
    return <span className="text-sm font-bold text-gray-400">#{rank}</span>
  }

  // Get rate color
  const getRateColor = (rate: number, isAbandon = false) => {
    if (isAbandon) {
      if (rate >= 20) return 'text-red-400'
      if (rate >= 10) return 'text-orange-400'
      return 'text-green-400'
    } else {
      if (rate >= 80) return 'text-green-400'
      if (rate >= 60) return 'text-blue-400'
      if (rate >= 40) return 'text-yellow-400'
      return 'text-red-400'
    }
  }

  // Sort indicator
  const SortIndicator = ({ column }: { column: keyof Player }) => {
    if (sortConfig.key !== column) return <ChevronUp className="w-4 h-4 text-gray-600" />
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-blue-400" />
    ) : (
      <ChevronDown className="w-4 h-4 text-blue-400" />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 mt-20">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            🏆 Classement de Project 42
          </h1>
          <p className="text-gray-400">Découvrez les meilleurs joueurs de la station Mir</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <Card className="bg-black/30 border-gray-800/50 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{data?.totalPlayers || 0}</div>
              <div className="text-sm text-gray-400">Joueurs Actifs</div>
            </CardContent>
          </Card>
          <Card className="bg-black/30 border-gray-800/50 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Gamepad2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{ gamesCount }</div>
              <div className="text-sm text-gray-400">Parties Jouées</div>
            </CardContent>
          </Card>
          <Card className="bg-black/30 border-gray-800/50 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{ myRank }</div>
              <div className="text-sm text-gray-400">Votre Rang</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Card className="bg-black/30 border-gray-800/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Rechercher un joueur ou une guilde..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 bg-black/30 border-gray-700 text-white placeholder:text-gray-500"
                  />
                </div>
                <div className="text-sm text-gray-400">{data && `${data.totalPlayers} joueurs trouvés`}</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Leaderboard Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-black/30 border-gray-800/50 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                  <span className="ml-2 text-gray-400">Chargement du classement...</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-black/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Rang</th>
                        <th
                          className="px-4 py-3 text-left text-sm font-medium text-gray-300 cursor-pointer hover:text-white transition-colors"
                          onClick={() => handleSort('nickname')}
                        >
                          <div className="flex items-center gap-1">
                          Joueur
                            <SortIndicator column="nickname" />
                          </div>
                        </th>
                        <th
                          className="px-4 py-3 text-left text-sm font-medium text-gray-300 cursor-pointer hover:text-white transition-colors"
                          onClick={() => handleSort('points')}
                        >
                          <div className="flex items-center gap-1">
                          Points
                            <SortIndicator column="points" />
                          </div>
                        </th>
                        <th
                          className="px-4 py-3 text-left text-sm font-medium text-gray-300 cursor-pointer hover:text-white transition-colors"
                          onClick={() => handleSort('level')}
                        >
                          <div className="flex items-center gap-1">
                            Niveau
                            <SortIndicator column="level" />
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Parties</th>
                        <th
                          className="px-4 py-3 text-left text-sm font-medium text-gray-300 cursor-pointer hover:text-white transition-colors"
                          onClick={() => handleSort('gamesWon')}
                        >
                          <div className="flex items-center gap-1">
                          Victoires
                            <SortIndicator column="winRate" />
                          </div>
                        </th>
                        <th
                          className="px-4 py-3 text-left text-sm font-medium text-gray-300 cursor-pointer hover:text-white transition-colors"
                          onClick={() => handleSort('gamesAbandoned')}
                        >
                          <div className="flex items-center gap-1">
                          Abandons
                            <SortIndicator column="abandonRate" />
                          </div>
                        </th>
                        <th
                          className="px-4 py-3 text-left text-sm font-medium text-gray-300 cursor-pointer hover:text-white transition-colors"
                          onClick={() => handleSort('eloFunRating')}
                        >
                          <div className="flex items-center gap-1">
                            Elo Fun
                            <SortIndicator column="eloFunRating" />
                          </div>
                        </th>
                        <th
                          className="px-4 py-3 text-left text-sm font-medium text-gray-300 cursor-pointer hover:text-white transition-colors"
                          onClick={() => handleSort('eloSeriousRating')}
                        >
                          <div className="flex items-center gap-1">
                            Elo Sérieux
                            <SortIndicator column="eloSeriousRating" />
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Guilde</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {data?.players.map((player, index) => (
                          <motion.tr
                            key={player.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.05 }}
                            className={`border-t border-gray-800/50 hover:bg-white/5 transition-colors ${
                              player.id === user?.id
                                ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/50'
                                : ''
                            }`}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {getRankIcon(player.rank)}
                                {player.id === user?.id && (
                                  <Badge
                                    variant="secondary"
                                    className="bg-blue-500/20 text-blue-400 border-blue-500/50"
                                  >
                                  Vous
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <Image
                                  className="w-12 h-12 rounded-full object-cover border-2 border-purple-500/30 cursor-pointer"
                                  src={player.avatar || '/placeholder.svg'}
                                  alt="profile"
                                  data-profile={player.nickname}
                                />
                                <div>
                                  <div className="font-medium sound-tick text-white cursor-pointer" data-profile={player.nickname}>{player.nickname}</div>
                                  {player.title && <div className="text-xs text-gray-400">{player.title}</div>}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <Zap className="w-4 h-4 text-yellow-400" />
                                <span className="font-bold text-white">{player.points.toLocaleString()}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-white">{player.level}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm">
                                <div className="text-white">{player.gamesPlayed}</div>
                                <div className="text-gray-400 text-xs">{player.gamesWon} gagnées</div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className={`font-medium ${getRateColor(player.winRate)}`}>{player.winRate}%</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className={`font-medium ${getRateColor(player.abandonRate, true)}`}>
                                {player.abandonRate}%
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-medium">
                                <Badge variant="outline" className="border-blue-600 bg-blue-500 text-gray-300">
                                  {player.eloFunRating}
                                </Badge>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-medium">
                                <Badge variant="outline" className="border-red-600 bg-red-500 text-gray-300">
                                  {player.eloSeriousRating}
                                </Badge>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {player.guild ? (
                                <Badge variant="outline" className="border-gray-600 bg-green-200 text-gray-300">
                                  {player.guild.name}
                                </Badge>
                              ) : (
                                <span className="text-gray-500 text-sm">Aucune</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <div
                                  className={`w-2 h-2 rounded-full ${player.isOnline ? 'bg-green-400' : 'bg-gray-500'}`}
                                ></div>
                                <span className={`text-xs ${player.isOnline ? 'text-green-400' : 'text-gray-500'}`}>
                                  {player.isOnline ? 'En ligne' : 'Hors ligne'}
                                </span>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6"
          >
            <Card className="bg-black/30 border-gray-800/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    Page {data.currentPage} sur {data.totalPages} ({data.totalPlayers} pilotes)
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={!data.hasPrevPage}
                      className="bg-black/30 border-gray-700 text-white hover:bg-white/10"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Précédent
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                        const pageNum = Math.max(1, Math.min(data.totalPages - 4, data.currentPage - 2)) + i
                        return (
                          <Button
                            key={pageNum}
                            variant={pageNum === data.currentPage ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className={
                              pageNum === data.currentPage
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : 'bg-black/30 border-gray-700 text-white hover:bg-white/10'
                            }
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(data.totalPages, prev + 1))}
                      disabled={!data.hasNextPage}
                      className="bg-black/30 border-gray-700 text-white hover:bg-white/10"
                    >
                      Suivant
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default LeaderboardPage
