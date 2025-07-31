'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'

interface LoadingScreenProps {
  onLoadingComplete?: () => void
  message?: string
  duration?: number
  showProgress?: boolean
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Initialisation du système...',
}) => {
  const [currentMessage] = useState(message)
  const controls = useAnimation()

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Fond étoilé */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 100 }).map((_, i) => {
            const size = Math.random() * 3 + 1
            return (
              <div
                key={`star-${i}`}
                className="absolute rounded-full"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  backgroundColor: '#ffffff',
                  opacity: Math.random() * 0.8 + 0.2,
                  animation: `twinkle ${Math.random() * 5 + 3}s infinite ${Math.random() * 5}s`,
                }}
              />
            )
          })}
        </div>

        {/* Nébuleuses colorées */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background:
                'radial-gradient(circle at 70% 30%, rgba(111, 66, 193, 0.6), transparent 60%), radial-gradient(circle at 30% 70%, rgba(59, 130, 246, 0.6), transparent 60%), radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.3), transparent 70%)',
            }}
          />
        </div>

        {/* Conteneur principal */}
        <motion.div className="relative z-10 flex flex-col items-center justify-center" animate={controls}>
          {/* Cercle central avec animation */}
          <div className="relative mb-12">
            {/* Cercle central */}
            <motion.div
              className="relative w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center"
              animate={{
                boxShadow: [
                  '0 0 20px 5px rgba(59, 130, 246, 0.5)',
                  '0 0 40px 10px rgba(59, 130, 246, 0.7)',
                  '0 0 20px 5px rgba(59, 130, 246, 0.5)',
                ],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'easeInOut',
              }}
            >
              {/* Logo ou icône */}
              <motion.div
                className="text-4xl font-bold text-white"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
              ></motion.div>
            </motion.div>
          </div>

          {/* Message de chargement avec animation de typing */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <motion.h2
              className="text-2xl md:text-3xl font-bold text-white mb-2"
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              Chargement en cours
            </motion.h2>
            <motion.p
              className="text-blue-300 text-lg"
              key={currentMessage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {currentMessage}
            </motion.p>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default LoadingScreen
