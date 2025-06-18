'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Bug, AlertTriangle } from 'lucide-react'
import { useAuth } from 'contexts/AuthContext'

interface BugReportModalProps {
  isOpen: boolean
  onClose: () => void
  gameId?: string
  userId?: number
  username?: string
}

const BUG_TYPES = [
  { id: 'gameplay', label: 'Fonctionnalité de jeu', description: 'Règles du jeu, mécaniques qui ne fonctionnent pas correctement' },
  {
    id: 'interface',
    label: 'Interface utilisateur',
    description: 'Boutons qui ne fonctionnent pas, affichage incorrect',
  },
  { id: 'chat', label: 'Système de chat', description: 'Messages non envoyés, problèmes de modération' },
  { id: 'connection', label: 'Problème de connexion', description: 'Déconnexions, lag, synchronisation' },
  { id: 'audio', label: 'Audio/Musique', description: 'Son qui ne fonctionne pas, volume' },
  { id: 'visual', label: 'Problème visuel', description: 'Affichage cassé, animations incorrectes' },
  { id: 'performance', label: 'Performance', description: 'Lenteur, freeze, crash' },
  { id: 'other', label: 'Autre', description: 'Autre type de problème technique' },
]

export default function BugReportModal({ isOpen, onClose, gameId,  userId, username }: BugReportModalProps) {
  const { token } = useAuth()
  const [selectedBugType, setSelectedBugType] = useState<string>('')
  const [comment, setComment] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const handleSubmit = async () => {
    if (!selectedBugType || !comment.trim()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/games/room/${gameId}/report-bug`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bugType: selectedBugType,
          description: comment.trim(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      })

      if (response.ok) {
        setSubmitSuccess(true)
        setTimeout(() => {
          handleClose()
        }, 5000)
      } else {
        throw new Error('Erreur lors de l\'envoi')
      }
    } catch (error) {
      console.error('Erreur lors du signalement:', error)
      alert('Erreur lors de l\'envoi du rapport. Veuillez réessayer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setSelectedBugType('')
    setComment('')
    setSubmitSuccess(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          className="bg-gradient-to-br from-gray-900/95 to-blue-900/95 backdrop-blur-md rounded-xl border border-blue-500/30 p-6 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                <Bug className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Signaler un bug</h2>
                <p className="text-sm text-gray-400">Partie #{gameId}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 bg-gray-700/50 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {submitSuccess ? (
            <motion.div className="text-center py-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Rapport envoyé !</h3>
              <p className="text-gray-300">Merci pour votre signalement. Notre équipe va examiner le problème.</p>
            </motion.div>
          ) : (
            <>
              {/* Avertissement */}
              <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-yellow-200 mb-2">⚠️ Utilisation responsable</h3>
                    <p className="text-yellow-100 text-sm leading-relaxed">
                      Cet outil est destiné uniquement au signalement de <strong>bugs techniques</strong>. Ne l'utilisez
                      pas pour des réclamations de gameplay, des disputes entre joueurs, ou des demandes d'assistance
                      générale. Tout abus de cet outil sera sanctionné.
                    </p>
                  </div>
                </div>
              </div>

              {/* Type de bug */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Type de problème <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {BUG_TYPES.map((bugType) => (
                    <motion.button
                      key={bugType.id}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        selectedBugType === bugType.id
                          ? 'bg-blue-600/30 border-blue-500 text-white'
                          : 'bg-gray-800/50 border-gray-600/50 text-gray-300 hover:bg-gray-700/50 hover:border-gray-500'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedBugType(bugType.id)}
                    >
                      <div className="font-medium text-sm">{bugType.label}</div>
                      <div className="text-xs text-gray-400 mt-1">{bugType.description}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Commentaire */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description détaillée <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Décrivez précisément le problème rencontré, les étapes pour le reproduire, et tout autre détail utile..."
                  className="w-full h-32 bg-gray-800/50 border border-gray-600/50 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none"
                  maxLength={1000}
                />
                <div className="text-xs text-gray-400 mt-1 text-right">{comment.length}/1000 caractères</div>
              </div>

              {/* Informations automatiques */}
              <div className="bg-gray-800/30 rounded-lg p-3 mb-6">
                <h4 className="text-sm font-medium text-gray-300 mb-2">
                  Informations techniques (ajoutées automatiquement)
                </h4>
                <div className="text-xs text-gray-400 space-y-1">
                  <div>• URL de la partie: {window.location.href}</div>
                  <div>• Navigateur: {navigator.userAgent.split(' ').slice(-2).join(' ')}</div>
                  <div>• Horodatage: {new Date().toLocaleString('fr-FR')}</div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-3 justify-end">
                <motion.button
                  className="px-4 py-2 bg-gray-600/50 hover:bg-gray-600/70 text-gray-300 rounded-lg transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Annuler
                </motion.button>
                <motion.button
                  className={`px-6 py-2 rounded-lg transition-all flex items-center gap-2 ${
                    selectedBugType && comment.trim() && !isSubmitting
                      ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white'
                      : 'bg-gray-600/30 text-gray-500 cursor-not-allowed'
                  }`}
                  whileHover={selectedBugType && comment.trim() && !isSubmitting ? { scale: 1.02 } : {}}
                  whileTap={selectedBugType && comment.trim() && !isSubmitting ? { scale: 0.98 } : {}}
                  onClick={handleSubmit}
                  disabled={!selectedBugType || !comment.trim() || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
                      />
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Bug className="w-4 h-4" />
                      Envoyer le rapport
                    </>
                  )}
                </motion.button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
