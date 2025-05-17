'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Badge } from 'components/UI/Badge'
import { Button } from 'components/UI/Button'
import { Card } from 'components/UI/Card'
import { Input } from 'components/UI/Input'
import { Label } from 'components/UI/Label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from 'components/UI/Dialog'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Search, Filter, Download, Eye, Calendar, CreditCard, Crown, Package, User, RefreshCw } from 'lucide-react'
import axios from 'axios'
import { useAuth } from 'contexts/AuthContext'
import { toast } from 'react-toastify'
import type { Transaction, Item, PremiumPlan, CreditPack } from 'types/shop'
import { ToastDefaultOptions } from 'utils/toastOptions'
import { Checkbox } from 'components/UI/Checkbox'
import { DateRangePicker } from 'components/UI/DateRangePicker'
import { Popover, PopoverContent, PopoverTrigger } from 'components/UI/Popover'
import { DateRange, OnSelectHandler } from 'react-day-picker'

// Helper function to format currency
const formatCurrency = (amount: string | undefined) => {
  if (!amount) return '-'
  return `${Number.parseFloat(amount).toFixed(2)}€`
}

// Helper function to format date
const formatDate = (date: Date | string) => {
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: fr })
}

// Helper function to get transaction type label
const getTransactionTypeLabel = (type: string) => {
  switch (type) {
  case 'item_bought':
    return 'Achat d\'item'
  case 'premium_bought':
    return 'Achat premium'
  case 'credits_bought':
    return 'Achat de crédits'
  case 'gift_sent':
    return 'Cadeau envoyé'
  case 'gift_received':
    return 'Cadeau reçu'
  default:
    return type
  }
}

// Helper function to get transaction status badge
const getStatusBadge = (status: string) => {
  switch (status) {
  case 'completed':
    return <Badge className="bg-green-500">Complété</Badge>
  case 'pending':
    return <Badge className="bg-yellow-500">En attente</Badge>
  case 'canceled':
    return <Badge className="bg-red-500">Annulé</Badge>
  default:
    return <Badge className="bg-gray-500">{status}</Badge>
  }
}

// Helper function to get transaction icon
const getTransactionIcon = (transaction: Transaction) => {
  if (transaction.itemId) {
    return <Package className="h-5 w-5 text-purple-400" />
  } else if (transaction.premiumPlanId) {
    return <Crown className="h-5 w-5 text-yellow-400" />
  } else if (transaction.creditsPackId) {
    return <CreditCard className="h-5 w-5 text-blue-400" />
  } else {
    return <RefreshCw className="h-5 w-5 text-gray-400" />
  }
}

