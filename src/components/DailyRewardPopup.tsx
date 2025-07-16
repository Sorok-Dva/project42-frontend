'use client'

import type React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDailyRewards } from 'contexts/DailyRewardsContext'
import { Button } from './UI/Button'
import { X } from 'lucide-react'

const DailyRewardsPopup: React.FC = () => {
  const { rewards, currentStreak, showPopup, canClaimToday, claimReward, closePopup } = useDailyRewards()

  // Déterminer le jour actuel (limité à 7)
  const currentDay = Math.min(currentStreak + (canClaimToday ? 1 : 0), 7)

  // Animation pour les étoiles
  const starVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: (i: number) => ({
      scale: 1,
      rotate: 0,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay: 0.1 + i * 0.05,
      },
    }),
  }

  // Animation pour les jours
  const dayVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: (i: number) => ({
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
        delay: 0.2 + i * 0.1,
      },
    }),
    hover: {
      scale: 1.05,
      boxShadow: '0 0 15px rgba(120, 120, 255, 0.7)',
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10,
      },
    },
  }

  // Animation pour le conteneur principal
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25,
        when: 'beforeChildren',
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: 20,
      transition: {
        duration: 0.2,
      },
    },
  }

  return (
    <AnimatePresence>
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm" style={{ zIndex: 200 }}>
          <motion.div
            className="relative w-full max-w-md p-6 bg-gray-900 border border-indigo-500/30 rounded-xl shadow-2xl overflow-hidden"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Bouton de fermeture */}
            <button
              onClick={closePopup}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            {/* Titre */}
            <motion.h2
              className="text-2xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
            >
              Récompenses journalières
            </motion.h2>

            <motion.p
              className="text-center text-gray-300 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.3 } }}
            >
              Jour {currentDay} de votre série de connexions
            </motion.p>

            {/* Barre de progression */}
            <motion.div
              className="w-full h-2 bg-gray-700 rounded-full mb-6 overflow-hidden"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1, transition: { delay: 0.4 } }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width: `${(currentDay / 7) * 100}%`,
                  transition: { delay: 0.5, duration: 0.8, ease: 'easeOut' },
                }}
              />
            </motion.div>

            {/* Grille des récompenses */}
            <div className="grid grid-cols-7 gap-2 mb-6">
              {rewards.map((reward, index) => {
                const isPast = index < currentStreak
                const isCurrent = index === currentStreak && canClaimToday
                const isFuture = index > currentStreak || (index === currentStreak && !canClaimToday)

                return (
                  <motion.div
                    key={reward.day}
                    className={`relative flex flex-col items-center justify-center p-2 rounded-lg border ${
                      isCurrent
                        ? 'border-indigo-500 bg-indigo-900/50'
                        : isPast
                          ? 'border-gray-600 bg-gray-800/50'
                          : 'border-gray-700 bg-gray-800/20'
                    }`}
                    variants={dayVariants}
                    initial="initial"
                    animate="animate"
                    whileHover={isCurrent ? 'hover' : undefined}
                    custom={index}
                  >
                    <span className="text-xs font-semibold mb-1">Jour {reward.day}</span>
                    <span className="text-sm font-bold text-yellow-400">{reward.credits}</span>

                    {isPast && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3 text-white"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>

            {/* Bouton de réclamation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.7 } }}
              className="flex justify-center"
            >
              <Button
                onClick={claimReward}
                disabled={!canClaimToday}
                className={`w-full py-3 ${
                  canClaimToday
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                    : 'bg-gray-700 cursor-not-allowed'
                }`}
              >
                {canClaimToday
                  ? `Réclamer ${rewards[currentStreak]?.credits || 0} crédits`
                  : 'Déjà réclamé aujourd\'hui'}
              </Button>
            </motion.div>

            {/* Message bonus pour le 7ème jour */}
            {currentDay === 7 && canClaimToday && (
              <motion.div
                className="mt-4 p-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1, transition: { delay: 0.8 } }}
              >
                <span className="text-yellow-300 font-semibold">Bonus de semaine complète! 🎉</span>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default DailyRewardsPopup
