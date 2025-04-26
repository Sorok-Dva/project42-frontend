'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useAuth } from 'contexts/AuthContext'

interface UserData {
  name: string
  'Total Users': number
  'New Users': number
}

const UserChart: React.FC = () => {
  const { token } = useAuth()
  const [data, setData] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: result } = await axios.get<UserData[]>('/api/admin/stats/user-growth', {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        })
        setData(result)
      } catch (error) {
        console.error('Failed to fetch user growth:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div className="flex items-center justify-center h-full">Chargement chart...</div>

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
