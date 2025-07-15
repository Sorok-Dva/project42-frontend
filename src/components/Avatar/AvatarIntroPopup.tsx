'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from 'components/UI/Button'

interface AvatarIntroPopupProps {
  onClose: () => void
}

const AvatarIntroPopup: React.FC<AvatarIntroPopupProps> = ({ onClose }) => {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative bg-gray-900 p-6 rounded-xl border border-blue-500/30 shadow-2xl w-full max-w-md"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
          <h2 className="text-2xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Nouveauté : Avatar 3D
          </h2>
          <p className="text-gray-300 text-center mb-6">
            Crée ton avatar 3D personnalisé pour te représenter dans le jeu !
          </p>
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            C'est parti !
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default AvatarIntroPopup
