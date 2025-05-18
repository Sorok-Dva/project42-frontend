'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'components/UI/Card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'components/UI/Tabs'
import { Input } from 'components/UI/Input'
import { Button } from 'components/UI/Button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'components/UI/Select'
import { DateRangePicker } from 'components/UI/DateRangePicker'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { Download, Search, Filter, RefreshCw, User, Calendar, CreditCard, ArrowUpRight, ArrowDownRight, DollarSign, PieChartIcon } from 'lucide-react'
import {
  CreditTransaction, TransactionStats, TransactionFilters, PaginatedTransactions
} from 'types/creditTransaction'
import { DataTable } from 'components/UI/DataTable'
import { UserTransactionDetails } from 'components/Admin/UserTransactionDetails'
import axios from 'axios'
import { useAuth } from 'contexts/AuthContext'
import { DateRange } from 'react-day-picker'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658']
const TRANSACTION_TYPES = [
  { value: 'all', label: 'Tous les types' },
  { value: 'game', label: 'Partie' },
  { value: 'daily_reward', label: 'Récompense journalière' },
  { value: 'shop_item', label: 'Achat d\'item' },
  { value: 'shop_credits', label: 'Achat de crédits' },
  { value: 'shop_premium', label: 'Achat premium' },
  { value: 'events', label: 'Événements' },
  { value: 'gift', label: 'Cadeau' },
  { value: 'admin', label: 'Administration' }
]

