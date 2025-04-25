'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { UserPlus, Newspaper, MessageSquare, Shield, Settings, Database } from 'lucide-react'

const QuickActions: React.FC = () => {
  const actions = [
    {
      title: 'Add User',
      icon: <UserPlus size={20} />,
      color: 'from-green-600 to-green-400',
      href: '/admin/users/create',
    },
    {
      title: 'New Article',
      icon: <Newspaper size={20} />,
      color: 'from-blue-600 to-blue-400',
      href: '/admin/news/create',
    },
    {
      title: 'Create Room',
      icon: <Database size={20} />,
      color: 'from-purple-600 to-purple-400',
      href: '/admin/rooms/create',
    },
    {
      title: 'Announcements',
      icon: <MessageSquare size={20} />,
      color: 'from-yellow-600 to-yellow-400',
      href: '/admin/announcements',
    },
    {
      title: 'Moderation',
      icon: <Shield size={20} />,
      color: 'from-red-600 to-red-400',
      href: '/admin/moderation',
    },
    {
      title: 'Settings',
      icon: <Settings size={20} />,
      color: 'from-gray-600 to-gray-400',
      href: '/admin/settings',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action, index) => (
        <motion.a
          key={action.title}
          href={action.href}
          className="bg-gradient-to-r from-black/60 to-blue-900/20 backdrop-blur-sm rounded-lg border border-blue-500/30 p-4 flex flex-col items-center justify-center hover:border-blue-400/50 transition-all"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color} text-white mb-2`}>{action.icon}</div>
          <span className="text-sm">{action.title}</span>
        </motion.a>
      ))}
    </div>
  )
}

export default QuickActions
