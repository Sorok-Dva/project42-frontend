'use client'

import type React from 'react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from 'components/UI/Button'
import { Textarea } from 'components/UI/Textarea'
import { useUser } from 'contexts/UserContext'
import { toast } from 'react-toastify'
import { ToastDefaultOptions } from 'utils/toastOptions'
import { useAuth } from 'contexts/AuthContext'

interface WarnModalProps {
  isOpen: boolean
  onClose: () => void
  targetUser: {
    id: number
    nickname: string
    avatar?: string
  }
}

const WarnModal: React.FC<WarnModalProps> = ({ isOpen, onClose, targetUser }) => {
  const { token } = useAuth()
  const [reason, setReason] = useState('')
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reason.trim()) {
      toast.error('Veuillez fournir une raison pour l\'avertissement.', ToastDefaultOptions)
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/mod/warn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: targetUser.id,
          reason,
          comment: comment.trim() || 'Aucun commentaire',
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`${targetUser.nickname} a été averti avec succès.`, ToastDefaultOptions)
        setComment('')
        setReason('')
        onClose()
      } else {
        toast.error(data.message || 'Une erreur est survenue lors de l\'envoi de l\'avertissement.', ToastDefaultOptions)
      }
    } catch (error) {
      toast.error('Une erreur est survenue lors de la connexion au serveur.', ToastDefaultOptions)
    } finally {
      setIsSubmitting(false)
    }
  }

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
            className="bg-gradient-to-r from-black/90 to-blue-900/40 backdrop-blur-md rounded-xl border border-blue-500/30 p-6 max-w-md w-full shadow-2xl"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Avertir un joueur</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-gray-400 hover:text-white hover:bg-black/60 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-3 mb-6 bg-black/30 p-3 rounded-lg border border-blue-500/20">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
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
                <p className="text-sm text-blue-300">ID: {targetUser.id}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-blue-300 mb-1">
                  Raison de l'avertissement <span className="text-red-400">*</span>
                </label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Décrivez la raison de l'avertissement..."
                  className="w-full bg-black/40 border border-blue-500/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[100px]"
                  required
                />
              </div>

              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-blue-300 mb-1">
                  Commentaire interne (optionnel)
                </label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Commentaire visible uniquement par les modérateurs..."
                  className="w-full bg-black/40 border border-blue-500/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-black/40 hover:bg-black/60 text-blue-300 hover:text-white border border-blue-500/30 rounded-lg transition-all"
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white rounded-lg transition-all"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Envoi...
                    </div>
                  ) : (
                    'Envoyer l\'avertissement'
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default WarnModal