export default function AdminCreditTransactions() {
  const { token } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [filters, setFilters] = useState<TransactionFilters>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [selectedType, setSelectedType] = useState('all')
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<PaginatedTransactions | null>(null)
  const [stats, setStats] = useState<TransactionStats | null>(null)
  const [selectedUser, setSelectedUser] = useState<number | null>(null)

  // Fetch transactions based on filters
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true)
      try {
        const params: Record<string, any> = {
          page: filters.page,
          limit: filters.limit,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder
        }
        if (searchQuery) params.search = searchQuery
        if (selectedType !== 'all') params.type = selectedType
        if (dateRange?.from) params.from = dateRange.from.toISOString()
        if (dateRange?.to) params.to   = dateRange.to.toISOString()

        const response = await axios.get('/api/admin/credit-transactions', {
          headers: { Authorization: `Bearer ${token}` },
          params
        })
        setTransactions(response.data)
      } catch (error) {
        console.error('Error fetching transactions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [filters, searchQuery, selectedType, dateRange, token])

  // Fetch global stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const params: Record<string, any> = {}
        if (selectedType !== 'all') params.type = selectedType
        if (dateRange?.from)         params.from = dateRange.from.toISOString()
        if (dateRange?.to)           params.to   = dateRange.to.toISOString()

        const response = await axios.get('/api/admin/credit-transactions/stats', {
          headers: { Authorization: `Bearer ${token}` },
          params
        })
        setStats(response.data)
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    fetchStats()
  }, [selectedType, dateRange, token])


  const handleExportCSV = async () => {
    try {
      const params: Record<string, any> = {}
      if (searchQuery)       params.search = searchQuery
      if (selectedType !== 'all') params.type = selectedType
      if (dateRange?.from)   params.from = dateRange.from.toISOString()
      if (dateRange?.to)     params.to   = dateRange.to.toISOString()

      const response = await axios.get('/api/admin/credit-transactions/export', {
        headers: { Authorization: `Bearer ${token}` },
        params,
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `credit-transactions-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting data:', error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters({ ...filters, page: 1 })
  }

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page })
  }

  const handleSortChange = (sortBy: string) => {
    setFilters({
      ...filters,
      sortBy,
      sortOrder: filters.sortBy === sortBy && filters.sortOrder === 'asc' ? 'desc' : 'asc'
    })
  }

  const handleRefresh = () => {
    setFilters({
      ...filters,
      page: 1
    })
  }

  const handleUserSelect = (userId: number) => {
    setSelectedUser(userId)
    setActiveTab('user-details')
  }

  const handleBackToOverview = () => {
    setSelectedUser(null)
    setActiveTab('overview')
  }

  const columns = [
    {
      header: 'ID',
      accessorKey: 'id',
      cell: ({ row }: any) => <span className="font-mono text-xs">{row.original.id}</span>
    },
    {
      header: 'Utilisateur',
      accessorKey: 'user.nickname',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          {row.original.user?.avatar && (
            <img
              src={row.original.user.avatar || '/placeholder.svg'}
              alt={row.original.user?.nickname}
              className="w-6 h-6 rounded-full"
            />
          )}
          <button
            onClick={() => handleUserSelect(row.original.userId)}
            className="text-blue-500 hover:underline"
          >
            {row.original.user?.nickname || `User #${row.original.userId}`}
          </button>
        </div>
      )
    },
    {
      header: 'Type',
      accessorKey: 'type',
      cell: ({ row }: any) => {
        const type = row.original.type
        const getTypeLabel = () => {
          const found = TRANSACTION_TYPES.find(t => t.value === type)
          return found ? found.label : type
        }

        return (
          <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(type)}`}>
            {getTypeLabel()}
          </span>
        )
      }
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
      }
    },
    {
      header: 'Solde',
      accessorKey: 'newAmount',
      cell: ({ row }: any) => (
        <span className="font-mono">{row.original.newAmount}</span>
      )
    },
    {
      header: 'Description',
      accessorKey: 'description',
      cell: ({ row }: any) => (
        <span className="text-sm truncate max-w-[200px]">
          {row.original.description || '-'}
        </span>
      )
    },
    {
      header: 'Date',
      accessorKey: 'createdAt',
      cell: ({ row }: any) => (
        <span className="text-sm">
          {new Date(row.original.createdAt).toLocaleString()}
        </span>
      )
    }
  ]

  const getTypeColor = (type: string) => {
    switch (type) {
    case 'game': return 'bg-blue-100 text-blue-800'
    case 'daily_reward': return 'bg-green-100 text-green-800'
    case 'shop_item': return 'bg-red-100 text-red-800'
    case 'shop_credits': return 'bg-purple-100 text-purple-800'
    case 'shop_premium': return 'bg-yellow-100 text-yellow-800'
    case 'events': return 'bg-indigo-100 text-indigo-800'
    case 'gift': return 'bg-pink-100 text-pink-800'
    case 'admin': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Administration des Transactions de Crédits</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="user-details" disabled={!selectedUser}>
            Détails Utilisateur
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.totalTransactions.toLocaleString() || '...'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Crédits Ajoutés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500 flex items-center">
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  {stats?.totalCreditsAdded.toLocaleString() || '...'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Crédits Dépensés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500 flex items-center">
                  <ArrowDownRight className="mr-2 h-4 w-4" />
                  {stats?.totalCreditsSpent.toLocaleString() || '...'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Bilan Net
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stats?.netCredits && stats.netCredits >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stats?.netCredits ? (stats.netCredits >= 0 ? '+' : '') + stats.netCredits.toLocaleString() : '...'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filtres</CardTitle>
              <CardDescription>Filtrer les transactions par utilisateur, type et date</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un utilisateur..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                </div>

                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type de transaction" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRANSACTION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <DateRangePicker
                  value={dateRange}
                  onChange={(r) => setDateRange(r)}
                  className="w-full max-w-sm"
                />

                <Button type="submit">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrer
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Évolution des Crédits</CardTitle>
                <CardDescription>Crédits ajoutés vs dépensés par jour</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {stats?.dailyTransactions ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={stats.dailyTransactions}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) => new Date(date).toLocaleDateString()}
                      />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number) => [value.toLocaleString(), '']}
                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="added"
                        name="Crédits Ajoutés"
                        stroke="#4ade80"
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="spent"
                        name="Crédits Dépensés"
                        stroke="#f87171"
                      />
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
                {stats?.transactionsByType ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.transactionsByType}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="totalCredits"
                        nameKey="type"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {stats.transactionsByType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [value.toLocaleString() + ' crédits', '']}
                      />
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

          {/* Monthly Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Transactions Mensuelles</CardTitle>
              <CardDescription>Évolution des crédits par mois</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {stats?.monthlyTransactions ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.monthlyTransactions}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [value.toLocaleString(), '']} />
                    <Legend />
                    <Bar dataKey="added" name="Crédits Ajoutés" fill="#4ade80" />
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
              <CardTitle>Liste des Transactions</CardTitle>
              <CardDescription>
                {transactions ? `${transactions.total} transactions trouvées` : 'Chargement des transactions...'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions ? (
                <DataTable
                  data={transactions.transactions}
                  columns={columns}
                  pagination={{
                    pageCount: transactions.totalPages,
                    page: transactions.page,
                    onPageChange: handlePageChange
                  }}
                  sorting={{
                    sortBy: filters.sortBy,
                    sortOrder: filters.sortOrder,
                    onSortChange: handleSortChange
                  }}
                />
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-muted-foreground">Chargement des transactions...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="user-details" className="space-y-6">
          {selectedUser && (
            <>
              <Button variant="outline" onClick={handleBackToOverview}>
                ← Retour à la vue d'ensemble
              </Button>
              <UserTransactionDetails userId={selectedUser} />
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
