'use client'

import React from 'react'
import { motion } from 'framer-motion'
import StatsOverview from 'components/Admin/StatsOverview'
import RecentActivity from 'components/Admin/RecentActivity'
import QuickActions from 'components/Admin/QuickActions'
import UserChart from 'components/Admin/Charts/Users'
import GameActivityChart from 'components/Admin/Charts/GameActivity'
import { useUser } from 'contexts/UserContext'

const AdminDashboard: React.FC = () => {
  const { user } = useUser()
  return (
    <main className="p-4 md:p-6 space-y-6">
      {/* Welcome message */}
      <motion.div
        className="bg-gradient-to-r from-black/60 to-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-2">Bienvenue {user?.nickname}</h2>
      </motion.div>

      {/* Stats overview */}
      <StatsOverview />

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          className="bg-gradient-to-r from-black/60 to-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-xl font-bold mb-4">Croissance utilisateur</h3>
          <div className="h-80">
            <UserChart />
          </div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-r from-black/60 to-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-xl font-bold mb-4">Parties</h3>
          <div className="h-80">
            <GameActivityChart />
          </div>
        </motion.div>
      </div>

      {/* Quick actions and recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          className="lg:col-span-1 bg-gradient-to-r from-black/60 to-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="text-xl font-bold mb-4">Actions rapide</h3>
          <QuickActions />
        </motion.div>

        <motion.div
          className="lg:col-span-2 bg-gradient-to-r from-black/60 to-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h3 className="text-xl font-bold mb-4">Activité</h3>
          <RecentActivity />
        </motion.div>
      </div>
    </main>
  )
}

export default AdminDashboard
