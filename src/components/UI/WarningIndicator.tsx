'use client'

import type React from 'react'
import { motion } from 'framer-motion'
import { useWarning } from 'contexts/WarningContext'

interface WarningIndicatorProps {
  className?: string
}

const WarningIndicator: React.FC<WarningIndicatorProps> = ({ className = '' }) => {
  const { unreadCount } = useWarning()

  console.log(unreadCount)
  if (unreadCount === 0) return null

  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', damping: 15, stiffness: 300 }}
    >
      <motion.div
        className="w-6 h-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg"
        animate={{
          scale: [1, 1.2, 1],
          boxShadow: [
            '0 0 0 0 rgba(251, 191, 36, 0.7)',
            '0 0 0 10px rgba(251, 191, 36, 0)',
            '0 0 0 0 rgba(251, 191, 36, 0)',
          ],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        }}
      >
        {unreadCount > 9 ? '9+' : unreadCount}
      </motion.div>

      {/* Icône d'avertissement */}
      <motion.div
        className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center"
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY, repeatDelay: 2 }}
      >
        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </motion.div>
    </motion.div>
  )
}

export default WarningIndicator
