'use client'

import React, { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

// Mock data for game activity
const generateGameData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const today = new Date().getDay() - 1 // 0 = Sunday, so -1 gives us the index in our array

  return days.map((day, index) => {
    // Generate some realistic looking data
    const normalGames = Math.floor(Math.random() * 100) + 50
    const tournamentGames = Math.floor(Math.random() * 50) + 10
    const specialEvents = Math.floor(Math.random() * 20)

    return {
      name: day,
      'Normal Games': normalGames,
      'Tournament Games': tournamentGames,
      'Special Events': specialEvents,
      active: index === (today === -1 ? 6 : today), // Highlight today
    }
  })
}

const GameActivityChart: React.FC = () => {
  const [data, setData] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setData(generateGameData())
    setMounted(true)
  }, [])

  if (!mounted) return <div className="flex items-center justify-center h-full">Loading chart...</div>

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="name" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            borderColor: 'rgba(59, 130, 246, 0.5)',
            color: '#f8fafc',
          }}
        />
        <Legend />
        <Bar dataKey="Normal Games" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Tournament Games" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Special Events" fill="#ec4899" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default GameActivityChart
