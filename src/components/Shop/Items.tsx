'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Badge } from 'components/UI/Badge'
import { Button } from 'components/UI/Button'
import { Card } from 'components/UI/Card'
import axios from 'axios'
import { useUser } from 'contexts/UserContext'
import { useAuth } from 'contexts/AuthContext'
import { Gift, ShoppingCart, Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from 'components/UI/Dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from 'components/UI/Tooltip'
import { Category, Item, ShopData, TagType, UserInventory } from 'types/shop'
import { User } from 'types/user'
import { toast } from 'react-toastify'
import { ToastDefaultOptions } from 'utils/toastOptions'

const getIcon = (iconName : string) => {
  switch (iconName) {
  case 'sparkles':
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          d="M12 3l1.88 5.76h6.12l-4.94 3.58 1.88 5.76-4.94-3.58-4.94 3.58 1.88-5.76-4.94-3.58h6.12z"/>
      </svg>
    )
  case 'zap':
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    )
  case 'user':
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    )
  case 'message-circle':
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
      </svg>
    )
  case 'image':
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
    )
  default:
    return null
  }
}

const getRarityColor = (rarity : string) => {
  switch (rarity) {
  case 'common':
    return 'bg-gray-500'
  case 'rare':
    return 'bg-blue-500'
  case 'epic':
    return 'bg-purple-500'
  case 'legendary':
    return 'bg-yellow-500'
  default:
    return 'bg-gray-500'
  }
}

