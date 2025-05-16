'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'components/UI/Card'
import type { RoomStats } from 'types/room'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

interface RoomsByTypeChartProps {
  data: RoomStats['roomsByType']
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

const RoomsByTypeChart: React.FC<RoomsByTypeChartProps> = ({ data })=> {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Types de parties</CardTitle>
        <CardDescription>Distribution des parties par type</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
              nameKey="label"
              label={({ label, percent }) => `${label} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [`${value} parties`, 'Nombre']}
              labelFormatter={(label) => `Type: ${label}`}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default RoomsByTypeChart
