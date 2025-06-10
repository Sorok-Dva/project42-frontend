'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from 'components/UI/Button'
import { Textarea } from 'components/UI/Textarea'
import { useUser } from 'contexts/UserContext'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'components/UI/Select'
import * as SelectPrimitive from '@radix-ui/react-select'
import { toast } from 'react-toastify'
import { ToastDefaultOptions } from 'utils/toastOptions'
import { useAuth } from 'contexts/AuthContext'
import axios from 'axios'

interface SanctionStep {
  durationHours: number
  points: number
}

interface SanctionInfo {
  key: string
  label: string
  description: string
  steps: SanctionStep[]
  allowedRoles: number[]
}

interface BanModalProps {
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

const BanModal: React.FC<BanModalProps> = ({ isOpen, onClose, targetUser }) => {
  const { user } = useUser()
  const { token } = useAuth()
  const [selectedSanction, setSelectedSanction] = useState<string>('')
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availableSanctions, setAvailableSanctions] = useState<SanctionInfo[]>([])
  const [currentSanctionInfo, setCurrentSanctionInfo] = useState<{
    step: number
    duration: number
    points: number
    isFirstOffense: boolean
  } | null>(null)

  // Récupère la liste des sanctions autorisées
  useEffect(() => {
    if (!user?.roleId) return
    axios.get('/api/mod/sanctions/list', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setAvailableSanctions(res.data))
      .catch(() => toast.error('Impossible de charger les sanctions.', ToastDefaultOptions))
  }, [user?.roleId, token])

  // Calcule l'étape courante pour l'affichage
  useEffect(() => {
    if (!selectedSanction || !targetUser.sanctionHistory) {
      setCurrentSanctionInfo(null)
      return
    }
    const info = availableSanctions.find(s => s.key === selectedSanction)
    if (!info) {
      setCurrentSanctionInfo(null)
      return
    }
    const history = targetUser.sanctionHistory.find(h => h.type === selectedSanction)
    const count = history ? history.count : 0
    const isFirst = count === 0
    const stepIndex = isFirst && info.steps.length > 1 ? 0 : Math.min(count, info.steps.length - 1)
    const step = info.steps[stepIndex]
    setCurrentSanctionInfo({
      step: stepIndex,
      duration: step.durationHours,
      points: step.points,
      isFirstOffense: isFirst,
    })
  }, [selectedSanction, targetUser.sanctionHistory, availableSanctions])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSanction) {
      toast.error('Veuillez sélectionner un type de sanction.', ToastDefaultOptions)
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/mod/ban', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: targetUser.id,
          sanctionKey: selectedSanction,
          comment: comment.trim() || 'Aucun commentaire'
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.info(data.message, ToastDefaultOptions)
        setComment('')
        setSelectedSanction('')
        onClose()
      } else {
        toast.error(data.message || 'Erreur lors de l’application de la sanction.', ToastDefaultOptions)
      }
    } catch {
      toast.error('Erreur de connexion au serveur.', ToastDefaultOptions)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDuration = (hours: number): string => {
    if (hours >= 24 * 365) {
      const years = Math.floor(hours / (24 * 365))
      return years === 1 ? '1 an' : `${years} ans`
    }
    if (hours >= 24) {
      const days = Math.floor(hours / 24)
      return days === 1 ? '1 jour' : `${days} jours`
    }
    return hours === 1 ? '1 heure' : `${hours} heures`
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
            className="bg-gradient-to-r from-black/90 to-red-900/30 backdrop-blur-md rounded-xl border border-red-500/30 p-6 max-w-md w-full shadow-2xl"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
          >
            {/* En-tête */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Bannir un joueur</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-gray-400 hover:text-white hover:bg-black/60 transition-colors">
                ✕
              </button>
            </div>

            {/* Profil cible */}
            <div className="flex items-center gap-3 mb-6 bg-black/30 p-3 rounded-lg border border-red-500/20">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center overflow-hidden">
                {targetUser.avatar ? (
                  <img src={targetUser.avatar} alt={targetUser.nickname} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold text-lg">{targetUser.nickname.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-white">{targetUser.nickname}</h3>
                <p className="text-sm text-red-300">ID: {targetUser.id}</p>
              </div>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Sélecteur de sanction */}
              <div>
                <label className="block text-sm font-medium text-red-300 mb-1">
                  Type de sanction <span className="text-red-400">*</span>
                </label>
                <Select value={selectedSanction} onValueChange={setSelectedSanction}>
                  <SelectTrigger className="w-full bg-black/40 border border-red-500/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50">
                    <SelectValue placeholder="Sélectionnez un type de sanction" />
                  </SelectTrigger>
                  <SelectPrimitive.Content position="popper" side="bottom" align="start" sideOffset={8} className="relative bg-black/90 border border-red-500/30 text-white">
                    <SelectPrimitive.Viewport>
                      {availableSanctions.map(s => (
                        <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
                      ))}
                    </SelectPrimitive.Viewport>
                  </SelectPrimitive.Content>
                </Select>
              </div>

              {/* Détails de la sanction choisie */}
              {selectedSanction && (
                <div className="bg-black/30 p-3 rounded-lg border border-red-500/20">
                  <h4 className="font-medium text-white mb-1">
                    {availableSanctions.find(s => s.key === selectedSanction)?.label}
                  </h4>
                  <p className="text-sm text-gray-300 mb-2">
                    {availableSanctions.find(s => s.key === selectedSanction)?.description}
                  </p>
                  {currentSanctionInfo && (
                    <div className="mt-3 pt-3 border-t border-red-500/20 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-300">Récidive :</span>
                        <span className="text-sm font-medium text-white">
                          {currentSanctionInfo.isFirstOffense ? '1ère' : `${currentSanctionInfo.step + 1}ème`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-300">Durée :</span>
                        <span className="text-sm font-medium text-white">
                          {formatDuration(currentSanctionInfo.duration)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-300">Points :</span>
                        <span className="text-sm font-medium text-white">-{currentSanctionInfo.points}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Commentaire interne */}
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-red-300 mb-1">
                  Commentaire interne (optionnel)
                </label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Visible uniquement par les modérateurs..."
                  className="w-full bg-black/40 border border-red-500/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 bg-black/40 hover:bg-black/60 text-gray-300 border border-gray-500/30 rounded-lg">
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting || !selectedSanction} className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg hover:from-red-700 hover:to-red-900">
                  {isSubmitting
                    ? <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Envoi…
                    </div>
                    : 'Appliquer la sanction'}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default BanModal