const ShopItems : React.FC<{ inventory: boolean }> = ({ inventory }) => {
  const { token } = useAuth()
  const { user, setUser } = useUser()
  const [loading, setLoading] = useState<boolean>(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<TagType[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [activeCategory, setActiveCategory] = useState<number>(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('featured')

  const [userInventory, setUserInventory] = useState<UserInventory[]>([])
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false)
  const [isGiftDialogOpen, setIsGiftDialogOpen] = useState(false)
  const [giftRecipient, setGiftRecipient] = useState('')
  const [purchaseLoading, setPurchaseLoading] = useState(false)

  const [searchGiftResults, setSearchGiftResults] = useState<User[]>([])
  useEffect(() => {
    async function retrieveShop() {
      try {
        const response = await axios.get<ShopData>('/api/shop')

        setCategories(response.data.categories)
        setItems(response.data.items.filter(i => i.enable ))
        setTags(response.data.tags)

        // Fetch user inventory
        const inventoryResponse = await axios.get('/api/users/inventory', {
          headers: { Authorization: `Bearer ${token}` },
        })
        setUserInventory(inventoryResponse.data.inventory || [])
      } catch (e) {
        console.log(e)
      } finally {
        setLoading(false)
      }
    }

    retrieveShop()
  }, [])

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (giftRecipient.trim() === '') {
        setSearchGiftResults([])
        return
      }
      try {
        const res = await axios.get<User[]>('/api/users/search', {
          params: { query: giftRecipient },
          headers: { Authorization: `Bearer ${ token }` },
        })
        setSearchGiftResults(res.data)
      } catch (error) {
        console.error('Erreur lors de la recherche d\'utilisateurs', error)
      }
    }
    fetchSearchResults()
  }, [giftRecipient, token])

  // Filter items by category and search query
  const filteredItems = items
    .filter((item) => item.categoryId === activeCategory)
    .filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter((item) => inventory ? userInventory.find(ui => ui.itemId === item.id) : true)
    .filter((item) => !inventory ? !userInventory.find(ui => ui.itemId === item.id) : true)

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'featured') {
      return (b.isFeatured ? 1: 0) - (a.isFeatured ? 1: 0)
    } else if (sortBy === 'new') {
      return (b.isNew ? 1: 0) - (a.isNew ? 1: 0)
    } else if (sortBy === 'price-low') {
      return (a.discountPrice || a.price) - (b.discountPrice || b.price)
    } else if (sortBy === 'price-high') {
      return (b.discountPrice || b.price) - (a.discountPrice || a.price)
    }
    return 0
  })

  const userOwnsItem = (itemId : number) => {
    return userInventory.some((item) => item.itemId === itemId)
  }

  // Check if item is equipped
  const isItemEquipped = (itemId : number) => {
    return userInventory.some((item) => item.itemId === itemId && item.equipped)
  }

  // Handle purchase confirmation
  const handlePurchaseConfirm = async () => {
    if (!selectedItem) return

    setPurchaseLoading(true)
    try {
      const response = await axios.post(
        '/api/shop/purchase',
        {
          itemId: selectedItem.id,
        },
        {
          headers: { Authorization: `Bearer ${ token }` },
        },
      )

      // Update user credits
      if (user) {
        const itemPrice = selectedItem.discountPrice || selectedItem.price
        setUser({
          ...user,
          credits: (user.credits || 0) - itemPrice,
        })
      }

      // Update inventory
      setUserInventory([...userInventory, {
        itemId: selectedItem.id,
        equipped: false,
      }])

      toast.success(`Achat réussi ! Vous avez acheté ${ selectedItem.name }`, ToastDefaultOptions)

      setIsPurchaseDialogOpen(false)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = await error?.response?.data
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorData.errors.forEach((error : { msg : string }) => {
            toast.error(error.msg, ToastDefaultOptions)
          })
        } else if (errorData.error) {
          toast.error(errorData.error, ToastDefaultOptions)
        }
      } else {
        console.error(error)
        toast.error('Erreur: Une erreur est survenue lors de l\'achat', ToastDefaultOptions)
      }
    } finally {
      setPurchaseLoading(false)
    }
  }

  // Handle gift confirmation
  const handleGiftConfirm = async () => {
    if (!selectedItem || !giftRecipient) return

    setPurchaseLoading(true)
    try {
      const response = await axios.post(
        '/api/shop/gift',
        {
          itemId: selectedItem.id,
          recipient: giftRecipient,
        },
        {
          headers: { Authorization: `Bearer ${ token }` },
        },
      )

      // Update user credits
      if (user) {
        const itemPrice = selectedItem.discountPrice || selectedItem.price
        setUser({
          ...user,
          credits: (user.credits || 0) - itemPrice,
        })
      }

      toast.info(`Cadeau envoyé ! Vous avez offert ${ selectedItem.name } à ${ giftRecipient }`, ToastDefaultOptions)

      setIsGiftDialogOpen(false)
      setGiftRecipient('')
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = await error?.response?.data
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorData.errors.forEach((error : { msg : string }) => {
            toast.error(error.msg, ToastDefaultOptions)
          })
        } else if (errorData.error) {
          toast.error(errorData.error, ToastDefaultOptions)
        }
      } else {
        console.error(error)
        toast.error('Erreur: Une erreur est survenue lors de l\'envoi du cadeau', ToastDefaultOptions)
      }
    } finally {
      setPurchaseLoading(false)
    }
  }

  // Handle equip item
  const handleEquipItem = async (itemId : number) => {
    try {
      const response = await axios.post(
        `/api/users/equip/${itemId}`,
        {},
        {
          headers: { Authorization: `Bearer ${ token }` },
        },
      )

      if (response.data.status === 'success') {
        // Update local inventory state
        setUserInventory(
          userInventory.map((item) => {
            if (item.itemId === itemId) {
              return { ...item, equipped: true }
            } else if (item.equipped) {
              // Unequip other items of the same category
              const itemCategory = items.find((i) => i.id === itemId)?.categoryId
              const thisItemCategory = items.find((i) => i.id === item.itemId)?.categoryId

              if (itemCategory === thisItemCategory) {
                return { ...item, equipped: false }
              }
            }
            return item
          }),
        )
        toast.info('Item équipé ! Vous avez équipé l\'item avec succès', ToastDefaultOptions)
      }
    } catch (error) {
      console.error(error)
      toast.error('Erreur: Une erreur est survenue lors de l\'équipement de l\'item', ToastDefaultOptions)
    }
  }

  return (
    <motion.div initial={ { opacity: 0 } } animate={ { opacity: 1 } }
      transition={ { duration: 0.3 } }>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar with categories */ }
        <div className="lg:col-span-1">
          <div
            className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-indigo-500/30 p-4 sticky top-4">
            <h3
              className="text-lg font-semibold mb-4 text-indigo-300">Catégories</h3>
            <div className="space-y-2">
              { categories.map((category) => (
                <button
                  key={ category.id }
                  onClick={ () => setActiveCategory(category.id) }
                  className={ `w-full flex items-center p-3 rounded-md transition-all ${
                    activeCategory === category.id
                      ? 'bg-indigo-900/70 text-white shadow-lg shadow-indigo-500/20'
                      : 'hover:bg-gray-700/50 text-gray-300'
                  }` }
                >
                  <span className="mr-3">{ getIcon(category.icon) }</span>
                  <span>{ category.name }</span>
                </button>
              )) }
            </div>
          </div>
        </div>

        {/* Main content */ }
        <div className="lg:col-span-3 space-y-6">
          {/* Search and sort */ }
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Rechercher..."
                value={ searchQuery }
                onChange={ (e) => setSearchQuery(e.target.value) }
                className="w-full bg-gray-800/50 backdrop-blur-sm border border-indigo-500/30 rounded-lg p-3 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 absolute left-3 top-3.5 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <select
              value={ sortBy }
              onChange={ (e) => setSortBy(e.target.value) }
              className="bg-gray-800/50 backdrop-blur-sm border border-indigo-500/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="featured">En vedette</option>
              <option value="new">Nouveautés</option>
              <option value="price-low">Prix: Croissant</option>
              <option value="price-high">Prix: Décroissant</option>
            </select>
          </div>

          {/* Items grid */ }
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            { sortedItems.map((item) => {
              const itemPrice = item.discountPrice || item.price
              const userCanAfford = (user?.credits || 0) >= itemPrice
              const creditsNeeded = itemPrice - (user?.credits || 0)
              const owned = userOwnsItem(item.id)
              const equipped = isItemEquipped(item.id)

              return (
                <motion.div
                  key={ item.id }
                  initial={ { opacity: 0, y: 20 } }
                  animate={ { opacity: 1, y: 0 } }
                  transition={ { duration: 0.3 } }
                >
                  <Card
                    className="overflow-hidden bg-gray-800/50 backdrop-blur-sm border border-indigo-500/30 hover:border-indigo-400/50 transition-all h-full flex flex-col">
                    <div className="relative">
                      <img
                        src={ item.image || '/placeholder.svg' }
                        alt={ item.name }
                        className="w-full h-auto"
                      />
                      <div
                        className="absolute top-2 left-2 flex flex-col gap-2">
                        { item.isNew && <Badge
                          className="bg-green-500 hover:bg-green-600">Nouveau</Badge> }
                        { item.isFeatured && <Badge
                          className="bg-blue-500 hover:bg-blue-600">Vedette</Badge> }
                        { equipped && <Badge
                          className="bg-purple-500 hover:bg-purple-600">Équipé</Badge> }
                      </div>
                      <div className="absolute top-2 right-2">
                        <Badge
                          className={ `${ getRarityColor(item.rarity) }` }>
                          { item.rarity === 'common' && 'Commun' }
                          { item.rarity === 'rare' && 'Rare' }
                          { item.rarity === 'epic' && 'Épique' }
                          { item.rarity === 'legendary' && 'Légendaire' }
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4 flex-grow flex flex-col">
                      <h3
                        className="text-lg font-semibold mb-2">{ item.name }</h3>
                      <p
                        className="text-gray-400 text-sm mb-4 flex-grow">{ item.description }</p>
                      <div
                        className="flex items-center justify-between mt-auto">
                        { !inventory && !userInventory.find(ui => ui.itemId === item.id) ? (
                          <div className="flex items-center">
                            { item.discountPrice ? (
                              <>
                                <span
                                  className="text-gray-400 line-through mr-2">{ item.price }</span>
                                <span
                                  className="text-white font-bold">{ item.discountPrice }</span>
                              </>
                            ): (
                              <span
                                className="text-white font-bold">{ item.price }</span>
                            ) }
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 ml-1 text-indigo-400"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <circle cx="12" cy="12" r="10"/>
                              <path d="M16 12l-4 4-4-4M12 8v8"/>
                            </svg>
                          </div>
                        ) : userInventory && userInventory.length > 0 && (
                          <div className="flex items-center">
                            <span
                              className="text-gray-400 line-through mr-2">Acheté</span>
                          </div>
                        )}
                        <div className="flex space-x-2">

                          { owned ? (
                            <Button
                              variant={ equipped ? 'secondary': 'default' }
                              className={
                                equipped ? 'bg-purple-700 hover:bg-purple-800': 'bg-indigo-600 hover:bg-indigo-700'
                              }
                              onClick={ () => handleEquipItem(item.id) }
                              disabled={ equipped }
                            >
                              { equipped ? (
                                <>
                                  <Check className="h-4 w-4 mr-1"/>
                                  Équipé
                                </>
                              ): (
                                'Équiper'
                              ) }
                            </Button>
                          ): (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div>
                                    <Button
                                      className="bg-indigo-600 hover:bg-indigo-700"
                                      disabled={ !userCanAfford }
                                      onClick={ () => {
                                        setSelectedItem(item)
                                        setIsPurchaseDialogOpen(true)
                                      } }
                                    >
                                      <ShoppingCart className="h-4 w-4 mr-1"/>
                                      Acheter
                                    </Button>
                                  </div>
                                </TooltipTrigger>
                                { !userCanAfford && (
                                  <TooltipContent>
                                    <p>Il vous
                                      manque { creditsNeeded } crédits</p>
                                  </TooltipContent>
                                ) }
                              </Tooltip>
                            </TooltipProvider>
                          ) }

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div>
                                  <Button
                                    variant="outline"
                                    className="border-indigo-500/30 hover:bg-gray-700/50"
                                    disabled={ !userCanAfford }
                                    onClick={ () => {
                                      setSelectedItem(item)
                                      setIsGiftDialogOpen(true)
                                    } }
                                  >
                                    <Gift className="h-4 w-4"/>
                                  </Button>
                                </div>
                              </TooltipTrigger>
                              { !userCanAfford ? (
                                <TooltipContent>
                                  <p>Il vous
                                    manque { creditsNeeded } crédits</p>
                                </TooltipContent>
                              ): (
                                <TooltipContent>
                                  <p>Offrir cet item</p>
                                </TooltipContent>
                              ) }
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            }) }
          </div>

          {/* Empty state */ }
          { sortedItems.length === 0 && (
            <div
              className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-indigo-500/30 p-8 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-gray-500 mb-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
              <h3 className="text-xl font-semibold mb-2">Aucun article
                trouvé</h3>
              <p className="text-gray-400">
                Aucun article ne correspond à votre recherche. Essayez de
                modifier vos critères.
              </p>
            </div>
          ) }
        </div>
      </div>

      {/* Purchase Confirmation Dialog */ }
      <Dialog open={ isPurchaseDialogOpen }
        onOpenChange={ setIsPurchaseDialogOpen }>
        <DialogContent
          className="bg-gray-800 border border-indigo-500/30 text-white">
          <DialogHeader>
            <DialogTitle>Confirmer l'achat</DialogTitle>
            <DialogDescription className="text-gray-300">Êtes-vous sûr de
              vouloir acheter cet item ?</DialogDescription>
          </DialogHeader>

          { selectedItem && (
            <div className="flex items-start space-x-4 py-4">
              <div
                className="w-auto h-24 rounded-md overflow-hidden flex-shrink-0">
                <img
                  src={ selectedItem.image || '/placeholder.svg' }
                  alt={ selectedItem.name }
                  className="w-full h-full"
                />
              </div>
              <div className="flex-1">
                <h3
                  className="text-lg font-semibold mb-1">{ selectedItem.name }</h3>
                <Badge
                  className={ `${ getRarityColor(selectedItem.rarity) } mb-2` }>
                  { selectedItem.rarity === 'common' && 'Commun' }
                  { selectedItem.rarity === 'rare' && 'Rare' }
                  { selectedItem.rarity === 'epic' && 'Épique' }
                  { selectedItem.rarity === 'legendary' && 'Légendaire' }
                </Badge>
                <p
                  className="text-gray-300 text-sm">{ selectedItem.description }</p>
                <div className="mt-3 flex items-center">
                  <span className="text-gray-300 mr-2">Prix:</span>
                  { selectedItem.discountPrice ? (
                    <>
                      <span
                        className="text-gray-400 line-through mr-2">{ selectedItem.price }</span>
                      <span
                        className="text-white font-bold">{ selectedItem.discountPrice }</span>
                    </>
                  ): (
                    <span
                      className="text-white font-bold">{ selectedItem.price }</span>
                  ) }
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-1 text-indigo-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M16 12l-4 4-4-4M12 8v8"/>
                  </svg>
                </div>
              </div>
            </div>
          ) }

          <DialogFooter>
            <Button
              variant="outline"
              onClick={ () => setIsPurchaseDialogOpen(false) }
              className="border-indigo-500/30 hover:bg-gray-700/50"
            >
              Annuler
            </Button>
            <Button
              onClick={ handlePurchaseConfirm }
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={ purchaseLoading }
            >
              { purchaseLoading ? 'Traitement...': 'Confirmer l\'achat' }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Gift Dialog */ }
      <Dialog open={ isGiftDialogOpen } onOpenChange={ setIsGiftDialogOpen }>
        <DialogContent
          className="bg-gray-800 border border-indigo-500/30 text-white">
          <DialogHeader>
            <DialogTitle>Offrir un cadeau</DialogTitle>
            <DialogDescription className="text-gray-300">
              Entrez le nom du joueur à qui vous souhaitez offrir cet item.
            </DialogDescription>
          </DialogHeader>

          { selectedItem && (
            <div className="flex items-start space-x-4 py-4">
              <div
                className="w-auto h-24 rounded-md overflow-hidden flex-shrink-0">
                <img
                  src={ selectedItem.image || '/placeholder.svg' }
                  alt={ selectedItem.name }
                  className="w-full h-full"
                />
              </div>
              <div className="flex-1">
                <h3
                  className="text-lg font-semibold mb-1">{ selectedItem.name }</h3>
                <Badge
                  className={ `${ getRarityColor(selectedItem.rarity) } mb-2` }>
                  { selectedItem.rarity === 'common' && 'Commun' }
                  { selectedItem.rarity === 'rare' && 'Rare' }
                  { selectedItem.rarity === 'epic' && 'Épique' }
                  { selectedItem.rarity === 'legendary' && 'Légendaire' }
                </Badge>
                <div className="mt-3 flex items-center">
                  <span className="text-gray-300 mr-2">Prix:</span>
                  { selectedItem.discountPrice ? (
                    <>
                      <span
                        className="text-gray-400 line-through mr-2">{ selectedItem.price }</span>
                      <span
                        className="text-white font-bold">{ selectedItem.discountPrice }</span>
                    </>
                  ): (
                    <span
                      className="text-white font-bold">{ selectedItem.price }</span>
                  ) }
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-1 text-indigo-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M16 12l-4 4-4-4M12 8v8"/>
                  </svg>
                </div>
              </div>
            </div>
          ) }

          <div className="py-2">
            <label htmlFor="recipient"
              className="block text-sm font-medium text-gray-300 mb-1">
              Nom du destinataire
            </label>
            <input
              id="recipient"
              type="text"
              value={ giftRecipient }
              onChange={ (e) => setGiftRecipient(e.target.value) }
              placeholder="Entrez le nom du joueur"
              autoComplete="off"
              className="w-full bg-gray-900/50 border border-indigo-500/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            { searchGiftResults.length > 0 ? (
              <ul
                className="bg-slate-800/90 border border-slate-700/50 rounded-md max-h-48 overflow-y-auto">
                { searchGiftResults.map((user) => (
                  <li
                    key={ user.id }
                    className="px-3 py-2 hover:bg-slate-700/50 cursor-pointer text-slate-300 hover:text-slate-100 transition-colors border-b border-slate-700/30 last:border-0"
                    onClick={ () => {
                      setGiftRecipient(user.nickname)
                      setSearchGiftResults([])
                    } }
                  >
                    { user.nickname }
                  </li>
                )) }
              </ul>
            ): (
              searchQuery.trim() !== '' &&
              <p className="text-slate-400 text-sm py-2">Aucune
                correspondance</p>
            ) }
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={ () => setIsGiftDialogOpen(false) }
              className="border-indigo-500/30 hover:bg-gray-700/50"
            >
              Annuler
            </Button>
            <Button
              onClick={ handleGiftConfirm }
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={ purchaseLoading || !giftRecipient }
            >
              { purchaseLoading ? 'Traitement...': 'Envoyer le cadeau' }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

export default ShopItems
