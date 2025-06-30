'use client'

import type React from 'react'
import { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import { useAuth } from 'contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from 'components/UI/Button'

interface HistoryModalProps {
  isOpen: boolean
  onClose: () => void
  targetUser: {
    id: number
    nickname: string
    avatar?: string
    sanctionHistory?: {
      type: string
      count: number
    }[]
  }
}

interface HistoryData {
  warnings: {
    reason: string
    playerComment: string
    teamComment: string
    isRead: boolean
    createdAt: Date
    moderator: {
      nickname: string
    }
  }[]
  bans: {
    reason: string
    playerComment: string
    teamComment: string
    expiration: Date
    createdAt: Date
    moderator: {
      nickname: string
    }
  }[]
  notes: {
    note: string
    createdAt: Date
    moderator: {
      nickname: string
    }
  }[]
  nickChanges: { oldNickname: string; newNickname: string; createdAt: Date }[]
  behaviorPoints: number
}

interface MergedHistoryItem {
  type: 'warning' | 'ban' | 'nickChange' | 'note'
  reason?: string
  playerComment?: string,
  teamComment?: string,
  moderator?: string,
  oldNickname?: string
  newNickname?: string
  expiration?: Date
  createdAt: Date
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, targetUser }) => {
  const { token } = useAuth()
  const authHeaders = token ? { headers: { Authorization: `Bearer ${token}` } } : {}
  const [history, setHistory] = useState<HistoryData>({ warnings: [], bans: [], nickChanges: [], notes: [], behaviorPoints: 1000 })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    if (isOpen) {
      axios
        .get<HistoryData>(`/api/mod/history/${targetUser.id}`, authHeaders)
        .then((res) => setHistory(res.data))
        .catch(() => {})
    }
  }, [isOpen, targetUser.id])

  // Merger et trier tous les éléments d'historique par date
  const mergedHistory = useMemo(() => {
    const merged: MergedHistoryItem[] = [
      ...history.warnings.map((w) => ({
        type: 'warning' as const,
        reason: w.reason,
        playerComment: w.playerComment,
        teamComment: w.teamComment,
        moderator: w.moderator.nickname,
        createdAt: new Date(w.createdAt),
      })),
      ...history.bans.map((b) => ({
        type: 'ban' as const,
        reason: b.reason,
        playerComment: b.playerComment,
        teamComment: b.teamComment,
        moderator: b.moderator.nickname,
        expiration: new Date(b.expiration),
        createdAt: new Date(b.createdAt),
      })),
      ...history.notes.map((n) => ({
        type: 'note' as const,
        reason: n.note,
        moderator: n.moderator.nickname,
        createdAt: new Date(n.createdAt),
      })),
      ...history.nickChanges.map((n) => ({
        type: 'nickChange' as const,
        oldNickname: n.oldNickname,
        newNickname: n.newNickname,
        createdAt: new Date(n.createdAt),
      })),
    ]

    return merged.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }, [history])

  // Pagination
  const totalPages = Math.ceil(mergedHistory.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = mergedHistory.slice(startIndex, endIndex)

  const getItemIcon = (type: string) => {
    switch (type) {
    case 'warning':
      return '⚠️'
    case 'ban':
      return '🔨'
    case 'nickChange':
      return '✏️'
    case 'note':
      return '📝'
    default:
      return '📝'
    }
  }

  const getItemColor = (type: string) => {
    switch (type) {
    case 'warning':
      return 'border-yellow-500/30 bg-yellow-900/20'
    case 'ban':
      return 'border-red-500/30 bg-red-900/20'
    case 'nickChange':
      return 'border-blue-500/30 bg-blue-900/20'
    case 'note':
      return 'border-orange-500/30 bg-orange-900/20'
    default:
      return 'border-gray-500/30 bg-gray-900/20'
    }
  }

  const getItemTitle = (type: string) => {
    switch (type) {
    case 'warning':
      return 'Avertissement'
    case 'ban':
      return 'Bannissement'
    case 'nickChange':
      return 'Changement de pseudo'
    case 'note':
      return 'Note de modération'
    default:
      return 'Action'
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        // Fond semi-transparent
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* Conteneur modal */}
          <motion.div
            className="bg-gradient-to-r from-black/90 to-orange-900/30 backdrop-blur-md rounded-xl border border-orange-500/30 p-6 max-w-2xl w-full mx-4 shadow-2xl max-h-[80vh] overflow-hidden"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* En-tête */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Historique des actions</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-gray-400 hover:text-white hover:bg-black/60 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Profil cible */}
            <div className="flex items-center gap-3 mb-6 bg-black/30 p-3 rounded-lg border border-red-500/20">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center overflow-hidden">
                {targetUser.avatar ? (
                  <img
                    src={targetUser.avatar || '/placeholder.svg'}
                    alt={targetUser.nickname}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-bold text-lg">{targetUser.nickname.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">{targetUser.nickname}</h3>
                <p className="text-sm text-red-300">ID: {targetUser.id}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">
                  Total: {mergedHistory.length} action{mergedHistory.length > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-green-400">
                  Points de comportements: {history.behaviorPoints}
                </p>
              </div>
            </div>

            {/* Liste des actions */}
            <div className="space-y-3 mb-6 overflow-y-auto max-h-[40vh]">
              {currentItems.length > 0 ? (
                currentItems.map((item, index) => (
                  <motion.div
                    key={`${item.type}-${startIndex + index}`}
                    className={`p-4 rounded-lg border ${getItemColor(item.type)}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{getItemIcon(item.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h6 className="font-semibold text-white">{getItemTitle(item.type)}</h6>
                          <span className="text-xs text-gray-400">{formatDate(item.createdAt)}</span>
                        </div>

                        {item.type === 'nickChange' ? (
                          <p className="text-sm text-gray-300">
                            <span className="text-red-300">{item.oldNickname}</span>
                            {' → '}
                            <span className="text-green-300">{item.newNickname}</span>
                          </p>
                        ) : (
                          <>
                            <b className="text-sm text-gray-300">{item.reason}</b>
                            {item.teamComment && (
                              <p className="text-sm text-gray-300">Commentaire de l'équipe: {item.teamComment}</p>
                            )}
                            {item.playerComment && (
                              <p className="text-sm text-gray-300">Commentaire du joueur: {item.playerComment}</p>
                            )}
                            {item.expiration && (
                              <p className="text-sm text-red-300">Banni jusqu'au: {item.expiration.toLocaleDateString()} {item.expiration.toLocaleTimeString()}</p>
                            )}
                            {item.moderator && (
                              <p className="text-sm text-orange-300">{getItemTitle(item.type)} émit par <b>{item.moderator}</b></p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📋</div>
                  <p className="text-gray-400">Aucun historique disponible</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mb-6 bg-black/30 p-3 rounded-lg">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-black/40 hover:bg-black/60 text-gray-300 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Précédent
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded transition-all ${
                        page === currentPage
                          ? 'bg-orange-600 text-white'
                          : 'bg-black/40 hover:bg-black/60 text-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-black/40 hover:bg-black/60 text-gray-300 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant →
                </button>
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-end">
              <Button
                variant="secondary"
                onClick={onClose}
                className="px-4 py-2 bg-black/40 hover:bg-black/60 text-gray-300 border border-gray-500/30 rounded-lg transition-all"
              >
                Fermer
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default HistoryModal
