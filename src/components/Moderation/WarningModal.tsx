'use client'

import type React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface Warning {
  id: number
  reason: string
  teamComment?: string
  moderatorId: string
  moderator: {
    nickname: string
  }
  createdAt: string
  isRead: boolean
}

interface WarningModalProps {
  warning: Warning
  isOpen: boolean
  onClose: () => void
}

const SITE_RULES = [
  {
    title: 'Respect et courtoisie',
    description:
      'Traitez tous les joueurs avec respect. Les insultes, le harcèlement et les comportements toxiques ne sont pas tolérés.',
  },
  {
    title: 'Langage approprié',
    description: 'Évitez le langage vulgaire, les propos discriminatoires, racistes, sexistes ou homophobes.',
  },
  {
    title: 'Fair-play',
    description: 'Jouez dans l\'esprit du jeu. L\'anti-jeu, la triche et l\'exploitation de bugs sont interdits.',
  },
  {
    title: 'Pseudonyme adapté',
    description: 'Votre pseudonyme doit être approprié et ne pas contenir de contenu offensant.',
  },
  {
    title: 'Un seul compte',
    description: 'Chaque joueur ne peut posséder qu\'un seul compte. Les multi-comptes sont interdits.',
  },
  {
    title: 'Confidentialité',
    description: 'Ne partagez jamais d\'informations personnelles d\'autres joueurs sans leur consentement.',
  },
]

const WarningModal: React.FC<WarningModalProps> = ({ warning, isOpen, onClose }) => {
  const [currentTab, setCurrentTab] = useState<'warning' | 'rules'>('warning')

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gradient-to-br from-yellow-900/90 to-orange-900/90 backdrop-blur-md rounded-xl border border-yellow-500/50 shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* En-tête */}
            <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 px-6 py-4 border-b border-yellow-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  >
                    <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Avertissement reçu</h2>
                    <p className="text-yellow-200 text-sm">Veuillez prendre connaissance de cet avertissement</p>
                    <p className="text-yellow-200 text-sm">Cet avertissement n'engendre aucun retrait de point de comportement</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-gray-400 hover:text-white hover:bg-black/60 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Onglets */}
            <div className="flex border-b border-yellow-500/30">
              <button
                onClick={() => setCurrentTab('warning')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                  currentTab === 'warning'
                    ? 'bg-yellow-600/20 text-yellow-300 border-b-2 border-yellow-400'
                    : 'text-yellow-200 hover:text-white hover:bg-yellow-600/10'
                }`}
              >
                Détails de l'avertissement
              </button>
              <button
                onClick={() => setCurrentTab('rules')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                  currentTab === 'rules'
                    ? 'bg-yellow-600/20 text-yellow-300 border-b-2 border-yellow-400'
                    : 'text-yellow-200 hover:text-white hover:bg-yellow-600/10'
                }`}
              >
                Règles du site
              </button>
            </div>

            {/* Contenu */}
            <div className="p-6 overflow-y-auto max-h-96">
              <AnimatePresence mode="wait">
                {currentTab === 'warning' ? (
                  <motion.div
                    key="warning"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="bg-black/20 rounded-lg p-4 border border-yellow-500/20">
                      <h3 className="text-lg font-semibold text-yellow-300 mb-2">Raison de l'avertissement</h3>
                      <p className="text-white text-base leading-relaxed">{warning.reason}</p>
                    </div>

                    {warning.teamComment && (
                      <div className="bg-black/20 rounded-lg p-4 border border-yellow-500/20">
                        <h3 className="text-lg font-semibold text-yellow-300 mb-2">Commentaire du modérateur</h3>
                        <p className="text-white text-base leading-relaxed">{warning.teamComment}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black/20 rounded-lg p-4 border border-yellow-500/20">
                        <h4 className="text-sm font-medium text-yellow-300 mb-1">Modérateur</h4>
                        <p className="text-white">{warning.moderator.nickname}</p>
                      </div>
                      <div className="bg-black/20 rounded-lg p-4 border border-yellow-500/20">
                        <h4 className="text-sm font-medium text-yellow-300 mb-1">Date</h4>
                        <p className="text-white">{formatDate(warning.createdAt)}</p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 rounded-lg p-4 border border-red-500/30">
                      <div className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                          />
                        </svg>
                        <div>
                          <h4 className="text-red-300 font-medium mb-1">Important</h4>
                          <p className="text-red-200 text-sm">
                            Les avertissements répétés peuvent conduire à des sanctions plus sévères, incluant des
                            bannissements temporaires ou définitifs. Veuillez respecter les règles du site pour
                            maintenir une communauté agréable pour tous.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="rules"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-yellow-300 mb-2">Règles de la communauté</h3>
                      <p className="text-yellow-200 text-sm">
                        Respecter ces règles garantit une expérience de jeu agréable pour tous les joueurs.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {SITE_RULES.map((rule, index) => (
                        <motion.div
                          key={index}
                          className="bg-black/20 rounded-lg p-4 border border-yellow-500/20"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <h4 className="text-yellow-300 font-semibold mb-2 flex items-center gap-2">
                            <span className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </span>
                            {rule.title}
                          </h4>
                          <p className="text-white text-sm leading-relaxed">{rule.description}</p>
                        </motion.div>
                      ))}
                    </div>

                    <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-4 border border-blue-500/30 mt-6">
                      <div className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <div>
                          <h4 className="text-blue-300 font-medium mb-1">Besoin d'aide ?</h4>
                          <p className="text-blue-200 text-sm">
                            Si vous avez des questions sur les règles ou si vous pensez qu'une sanction a été appliquée
                            par erreur, vous pouvez contacter l'équipe de modération via le système de tickets.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Pied de page */}
            <div className="bg-gradient-to-r from-yellow-600/10 to-orange-600/10 px-6 py-4 border-t border-yellow-500/30">
              <div className="flex justify-between items-end">
                <p className="text-yellow-200 text-sm"></p>
                <motion.button
                  onClick={onClose}
                  className="px-6 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-lg font-medium transition-all shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  J'ai compris
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default WarningModal
