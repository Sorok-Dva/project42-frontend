import StatsOverview from 'components/Admin/Games/StatsOverview'
import RoomsByTypeChart from 'components/Admin/Games/Charts/RoomsByType'
import RoomsByStatusChart from 'components/Admin/Games/Charts/RoomsByStatus'
import PointsDistributionChart from 'components/Admin/Games/Charts/PointsDistribution'
import PlayerVictoriesChart from 'components/Admin/Games/Charts/PlayersVictories'
import RoomsTable from 'components/Admin/Games/RoomTable'
import { mockRooms, mockRoomStats } from 'data/mock-rooms'
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'components/UI/Tabs'
import React from 'react'

const GamesAdminPage: React.FC = () => {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Administration des parties</h2>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="rooms">Parties</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <StatsOverview stats={mockRoomStats} />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <RoomsByTypeChart data={mockRoomStats.roomsByType} />
            <RoomsByStatusChart data={mockRoomStats.roomsByStatus} />
            <PointsDistributionChart data={mockRoomStats.pointsDistribution} />
            <PlayerVictoriesChart data={mockRoomStats.playerVictories} />
          </div>
        </TabsContent>

        <TabsContent value="rooms" className="space-y-4">
          <RoomsTable rooms={mockRooms} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default GamesAdminPage
