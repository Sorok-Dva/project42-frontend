'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'components/UI/Card'
import { DateRangePicker } from 'components/UI/DateRangePicker'
import { Button } from 'components/UI/Button'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Download, RefreshCw, User, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import type { UserTransactionStats, CreditTransaction } from 'types/creditTransaction'
import { DataTable } from 'components/UI/DataTable'
import { useAuth } from 'contexts/AuthContext'
import axios from 'axios'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658']

interface UserTransactionDetailsProps {
  userId: number
}

export function UserTransactionDetails({ userId }: UserTransactionDetailsProps) {
  const { token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [userStats, setUserStats] = useState<UserTransactionStats | null>(null)
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>(undefined)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const fetchUserStats = async () => {
      setLoading(true)
      try {
        const params: Record<string, any> = {}
        if (dateRange?.from) params.from = dateRange.from.toISOString()
        if (dateRange?.to) params.to = dateRange.to.toISOString()

        const response = await axios.get(
          `/api/admin/credit-transactions/user/${userId}/stats`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params,
          }
        )
        setUserStats(response.data)
      } catch (error) {
        console.error('Error fetching user stats:', error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) fetchUserStats()
  }, [userId, dateRange, token])

  // Fetch user transactions
  useEffect(() => {
    const fetchUserTransactions = async () => {
      try {
        const params: Record<string, any> = {
          page,
          limit: 10,
        }
        if (dateRange?.from) params.from = dateRange.from.toISOString()
        if (dateRange?.to) params.to = dateRange.to.toISOString()

        const response = await axios.get(
          `/api/admin/credit-transactions/user/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params,
          }
        )
        setTransactions(response.data.transactions)
        setTotalPages(response.data.totalPages)
      } catch (error) {
        console.error('Error fetching user transactions:', error)
      }
    }

    if (userId) fetchUserTransactions()
  }, [userId, page, dateRange, token])

  // Export user CSV
  const handleExportUserCSV = async () => {
    try {
      const params: Record<string, any> = {}
      if (dateRange?.from) params.from = dateRange.from.toISOString()
      if (dateRange?.to) params.to = dateRange.to.toISOString()

      const response = await axios.get(
        `/api/admin/credit-transactions/user/${userId}/export`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
          responseType: 'blob',
        }
      )

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `user-${userId}-transactions-${new Date()
        .toISOString()
        .split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting data:', error)
    }
  }

  const handleRefresh = () => {
    setPage(1)
  }

  const columns = [
    {
      header: 'ID',
      accessorKey: 'id',
      cell: ({ row }: any) => <span className="font-mono text-xs">{row.original.id}</span>,
    },
    {
      header: 'Type',
      accessorKey: 'type',
      cell: ({ row }: any) => {
        const type = row.original.type
        const getTypeLabel = () => {
          switch (type) {
          case 'game':
            return 'Partie'
          case 'daily_reward':
            return 'Récompense journalière'
          case 'shop_item':
            return 'Achat d\'item'
          case 'shop_credits':
            return 'Achat de crédits'
          case 'shop_premium':
            return 'Achat premium'
          case 'events':
            return 'Événements'
          case 'gift':
            return 'Cadeau'
          case 'admin':
            return 'Administration'
          default:
            return type
          }
        }

        return <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(type)}`}>{getTypeLabel()}</span>
      },
    },
    {
      header: 'Crédits',
      accessorKey: 'credits',
      cell: ({ row }: any) => {
        const credits = row.original.credits
        return (
          <span className={`font-mono ${credits >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {credits >= 0 ? `+${credits}` : credits}
          </span>
        )
      },
    },
    {
      header: 'Solde',
      accessorKey: 'newAmount',
      cell: ({ row }: any) => <span className="font-mono">{row.original.newAmount}</span>,
    },
    {
      header: 'Description',
      accessorKey: 'description',
      cell: ({ row }: any) => <span className="text-sm truncate max-w-[200px]">{row.original.description || '-'}</span>,
    },
    {
      header: 'Date',
      accessorKey: 'createdAt',
      cell: ({ row }: any) => <span className="text-sm">{new Date(row.original.createdAt).toLocaleString()}</span>,
    },
  ]

  const getTypeColor = (type: string) => {
    switch (type) {
    case 'game':
      return 'bg-blue-100 text-blue-800'
    case 'daily_reward':
      return 'bg-green-100 text-green-800'
    case 'shop_item':
      return 'bg-red-100 text-red-800'
    case 'shop_credits':
      return 'bg-purple-100 text-purple-800'
    case 'shop_premium':
      return 'bg-yellow-100 text-yellow-800'
    case 'events':
      return 'bg-indigo-100 text-indigo-800'
    case 'gift':
      return 'bg-pink-100 text-pink-800'
    case 'admin':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <User className="h-6 w-6" />
          <h2 className="text-2xl font-bold">{userStats?.nickname || `Utilisateur #${userId}`}</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button variant="outline" onClick={handleExportUserCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
        </div>
      </div>

      {/* User Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Crédits Actuels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.currentCredits.toLocaleString() || '...'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Crédits Gagnés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500 flex items-center">
              <ArrowUpRight className="mr-2 h-4 w-4" />
              {userStats?.totalCreditsAdded.toLocaleString() || '...'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Crédits Dépensés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500 flex items-center">
              <ArrowDownRight className="mr-2 h-4 w-4" />
              {userStats?.totalCreditsSpent.toLocaleString() || '...'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.totalTransactions.toLocaleString() || '...'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filtrer par date</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <DateRangePicker
              value={dateRange}
              onChange={(range) => {
                if (!range?.from || !range.to) return
                setDateRange({ from: range.from, to: range.to })
              }}
              className="w-full max-w-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Évolution des Crédits</CardTitle>
            <CardDescription>Progression du solde de crédits</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {userStats?.dailyTransactions ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={userStats.dailyTransactions.map((day, index, arr) => {
                    // Calculate running balance for each day
                    const runningBalance = arr
                      .slice(0, index + 1)
                      .reduce((sum, item) => sum + (item.added - item.spent), 0)

                    return {
                      ...day,
                      balance: runningBalance,
                    }
                  })}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => [value.toLocaleString(), '']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="balance" name="Solde" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">Chargement des données...</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition par Type</CardTitle>
            <CardDescription>Distribution des transactions par type</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {userStats?.transactionsByType ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userStats.transactionsByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="totalCredits"
                    nameKey="type"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {userStats.transactionsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [value.toLocaleString() + ' crédits', '']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">Chargement des données...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Daily Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Activité Journalière</CardTitle>
          <CardDescription>Crédits gagnés vs dépensés par jour</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          {userStats?.dailyTransactions ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userStats.dailyTransactions} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [value.toLocaleString(), '']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Legend />
                <Bar dataKey="added" name="Crédits Gagnés" fill="#4ade80" />
                <Bar dataKey="spent" name="Crédits Dépensés" fill="#f87171" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">Chargement des données...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des Transactions</CardTitle>
          <CardDescription>Transactions de l'utilisateur</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={transactions}
            columns={columns}
            pagination={{
              pageCount: totalPages,
              page: page,
              onPageChange: setPage,
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
