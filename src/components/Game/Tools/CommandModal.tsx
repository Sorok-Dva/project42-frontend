'use client'
import React, { useEffect } from 'react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from 'components/UI/Button'
import axios from 'axios'
import type { RoomCard } from 'hooks/useGame'

interface CommandModalProps {
  isOpen: boolean
  roomId: number
  onClose: () => void
  type: string
  playerName?: string
  onSubmit: (params: any) => void
}

const TIMER_COMMANDS = [
  { command: 'addTimer', label: 'Ajouter du temps', icon: '➕', color: 'from-green-600 to-green-800' },
  { command: 'setTimer', label: 'Définir le temps', icon: '⏰', color: 'from-blue-600 to-blue-800' },
  { command: 'removeTimer', label: 'Retirer du temps', icon: '➖', color: 'from-red-600 to-red-800' },
]

const PHASE_OPTIONS = [
  { id: 90, name: 'Victoire Aliens', description: 'Forcer la victoire des Aliens' },
  { id: 91, name: 'Victoire Station', description: 'Forcer la victoire de la Station' },
  { id: 92, name: 'Victoire Couple', description: 'Forcer la victoire du Couple' },
  { id: 93, name: 'Victoire Alien Solitaire', description: 'Forcer la victoire de l\'Alien Solitaire' },
  { id: 94, name: 'Victoire Maître des Ondes', description: 'Forcer la victoire du Maître des Ondes' },
  { id: 95, name: 'Victoire Ange', description: 'Forcer la victoire de l\'Ange' },
  { id: 99, name: 'Aucune Victoire', description: 'Terminer sans vainqueur' },
]

