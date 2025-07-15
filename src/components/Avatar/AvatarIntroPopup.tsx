'use client'

import type React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Palette, Zap, ShoppingBag } from 'lucide-react'
import { Button } from 'components/UI/Button'
import { createPortal } from 'react-dom'

interface AvatarIntroPopupProps {
  onClose: () => void
}

const AvatarIntroPopup: React.FC<AvatarIntroPopupProps> = ({ onClose }) => {
  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 rounded-2xl border border-blue-500/30 shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
          initial={{ scale: 0.8, y: 50, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.8, y: 50, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <motion.button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X size={20} />
          </motion.button>

          {/* Header with icon */}
          <div className="text-center mb-6">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', damping: 15 }}
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>

            <motion.h2
              className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Avatars 3D
            </motion.h2>

            <motion.div
              className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-300">Nouveauté</span>
            </motion.div>
          </div>

          {/* Main content */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="text-center">
              <p className="text-gray-300 text-lg leading-relaxed mb-4">
                Exprime ta personnalité avec ton{' '}
                <span className="text-blue-400 font-semibold">avatar 3D personnalisé</span> ! Crée un personnage unique
                qui te représente dans toutes tes parties.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 gap-4">
              <motion.div
                className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Palette className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Personnalisation complète</h3>
                  <p className="text-sm text-gray-400">
                    Choisis parmi de nombreuses options : couleurs, styles, accessoires...
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="flex-shrink-0 w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Animations dynamiques</h3>
                  <p className="text-sm text-gray-400">
                    Ton avatar prend vie avec des animations fluides et expressives
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="flex-shrink-0 w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Collection exclusive</h3>
                  <p className="text-sm text-gray-400">
                    Découvre régulièrement de nouveaux skins et animations dans la boutique
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Call to action */}
            <div className="pt-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
                <Button
                  onClick={onClose}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300"
                  size="lg"
                >
                  <motion.span className="flex items-center justify-center gap-2" whileHover={{ scale: 1.05 }}>
                    <Sparkles className="w-5 h-5" />
                    Créer mon avatar
                  </motion.span>
                </Button>
              </motion.div>

              <motion.p
                className="text-center text-xs text-gray-500 mt-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                Tu pourras modifier ton avatar à tout moment depuis ton profil
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>, document.body
  )
}

export default AvatarIntroPopup
