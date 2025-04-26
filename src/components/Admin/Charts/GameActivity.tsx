'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { toast } from 'react-toastify'
import { ToastDefaultOptions } from 'utils/toastOptions'
import { useAuth } from 'contexts/AuthContext'

interface GameData {
  name: string
  'Normal': number
  'Fun': number
  'Carnage': number
  'Sérieuse': number
  'Spéciale': number
  'Test': number
}

const GameActivityChart: React.FC = () => {
  const { token } = useAuth()
  const [data, setData] = useState<GameData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: result } = await axios.get<GameData[]>('/api/admin/stats/game-activity', {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        })
        setData(result)
      } catch (error) {
        toast.error('Failed to fetch game activity:', ToastDefaultOptions)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div className="flex items-center justify-center h-full">Chargement...</div>

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="name" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip
          contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(59, 130, 246, 0.5)', color: '#f8fafc' }}
        />
        <Legend />
        <Bar dataKey="Normal" fill="#16a34a" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Fun" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Carnage" fill="#9333ea" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Sérieuse" fill="#dc2626" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Spéciale" fill="#c0ba0e" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Test" fill="#c56e28" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default GameActivityChart
