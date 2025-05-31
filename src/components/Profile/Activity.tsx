'use client'

import type React from 'react'
import { motion } from 'framer-motion'
import { Play, Eye, Users } from 'lucide-react'
import type { User } from 'components/ProfileModal'

interface ActivityProps {
  user: User
  relation: string
}

const Activity: React.FC<ActivityProps> = ({ user, relation }) => {
  if (relation === 'me' || !user.activity || user.activity.state === 'none') {
    return null
  }

  const { state, gameId } = user.activity

  const getActivityConfig = () => {
    switch (state) {
    case 'ingame':
      return {
        icon: Play,
        title: `${user.nickname} est actuellement en jeu`,
        description: 'Une partie est en cours',
        color: 'text-green-400',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/50',
        buttons: [
          {
            label: 'Observer',
            href: `/game/${gameId}`,
            variant: 'secondary' as const,
          },
        ],
      }
    case 'pregame':
      return {
        icon: Users,
        title: `${user.nickname} est sur le point de commencer une partie`,
        description: 'La partie va bientôt démarrer',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/50',
        buttons: [
          {
            label: 'Observer',
            href: `/game/${gameId}`,
            variant: 'secondary' as const,
          },
          {
            label: 'Rejoindre',
            action: () => {
              const form = document.createElement('form')
              form.method = 'POST'
              form.action = '/game/join'
              form.target = '_blank'

              const roomInput = document.createElement('input')
              roomInput.type = 'hidden'
              roomInput.name = 'room'
              roomInput.value = gameId?.toString() || ''

              const playerInput = document.createElement('input')
              playerInput.type = 'hidden'
              playerInput.name = 'player'
              playerInput.value = 'true'

              form.appendChild(roomInput)
              form.appendChild(playerInput)
              document.body.appendChild(form)
              form.submit()
              document.body.removeChild(form)
            },
            variant: 'primary' as const,
          },
        ],
      }
    case 'spectator':
      return {
        icon: Eye,
        title: `${user.nickname} observe une partie`,
        description: 'En mode spectateur',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/50',
        buttons: [
          {
            label: `Rejoindre ${user.nickname} en spectateur`,
            href: `/game/${gameId}`,
            variant: 'primary' as const,
          },
        ],
      }
    default:
      return null
    }
  }

  const config = getActivityConfig()
  if (!config) return null

  const getButtonStyles = (variant: 'primary' | 'secondary') => {
    const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-all duration-200'

    switch (variant) {
    case 'primary':
      return `${baseStyles} bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-blue-500/25`
    case 'secondary':
      return `${baseStyles} bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-600/50`
    }
  }

  return (
    <motion.div
      className={`${config.bgColor} backdrop-blur-sm border ${config.borderColor} rounded-xl p-6`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-lg ${config.bgColor} border ${config.borderColor}`}>
          <config.icon className={config.color} size={24} />
        </div>

        <div className="flex-1">
          <h3 className={`text-lg font-bold ${config.color} mb-1`}>{config.title}</h3>
          <p className="text-gray-400 mb-4">{config.description}</p>

          <div className="flex flex-wrap gap-3">
            {config.buttons.map((button, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {button.href ? (
                  <a
                    href={button.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={getButtonStyles(button.variant)}
                  >
                    {button.label}
                  </a>
                ) : (
                  <button onClick={() => { window.open(button.href) }} className={getButtonStyles(button.variant)}>
                    {button.label}
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Activity
