'use client'

import type React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import type { EventNotification } from 'types/events'

interface EventNotificationsProps {
  notifications: EventNotification[]
  onDismiss: (id: string) => void
}

export const EventNotifications: React.FC<EventNotificationsProps> = ({ notifications, onDismiss }) => {
  return (
    <div className="fixed mt-24 right-4 z-[100] space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`
              max-w-sm p-4 rounded-lg shadow-2xl border backdrop-blur-sm
              ${
          notification.type === 'celebration'
            ? 'bg-gradient-to-r from-purple-900/90 to-pink-900/90 border-purple-500/50'
            : 'bg-gray-900/90 border-gray-700/50'
          }
            `}
          >
            <div className="flex items-start space-x-3">
              <div className="text-2xl flex-shrink-0">{notification.icon}</div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-semibold text-sm mb-1">{notification.title}</h4>
                <p className="text-gray-300 text-xs leading-relaxed">{notification.message}</p>
              </div>
              <button
                onClick={() => onDismiss(notification.id)}
                className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
