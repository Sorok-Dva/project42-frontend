'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from 'contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from 'components/UI/Button'

interface DoublesModalProps {
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

interface DoubleUser {
  id: number
  nickname: string
}

const DoublesModal: React.FC<DoublesModalProps> = ({ isOpen, onClose, targetUser }) => {
  const { token } = useAuth()
  const authHeaders = token ? { headers: { Authorization: `Bearer ${token}` } } : {}
  const [doubles, setDoubles] = useState<DoubleUser[]>([])

  useEffect(() => {
    if (isOpen) {
      axios
        .get<DoubleUser[]>(`/api/mod/doubles/${targetUser.id}`, authHeaders)
        .then(res => setDoubles(res.data))
        .catch(() => {})
    }
  }, [isOpen, targetUser.id])

  return (
    <AnimatePresence>
      {isOpen && (
        // Overlay
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* Conteneur modal */}
          <motion.div
            className="bg-gradient-to-r from-black/90 to-orange-900/30 backdrop-blur-md rounded-xl border border-orange-500/30 p-6 max-w-md w-full shadow-2xl"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
          >
            {/* En-tête */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Doubles comptes</h2>
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

            {/* Liste */}
            <div className="max-h-[50vh] overflow-auto mb-4">
              {doubles.length > 0 ? (
                <ul className="list-disc ml-5 space-y-1 text-sm text-gray-300">
                  {doubles.map(d => (
                    <li key={d.id}>{d.nickname}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Aucun double compte trouvé.</p>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-4">
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

export default DoublesModal
