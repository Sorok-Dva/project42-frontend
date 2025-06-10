'use client'

import type React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface Ban {
  id: number
  reason: string
  teamComment?: string
  moderatorId: number
  moderator: {
    nickname: string
  }
  expiration: string
  durationHours: string
  pointsLoss: number
  createdAt: string
}

interface BanModalProps {
  ban: Ban
  isOpen: boolean
  onClose: () => void
  onLogout: () => void
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

const BanModal: React.FC<BanModalProps> = ({ ban, isOpen, onLogout }) => {
  const [currentTab, setCurrentTab] = useState<'ban' | 'rules'>('ban')

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatExpiration = (dateString: string) => {
    if (!dateString) return 'Permanent'

    const expirationDate = new Date(dateString)
    const now = new Date()

    // Si la date d'expiration est très loin dans le futur (plus de 10 ans), considérer comme permanent
    if (expirationDate.getTime() - now.getTime() > 315360000000) {
      // ~10 ans en millisecondes
      return 'Permanent'
    }

    return expirationDate.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isPermanent = ban.durationHours.includes('définitif') || !ban.expiration

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
            className="bg-gradient-to-br from-red-900/90 to-red-800/90 backdrop-blur-md rounded-xl border border-red-500/50 shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* En-tête */}
            <div className="bg-gradient-to-r from-red-600/20 to-red-800/20 px-6 py-4 border-b border-red-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  >
                    <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m0 0v2m0-2h2m-2 0H10m8-6H6a2 2 0 01-2-2V6a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2z"
                      />
                    </svg>
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Compte banni</h2>
                    <p className="text-red-200 text-sm">
                      {isPermanent
                        ? 'Votre compte a été banni définitivement'
                        : 'Votre compte a été temporairement banni'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Onglets */}
            <div className="flex border-b border-red-500/30">
              <button
                onClick={() => setCurrentTab('ban')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                  currentTab === 'ban'
                    ? 'bg-red-600/20 text-red-300 border-b-2 border-red-400'
                    : 'text-red-200 hover:text-white hover:bg-red-600/10'
                }`}
              >
                Détails du bannissement
              </button>
              <button
                onClick={() => setCurrentTab('rules')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                  currentTab === 'rules'
                    ? 'bg-red-600/20 text-red-300 border-b-2 border-red-400'
                    : 'text-red-200 hover:text-white hover:bg-red-600/10'
                }`}
              >
                Règles du site
              </button>
            </div>

            {/* Contenu */}
            <div className="p-6 overflow-y-auto max-h-[45vh]">
              <AnimatePresence mode="wait">
                {currentTab === 'ban' ? (
                  <motion.div
                    key="ban"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="bg-black/20 rounded-lg p-4 border border-red-500/20">
                      <h3 className="text-lg font-semibold text-red-300 mb-2">Raison du bannissement</h3>
                      <p className="text-white text-base leading-relaxed">{ban.reason}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black/20 rounded-lg p-4 border border-red-500/20">
                        <h4 className="text-sm font-medium text-red-300 mb-1">Durée</h4>
                        <p className="text-white">{ban.durationHours}</p>
                      </div>
                      <div className="bg-black/20 rounded-lg p-4 border border-red-500/20">
                        <h4 className="text-sm font-medium text-red-300 mb-1">Expiration</h4>
                        <p className="text-white">{formatExpiration(ban.expiration)}</p>
                      </div>
                    </div>

                    <div className="bg-black/20 rounded-lg p-4 border border-red-500/20 mt-4">
                      <h4 className="text-sm font-medium text-red-300 mb-1">Impact sur votre capital comportement</h4>
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                          />
                        </svg>
                        <p className="text-white font-medium">-{ban.pointsLoss} points</p>
                      </div>
                      <p className="text-red-200 text-xs mt-2">
                        Votre capital comportement est affecté par cette sanction. Un capital comportement à 0 signifie bannissement définitif.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black/20 rounded-lg p-4 border border-red-500/20">
                        <h4 className="text-sm font-medium text-red-300 mb-1">Modérateur</h4>
                        <p className="text-white">{ban.moderator.nickname}</p>
                      </div>
                      <div className="bg-black/20 rounded-lg p-4 border border-red-500/20">
                        <h4 className="text-sm font-medium text-red-300 mb-1">Date</h4>
                        <p className="text-white">{formatDate(ban.createdAt)}</p>
                      </div>
                    </div>

                    {ban.teamComment && (
                      <div className="bg-black/20 rounded-lg p-4 border border-red-500/20">
                        <h3 className="text-lg font-semibold text-red-300 mb-2">Commentaire de l'équipe</h3>
                        <p className="text-white text-base leading-relaxed">{ban.teamComment}</p>
                      </div>
                    )}

                    <div className="bg-gradient-to-r from-red-900/20 to-black/20 rounded-lg p-4 border border-red-500/30">
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
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <div>
                          <h4 className="text-red-300 font-medium mb-1">Information</h4>
                          <p className="text-red-200 text-sm">
                            {isPermanent
                              ? 'Ce bannissement est définitif. Si vous pensez qu\'il s\'agit d\'une erreur, vous pouvez contacter l\'équipe de modération via le site web.'
                              : 'Vous pourrez vous reconnecter une fois la période de bannissement terminée. Veuillez respecter les règles du site à l\'avenir pour éviter des sanctions plus sévères.'}
                          </p>
                          <p className="text-red-200 text-sm mt-2">
                            Votre capital comportement a été réduit de {ban.pointsLoss} points. Ce capital se régénère
                            lentement avec le temps si vous respectez les règles.
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
                      <h3 className="text-xl font-bold text-red-300 mb-2">Règles de la communauté</h3>
                      <p className="text-red-200 text-sm">
                        Le non-respect de ces règles peut entraîner des sanctions, y compris le bannissement.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {SITE_RULES.map((rule, index) => (
                        <motion.div
                          key={index}
                          className="bg-black/20 rounded-lg p-4 border border-red-500/20"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <h4 className="text-red-300 font-semibold mb-2 flex items-center gap-2">
                            <span className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </span>
                            {rule.title}
                          </h4>
                          <p className="text-white text-sm leading-relaxed">{rule.description}</p>
                        </motion.div>
                      ))}
                    </div>

                    <div className="bg-gradient-to-r from-gray-900/20 to-gray-800/20 rounded-lg p-4 border border-gray-500/30 mt-6">
                      <div className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <div>
                          <h4 className="text-gray-300 font-medium mb-1">Besoin d'aide ?</h4>
                          <p className="text-gray-200 text-sm">
                            Si vous pensez que cette sanction a été appliquée par erreur, vous pouvez contacter l'équipe
                            de modération via le site web une fois la période de bannissement terminée.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Pied de page */}
            <div className="bg-gradient-to-r from-red-600/10 to-red-800/10 px-6 py-4 border-t border-red-500/30">
              <div className="flex justify-between items-center">
                <p className="text-red-200 text-sm">Bannissement {isPermanent ? 'définitif' : 'temporaire'}.</p>
                <motion.button
                  onClick={onLogout}
                  className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white rounded-lg font-medium transition-all shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Me déconnecter
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default BanModal