const AdminTransactionsPage: React.FC = () => {
  const { token } = useAuth()
  const [loading, setLoading] = useState<boolean>(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [premiumPlans, setPremiumPlans] = useState<PremiumPlan[]>([])
  const [creditPacks, setCreditPacks] = useState<CreditPack[]>([])

  // Filter states
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedTypes, setSelectedTypes] = useState<string[]>([
    'item_bought',
    'premium_bought',
    'credits_bought',
    'gift_sent',
    'gift_received',
  ])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['completed', 'pending', 'canceled'])
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [selectedItemId, setSelectedItemId] = useState<number | undefined>(undefined)
  const [selectedPremiumPlanId, setSelectedPremiumPlanId] = useState<number | undefined>(undefined)
  const [selectedCreditPackId, setSelectedCreditPackId] = useState<number | undefined>(undefined)
  const [minAmount, setMinAmount] = useState<string>('')
  const [maxAmount, setMaxAmount] = useState<string>('')
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState<boolean>(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState<boolean>(false)
  const [exportFormat, setExportFormat] = useState<string>('csv')

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [itemsPerPage, setItemsPerPage] = useState<number>(20)
  const [totalPages, setTotalPages] = useState<number>(1)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Fetch transactions
        const transactionsResponse = await axios.get<Transaction[]>('/api/admin/shop/transactions', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        // Fetch items, premium plans, and credit packs for filtering
        const itemsResponse = await axios.get<Item[]>('/api/admin/shop/items', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const premiumPlansResponse = await axios.get<PremiumPlan[]>('/api/admin/shop/premiumPlans', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const creditPacksResponse = await axios.get<CreditPack[]>('/api/admin/shop/creditPacks', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setTransactions(transactionsResponse.data)
        setFilteredTransactions(transactionsResponse.data)
        setItems(itemsResponse.data)
        setPremiumPlans(premiumPlansResponse.data)
        setCreditPacks(creditPacksResponse.data)

        // Calculate total pages
        setTotalPages(Math.ceil(transactionsResponse.data.length / itemsPerPage))
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Erreur lors du chargement des données', ToastDefaultOptions)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token, itemsPerPage])

  // Apply filters
  useEffect(() => {
    let filtered = [...transactions]

    // Filter by search query (user nickname, item name, etc.)
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (transaction) =>
          transaction.recipient?.nickname?.toLowerCase().includes(query) ||
          transaction.sender?.nickname?.toLowerCase().includes(query) ||
          transaction.item?.name?.toLowerCase().includes(query) ||
          transaction.premiumPlan?.name?.toLowerCase().includes(query) ||
          transaction.creditsPack?.credits?.toString().includes(query),
      )
    }

    // Filter by transaction types
    if (selectedTypes.length > 0) {
      filtered = filtered.filter((transaction) => selectedTypes.includes(transaction.type))
    }

    // Filter by transaction statuses
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((transaction) => selectedStatuses.includes(transaction.status))
    }

    // Filter by date range
    if (dateRange.from) {
      filtered = filtered.filter((transaction) => new Date(transaction.createdAt) >= dateRange.from!)
    }

    if (dateRange.to) {
      filtered = filtered.filter((transaction) => new Date(transaction.createdAt) <= dateRange.to!)
    }

    // Filter by item
    if (selectedItemId) {
      filtered = filtered.filter((transaction) => transaction.itemId === selectedItemId)
    }

    // Filter by premium plan
    if (selectedPremiumPlanId) {
      filtered = filtered.filter((transaction) => transaction.premiumPlanId === selectedPremiumPlanId)
    }

    // Filter by credit pack
    if (selectedCreditPackId) {
      filtered = filtered.filter((transaction) => transaction.creditsPackId === selectedCreditPackId)
    }

    // Filter by amount range
    if (minAmount) {
      filtered = filtered.filter(
        (transaction) => transaction.price && Number.parseFloat(transaction.price) >= Number.parseFloat(minAmount),
      )
    }

    if (maxAmount) {
      filtered = filtered.filter(
        (transaction) => transaction.price && Number.parseFloat(transaction.price) <= Number.parseFloat(maxAmount),
      )
    }

    setFilteredTransactions(filtered)
    setTotalPages(Math.ceil(filtered.length / itemsPerPage))
    setCurrentPage(1) // Reset to first page when filters change
  }, [
    transactions,
    searchQuery,
    selectedTypes,
    selectedStatuses,
    dateRange,
    selectedItemId,
    selectedPremiumPlanId,
    selectedCreditPackId,
    minAmount,
    maxAmount,
    itemsPerPage,
  ])

  // Get current page transactions
  const getCurrentPageTransactions = () => {
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    return filteredTransactions.slice(indexOfFirstItem, indexOfLastItem)
  }

  // Reset filters
  const resetFilters = () => {
    setSearchQuery('')
    setSelectedTypes(['item_bought', 'premium_bought', 'credits_bought', 'gift_sent', 'gift_received'])
    setSelectedStatuses(['completed', 'pending', 'canceled'])
    setDateRange({ from: undefined, to: undefined })
    setSelectedItemId(undefined)
    setSelectedPremiumPlanId(undefined)
    setSelectedCreditPackId(undefined)
    setMinAmount('')
    setMaxAmount('')
    setIsFilterDialogOpen(false)
  }

  // Export transactions
  const exportTransactions = () => {
    if (exportFormat === 'csv') {
      // Create CSV content
      const headers = ['ID', 'Date', 'Utilisateur', 'Type', 'Produit', 'Prix', 'Crédits', 'Statut']
      const csvContent = [
        headers.join(','),
        ...filteredTransactions.map((transaction) =>
          [
            transaction.id,
            formatDate(transaction.createdAt),
            transaction.user.nickname,
            getTransactionTypeLabel(transaction.type),
            transaction.item?.name || transaction.premiumPlan?.name || transaction.creditsPack?.credits || '-',
            transaction.price || '-',
            transaction.credits || '-',
            transaction.status,
          ].join(','),
        ),
      ].join('\n')

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setIsExportDialogOpen(false)
      toast.success('Export CSV réussi', ToastDefaultOptions)
    } else if (exportFormat === 'json') {
      // Create JSON content
      const jsonContent = JSON.stringify(filteredTransactions, null, 2)

      // Create download link
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', `transactions_${format(new Date(), 'yyyy-MM-dd')}.json`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setIsExportDialogOpen(false)
      toast.success('Export JSON réussi', ToastDefaultOptions)
    }
  }

  // Handle type checkbox change
  const handleTypeCheckboxChange = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type))
    } else {
      setSelectedTypes([...selectedTypes, type])
    }
  }

  // Handle status checkbox change
  const handleStatusCheckboxChange = (status: string) => {
    if (selectedStatuses.includes(status)) {
      setSelectedStatuses(selectedStatuses.filter((s) => s !== status))
    } else {
      setSelectedStatuses([...selectedStatuses, status])
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-indigo-950 to-gray-900 text-white p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
            Administration des Transactions
          </h1>
        </div>

        {/* Search and Filter Bar */}
        <Card className="bg-gray-800/50 backdrop-blur-sm border border-indigo-500/30 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Input
                type="text"
                placeholder="Rechercher par utilisateur, item, etc..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-900/50 border-indigo-500/30 pl-10"
              />
              <Search className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
            </div>

            <div className="flex gap-2">
              <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-indigo-500/30">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtres
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 border border-indigo-500/30 max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Filtres avancés</DialogTitle>
                  </DialogHeader>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    {/* Transaction Types */}
                    <div>
                      <h3 className="font-medium mb-2">Types de transaction</h3>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Checkbox
                            id="type-item"
                            checked={selectedTypes.includes('item_bought')}
                            onCheckedChange={() => handleTypeCheckboxChange('item_bought')}
                          />
                          <Label htmlFor="type-item" className="ml-2">
                            Achat d'item
                          </Label>
                        </div>
                        <div className="flex items-center">
                          <Checkbox
                            id="type-premium"
                            checked={selectedTypes.includes('premium_bought')}
                            onCheckedChange={() => handleTypeCheckboxChange('premium_bought')}
                          />
                          <Label htmlFor="type-premium" className="ml-2">
                            Achat premium
                          </Label>
                        </div>
                        <div className="flex items-center">
                          <Checkbox
                            id="type-credits"
                            checked={selectedTypes.includes('credits_bought')}
                            onCheckedChange={() => handleTypeCheckboxChange('credits_bought')}
                          />
                          <Label htmlFor="type-credits" className="ml-2">
                            Achat de crédits
                          </Label>
                        </div>
                        <div className="flex items-center">
                          <Checkbox
                            id="type-gift-sent"
                            checked={selectedTypes.includes('gift_sent')}
                            onCheckedChange={() => handleTypeCheckboxChange('gift_sent')}
                          />
                          <Label htmlFor="type-gift-sent" className="ml-2">
                            Cadeau envoyé
                          </Label>
                        </div>
                        <div className="flex items-center">
                          <Checkbox
                            id="type-gift-received"
                            checked={selectedTypes.includes('gift_received')}
                            onCheckedChange={() => handleTypeCheckboxChange('gift_received')}
                          />
                          <Label htmlFor="type-gift-received" className="ml-2">
                            Cadeau reçu
                          </Label>
                        </div>
                      </div>
                    </div>

                    {/* Transaction Statuses */}
                    <div>
                      <h3 className="font-medium mb-2">Statuts</h3>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Checkbox
                            id="status-completed"
                            checked={selectedStatuses.includes('completed')}
                            onCheckedChange={() => handleStatusCheckboxChange('completed')}
                          />
                          <Label htmlFor="status-completed" className="ml-2">
                            Complété
                          </Label>
                        </div>
                        <div className="flex items-center">
                          <Checkbox
                            id="status-pending"
                            checked={selectedStatuses.includes('pending')}
                            onCheckedChange={() => handleStatusCheckboxChange('pending')}
                          />
                          <Label htmlFor="status-pending" className="ml-2">
                            En attente
                          </Label>
                        </div>
                        <div className="flex items-center">
                          <Checkbox
                            id="status-canceled"
                            checked={selectedStatuses.includes('canceled')}
                            onCheckedChange={() => handleStatusCheckboxChange('canceled')}
                          />
                          <Label htmlFor="status-canceled" className="ml-2">
                            Annulé
                          </Label>
                        </div>
                      </div>
                    </div>

                    {/* Date Range */}
                    <div>
                      <h3 className="font-medium mb-2">Période</h3>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal border-indigo-500/30"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {dateRange.from ? (
                              dateRange.to ? (
                                <>
                                  {format(dateRange.from, 'dd/MM/yyyy')} - {format(dateRange.to, 'dd/MM/yyyy')}
                                </>
                              ) : (
                                format(dateRange.from, 'dd/MM/yyyy')
                              )
                            ) : (
                              'Sélectionner une période'
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-gray-800 border border-indigo-500/30">
                          <DateRangePicker
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange.from}
                            selected={dateRange}
                            onSelect={setDateRange as OnSelectHandler<DateRange|undefined>}
                            numberOfMonths={2}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Amount Range */}
                    <div>
                      <h3 className="font-medium mb-2">Montant (€)</h3>
                      <div className="flex gap-2">
                        <div>
                          <Label htmlFor="min-amount" className="sr-only">
                            Montant minimum
                          </Label>
                          <Input
                            id="min-amount"
                            type="number"
                            placeholder="Min"
                            value={minAmount}
                            onChange={(e) => setMinAmount(e.target.value)}
                            className="bg-gray-900/50 border-indigo-500/30"
                          />
                        </div>
                        <div>
                          <Label htmlFor="max-amount" className="sr-only">
                            Montant maximum
                          </Label>
                          <Input
                            id="max-amount"
                            type="number"
                            placeholder="Max"
                            value={maxAmount}
                            onChange={(e) => setMaxAmount(e.target.value)}
                            className="bg-gray-900/50 border-indigo-500/30"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Item Filter */}
                    <div>
                      <h3 className="font-medium mb-2">Item</h3>
                      <select
                        value={selectedItemId || ''}
                        onChange={(e) =>
                          setSelectedItemId(e.target.value ? Number.parseInt(e.target.value) : undefined)
                        }
                        className="w-full bg-gray-900/50 border border-indigo-500/30 rounded-md p-2"
                      >
                        <option value="">Tous les items</option>
                        {items.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Premium Plan Filter */}
                    <div>
                      <h3 className="font-medium mb-2">Plan Premium</h3>
                      <select
                        value={selectedPremiumPlanId || ''}
                        onChange={(e) =>
                          setSelectedPremiumPlanId(e.target.value ? Number.parseInt(e.target.value) : undefined)
                        }
                        className="w-full bg-gray-900/50 border border-indigo-500/30 rounded-md p-2"
                      >
                        <option value="">Tous les plans</option>
                        {premiumPlans.map((plan) => (
                          <option key={plan.id} value={plan.id}>
                            {plan.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Credit Pack Filter */}
                    <div>
                      <h3 className="font-medium mb-2">Pack de Crédits</h3>
                      <select
                        value={selectedCreditPackId || ''}
                        onChange={(e) =>
                          setSelectedCreditPackId(e.target.value ? Number.parseInt(e.target.value) : undefined)
                        }
                        className="w-full bg-gray-900/50 border border-indigo-500/30 rounded-md p-2"
                      >
                        <option value="">Tous les packs</option>
                        {creditPacks.map((pack) => (
                          <option key={pack.id} value={pack.id}>
                            {pack.credits} crédits
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={resetFilters} className="border-indigo-500/30">
                      Réinitialiser
                    </Button>
                    <Button onClick={() => setIsFilterDialogOpen(false)} className="bg-indigo-600 hover:bg-indigo-700">
                      Appliquer
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-indigo-500/30">
                    <Download className="h-4 w-4 mr-2" />
                    Exporter
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 border border-indigo-500/30">
                  <DialogHeader>
                    <DialogTitle>Exporter les transactions</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="export-format">Format</Label>
                      <select
                        id="export-format"
                        value={exportFormat}
                        onChange={(e) => setExportFormat(e.target.value)}
                        className="w-full bg-gray-900/50 border border-indigo-500/30 rounded-md p-2 mt-1"
                      >
                        <option value="csv">CSV</option>
                        <option value="json">JSON</option>
                      </select>
                    </div>

                    <div className="pt-2">
                      <Button onClick={exportTransactions} className="w-full bg-indigo-600 hover:bg-indigo-700">
                        <Download className="h-4 w-4 mr-2" />
                        Exporter {filteredTransactions.length} transactions
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchQuery ||
            selectedTypes.length < 5 ||
            selectedStatuses.length < 3 ||
            dateRange.from ||
            dateRange.to ||
            selectedItemId ||
            selectedPremiumPlanId ||
            selectedCreditPackId ||
            minAmount ||
            maxAmount) && (
            <div className="flex flex-wrap gap-2 mt-4">
              {searchQuery && (
                <Badge className="bg-indigo-600 px-3 py-1">
                  Recherche: {searchQuery}
                  <button className="ml-2 hover:text-gray-300" onClick={() => setSearchQuery('')}>
                    ×
                  </button>
                </Badge>
              )}

              {selectedTypes.length < 5 && (
                <Badge className="bg-purple-600 px-3 py-1">Types: {selectedTypes.length} sélectionnés</Badge>
              )}

              {selectedStatuses.length < 3 && (
                <Badge className="bg-blue-600 px-3 py-1">Statuts: {selectedStatuses.length} sélectionnés</Badge>
              )}

              {(dateRange.from || dateRange.to) && (
                <Badge className="bg-green-600 px-3 py-1">
                  Période: {dateRange.from ? format(dateRange.from, 'dd/MM/yyyy') : '...'} -{' '}
                  {dateRange.to ? format(dateRange.to, 'dd/MM/yyyy') : '...'}
                  <button
                    className="ml-2 hover:text-gray-300"
                    onClick={() => setDateRange({ from: undefined, to: undefined })}
                  >
                    ×
                  </button>
                </Badge>
              )}

              {selectedItemId && (
                <Badge className="bg-pink-600 px-3 py-1">
                  Item: {items.find((i) => i.id === selectedItemId)?.name}
                  <button className="ml-2 hover:text-gray-300" onClick={() => setSelectedItemId(undefined)}>
                    ×
                  </button>
                </Badge>
              )}

              {selectedPremiumPlanId && (
                <Badge className="bg-yellow-600 px-3 py-1">
                  Premium: {premiumPlans.find((p) => p.id === selectedPremiumPlanId)?.name}
                  <button className="ml-2 hover:text-gray-300" onClick={() => setSelectedPremiumPlanId(undefined)}>
                    ×
                  </button>
                </Badge>
              )}

              {selectedCreditPackId && (
                <Badge className="bg-blue-600 px-3 py-1">
                  Crédits: {creditPacks.find((c) => c.id === selectedCreditPackId)?.credits} crédits
                  <button className="ml-2 hover:text-gray-300" onClick={() => setSelectedCreditPackId(undefined)}>
                    ×
                  </button>
                </Badge>
              )}

              {(minAmount || maxAmount) && (
                <Badge className="bg-indigo-600 px-3 py-1">
                  Montant: {minAmount || '0'}€ - {maxAmount || '∞'}€
                  <button
                    className="ml-2 hover:text-gray-300"
                    onClick={() => {
                      setMinAmount('')
                      setMaxAmount('')
                    }}
                  >
                    ×
                  </button>
                </Badge>
              )}

              {(searchQuery ||
                selectedTypes.length < 5 ||
                selectedStatuses.length < 3 ||
                dateRange.from ||
                dateRange.to ||
                selectedItemId ||
                selectedPremiumPlanId ||
                selectedCreditPackId ||
                minAmount ||
                maxAmount) && (
                <Button variant="link" onClick={resetFilters} className="text-gray-400 hover:text-white p-0 h-auto">
                  Réinitialiser tous les filtres
                </Button>
              )}
            </div>
          )}
        </Card>

        {/* Transactions Table */}
        <Card className="bg-gray-800/50 backdrop-blur-sm border border-indigo-500/30 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-900/50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Utilisateur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Produit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Prix
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Crédits
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Statut
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {getCurrentPageTransactions().map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-700/30">
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{transaction.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(transaction.createdAt)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="cursor-pointer" data-profile={transaction.user.nickname}>{transaction.user.nickname}</span>
                          </div>
                          {transaction.type === 'gift_sent' && transaction.recipient && (
                            <div className="text-xs text-gray-400 mt-1">Envoyé à: {transaction.recipient.nickname}</div>
                          )}
                          {transaction.type === 'gift_received' && transaction.sender && (
                            <div className="text-xs text-gray-400 mt-1">Reçu de: {transaction.sender.nickname}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center">
                            {getTransactionIcon(transaction)}
                            <span className="ml-2">{getTransactionTypeLabel(transaction.type)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {transaction.item?.name ||
                          transaction.premiumPlan?.name ||
                          (transaction.creditsPack && `${transaction.creditsPack.credits} crédits`) ||
                          '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{formatCurrency(transaction.price)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={
                              transaction.credits && transaction.credits > 0
                                ? 'text-green-400'
                                : transaction.credits && transaction.credits < 0
                                  ? 'text-red-400'
                                  : ''
                            }
                          >
                            {transaction.credits && transaction.credits > 0
                              ? `+${transaction.credits}`
                              : transaction.credits || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{getStatusBadge(transaction.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedTransaction(transaction)}
                            className="hover:bg-gray-700/50"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Empty State */}
              {filteredTransactions.length === 0 && (
                <div className="text-center p-12">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mx-auto text-gray-500 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="text-xl font-semibold mb-2">Aucune transaction trouvée</h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    Aucune transaction ne correspond à vos critères de recherche. Essayez de modifier vos filtres.
                  </p>
                </div>
              )}

              {/* Pagination */}
              {filteredTransactions.length > 0 && (
                <div className="flex items-center justify-between px-6 py-4 bg-gray-900/30">
                  <div className="text-sm text-gray-400">
                    Affichage de {Math.min((currentPage - 1) * itemsPerPage + 1, filteredTransactions.length)} à{' '}
                    {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} sur{' '}
                    {filteredTransactions.length} transactions
                  </div>

                  <div className="flex items-center space-x-2">
                    <select
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                      className="bg-gray-900/50 border border-indigo-500/30 rounded-md p-1 text-sm"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="border-indigo-500/30"
                    >
                      Précédent
                    </Button>

                    <span className="text-sm">
                      Page {currentPage} sur {totalPages}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="border-indigo-500/30"
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>

        {/* Transaction Detail Dialog */}
        {selectedTransaction && (
          <Dialog open={!!selectedTransaction} onOpenChange={(open) => !open && setSelectedTransaction(null)}>
            <DialogContent className="bg-gray-800 border border-indigo-500/30 max-w-3xl">
              <DialogHeader>
                <DialogTitle>Détails de la transaction #{selectedTransaction.id}</DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <h3 className="font-medium mb-4 text-lg">Informations générales</h3>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">ID:</span>
                      <span>{selectedTransaction.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Date:</span>
                      <span>{formatDate(selectedTransaction.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type:</span>
                      <span>{getTransactionTypeLabel(selectedTransaction.type)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Statut:</span>
                      <span>{getStatusBadge(selectedTransaction.status)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Utilisateur ID:</span>
                      <span>{selectedTransaction.userId}</span>
                    </div>
                    {selectedTransaction.type === 'gift_sent' && selectedTransaction.recipient && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Destinataire:</span>
                        <span>
                          {selectedTransaction.recipient.nickname} (ID: {selectedTransaction.giftTo})
                        </span>
                      </div>
                    )}
                    {selectedTransaction.type === 'gift_received' && selectedTransaction.sender && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Expéditeur:</span>
                        <span>
                          {selectedTransaction.sender.nickname} (ID: {selectedTransaction.giftFrom})
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-4 text-lg">Détails financiers</h3>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Prix:</span>
                      <span>{formatCurrency(selectedTransaction.price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Crédits:</span>
                      <span
                        className={
                          selectedTransaction.credits && selectedTransaction.credits > 0
                            ? 'text-green-400'
                            : selectedTransaction.credits && selectedTransaction.credits < 0
                              ? 'text-red-400'
                              : ''
                        }
                      >
                        {selectedTransaction.credits && selectedTransaction.credits > 0
                          ? `+${selectedTransaction.credits}`
                          : selectedTransaction.credits || '-'}
                      </span>
                    </div>

                    {selectedTransaction.item && (
                      <>
                        <div className="border-t border-gray-700 my-3"></div>
                        <h4 className="font-medium">Détails de l'item</h4>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Nom:</span>
                          <span>{selectedTransaction.item.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">ID:</span>
                          <span>{selectedTransaction.item.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Catégorie:</span>
                          <span>{selectedTransaction.item.categoryId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Rareté:</span>
                          <span
                            className={
                              selectedTransaction.item.rarity === 'legendary'
                                ? 'text-yellow-400'
                                : selectedTransaction.item.rarity === 'epic'
                                  ? 'text-purple-400'
                                  : selectedTransaction.item.rarity === 'rare'
                                    ? 'text-blue-400'
                                    : 'text-gray-400'
                            }
                          >
                            {selectedTransaction.item.rarity.charAt(0).toUpperCase() +
                              selectedTransaction.item.rarity.slice(1)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Tag:</span>
                          <span
                            className='text-blue-400'
                          >
                            {selectedTransaction.item?.tag?.name || 'Aucun'}
                          </span>
                        </div>
                      </>
                    )}

                    {selectedTransaction.premiumPlan && (
                      <>
                        <div className="border-t border-gray-700 my-3"></div>
                        <h4 className="font-medium">Détails du plan premium</h4>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Nom:</span>
                          <span>{selectedTransaction.premiumPlan.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Durée:</span>
                          <span>{selectedTransaction.premiumPlan.duration} jours</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Crédits offerts:</span>
                          <span className="text-green-400">+{selectedTransaction.premiumPlan.credits}</span>
                        </div>
                      </>
                    )}

                    {selectedTransaction.creditsPack && (
                      <>
                        <div className="border-t border-gray-700 my-3"></div>
                        <h4 className="font-medium">Détails du pack de crédits</h4>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Crédits:</span>
                          <span>{selectedTransaction.creditsPack.credits}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Bonus:</span>
                          <span className="text-green-400">+{selectedTransaction.creditsPack.bonus}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button onClick={() => setSelectedTransaction(null)} className="bg-indigo-600 hover:bg-indigo-700">
                  Fermer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </motion.div>
    </div>
  )
}

export default AdminTransactionsPage
