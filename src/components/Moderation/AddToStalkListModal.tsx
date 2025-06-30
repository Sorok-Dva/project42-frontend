'use client'

import React, { useEffect } from 'react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from 'components/UI/Button'
import { Textarea } from 'components/UI/Textarea'
import { toast } from 'react-toastify'
import { ToastDefaultOptions } from 'utils/toastOptions'
import { useAuth } from 'contexts/AuthContext'
import axios from 'axios'
import { useUser } from 'contexts/UserContext'

interface StalkListModalProps {
  isOpen: boolean
  onClose: () => void
  targetUser: {
    id: number
    nickname: string
    avatar?: string
  }
}

const StalkListModal: React.FC<StalkListModalProps> = ({ isOpen, onClose, targetUser }) => {
  const { user } = useUser()
  const { token } = useAuth()
  const [reason, setReason] = useState('')
  const [expirationDate, setExpirationDate] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isAlreadyStalked, setIsAlreadyStalked] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const isUserAlreadyStalked = async () => {
      try {
        const res = await axios.get(`/api/mod/isStalked/${targetUser.id}`, {
          headers: {
            Authorization: `Bearer ${ token }`,
          }
        })

        if (res.data.result === 'yes') {
          setIsAlreadyStalked(true)
        }
      } catch {
        setIsAlreadyStalked(false)
      } finally {
        setIsLoading(false)
      }
    }

    isUserAlreadyStalked()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reason.trim()) {
      toast.error('Veuillez fournir une raison pour ajouter ce joueur à la liste de surveillance.', ToastDefaultOptions)
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/mod/stalk/${targetUser.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reason: reason.trim(),
          ...(expirationDate ? { expirationDate } : {}),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`${targetUser.nickname} a été ajouté à la liste de surveillance.`, ToastDefaultOptions)
        setReason('')
        setExpirationDate('')
        onClose()
      } else {
        toast.error(
          data.message || 'Une erreur est survenue lors de l\'ajout à la liste de surveillance.',
          ToastDefaultOptions,
        )
      }
    } catch (error) {
      toast.error('Une erreur est survenue lors de la connexion au serveur.', ToastDefaultOptions)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculer la date minimale (aujourd'hui)
  const today = new Date().toISOString().split('T')[0]

  if (isLoading || !user) return

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-gradient-to-r from-black/90 to-purple-900/40 backdrop-blur-md rounded-xl border border-purple-500/30 p-6 w-25 shadow-2xl"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Liste de surveillance</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-gray-400 hover:text-white hover:bg-black/60 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Explication de la liste de surveillance */}

            <div className="flex items-center gap-3 mb-6 bg-black/30 p-3 rounded-lg border border-purple-500/20">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center overflow-hidden">
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
              <div>
                <h3 className="font-semibold text-white">{targetUser.nickname}</h3>
                <p className="text-sm text-purple-300">ID: {targetUser.id}</p>
              </div>
            </div>

            { !isAlreadyStalked ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-purple-300 mb-1">
                    Raison de la surveillance <span className="text-red-400">*</span>
                  </label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Décrivez pourquoi ce joueur doit être surveillé (comportement suspect, antécédents, etc.)..."
                    className="w-full bg-black/40 border border-purple-500/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 min-h-[100px]"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="expirationDate" className="block text-sm font-medium text-purple-300 mb-1">
                    Date d'expiration (optionnel)
                  </label>
                  <input
                    type="date"
                    id="expirationDate"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    min={today}
                    className="w-full bg-black/40 border border-purple-500/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Si aucune date n'est spécifiée, la surveillance sera permanente jusqu'à suppression manuelle.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-black/40 hover:bg-black/60 text-purple-300 hover:text-white border border-purple-500/30 rounded-lg transition-all"
                    disabled={isSubmitting}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Ajout...
                      </div>
                    ) : (
                      'Ajouter à la surveillance'
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="mb-6 bg-red-900/20 p-4 rounded-lg border border-red-500/20">
                <h3 className="font-semibold text-purple-300 mb-2">Ce joueur est déjà sous surveillance</h3>
                <Button
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all"
                  onClick={() => window.open(`/${user.role === 'Moderator' ? 'moderator' : 'admin'}/users/stalk/${targetUser.id}`, '_blank')}
                >
                  Voir la page de surveillance
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default StalkListModal
