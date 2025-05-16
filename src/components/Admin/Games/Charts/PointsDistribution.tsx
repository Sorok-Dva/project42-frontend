'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'components/UI/Card'
import type { RoomStats } from 'types/room'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface PointsDistributionChartProps {
  data: RoomStats['pointsDistribution']
}

const PointsDistributionChart: React.FC<PointsDistributionChartProps> = ({ data }) => {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Distribution des points</CardTitle>
        <CardDescription>Points distribués au cours des 14 derniers jours</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value: number) => [`${value} points`, 'Points']} />
            <Area type="monotone" dataKey="points" stroke="#8884d8" fill="#8884d8" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default PointsDistributionChart
