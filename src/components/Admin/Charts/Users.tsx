'use client'

import React, { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

// Mock data for user growth
const generateUserData = () => {
  const months = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aout', 'Sept', 'Oct', 'Nov', 'Dec']
  const currentMonth = new Date().getMonth()

  return months.map((month, index) => {
    // Generate some realistic looking data with an upward trend
    const baseValue = 500 + index * 100
    const randomFactor = Math.random() * 200 - 100
    const newUsers = Math.max(50, Math.floor((baseValue + randomFactor) / 10))

    return {
      name: month,
      'Total Users': baseValue + randomFactor,
      'New Users': newUsers,
      active: index === currentMonth, // Highlight current month
    }
  })
}

const UserChart: React.FC = () => {
  const [data, setData] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setData(generateUserData())
    setMounted(true)
  }, [])

  if (!mounted) return <div className="flex items-center justify-center h-full">Loading chart...</div>

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
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
        <Line
          type="monotone"
          dataKey="Total Users"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 8, fill: '#60a5fa' }}
        />
        <Line type="monotone" dataKey="New Users" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default UserChart
