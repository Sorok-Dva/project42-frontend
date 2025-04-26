'use client'

import { motion } from 'framer-motion'
import { UserPlus, AlertTriangle, MessageSquare, Shield, Trash2, Newspaper } from 'lucide-react'
import React from 'react'

interface Activity {
  id: number
  type: 'user_joined' | 'report' | 'message' | 'moderation' | 'deletion' | 'news'
  user: {
    name: string
    avatar?: string
  }
  description: string
  time: string
}

const RecentActivity: React.FC = () => {
  // Mock data for recent activities
  const activities: Activity[] = [
    {
      id: 1,
      type: 'user_joined',
      user: { name: 'StarNavigator' },
      description: 'joined the platform',
      time: '2 minutes ago',
    },
    {
      id: 2,
      type: 'report',
      user: { name: 'CosmicRay' },
      description: 'reported a message in Game Room #42',
      time: '15 minutes ago',
    },
    {
      id: 3,
      type: 'news',
      user: { name: 'Admin' },
      description: 'published a news article "Server Maintenance"',
      time: '45 minutes ago',
    },
    {
      id: 4,
      type: 'moderation',
      user: { name: 'Moderator' },
      description: 'banned user GalaxyQueen for 24 hours',
      time: '1 hour ago',
    },
    {
      id: 5,
      type: 'message',
      user: { name: 'VoidWalker' },
      description: 'sent a message in the support channel',
      time: '2 hours ago',
    },
    {
      id: 6,
      type: 'deletion',
      user: { name: 'Admin' },
      description: 'deleted a game room "Toxic Environment"',
      time: '3 hours ago',
    },
  ]

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
    case 'user_joined':
      return <UserPlus className="text-green-400" size={18} />
    case 'report':
      return <AlertTriangle className="text-yellow-400" size={18} />
    case 'message':
      return <MessageSquare className="text-blue-400" size={18} />
    case 'moderation':
      return <Shield className="text-purple-400" size={18} />
    case 'deletion':
      return <Trash2 className="text-red-400" size={18} />
    case 'news':
      return <Newspaper className="text-blue-400" size={18} />
    default:
      return null
    }
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <motion.div
          key={activity.id}
          className="flex items-start p-3 rounded-lg hover:bg-blue-900/20 transition-colors"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <div className="mr-4 mt-1">{getActivityIcon(activity.type)}</div>

          <div className="flex-1">
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-2">
                <span className="font-bold text-xs">{activity.user.name.charAt(0)}</span>
              </div>
              <span className="font-medium">{activity.user.name}</span>
              <span className="text-blue-300 ml-2">{activity.description}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
          </div>

          <button className="text-blue-400 hover:text-blue-300 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </button>
        </motion.div>
      ))}

      <div className="text-center pt-2">
        <button className="text-blue-400 hover:text-blue-300 text-sm">View All Activity</button>
      </div>
    </div>
  )
}

export default RecentActivity
