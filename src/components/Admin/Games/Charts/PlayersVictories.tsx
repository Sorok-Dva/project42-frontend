'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'components/UI/Card'
import type { RoomStats } from 'types/room'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface PlayerVictoriesChartProps {
  data: RoomStats['playerVictories']
}

const PlayerVictoriesChart: React.FC<PlayerVictoriesChartProps> = ({ data }) => {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Victoires par rôle</CardTitle>
        <CardDescription>Nombre de victoires par rôle de joueur</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
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
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="role" />
            <YAxis />
            <Tooltip formatter={(value: number) => [`${value} victoires`, 'Victoires']} />
            <Legend />
            <Bar dataKey="victories" fill="#8884d8" name="Victoires" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default PlayerVictoriesChart
