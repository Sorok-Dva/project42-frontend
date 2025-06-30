'use client'

import type React from 'react'
import { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import { useAuth } from 'contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from 'components/UI/Button'
import { toast } from 'react-toastify'
import { ToastDefaultOptions } from 'utils/toastOptions'
import { useParams } from 'react-router-dom'
import { GAME_TYPES, gameTypeColors } from 'components/Game/GamePageContent'
import { ArrowLeft, Eye } from 'lucide-react'

interface StalkEntry {
  id: number
  userId: number
  reason: string
  expirationDate?: string
  createdAt: string
  moderator: {
    nickname: string
  }
  user: {
    nickname: string
    avatar?: string
    email: string
    updatedAt: string
  }
}

interface Game {
  id: number
  playerId: number
  createdAt: string
  room: {
    id: number
    name: string
    type: number
  }
}

interface ChatMessage {
  id: number
  playerId: number
  message: string
  createdAt: string
  room?: {
    id: number
    name: string
  }
}

interface PrivateMessage {
  id: number
  senderId: number
  receiverId: number
  message: string
  createdAt: string
  sender: {
    nickname: string
  }
  receiver: {
    nickname: string
  }
}

interface GuildMessage {
  id: number
  userId: number
  message: string
  createdAt: string
  guild: {
    name: string
  }
}

interface StalkActivity {
  id: number
  userId: number
  activityType: string
  description: string
  metadata?: any
  createdAt: string
}

interface StalkData {
  entry: StalkEntry
  games: Game[]
  tchatMessages: ChatMessage[]
  privateMessages: PrivateMessage[]
  guildMessages: GuildMessage[]
  activities: StalkActivity[]
}

type TabType = 'overview' | 'games' | 'chat' | 'private' | 'guild' | 'activities'

const StalkListDetailPage: React.FC = () => {
  const { id: userId } = useParams<{ id: string }>()
  const { token } = useAuth()
  const authHeaders = token ? { headers: { Authorization: `Bearer ${token}` } } : {}

  const [data, setData] = useState<StalkData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50

  useEffect(() => {
    if (userId) {
      fetchStalkData()
    }
  }, [userId])

  const fetchStalkData = async () => {
    try {
      setLoading(true)
      const response = await axios.get<StalkData>(`/api/mod/stalk/${userId}`, authHeaders)
      setData(response.data)
    } catch (error) {
      toast.error('Erreur lors du chargement des données de surveillance', ToastDefaultOptions)
      console.error('Error fetching stalk data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrage et pagination des données
  const filteredData = useMemo(() => {
    if (!data) return { games: [], tchatMessages: [], privateMessages: [], guildMessages: [], activities: [] }

    const filterBySearch = (items: any[], searchFields: string[]) => {
      if (!searchTerm) return items
      return items.filter((item) =>
        searchFields.some((field) => {
          const value = field.split('.').reduce((obj, key) => obj?.[key], item)
          return value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        }),
      )
    }

    const filterByDate = (items: any[]) => {
      if (!dateFilter) return items
      const filterDate = new Date(dateFilter)
      return items.filter((item) => {
        const itemDate = new Date(item.createdAt)
        return itemDate.toDateString() === filterDate.toDateString()
      })
    }

    const applyFilters = (items: any[], searchFields: string[]) => {
      let filtered = filterBySearch(items, searchFields)
      filtered = filterByDate(filtered)
      return filtered
    }

    return {
      games: applyFilters(data.games, ['room.name', 'room.gameMode', 'status']),
      tchatMessages: applyFilters(data.tchatMessages, ['message', 'room.name']),
      privateMessages: applyFilters(data.privateMessages, ['message', 'sender.nickname', 'receiver.nickname']),
      guildMessages: applyFilters(data.guildMessages, ['message', 'guild.name']),
      activities: applyFilters(data.activities, ['activityType', 'description']),
    }
  }, [data, searchTerm, dateFilter])

  // Pagination
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage

    return {
      games: filteredData.games.slice(startIndex, endIndex),
      tchatMessages: filteredData.tchatMessages.slice(startIndex, endIndex),
      privateMessages: filteredData.privateMessages.slice(startIndex, endIndex),
      guildMessages: filteredData.guildMessages.slice(startIndex, endIndex),
      activities: filteredData.activities.slice(startIndex, endIndex),
    }
  }, [filteredData, currentPage])

  const getTotalPages = (tabType: TabType) => {
    const counts = {
      games: filteredData.games.length,
      chat: filteredData.tchatMessages.length,
      private: filteredData.privateMessages.length,
      guild: filteredData.guildMessages.length,
      activities: filteredData.activities.length,
      overview: 0,
    }
    return Math.ceil(counts[tabType] / itemsPerPage)
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString))
  }

  const getTabIcon = (tab: TabType) => {
    const icons = {
      overview: '📊',
      games: '🎮',
      chat: '💬',
      private: '📩',
      guild: '🏰',
      activities: '📋',
    }
    return icons[tab]
  }

  const getTabCount = (tab: TabType) => {
    if (!data) return 0
    const counts = {
      overview: 0,
      games: data.games.length,
      chat: data.tchatMessages.length,
      private: data.privateMessages.length,
      guild: data.guildMessages.length,
      activities: data.activities.length,
    }
    return counts[tab]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Chargement des données de surveillance...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-white text-xl">Données de surveillance introuvables</p>
          <Button onClick={() => window.history.back() } className="mt-4">
            Retour
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              onClick={() => window.history.back()}
              className="bg-black/40 hover:bg-black/60 text-white border border-purple-500/30"
            >
              ← Retour
            </Button>
            <h1 className="text-3xl font-bold text-white">Surveillance Détaillée</h1>
          </div>

          {/* User Info Card */}
          <div className="bg-gradient-to-r from-black/90 to-purple-900/40 backdrop-blur-md rounded-xl border border-purple-500/30 p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center overflow-hidden">
                {data.entry.user.avatar ? (
                  <img
                    src={data.entry.user.avatar || '/placeholder.svg'}
                    alt={data.entry.user.nickname}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-bold text-2xl text-white">
                    {data.entry.user.nickname.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white">{data.entry.user.nickname}</h2>
                <p className="text-purple-300">ID: {data.entry.userId}</p>
                <p className="text-gray-400 text-sm">Email: {data.entry.user.email}</p>
                <p className="text-gray-400 text-sm">Dernière connexion: {formatDate(data.entry.user.updatedAt)}</p>
              </div>
              <div className="text-right">
                <div className="bg-red-900/30 px-3 py-1 rounded-full border border-red-500/30 mb-2">
                  <span className="text-red-300 text-sm">👁️ Sous surveillance</span>
                </div>
                <p className="text-gray-400 text-sm">Depuis: {formatDate(data.entry.createdAt)}</p>
                <p className="text-gray-400 text-sm">Par: {data.entry.moderator.nickname}</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-black/30 rounded-lg border border-purple-500/20">
              <p className="text-sm text-gray-300">
                <span className="text-purple-300 font-semibold">Raison:</span> {data.entry.reason}
              </p>
              {data.entry.expirationDate && (
                <p className="text-sm text-gray-300 mt-1">
                  <span className="text-purple-300 font-semibold">Expire le:</span>{' '}
                  {formatDate(data.entry.expirationDate)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-black/40 backdrop-blur-md rounded-xl border border-purple-500/30 p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full bg-black/40 border border-purple-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>
            <div>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="bg-black/40 border border-purple-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>
            <Button
              onClick={() => {
                setSearchTerm('')
                setDateFilter('')
                setCurrentPage(1)
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Réinitialiser
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 bg-black/40 backdrop-blur-md rounded-xl border border-purple-500/30 p-2">
            {(['overview', 'games', 'chat', 'private', 'guild', 'activities'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab)
                  setCurrentPage(1)
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab
                    ? 'bg-purple-600 text-white'
                    : 'bg-black/40 text-gray-300 hover:bg-black/60 hover:text-white'
                }`}
              >
                <span>{getTabIcon(tab)}</span>
                <span className="capitalize">
                  {tab === 'overview'
                    ? 'Vue d\'ensemble'
                    : tab === 'games'
                      ? 'Parties'
                      : tab === 'chat'
                        ? 'Chat Public'
                        : tab === 'private'
                          ? 'Messages Privés'
                          : tab === 'guild'
                            ? 'Messages Guilde'
                            : 'Activités'}
                </span>
                {tab !== 'overview' && (
                  <span className="bg-black/40 px-2 py-1 rounded-full text-xs">{getTabCount(tab)}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-gradient-to-r from-black/90 to-purple-900/40 backdrop-blur-md rounded-xl border border-purple-500/30 p-6 min-h-[600px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-black/30 p-4 rounded-lg border border-blue-500/20">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">🎮</span>
                      <h3 className="font-semibold text-white">Parties</h3>
                    </div>
                    <p className="text-3xl font-bold text-blue-400">{data.games.length}</p>
                    <p className="text-sm text-gray-400">Total des parties jouées</p>
                  </div>

                  <div className="bg-black/30 p-4 rounded-lg border border-green-500/20">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">💬</span>
                      <h3 className="font-semibold text-white">Messages Chat</h3>
                    </div>
                    <p className="text-3xl font-bold text-green-400">{data.tchatMessages.length}</p>
                    <p className="text-sm text-gray-400">Messages dans le chat public</p>
                  </div>

                  <div className="bg-black/30 p-4 rounded-lg border border-yellow-500/20">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">📩</span>
                      <h3 className="font-semibold text-white">Messages Privés</h3>
                    </div>
                    <p className="text-3xl font-bold text-yellow-400">{data.privateMessages.length}</p>
                    <p className="text-sm text-gray-400">Messages privés envoyés/reçus</p>
                  </div>

                  <div className="bg-black/30 p-4 rounded-lg border border-purple-500/20">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">🏰</span>
                      <h3 className="font-semibold text-white">Messages Guilde</h3>
                    </div>
                    <p className="text-3xl font-bold text-purple-400">{data.guildMessages.length}</p>
                    <p className="text-sm text-gray-400">Messages dans les guildes</p>
                  </div>

                  <div className="bg-black/30 p-4 rounded-lg border border-red-500/20">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">📋</span>
                      <h3 className="font-semibold text-white">Activités</h3>
                    </div>
                    <p className="text-3xl font-bold text-red-400">{data.activities.length}</p>
                    <p className="text-sm text-gray-400">Activités surveillées</p>
                  </div>

                  <div className="bg-black/30 p-4 rounded-lg border border-orange-500/20">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">⏱️</span>
                      <h3 className="font-semibold text-white">Surveillance</h3>
                    </div>
                    <p className="text-lg font-bold text-orange-400">
                      {Math.ceil(
                        (new Date().getTime() - new Date(data.entry.createdAt).getTime()) / (1000 * 60 * 60 * 24),
                      )}{' '}
                      jours
                    </p>
                    <p className="text-sm text-gray-400">Durée de surveillance</p>
                  </div>
                </div>
              )}

              {activeTab === 'games' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white mb-4">Parties ({filteredData.games.length})</h3>
                  {paginatedData.games.map((game) => (
                    <div key={game.id} className="bg-black/30 p-4 rounded-lg border border-blue-500/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className={gameTypeColors[game.room.type as keyof typeof gameTypeColors]}>
                            [{GAME_TYPES[game.room.type]}]
                          </span>
                          <h4 className="font-semibold text-white">{game.room.name}</h4>
                          <p className="text-sm text-gray-400">Statut: {game.room.status}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-400">{formatDate(game.createdAt)}</p>
                          <button className="text-green-300 hover:text-white mr-2" onClick={() => window.open(`/game/${game.room.id}`)}>
                            <Eye size={18} /> Voir la partie
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'chat' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Messages Chat Public ({filteredData.tchatMessages.length})
                  </h3>
                  {paginatedData.tchatMessages.map((message) => (
                    <div key={message.id} className="bg-black/30 p-4 rounded-lg border border-green-500/20">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-white">{message.message}</p>
                          {message.room && <p className="text-sm text-green-300 mt-1">Partie {message.room.name} ({message.room.id})</p>}
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-sm text-gray-400">{formatDate(message.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'private' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Messages Privés ({filteredData.privateMessages.length})
                  </h3>
                  {paginatedData.privateMessages.map((message) => (
                    <div key={message.id} className="bg-black/30 p-4 rounded-lg border border-yellow-500/20">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-yellow-300 font-semibold">{message.sender.nickname}</span>
                            <span className="text-gray-400">→</span>
                            <span className="text-yellow-300 font-semibold">{message.receiver.nickname}</span>
                          </div>
                          <p className="text-white">{message.message}</p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-sm text-gray-400">{formatDate(message.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'guild' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Messages Guilde ({filteredData.guildMessages.length})
                  </h3>
                  {paginatedData.guildMessages.map((message) => (
                    <div key={message.id} className="bg-black/30 p-4 rounded-lg border border-purple-500/20">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-white">{message.message}</p>
                          <p className="text-sm text-purple-300 mt-1">Guilde: {message.guild.name}</p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-sm text-gray-400">{formatDate(message.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'activities' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Activités Surveillées ({filteredData.activities.length})
                  </h3>
                  {paginatedData.activities.map((activity) => (
                    <div key={activity.id} className="bg-black/30 p-4 rounded-lg border border-red-500/20">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-red-900/30 px-2 py-1 rounded text-red-300 text-sm">
                              {activity.activityType}
                            </span>
                          </div>
                          <p className="text-white">{activity.description}</p>
                          {activity.metadata && (
                            <pre className="text-sm text-gray-400 mt-2 bg-black/40 p-2 rounded overflow-x-auto">
                              {JSON.stringify(activity.metadata, null, 2)}
                            </pre>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-sm text-gray-400">{formatDate(activity.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Pagination */}
          {activeTab !== 'overview' && getTotalPages(activeTab) > 1 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-purple-500/20">
              <div className="text-sm text-gray-400">
                Page {currentPage} sur {getTotalPages(activeTab)}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="bg-black/40 hover:bg-black/60 text-white border border-purple-500/30 disabled:opacity-50"
                >
                  ← Précédent
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(7, getTotalPages(activeTab)) }, (_, i) => {
                    const totalPages = getTotalPages(activeTab)
                    let pageNumber

                    if (totalPages <= 7) {
                      pageNumber = i + 1
                    } else if (currentPage <= 4) {
                      pageNumber = i + 1
                    } else if (currentPage >= totalPages - 3) {
                      pageNumber = totalPages - 6 + i
                    } else {
                      pageNumber = currentPage - 3 + i
                    }

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`w-8 h-8 rounded transition-all ${
                          pageNumber === currentPage
                            ? 'bg-purple-600 text-white'
                            : 'bg-black/40 hover:bg-black/60 text-gray-300'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    )
                  })}
                </div>

                <Button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, getTotalPages(activeTab)))}
                  disabled={currentPage === getTotalPages(activeTab)}
                  className="bg-black/40 hover:bg-black/60 text-white border border-purple-500/30 disabled:opacity-50"
                >
                  Suivant →
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StalkListDetailPage
