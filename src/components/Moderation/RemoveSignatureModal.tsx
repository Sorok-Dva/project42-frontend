'use client'

import React from 'react'
import axios from 'axios'
import { useAuth } from 'contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from 'components/UI/Button'
import { toast } from 'react-toastify'
import { ToastDefaultOptions } from 'utils/toastOptions'

interface RemoveSignatureModalProps {
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

const RemoveSignatureModal: React.FC<RemoveSignatureModalProps> = ({ isOpen, onClose, targetUser }) => {
  const { token } = useAuth()
  const authHeaders = token ? { headers: { Authorization: `Bearer ${token}` } } : {}

  const handleRemove = async () => {
    try {
      const res = await axios.post('/api/mod/remove-signature', { userId: targetUser.id }, authHeaders)

      if (res.data.success) {
        toast.success(`La signature de ${res.data.nickname} a été supprimée.`, ToastDefaultOptions)
      }
    } catch (error) {
      toast.error('Une erreur est survenue lors de la connexion au serveur.', ToastDefaultOptions)
    }
    onClose()
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
              <h2 className="text-xl font-bold text-white">Supprimer la signature ?</h2>
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

            {/* Message de confirmation */}
            <p className="text-sm text-gray-300 mb-4">
              Voulez-vous vraiment supprimer la signature de ce joueur ?
            </p>

            {/* Footer */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="secondary"
                onClick={onClose}
                className="px-4 py-2 bg-black/40 hover:bg-black/60 text-gray-300 border border-gray-500/30 rounded-lg transition-all"
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleRemove}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white rounded-lg transition-all"
              >
                Confirmer
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default RemoveSignatureModal
