'use client'

import type React from 'react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from 'components/UI/Button'

interface KickPlayerModalProps {
  isOpen: boolean
  onClose: () => void
  playerName: string
  onConfirm: (reason: string, isPermanent: boolean) => void
}

const KICK_REASONS = [
  'AFK / Inactif',
  'Abandon de partie',
  'Comportement toxique',
  'Insultes / Langage inapproprié',
  'Anti-jeu',
  'Triche suspectée',
  'Spam',
  'Hors-sujet répété',
  'Non-respect des règles',
  'Perturbation de la partie',
  'Connexion instable',
  'Demande du joueur',
  'Erreur de rejoindre',
  'Multi-compte suspecté',
  'Autre',
]

const KickPlayerModal: React.FC<KickPlayerModalProps> = ({ isOpen, onClose, playerName, onConfirm }) => {
  const [selectedReason, setSelectedReason] = useState('')
  const [customReason, setCustomReason] = useState('')
  const [isPermanent, setIsPermanent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    const reason = selectedReason === 'Autre' ? customReason : selectedReason

    if (!reason.trim()) {
      return
    }

    setIsSubmitting(true)

    try {
      await onConfirm(reason, isPermanent)
      handleClose()
    } catch (error) {
      console.error('Erreur lors du kick:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setSelectedReason('')
    setCustomReason('')
    setIsPermanent(false)
    setIsSubmitting(false)
    onClose()
  }

  const isValid = selectedReason && (selectedReason !== 'Autre' || customReason.trim())

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="bg-gradient-to-r from-black/90 to-red-900/40 backdrop-blur-md rounded-xl border border-red-500/30 p-6 max-w-md w-full mx-4 shadow-2xl"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* En-tête */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Expulser un joueur</h2>
                  <p className="text-red-200 text-sm">Cette action ne peut pas être annulée</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-gray-400 hover:text-white hover:bg-black/60 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Joueur ciblé */}
            <div className="bg-black/30 p-3 rounded-lg border border-red-500/20 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center">
                  <span className="font-bold text-white">{playerName.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white">{playerName}</h3>
                  <p className="text-sm text-red-300">Sera expulsé de la partie</p>
                </div>
              </div>
            </div>

            {/* Formulaire */}
            <div className="space-y-4">
              {/* Motif */}
              <div>
                <label className="block text-sm font-medium text-red-300 mb-2">
                  Motif de l'expulsion <span className="text-red-400">*</span>
                </label>
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-full bg-black/40 border border-red-500/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  required
                >
                  <option value="">Sélectionnez un motif...</option>
                  {KICK_REASONS.map((reason) => (
                    <option key={reason} value={reason} className="bg-gray-800">
                      {reason}
                    </option>
                  ))}
                </select>
              </div>

              {/* Motif personnalisé */}
              {selectedReason === 'Autre' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm font-medium text-red-300 mb-2">
                    Précisez le motif <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Décrivez le motif de l'expulsion..."
                    className="w-full bg-black/40 border border-red-500/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 min-h-[80px] resize-none"
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-400 mt-1">{customReason.length}/200 caractères</p>
                </motion.div>
              )}

              {/* Switch kick permanent */}
              <div className="bg-black/20 p-4 rounded-lg border border-red-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Expulsion permanente</h4>
                    <p className="text-sm text-red-200">Le joueur ne pourra plus rejoindre cette partie</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPermanent(!isPermanent)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isPermanent ? 'bg-red-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isPermanent ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                {isPermanent && !isPermanent && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 p-3 bg-red-900/20 rounded-lg border border-red-500/30"
                  >
                    <div className="flex items-start gap-2">
                      <svg
                        className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                      <p className="text-xs text-red-300">
                        <strong>Attention :</strong> Cette action ajoutera le joueur à votre liste noire permanente. Il
                        ne pourra plus rejoindre aucune de vos parties futures.
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-end gap-3 pt-6">
              <Button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 bg-black/40 hover:bg-black/60 text-gray-300 hover:text-white border border-gray-500/30 rounded-lg transition-all"
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!isValid || isSubmitting}
                className={`px-4 py-2 rounded-lg transition-all font-medium ${
                  isPermanent
                    ? 'bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 text-white'
                    : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Expulsion...
                  </div>
                ) : (
                  <>{isPermanent ? 'Expulser définitivement' : 'Expulser de la partie'}</>
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default KickPlayerModal
