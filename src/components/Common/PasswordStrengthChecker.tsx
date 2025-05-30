'use client'

import type React from 'react'
import { useMemo } from 'react'
import { motion } from 'framer-motion'

interface PasswordStrengthCheckerProps {
  password: string
}

const PasswordStrengthChecker: React.FC<PasswordStrengthCheckerProps> = ({ password }) => {
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecialChar = /[\W_]/.test(password)
  const isValidLength = password.length >= 8

  // Calculate password strength score (0-4)
  const strengthScore = useMemo(() => {
    let score = 0
    if (isValidLength) score++
    if (hasUpperCase) score++
    if (hasLowerCase) score++
    if (hasNumber) score++
    if (hasSpecialChar) score++
    return score
  }, [isValidLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar])

  // Get strength label and color based on score
  const strengthInfo = useMemo(() => {
    switch (strengthScore) {
    case 0:
      return { label: 'Très faible', color: 'bg-red-600', width: '10%' }
    case 1:
      return { label: 'Faible', color: 'bg-red-500', width: '25%' }
    case 2:
      return { label: 'Moyen', color: 'bg-yellow-500', width: '50%' }
    case 3:
      return { label: 'Bon', color: 'bg-green-500', width: '75%' }
    case 4:
    case 5:
      return { label: 'Excellent', color: 'bg-blue-500', width: '100%' }
    default:
      return { label: 'Très faible', color: 'bg-red-600', width: '10%' }
    }
  }, [strengthScore])

  const criteriaItems = [
    { met: isValidLength, text: 'Minimum 8 caractères' },
    { met: hasUpperCase, text: 'Au moins une majuscule' },
    { met: hasLowerCase, text: 'Au moins une minuscule' },
    { met: hasNumber, text: 'Au moins un chiffre' },
    { met: hasSpecialChar, text: 'Au moins un caractère spécial (@$!%*?&)' },
  ]

  return (
    <motion.div
      className="rounded-lg border border-gray-700/50 bg-black/30 backdrop-blur-sm p-4 mb-4 overflow-hidden"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <h5 className="text-sm font-medium text-gray-300">Force du mot de passe</h5>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              strengthScore < 2
                ? 'bg-red-500/20 text-red-400'
                : strengthScore < 4
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-green-500/20 text-green-400'
            }`}
          >
            {strengthInfo.label}
          </span>
        </div>

        <div className="h-1.5 w-full bg-gray-700/50 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${strengthInfo.color}`}
            initial={{ width: '0%' }}
            animate={{ width: strengthInfo.width }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        {criteriaItems.map((item, index) => (
          <motion.div
            key={index}
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <span
              className={`flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full ${
                item.met ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}
            >
              <i className={`ni ni-${item.met ? 'check' : 'simple-remove'} text-xs`}></i>
            </span>
            <span className={`text-xs ${item.met ? 'text-gray-300' : 'text-gray-400'}`}>{item.text}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default PasswordStrengthChecker