const CommandModal: React.FC<CommandModalProps> = ({ isOpen, roomId, onClose, type, playerName, onSubmit }) => {
  const [params, setParams] = useState<any>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cards, setCards] = useState<Record<number, RoomCard>>({})

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await axios.get(`/api/games/room/${roomId}/cards`)
        setCards(response.data.roomCards)
      } catch (e: any) {
        console.error('Erreur lors de la récupération des cards :', e)
      }
    }
    fetchCards()
  }, [roomId])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await onSubmit(params)
      handleClose()
    } catch (error) {
      console.error('Erreur lors de l\'exécution de la commande:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setParams({})
    setIsSubmitting(false)
    onClose()
  }

  const renderContent = () => {
    switch (type) {
    case 'message':
      return (
        <>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">💬</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Message privé</h3>
              <p className="text-blue-200 text-sm">Envoyer un message à {playerName}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-300 mb-2">
                Message <span className="text-red-400">*</span>
            </label>
            <textarea
              value={params.message || ''}
              onChange={(e) => setParams({ ...params, message: e.target.value })}
              placeholder="Tapez votre message..."
              className="w-full bg-black/40 border border-blue-500/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[100px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-gray-400 mt-1">{(params.message || '').length}/500 caractères</p>
          </div>
        </>
      )

    case 'nick':
      return (
        <>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">✒️</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Renommer un joueur</h3>
              <p className="text-blue-200 text-sm">Renommer {playerName}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-300 mb-2">
                Nouveau pseudo <span className="text-red-400">*</span>
            </label>
            <input
              value={params.message || ''}
              onChange={(e) => setParams({ ...params, message: e.target.value })}
              placeholder="Nouveau pseudo"
              className="bg-black/40 border border-blue-500/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              maxLength={15}
            />
          </div>
        </>
      )

    case 'mute':
      return (
        <>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">🔇</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Mute un joueur</h3>
              <p className="text-orange-200 text-sm">Empêcher {playerName} de parler</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-orange-300 mb-2">
                Raison du mute <span className="text-red-400">*</span>
            </label>
            <textarea
              value={params.reason || ''}
              onChange={(e) => setParams({ ...params, reason: e.target.value })}
              placeholder="Raison du mute..."
              className="w-full bg-black/40 border border-orange-500/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 min-h-[80px] resize-none"
              maxLength={200}
            />
            <p className="text-xs text-gray-400 mt-1">{(params.reason || '').length}/200 caractères</p>
          </div>
        </>
      )

    case 'card':
      return (
        <>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">🃏</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Assigner une carte</h3>
              <p className="text-purple-200 text-sm">Donner un rôle à {playerName}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-300 mb-2">
                Carte à assigner <span className="text-red-400">*</span>
            </label>
            <select
              value={params.cardId || ''}
              onChange={(e) => setParams({ ...params, cardId: e.target.value })}
              className="w-full bg-black/40 border border-purple-500/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <option value="">Sélectionnez une carte...</option>
              {Object.entries(cards).map((card) => (
                <option key={card[0]} value={card[0]} className="bg-gray-800">
                  {card[1].card.name} (ID: {card[0]})
                </option>
              ))}
            </select>
          </div>
        </>
      )

    case 'timer':
      return (
        <>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">⏰</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Gestion du timer</h3>
              <p className="text-blue-200 text-sm">Modifier le temps de la partie</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-blue-300 mb-2">
                  Type d'action <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-1 gap-2">
                {TIMER_COMMANDS.map((cmd) => (
                  <button
                    key={cmd.command}
                    onClick={() => setParams({ ...params, command: cmd.command })}
                    className={`p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                      params.command === cmd.command
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-gray-500/30 bg-black/20 hover:bg-black/40'
                    }`}
                  >
                    <span className="text-lg">{cmd.icon}</span>
                    <span className="text-white font-medium">{cmd.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-300 mb-2">
                  Nombre de minutes <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={params.minutes || ''}
                onChange={(e) => setParams({ ...params, minutes: e.target.value })}
                placeholder="Nombre de minutes..."
                className="w-full bg-black/40 border border-blue-500/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>
        </>
      )

    case 'stop':
      return (
        <>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">⏹️</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Arrêter une phase</h3>
              <p className="text-red-200 text-sm">Forcer l'arrêt d'une phase spécifique</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-red-300 mb-2">
                Type de victoire <span className="text-red-400">*</span>
            </label>
            <select
              value={params.phase || ''}
              onChange={(e) => setParams({ ...params, phase: e.target.value })}
              className="w-full bg-black/40 border border-red-500/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
            >
              <option value="">Sélectionnez un type de victoire...</option>
              {PHASE_OPTIONS.map((phase) => (
                <option key={phase.id} value={phase.id} className="bg-gray-800">
                  {phase.name} - {phase.description}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-2">
                Sélectionnez le type de victoire à forcer pour terminer la partie
            </p>
          </div>
        </>
      )

    default:
      return null
    }
  }

  const isValid = () => {
    switch (type) {
    case 'message':
      return params.message?.trim()
    case 'mute':
      return params.reason?.trim()
    case 'nick':
      return params.message?.trim()
    case 'card':
      return params.cardId
    case 'timer':
      return params.command && params.minutes && Number(params.minutes) > 0
    case 'stop':
      return params.phase && PHASE_OPTIONS.some((p) => p.id === Number(params.phase))
    default:
      return false
    }
  }

  const getModalColor = () => {
    switch (type) {
    case 'message':
      return 'to-blue-900/40'
    case 'mute':
      return 'to-orange-900/40'
    case 'card':
      return 'to-purple-900/40'
    case 'timer':
      return 'to-blue-900/40'
    case 'stop':
      return 'to-red-900/40'
    case 'nick':
      return 'to-blue-400/40'
    default:
      return 'to-gray-900/40'
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
          onClick={handleClose}
        >
          <motion.div
            className={`bg-gradient-to-r from-black/90 ${getModalColor()} backdrop-blur-md rounded-xl border border-gray-500/30 p-6 max-w-md w-full mx-4 shadow-2xl`}
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Bouton fermer */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-gray-400 hover:text-white hover:bg-black/60 transition-colors"
            >
              ✕
            </button>

            {/* Contenu */}
            <div className="pr-8">{renderContent()}</div>

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
                disabled={!isValid() || isSubmitting}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Exécution...
                  </div>
                ) : (
                  'Exécuter'
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CommandModal
