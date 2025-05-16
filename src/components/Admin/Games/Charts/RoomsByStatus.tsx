'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'components/UI/Card'
import type { RoomStats } from 'types/room'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

interface RoomsByStatusChartProps {
  data: RoomStats['roomsByStatus']
}

const COLORS = ['#FFBB28', '#0088FE', '#00C49F']
const STATUS_LABELS = {
  waiting: 'En attente',
  in_progress: 'En cours',
  completed: 'Terminées',
}

const RoomsByStatusChart: React.FC<RoomsByStatusChartProps> = ({ data })=> {
  const formattedData = data.map((item) => ({
    ...item,
    name: STATUS_LABELS[item.status as keyof typeof STATUS_LABELS] || item.status,
  }))

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Statut des parties</CardTitle>
        <CardDescription>Distribution des parties par statut</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={formattedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
              nameKey="name"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {formattedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [`${value} parties`, 'Nombre']}
              labelFormatter={(name) => `Statut: ${name}`}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default RoomsByStatusChart
