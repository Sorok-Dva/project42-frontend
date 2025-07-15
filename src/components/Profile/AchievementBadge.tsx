'use client'

import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import clsx from 'clsx'

interface Achievement {
  id: string
  title: string
  description: string
  unique: boolean
  level: number
  total?: number
  nextLevelTo?: number
}

interface AchievementBadgeProps {
  achievement: Achievement
  aKey: string
  isMemory?: boolean
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({ achievement, isMemory, aKey }) => {
  const [showTooltip, setShowTooltip] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const getProgressPercentage = () => {
    if (achievement.unique || !achievement.total || !achievement.nextLevelTo) return 0
    return Math.min((achievement.total / achievement.nextLevelTo) * 100, 100)
  }

  return (
    <div className="relative">
      <motion.div
        className={clsx(
          'relative inline-flex justify-center items-center w-[40px] h-[40px] mr-[7px] rounded-[5px] border-[2px]',
          'shadow-[0_5px_5px_rgba(0,0,0,0.2),_inset_0_2px_2px_rgba(0,0,0,0.2)]',
          {
            'bg-[#1e4262] border-[#e3be70]': !isMemory,
            'bg-[#1c81ac] border-white': isMemory,
          }
        )}
        whileHover={{ scale: 1.05 }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Level Indicator */}
        {!achievement.unique && achievement.level > 0 && (
          <div
            className="
              absolute -top-[8px] -right-[8px]
              w-[18px] h-[18px]
              rounded-full
              text-white text-sm leading-[2vh]
              px-2
              border-[inherit] bg-[inherit]
              shadow-[0_5px_5px_#0003,inset_0_2px_2px_#0003]
              [text-shadow:0_2px_2px_#0003]
            ">
            {achievement.level}
          </div>
        ) }
        {/* Badge Image */}
        <img
          src={`/assets/images/pictos/${achievement.id}.png`}
          alt={achievement.description}
        />

        {/* Memory Indicator */}
        {isMemory && (
          <div className="absolute -top-[15px] -right-[15px] w-full h-full flex items-center justify-center">
            <div className="w-4 h-4 bg-cyan-400 rounded-full animate-pulse"></div>
          </div>
        )}
      </motion.div>

      {/* Tooltip */}
      {showTooltip && (
        <motion.div
          className="absolute  transform translate-x-1/2 mb-2 z-[999]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-600 rounded-lg p-3 w-[250px]">
            <div className="flex items-center space-x-2 mb-2">
              <img
                src={`/assets/images/pictos/${achievement.id}.png`}
                alt={achievement.description}
                className="w-6 h-6"
              />
              {!achievement.unique && achievement.level > 0 && (
                <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded">Niveau {achievement.level}</span>
              )}
            </div>

            <h4 className="text-white font-bold text-sm mb-1">{achievement.title || 'Badge'}</h4>

            <p className="text-gray-300 text-xs mb-2">
              {achievement.total && <strong>{achievement.total} </strong>}
              {achievement.description}
            </p>

            {!achievement.unique && (
              <div className="space-y-1">
                {achievement.nextLevelTo !== undefined ? (
                  <>
                    <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 transition-all duration-300"
                        style={{ width: `${getProgressPercentage()}%` }}
                      />
                    </div>
                    <p className="text-gray-400 text-xs">Prochain niveau à {achievement.nextLevelTo}</p>
                  </>
                ) : (
                  <p className="text-green-400 text-xs">Niveau maximum atteint</p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default AchievementBadge
