'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Users, GamepadIcon as GameController, MessageSquare, AlertTriangle } from 'lucide-react'

const StatsOverview: React.FC = () => {
  const stats = [
    {
      title: 'Total Users',
      value: '12,845',
      change: '+12%',
      isPositive: true,
      icon: <Users size={24} />,
      color: 'from-blue-600 to-blue-400',
    },
    {
      title: 'Active Games',
      value: '342',
      change: '+8%',
      isPositive: true,
      icon: <GameController size={24} />,
      color: 'from-green-600 to-green-400',
    },
    {
      title: 'Messages Today',
      value: '8,492',
      change: '+24%',
      isPositive: true,
      icon: <MessageSquare size={24} />,
      color: 'from-purple-600 to-purple-400',
    },
    {
      title: 'Reports',
      value: '28',
      change: '-5%',
      isPositive: false,
      icon: <AlertTriangle size={24} />,
      color: 'from-red-600 to-red-400',
    },
  ]

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
