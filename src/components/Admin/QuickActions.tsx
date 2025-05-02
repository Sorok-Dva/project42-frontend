'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  Construction,
  Newspaper,
  MessageSquare,
  Shield,
  Settings,
  Gamepad2,
  UserRoundMinusIcon,
  ClockFading,
} from 'lucide-react'
import { useAuth } from 'contexts/AuthContext'
import axios from 'axios'
import { ToastDefaultOptions } from 'utils/toastOptions'
import { toast } from 'react-toastify'

const QuickActions: React.FC = () => {
  const { token } = useAuth()
  const executeCronjobs = async () => {
    if (!token) return
    try {
      await axios.post('/api/server/cronjobs', {}, { headers: { Authorization: `Bearer ${token}` } })
      toast.success('Cronjob en cours d\'exécution.', ToastDefaultOptions)
    } catch (e) {
      toast.error('Une erreur est survenue lors de l\'exécution des cronjobs.', ToastDefaultOptions)
    }
  }

  const actions = [
    {
      title: 'Maintenance',
      icon: <Construction size={20} />,
      color: 'from-orange-600 to-red-400',
      href: '#',
    },
    {
      title: 'Création de partie',
      icon: <Gamepad2 size={20} />,
      color: 'from-orange-400 to-red-200',
      href: '/admin/news/create',
    },
    {
      title: 'Ban un joueur',
      icon: <UserRoundMinusIcon size={20} />,
      color: 'from-red-600 to-red-400',
      href: '/admin/users/ban',
    },
    {
      title: 'Ajouter une news',
      icon: <Newspaper size={20} />,
      color: 'from-blue-600 to-blue-400',
      href: '/admin/news/create',
    },
    {
      title: 'Annonces',
      icon: <MessageSquare size={20} />,
      color: 'from-yellow-600 to-yellow-400',
      href: '/admin/announcements',
    },
    {
      title: 'Modération',
      icon: <Shield size={20} />,
      color: 'from-red-600 to-red-400',
      href: '/admin/moderation',
    },
    {
      title: 'Executer Cronjobs',
      icon: <ClockFading size={20} />,
      color: 'from-green-600 to-green-100',
      href: '#',
      onclick: () => executeCronjobs
    },
    {
      title: 'Paramètres',
      icon: <Settings size={20} />,
      color: 'from-gray-600 to-gray-400',
      href: '/admin/settings',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action, index) => (
        <motion.button
          key={action.title}
          onClick={action.onclick ? action.onclick : ()  => window.location.href = action.href}
          className="bg-gradient-to-r from-black/60 to-blue-900/20 backdrop-blur-sm rounded-lg border border-blue-500/30 p-4 flex flex-col items-center justify-center hover:border-blue-400/50 transition-all"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color} text-white mb-2`}>{action.icon}</div>
          <span className="text-sm">{action.title}</span>
        </motion.button>
      ))}
    </div>
  )
}

export default QuickActions
