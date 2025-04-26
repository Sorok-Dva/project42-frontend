'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { Users, GamepadIcon as GameController, MessageSquare, AlertTriangle } from 'lucide-react'
import { ToastDefaultOptions } from 'utils/toastOptions'
import { toast } from 'react-toastify'
import { useAuth } from 'contexts/AuthContext'

interface StatItem {
  title: string
  value: string
  change: string
  isPositive: boolean
  icon: React.ReactNode
  color: string
}

const StatsOverview: React.FC = () => {
  const { token } = useAuth()
  const [stats, setStats] = useState<StatItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get('/api/admin/stats/overview', {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        })
        const items: StatItem[] = [
          {
            title: 'Utilisateurs total',
            value: data.totalUsers.toLocaleString(),
            change: `${data.usersChange}%`, // assumes string or number
            isPositive: parseFloat(data.usersChange) >= 0,
            icon: <Users size={24} />,
            color: 'from-blue-600 to-blue-400',
          },
          {
            title: 'Parties en cours',
            value: data.activeGames.toLocaleString(),
            change: `${data.gamesChange}%`,
            isPositive: parseFloat(data.gamesChange) >= 0,
            icon: <GameController size={24} />,
            color: 'from-green-600 to-green-400',
          },
          {
            title: 'Messages aujourd\'hui',
            value: data.messagesToday.toLocaleString(),
            change: `${data.messagesChange}%`,
            isPositive: parseFloat(data.messagesChange) >= 0,
            icon: <MessageSquare size={24} />,
            color: 'from-purple-600 to-purple-400',
          },
          {
            title: 'Reports',
            value: data.reportsThisMonth.toLocaleString(),
            change: `${data.reportsChange}%`,
            isPositive: parseFloat(data.reportsChange) >= 0,
            icon: <AlertTriangle size={24} />,
            color: 'from-red-600 to-red-400',
          },
        ]
        setStats(items)
      } catch (error) {
        toast.error('Failed to fetch stats overview:', ToastDefaultOptions)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return <div className="text-center">Chargement...</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          className="bg-gradient-to-r from-black/60 to-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br opacity-10 rounded-bl-full"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-300 text-sm">{stat.title}</p>
              <h3 className="text-3xl font-bold mt-1">{stat.value}</h3>
              <div className={`mt-2 text-sm ${stat.isPositive ? 'text-green-400' : 'text-red-400'} flex items-center`}>
                {stat.change}
                <span className="ml-1">from last month</span>
              </div>
            </div>
            <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color} text-white`}>{stat.icon}</div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default StatsOverview
