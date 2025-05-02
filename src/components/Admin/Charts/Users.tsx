'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useAuth } from 'contexts/AuthContext'
import { motion } from 'framer-motion'

type TimeRange = 'day' | 'week' | 'month' | 'year'

interface UserData {
  name: string
  'Total Users': number
  'New Users': number
}

const UserChart: React.FC = () => {
  const { token } = useAuth()
  const [data, setData] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<TimeRange>('month')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const { data: result } = await axios.get<UserData[]>(`/api/admin/stats/user-growth?range=${timeRange}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setData(result)
      } catch (error) {
        console.error('Failed to fetch user growth:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [timeRange, token])

  const handleRangeChange = (range: TimeRange) => {
    setTimeRange(range)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-end mb-4 space-x-1">
        <RangeButton active={timeRange === 'day'} onClick={() => handleRangeChange('day')}>
          Jour
        </RangeButton>
        <RangeButton active={timeRange === 'week'} onClick={() => handleRangeChange('week')}>
          Semaine
        </RangeButton>
        <RangeButton active={timeRange === 'month'} onClick={() => handleRangeChange('month')}>
          Mois
        </RangeButton>
        <RangeButton active={timeRange === 'year'} onClick={() => handleRangeChange('year')}>
          Année
        </RangeButton>
      </div>

      {loading ? (
        <div className="flex items-center justify-center flex-1">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-sm text-blue-300">Chargement des données...</p>
          </div>
        </div>
      ) : (
        <div className="flex-1">
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
                dataKey="Utilisateurs total"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 8, fill: '#60a5fa' }}
              />
              <Line type="monotone" dataKey="Nouveaux utilisateurs" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

interface RangeButtonProps {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}

const RangeButton: React.FC<RangeButtonProps> = ({ active, onClick, children }) => {
  return (
    <motion.button
      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors relative ${
        active ? 'text-white bg-blue-600' : 'text-blue-300 bg-blue-900/30 hover:bg-blue-900/50'
      }`}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
    >
      {children}
      {active && <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-300" layoutId="underline" />}
    </motion.button>
  )
}

export default UserChart
