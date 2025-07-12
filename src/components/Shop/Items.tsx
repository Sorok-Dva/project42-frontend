'use client'
import type React from 'react'
import { useEffect, useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Badge } from 'components/UI/Badge'
import { Button } from 'components/UI/Button'
import { Card } from 'components/UI/Card'
import axios from 'axios'
import { useUser } from 'contexts/UserContext'
import { useAuth } from 'contexts/AuthContext'
import {
  Gift,
  ShoppingCart,
  Check,
  Bomb,
  Minus,
  Plus,
  ChevronDown,
  ChevronRight,
  VenetianMask,
  Loader,
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from 'components/UI/Dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from 'components/UI/Tooltip'
import type { Category, Item, ShopData, TagType, UserInventory } from 'types/shop'
import type { User } from 'types/user'
import { toast } from 'react-toastify'
import { ToastDefaultOptions } from 'utils/toastOptions'
import { AvatarCanvas } from 'components/Avatar/Animated'

const getIcon = (iconName: string) => {
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
        <path d="M12 3l1.88 5.76h6.12l-4.94 3.58 1.88 5.76-4.94-3.58-4.94 3.58 1.88-5.76-4.94-3.58h6.12z" />
      </svg>
    )
  case 'bomb':
    return <Bomb />
  case 'mask':
    return <VenetianMask />
  case 'danse':
    return <Loader />
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
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
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
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
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
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
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
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    )
  default:
    return null
  }
}

const getRarityColor = (rarity: string) => {
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

// Mapping des types de skins vers des noms français et icônes
const skinTypeMapping = {
  outfit: { name: 'Tenues', icon: '👗' },
  hair: { name: 'Cheveux', icon: '💇' },
  bottom: { name: 'Pantalons', icon: '👖' },
  footwear: { name: 'Chaussures', icon: '👟' },
  top: { name: 'Hauts', icon: '👕' },
  glasses: { name: 'Lunettes', icon: '🕶️' },
  headwear: { name: 'Chapeaux', icon: '🎩' },
  facewear: { name: 'Accessoires visage', icon: '😷' },
  facemask: { name: 'Masques', icon: '🎭' },
}

const animationTypeMapping = {
  idle: { name: 'Attente', icon: '🧍' },
  dance: { name: 'Danse', icon: '💃' },
  expression: { name: 'Expressions', icon: '😄' },
  locomotion: { name: 'Mouvement', icon: '🏃' },
}

const ITEMS_PER_PAGE = 24

const ShopItems: React.FC<{ inventory: boolean }> = ({ inventory }) => {
  const { token } = useAuth()
  const { user, setUser } = useUser()
  const premiumDate = user?.premium ? new Date(user.premium) : null
  const isPremium = premiumDate ? new Date().getTime() < premiumDate.getTime() : false

  const [loading, setLoading] = useState<boolean>(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<TagType[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [activeCategory, setActiveCategory] = useState<number>(1)
  const [activeSkinType, setActiveSkinType] = useState<string>('all')
  const [activeAnimationType, setActiveAnimationType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('featured')
  const [skinCategoriesExpanded, setSkinCategoriesExpanded] = useState(false)
  const [animationCategoriesExpanded, setAnimationCategoriesExpanded] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const [userInventory, setUserInventory] = useState<UserInventory[]>([])
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false)
  const [isGiftDialogOpen, setIsGiftDialogOpen] = useState(false)
  const [giftRecipient, setGiftRecipient] = useState('')
  const [purchaseLoading, setPurchaseLoading] = useState(false)
  const [purchaseQuantity, setPurchaseQuantity] = useState(1)
  const [giftQuantity, setGiftQuantity] = useState(1)

  const [searchGiftResults, setSearchGiftResults] = useState<User[]>([])

  const [animationTooltip, setAnimationTooltip] = useState<{
    show: boolean
    item: Item | null
    x: number
    y: number
  }>({ show: false, item: null, x: 0, y: 0 })

  const [isAnimationEventDialogOpen, setIsAnimationEventDialogOpen] = useState(false)
  const [selectedAnimationEvent, setSelectedAnimationEvent] = useState<'idle' | 'gameStart' | 'gameWin' | 'gameLoose'>(
    'idle',
  )
  const [pendingEquipItemId, setPendingEquipItemId] = useState<number | null>(null)

  useEffect(() => {
    async function retrieveShop() {
      try {
        const response = await axios.get<ShopData>('/api/shop')

        setCategories(response.data.categories)
        setItems(response.data.items.filter((i) => i.enable))
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
          headers: { Authorization: `Bearer ${token}` },
        })
        setSearchGiftResults(res.data)
      } catch (error) {
        console.error('Erreur lors de la recherche d\'utilisateurs', error)
      }
    }
    fetchSearchResults()
  }, [giftRecipient, token])

  // Memoized helpers pour optimiser les performances
  const availableSkinTypes = useMemo(() => {
    return Array.from(
      new Set(items.filter((i) => i.categoryId === 5 && i.avatarSkin?.type).map((i) => i.avatarSkin!.type)),
    ).sort()
  }, [items])

  const availableAnimationTypes = useMemo(() => {
    return Array.from(
      new Set(items.filter((i) => i.categoryId === 6 && i.avatarAnimation?.type).map((i) => i.avatarAnimation!.type)),
    ).sort()
  }, [items])

  const getSkinTypeCount = useCallback(
    (type: string) => {
      const filteredItems = items.filter(
        (item) =>
          item.categoryId === 5 &&
          item.avatarSkin?.type === type &&
          item.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )

      if (inventory) {
        // In inventory mode, count only owned items
        return filteredItems.filter((item) => userInventory.find((ui) => ui.itemId === item.id)).length
      } else {
        // In shop mode, count all items
        return filteredItems.length
      }
    },
    [items, searchQuery, inventory, userInventory],
  )

  const getAnimationTypeCount = useCallback(
    (type: string) => {
      const filteredItems = items.filter(
        (item) =>
          item.categoryId === 6 &&
          item.avatarAnimation?.type === type &&
          item.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )

      if (inventory) {
        // In inventory mode, count only owned items
        return filteredItems.filter((item) => userInventory.find((ui) => ui.itemId === item.id)).length
      } else {
        // In shop mode, count all items
        return filteredItems.length
      }
    },
    [items, searchQuery, inventory, userInventory],
  )

  // Filtrage optimisé avec useMemo
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => item.categoryId === activeCategory)
      .filter((item) => {
        // Si on est dans la catégorie skins (5) et qu'un type spécifique est sélectionné
        if (activeCategory === 5 && activeSkinType !== 'all') {
          return item.avatarSkin?.type === activeSkinType
        }
        // Si on est dans la catégorie animations (6) et qu'un type spécifique est sélectionné
        if (activeCategory === 6 && activeAnimationType !== 'all') {
          return item.avatarAnimation?.type === activeAnimationType
        }
        return true
      })
      .filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .filter((item) => {
        if (inventory) {
          // Dans l'inventaire : afficher seulement les items possédés
          return userInventory.find((ui) => ui.itemId === item.id)
        } else {
          // Dans le shop : afficher tous les items sauf ceux possédés (mais pas les jetables)
          const isOwned = userInventory.find((ui) => ui.itemId === item.id)
          const isConsumable = item.categoryId === 4

          // Si c'est jetable, toujours afficher
          if (isConsumable) return true

          // Sinon, afficher seulement si pas possédé
          return !isOwned
        }
      })
  }, [items, activeCategory, activeSkinType, activeAnimationType, searchQuery, inventory, userInventory])

  // Tri optimisé avec useMemo
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      if (sortBy === 'featured') {
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)
      } else if (sortBy === 'new') {
        return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)
      } else if (sortBy === 'price-low') {
        return (a.discountPrice || a.price) - (b.discountPrice || b.price)
      } else if (sortBy === 'price-high') {
        return (b.discountPrice || b.price) - (a.discountPrice || a.price)
      }
      return 0
    })
  }, [filteredItems, sortBy])

  // Pagination
  const totalPages = Math.ceil(sortedItems.length / ITEMS_PER_PAGE)
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return sortedItems.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [sortedItems, currentPage])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [activeCategory, activeSkinType, activeAnimationType, searchQuery, sortBy])

  const userOwnsItem = useCallback(
    (itemId: number) => {
      return userInventory.some((item) => item.itemId === itemId)
    },
    [userInventory],
  )

  const isItemEquipped = useCallback(
    (itemId: number) => {
      return userInventory.some((item) => item.itemId === itemId && item.equipped)
    },
    [userInventory],
  )

  const getItemQuantity = useCallback(
    (itemId: number) => {
      const inventoryItem = userInventory.find((item) => item.itemId === itemId)
      return inventoryItem?.quantity || 0
    },
    [userInventory],
  )

  // Handle purchase confirmation
  const handlePurchaseConfirm = async () => {
    if (!selectedItem) return

    setPurchaseLoading(true)
    try {
      const response = await axios.post(
        '/api/shop/purchase',
        {
          itemId: selectedItem.id,
          quantity: purchaseQuantity,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      // Update user credits
      if (user) {
        const itemPrice = (selectedItem.discountPrice || selectedItem.price) * purchaseQuantity
        setUser({
          ...user,
          credits: (user.credits || 0) - itemPrice,
        })
      }

      // Update inventory
      const existingItem = userInventory.find((item) => item.itemId === selectedItem.id)
      if (existingItem) {
        // Update quantity for existing item
        setUserInventory(
          userInventory.map((item) =>
            item.itemId === selectedItem.id ? { ...item, quantity: (item.quantity || 1) + purchaseQuantity } : item,
          ),
        )
      } else {
        // Add new item to inventory
        setUserInventory([
          ...userInventory,
          {
            itemId: selectedItem.id,
            equipped: false,
            quantity: purchaseQuantity,
          },
        ])
      }

      toast.success(`Achat réussi ! Vous avez acheté ${purchaseQuantity}x ${selectedItem.name}`, ToastDefaultOptions)

      setIsPurchaseDialogOpen(false)
      setPurchaseQuantity(1)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = await error?.response?.data
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorData.errors.forEach((error: { msg: string }) => {
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
          quantity: giftQuantity,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      // Update user credits
      if (user) {
        const itemPrice = (selectedItem.discountPrice || selectedItem.price) * giftQuantity
        setUser({
          ...user,
          credits: (user.credits || 0) - itemPrice,
        })
      }

      toast.info(
        `Cadeau envoyé ! Vous avez offert ${giftQuantity}x ${selectedItem.name} à ${giftRecipient}`,
        ToastDefaultOptions,
      )

      setIsGiftDialogOpen(false)
      setGiftRecipient('')
      setGiftQuantity(1)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = await error?.response?.data
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorData.errors.forEach((error: { msg: string }) => {
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

  const handleEquipItem = async (itemId: number, animationEvent?: 'idle' | 'gameStart' | 'gameWin' | 'gameLoose') => {
    const item = items.find((i) => i.id === itemId)

    // If it's an animation and no event is specified, open the event selection dialog
    if (item?.categoryId === 6 && !animationEvent) {
      setPendingEquipItemId(itemId)
      setIsAnimationEventDialogOpen(true)
      return
    }

    try {
      const requestBody = item?.categoryId === 6 && animationEvent ? { animationEvent } : {}

      const response = await axios.post(`/api/users/equip/${itemId}`, requestBody, {
        headers: { Authorization: `Bearer ${token}` },
      })

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

        const eventText = animationEvent ? ` pour l'événement ${animationEvent}` : ''
        toast.info(`Item équipé ! Vous avez équipé l'item avec succès${eventText}`, ToastDefaultOptions)
      }
    } catch (error) {
      console.error(error)
      toast.error('Erreur: Une erreur est survenue lors de l\'équipement de l\'item', ToastDefaultOptions)
    }
  }

  const handleAnimationEventConfirm = () => {
    if (pendingEquipItemId) {
      handleEquipItem(pendingEquipItemId, selectedAnimationEvent)
      setIsAnimationEventDialogOpen(false)
      setPendingEquipItemId(null)
      setSelectedAnimationEvent('idle')
    }
  }

  const openPurchaseModal = (item: Item) => {
    setSelectedItem(item)
    setPurchaseQuantity(1)
    setIsPurchaseDialogOpen(true)
  }

  const openGiftModal = (item: Item) => {
    setSelectedItem(item)
    setGiftQuantity(1)
    setIsGiftDialogOpen(true)
  }

  // Handle category change
  const handleCategoryChange = (categoryId: number) => {
    setActiveCategory(categoryId)
    setActiveSkinType('all')
    setActiveAnimationType('all')

    // Auto-étendre les sous-catégories pour skins et animations
    if (categoryId === 5) {
      setSkinCategoriesExpanded(true)
      setAnimationCategoriesExpanded(false)
    } else if (categoryId === 6) {
      setAnimationCategoriesExpanded(true)
      setSkinCategoriesExpanded(false)
    } else {
      setSkinCategoriesExpanded(false)
      setAnimationCategoriesExpanded(false)
    }

    setCurrentPage(1)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar with categories */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-indigo-500/30 p-4 sticky top-4">
            <h3 className="text-lg font-semibold mb-4 text-indigo-300">Catégories</h3>
            <div className="space-y-2">
              {categories.map((cat) => (
                <div key={cat.id}>
                  <button
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`w-full flex items-center p-3 rounded-md transition-all ${
                      activeCategory === cat.id
                        ? 'bg-indigo-900/70 text-white shadow-lg shadow-indigo-500/20'
                        : 'hover:bg-gray-700/50 text-gray-300'
                    }`}
                  >
                    <span className="mr-3">{getIcon(cat.icon)}</span>
                    <span className="flex-1 text-left">{cat.name}</span>
                    {/* Toggle subcategories */}
                    {cat.id === 5 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSkinCategoriesExpanded((x) => !x)
                        }}
                        className="ml-2 p-1 hover:bg-gray-600/50 rounded"
                      >
                        {skinCategoriesExpanded ? <ChevronDown /> : <ChevronRight />}
                      </button>
                    )}
                    {cat.id === 6 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setAnimationCategoriesExpanded((x) => !x)
                        }}
                        className="ml-2 p-1 hover:bg-gray-600/50 rounded"
                      >
                        {animationCategoriesExpanded ? <ChevronDown /> : <ChevronRight />}
                      </button>
                    )}
                  </button>
                  {/* Skins subcat */}
                  {cat.id === 5 && activeCategory === 5 && skinCategoriesExpanded && (
                    <div className="ml-4 mt-2 space-y-1">
                      <button
                        onClick={() => setActiveSkinType('all')}
                        className={`w-full flex items-center justify-between p-2 rounded-md text-sm transition-all ${
                          activeSkinType === 'all'
                            ? 'bg-indigo-800/50 text-white'
                            : 'hover:bg-gray-700/30 text-gray-400'
                        }`}
                      >
                        <span>🎯 Tous les skins</span>
                        <span className="text-xs bg-gray-600/50 px-2 py-1 rounded">
                          {inventory
                            ? items.filter((i) => i.categoryId === 5 && userInventory.find((ui) => ui.itemId === i.id))
                              .length
                            : items.filter((i) => i.categoryId === 5).length}
                        </span>
                      </button>
                      {availableSkinTypes.map((type) => (
                        <button
                          key={type}
                          onClick={() => setActiveSkinType(type)}
                          className={`w-full flex items-center justify-between p-2 rounded-md text-sm transition-all ${
                            activeSkinType === type
                              ? 'bg-indigo-800/50 text-white'
                              : 'hover:bg-gray-700/30 text-gray-400'
                          }`}
                        >
                          <span>
                            {skinTypeMapping[type as keyof typeof skinTypeMapping]?.icon}{' '}
                            {skinTypeMapping[type as keyof typeof skinTypeMapping]?.name || type}
                          </span>
                          <span className="text-xs bg-gray-600/50 px-2 py-1 rounded">{getSkinTypeCount(type)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {/* Animations subcat */}
                  {cat.id === 6 && activeCategory === 6 && animationCategoriesExpanded && (
                    <div className="ml-4 mt-2 space-y-1">
                      <button
                        onClick={() => setActiveAnimationType('all')}
                        className={`w-full flex items-center justify-between p-2 rounded-md text-sm transition-all ${
                          activeAnimationType === 'all'
                            ? 'bg-indigo-800/50 text-white'
                            : 'hover:bg-gray-700/30 text-gray-400'
                        }`}
                      >
                        <span>🎯 Toutes les animations</span>
                        <span className="text-xs bg-gray-600/50 px-2 py-1 rounded">
                          {inventory
                            ? items.filter((i) => i.categoryId === 6 && userInventory.find((ui) => ui.itemId === i.id))
                              .length
                            : items.filter((i) => i.categoryId === 6).length}
                        </span>
                      </button>
                      {availableAnimationTypes.map((type) => (
                        <button
                          key={type}
                          onClick={() => setActiveAnimationType(type)}
                          className={`w-full flex items-center justify-between p-2 rounded-md text-sm transition-all ${
                            activeAnimationType === type
                              ? 'bg-indigo-800/50 text-white'
                              : 'hover:bg-gray-700/30 text-gray-400'
                          }`}
                        >
                          <span>
                            {animationTypeMapping[type as keyof typeof animationTypeMapping]?.icon}{' '}
                            {animationTypeMapping[type as keyof typeof animationTypeMapping]?.name || type}
                          </span>
                          <span className="text-xs bg-gray-600/50 px-2 py-1 rounded">
                            {getAnimationTypeCount(type)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* User credits display */}
            <div className="mt-6 p-3 bg-indigo-900/30 rounded-lg border border-indigo-500/30">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Vos crédits:</span>
                <span className="text-white font-bold flex items-center">
                  {user?.credits || 0}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-1 text-indigo-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M16 12l-4 4-4-4M12 8v8" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search and sort */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-800/50 backdrop-blur-sm border border-indigo-500/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="featured">En vedette</option>
              <option value="new">Nouveautés</option>
              <option value="price-low">Prix: Croissant</option>
              <option value="price-high">Prix: Décroissant</option>
            </select>
          </div>

          {/* Breadcrumb */}
          {((activeCategory === 5 && activeSkinType !== 'all') ||
            (activeCategory === 6 && activeAnimationType !== 'all')) && (
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>{activeCategory === 5 ? 'Skins' : 'Animations'}</span>
              <span>›</span>
              <span className="text-indigo-300">
                {activeCategory === 5
                  ? `${skinTypeMapping[activeSkinType as keyof typeof skinTypeMapping]?.icon} ${
                    skinTypeMapping[activeSkinType as keyof typeof skinTypeMapping]?.name || activeSkinType
                  }`
                  : `${animationTypeMapping[activeAnimationType as keyof typeof animationTypeMapping]?.icon} ${
                    animationTypeMapping[activeAnimationType as keyof typeof animationTypeMapping]?.name ||
                    activeAnimationType
                  }`}
              </span>
              <span className="text-xs bg-gray-600/50 px-2 py-1 rounded">{sortedItems.length} items</span>
            </div>
          )}

          {activeCategory === 4 && !isPremium && (
            <div className="p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-center text-yellow-300">
              <p className="text-sm">
                Les objets jetables sont à usage unique et réservés aux joueurs premium. Rendez-vous dans l'onglet
                Premium pour pouvoir les acheter.
              </p>
            </div>
          )}

          {/* Pagination info */}
          {sortedItems.length > ITEMS_PER_PAGE && (
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>
                Affichage de {(currentPage - 1) * ITEMS_PER_PAGE + 1} à{' '}
                {Math.min(currentPage * ITEMS_PER_PAGE, sortedItems.length)} sur {sortedItems.length} articles
              </span>
              <span>
                Page {currentPage} sur {totalPages}
              </span>
            </div>
          )}

          {/* Items grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedItems.map((item) => {
              const itemPrice = item.discountPrice || item.price
              const userCanAfford = (user?.credits || 0) >= itemPrice
              const creditsNeeded = itemPrice - (user?.credits || 0)
              const owned = userOwnsItem(item.id)
              const equipped = isItemEquipped(item.id)
              const quantity = getItemQuantity(item.id)
              const isConsumable = item.categoryId === 4
              const premiumLocked = !isPremium && activeCategory === 4
              const isAnimation = item.categoryId === 6

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="overflow-hidden bg-gray-800/50 backdrop-blur-sm border border-indigo-500/30 hover:border-indigo-400/50 transition-all h-full flex flex-col">
                    {/* Image section - only for non-animations */}
                    {!isAnimation && (
                      <div className="relative">
                        {item.image && item.image !== ' ' && (
                          <img src={item.image || '/placeholder.svg'} alt={item.name} className="w-full h-auto" />
                        )}
                        <div className="absolute top-2 left-2 flex flex-col gap-2">
                          {item.isNew && <Badge className="bg-green-500 hover:bg-green-600">Nouveau</Badge>}
                          {item.isFeatured && <Badge className="bg-blue-500 hover:bg-blue-600">Vedette</Badge>}
                          {equipped && <Badge className="bg-purple-500 hover:bg-purple-600">Équipé</Badge>}
                          {isConsumable && quantity > 0 && (
                            <Badge className="bg-orange-500 hover:bg-orange-600">x{quantity}</Badge>
                          )}
                          {/* Badge pour le type de skin */}
                          {item.categoryId === 5 && item.avatarSkin && (
                            <Badge className="bg-cyan-500 hover:bg-cyan-600 text-xs">
                              {skinTypeMapping[item.avatarSkin.type as keyof typeof skinTypeMapping]?.icon}
                            </Badge>
                          )}
                        </div>
                        <div className="absolute top-2 right-2">
                          <Badge className={`${getRarityColor(item.rarity)}`}>
                            {item.rarity === 'common' && 'Commun'}
                            {item.rarity === 'rare' && 'Rare'}
                            {item.rarity === 'epic' && 'Épique'}
                            {item.rarity === 'legendary' && 'Légendaire'}
                          </Badge>
                        </div>
                      </div>
                    )}

                    <div className="p-4 flex-grow flex flex-col">
                      {/* For animations, badges go at the top of content */}
                      {isAnimation && (
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex flex-wrap gap-2">
                            {item.isNew && <Badge className="bg-green-500 hover:bg-green-600">Nouveau</Badge>}
                            {item.isFeatured && <Badge className="bg-blue-500 hover:bg-blue-600">Vedette</Badge>}
                            {equipped && <Badge className="bg-purple-500 hover:bg-purple-600">Équipé</Badge>}
                            {isConsumable && quantity > 0 && (
                              <Badge className="bg-orange-500 hover:bg-orange-600">x{quantity}</Badge>
                            )}
                          </div>
                          <Badge className={`${getRarityColor(item.rarity)}`}>
                            {item.rarity === 'common' && 'Commun'}
                            {item.rarity === 'rare' && 'Rare'}
                            {item.rarity === 'epic' && 'Épique'}
                            {item.rarity === 'legendary' && 'Légendaire'}
                          </Badge>
                        </div>
                      )}

                      <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
                      <p className="text-gray-400 text-sm mb-4 flex-grow">{item.description}</p>

                      {/* Informations spécifiques aux skins */}
                      {item.categoryId === 5 && item.avatarSkin && (
                        <div className="mb-3 text-xs text-gray-500 space-y-1">
                          <div className="flex items-center justify-between">
                            <span>Type:</span>
                            <span className="text-cyan-400">
                              {skinTypeMapping[item.avatarSkin.type as keyof typeof skinTypeMapping]?.name ||
                                item.avatarSkin.type}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Genre:</span>
                            <span className="text-pink-400">
                              {item.avatarSkin.gender === 'female' ? '👩 Féminin' : '👨 Masculin'}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Informations spécifiques aux animations */}
                      {item.categoryId === 6 && item.avatarAnimation && (
                        <div className="mb-3 text-xs text-gray-500 space-y-1">
                          <div className="flex items-center justify-between">
                            <span>Type:</span>
                            <span className="text-cyan-400">
                              {animationTypeMapping[item.avatarAnimation.type as keyof typeof animationTypeMapping]
                                ?.name || item.avatarAnimation.type}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Genre:</span>
                            <span className="text-pink-400">
                              {item.avatarAnimation.gender === 'female' ? '👩 Féminin' : '👨 Masculin'}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-auto">
                        {!inventory ? (
                          <div className="flex items-center">
                            {item.discountPrice ? (
                              <>
                                <span className="text-gray-400 line-through mr-2">{item.price}</span>
                                <span className="text-white font-bold">{item.discountPrice}</span>
                              </>
                            ) : (
                              <span className="text-white font-bold">{item.price}</span>
                            )}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 ml-1 text-indigo-400"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <path d="M16 12l-4 4-4-4M12 8v8" />
                            </svg>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <span className="text-gray-400 mr-2">Possédé</span>
                            {isConsumable && <span className="text-indigo-300 font-bold">x{quantity}</span>}
                          </div>
                        )}
                        <div className="flex space-x-2">
                          {owned && !isConsumable ? (
                            <Button
                              variant={equipped ? 'secondary' : 'default'}
                              className={
                                equipped ? 'bg-purple-700 hover:bg-purple-800' : 'bg-indigo-600 hover:bg-indigo-700'
                              }
                              onClick={() => handleEquipItem(item.id)}
                              disabled={equipped}
                            >
                              {equipped ? (
                                <>
                                  <Check className="h-4 w-4 mr-1" />
                                  Équipé
                                </>
                              ) : (
                                'Équiper'
                              )}
                            </Button>
                          ) : (
                            !inventory && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div>
                                      <Button
                                        className="bg-indigo-600 hover:bg-indigo-700"
                                        disabled={!userCanAfford || premiumLocked}
                                        onClick={() => openPurchaseModal(item)}
                                        onMouseEnter={(e) => {
                                          if (item.categoryId === 6) {
                                            const rect = e.currentTarget.getBoundingClientRect()
                                            const x = Math.min(rect.right + 10, window.innerWidth - 320)
                                            const y = Math.max(rect.top, 10)
                                            setAnimationTooltip({ show: true, item, x, y })
                                          }
                                        }}
                                        onMouseLeave={() => {
                                          if (item.categoryId === 6) {
                                            setAnimationTooltip({ show: false, item: null, x: 0, y: 0 })
                                          }
                                        }}
                                      >
                                        <ShoppingCart className="h-4 w-4 mr-1" />
                                        Acheter
                                      </Button>
                                    </div>
                                  </TooltipTrigger>
                                  {premiumLocked ? (
                                    <TooltipContent>
                                      <p>Réservé aux Premium</p>
                                    </TooltipContent>
                                  ) : (
                                    !userCanAfford && (
                                      <TooltipContent>
                                        <p>Il vous manque {creditsNeeded} crédits</p>
                                      </TooltipContent>
                                    )
                                  )}
                                </Tooltip>
                              </TooltipProvider>
                            )
                          )}

                          {!inventory && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div>
                                    <Button
                                      variant="outline"
                                      className="border-indigo-500/30 hover:bg-gray-700/50 bg-transparent"
                                      disabled={!userCanAfford || premiumLocked}
                                      onClick={() => openGiftModal(item)}
                                    >
                                      <Gift className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TooltipTrigger>
                                {premiumLocked ? (
                                  <TooltipContent>
                                    <p>Réservé aux Premium</p>
                                  </TooltipContent>
                                ) : !userCanAfford ? (
                                  <TooltipContent>
                                    <p>Il vous manque {creditsNeeded} crédits</p>
                                  </TooltipContent>
                                ) : (
                                  <TooltipContent>
                                    <p>Offrir cet item</p>
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="border-indigo-500/30 hover:bg-gray-700/50"
              >
                Précédent
              </Button>

              {/* Page numbers */}
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      onClick={() => setCurrentPage(pageNum)}
                      className={
                        currentPage === pageNum
                          ? 'bg-indigo-600 hover:bg-indigo-700'
                          : 'border-indigo-500/30 hover:bg-gray-700/50'
                      }
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="border-indigo-500/30 hover:bg-gray-700/50"
              >
                Suivant
              </Button>
            </div>
          )}

          {/* Empty state */}
          {sortedItems.length === 0 && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-indigo-500/30 p-8 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-gray-500 mb-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              <h3 className="text-xl font-semibold mb-2">Aucun article trouvé</h3>
              <p className="text-gray-400">
                Aucun article ne correspond à votre recherche. Essayez de modifier vos critères.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Purchase Confirmation Dialog */}
      <Dialog open={isPurchaseDialogOpen} onOpenChange={setIsPurchaseDialogOpen}>
        <DialogContent className="bg-gray-800 border border-indigo-500/30 text-white">
          <DialogHeader>
            <DialogTitle>Confirmer l'achat</DialogTitle>
            <DialogDescription className="text-gray-300">
              {selectedItem?.categoryId === 4
                ? 'Choisissez la quantité à acheter'
                : 'Êtes-vous sûr de vouloir acheter cet item ?'}
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="flex items-start space-x-4 py-4">
              <div className="w-auto h-24 rounded-md overflow-hidden flex-shrink-0">
                <img src={selectedItem.image || '/placeholder.svg'} alt={selectedItem.name} className="w-full h-full" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">{selectedItem.name}</h3>
                <Badge className={`${getRarityColor(selectedItem.rarity)} mb-2`}>
                  {selectedItem.rarity === 'common' && 'Commun'}
                  {selectedItem.rarity === 'rare' && 'Rare'}
                  {selectedItem.rarity === 'epic' && 'Épique'}
                  {selectedItem.rarity === 'legendary' && 'Légendaire'}
                </Badge>
                <p className="text-gray-300 text-sm">{selectedItem.description}</p>

                {/* Quantity selector for consumables */}
                {selectedItem.categoryId === 4 && (
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-gray-300">Quantité:</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPurchaseQuantity(Math.max(1, purchaseQuantity - 1))}
                        disabled={purchaseQuantity <= 1}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center font-bold">{purchaseQuantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPurchaseQuantity(purchaseQuantity + 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="mt-3 flex items-center">
                  <span className="text-gray-300 mr-2">Prix total:</span>
                  {selectedItem.discountPrice ? (
                    <>
                      <span className="text-gray-400 line-through mr-2">{selectedItem.price * purchaseQuantity}</span>
                      <span className="text-white font-bold">{selectedItem.discountPrice * purchaseQuantity}</span>
                    </>
                  ) : (
                    <span className="text-white font-bold">{selectedItem.price * purchaseQuantity}</span>
                  )}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-1 text-indigo-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M16 12l-4 4-4-4M12 8v8" />
                  </svg>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPurchaseDialogOpen(false)}
              className="border-indigo-500/30 hover:bg-gray-700/50"
            >
              Annuler
            </Button>
            <Button
              onClick={handlePurchaseConfirm}
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={purchaseLoading}
            >
              {purchaseLoading ? 'Traitement...' : 'Confirmer l\'achat'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Gift Dialog */}
      <Dialog open={isGiftDialogOpen} onOpenChange={setIsGiftDialogOpen}>
        <DialogContent className="bg-gray-800 border border-indigo-500/30 text-white">
          <DialogHeader>
            <DialogTitle>Offrir un cadeau</DialogTitle>
            <DialogDescription className="text-gray-300">
              Entrez le nom du joueur à qui vous souhaitez offrir cet item.
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="flex items-start space-x-4 py-4">
              <div className="w-auto h-24 rounded-md overflow-hidden flex-shrink-0">
                <img src={selectedItem.image || '/placeholder.svg'} alt={selectedItem.name} className="w-full h-full" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">{selectedItem.name}</h3>
                <Badge className={`${getRarityColor(selectedItem.rarity)} mb-2`}>
                  {selectedItem.rarity === 'common' && 'Commun'}
                  {selectedItem.rarity === 'rare' && 'Rare'}
                  {selectedItem.rarity === 'epic' && 'Épique'}
                  {selectedItem.rarity === 'legendary' && 'Légendaire'}
                </Badge>

                {/* Quantity selector for consumables */}
                {selectedItem.categoryId === 4 && (
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-gray-300">Quantité:</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setGiftQuantity(Math.max(1, giftQuantity - 1))}
                        disabled={giftQuantity <= 1}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center font-bold">{giftQuantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setGiftQuantity(giftQuantity + 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="mt-3 flex items-center">
                  <span className="text-gray-300 mr-2">Prix total:</span>
                  {selectedItem.discountPrice ? (
                    <>
                      <span className="text-gray-400 line-through mr-2">{selectedItem.price * giftQuantity}</span>
                      <span className="text-white font-bold">{selectedItem.discountPrice * giftQuantity}</span>
                    </>
                  ) : (
                    <span className="text-white font-bold">{selectedItem.price * giftQuantity}</span>
                  )}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-1 text-indigo-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M16 12l-4 4-4-4M12 8v8" />
                  </svg>
                </div>
              </div>
            </div>
          )}

          <div className="py-2">
            <label htmlFor="recipient" className="block text-sm font-medium text-gray-300 mb-1">
              Nom du destinataire
            </label>
            <input
              id="recipient"
              type="text"
              value={giftRecipient}
              onChange={(e) => setGiftRecipient(e.target.value)}
              placeholder="Entrez le nom du joueur"
              autoComplete="off"
              className="w-full bg-gray-900/50 border border-indigo-500/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            {searchGiftResults.length > 0 ? (
              <ul className="bg-slate-800/90 border border-slate-700/50 rounded-md max-h-48 overflow-y-auto">
                {searchGiftResults.map((user) => (
                  <li
                    key={user.id}
                    className="px-3 py-2 hover:bg-slate-700/50 cursor-pointer text-slate-300 hover:text-slate-100 transition-colors border-b border-slate-700/30 last:border-0"
                    onClick={() => {
                      setGiftRecipient(user.nickname)
                      setSearchGiftResults([])
                    }}
                  >
                    {user.nickname}
                  </li>
                ))}
              </ul>
            ) : (
              searchQuery.trim() !== '' && <p className="text-slate-400 text-sm py-2">Aucune correspondance</p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsGiftDialogOpen(false)}
              className="border-indigo-500/30 hover:bg-gray-700/50"
            >
              Annuler
            </Button>
            <Button
              onClick={handleGiftConfirm}
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={purchaseLoading || !giftRecipient}
            >
              {purchaseLoading ? 'Traitement...' : 'Envoyer le cadeau'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Animation Preview Tooltip */}
      {animationTooltip.show && animationTooltip.item && (
        <div
          className="fixed z-[1000] bg-gray-800 border border-indigo-500/30 rounded-lg p-4 shadow-xl"
          style={{
            left: `${animationTooltip.x}px`,
            top: `${animationTooltip.y}px`,
            width: '250px',
            height: '400px',
          }}
        >
          <div className="w-full h-full rounded-lg overflow-hidden">
            <AvatarCanvas
              avatarUrl={`https://models.readyplayer.me/${user?.rpmAvatarId}.glb`}
              animation={`${animationTooltip.item.avatarAnimation?.gender}/fbx/${animationTooltip.item.avatarAnimation?.type}/${animationTooltip.item.avatarAnimation?.key}`}
              options={{ ctrlMinDist: 2, ctrlMaxDist: 5 }}
            />
          </div>
          <div className="absolute bottom-2 left-2 right-2 bg-black/50 rounded px-2 py-1">
            <p className="text-white text-xs font-medium">{animationTooltip.item.name}</p>
          </div>
        </div>
      )}

      {/* Animation Event Selection Dialog */}
      <Dialog open={isAnimationEventDialogOpen} onOpenChange={setIsAnimationEventDialogOpen}>
        <DialogContent className="bg-gray-800 border border-indigo-500/30 text-white">
          <DialogHeader>
            <DialogTitle>Sélectionner l'événement</DialogTitle>
            <DialogDescription className="text-gray-300">
              Pour quel événement souhaitez-vous équiper cette animation ?
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedAnimationEvent('idle')}
                className={`p-3 rounded-lg border transition-all ${
                  selectedAnimationEvent === 'idle'
                    ? 'border-indigo-500 bg-indigo-500/20 text-white'
                    : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">🧍</div>
                  <div className="text-sm font-medium">Attente</div>
                  <div className="text-xs text-gray-400">Animation par défaut</div>
                </div>
              </button>

              <button
                onClick={() => setSelectedAnimationEvent('gameStart')}
                className={`p-3 rounded-lg border transition-all ${
                  selectedAnimationEvent === 'gameStart'
                    ? 'border-indigo-500 bg-indigo-500/20 text-white'
                    : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">🚀</div>
                  <div className="text-sm font-medium">Début de partie</div>
                  <div className="text-xs text-gray-400">Quand la partie commence</div>
                </div>
              </button>

              <button
                onClick={() => setSelectedAnimationEvent('gameWin')}
                className={`p-3 rounded-lg border transition-all ${
                  selectedAnimationEvent === 'gameWin'
                    ? 'border-indigo-500 bg-indigo-500/20 text-white'
                    : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">🏆</div>
                  <div className="text-sm font-medium">Victoire</div>
                  <div className="text-xs text-gray-400">Quand vous gagnez</div>
                </div>
              </button>

              <button
                onClick={() => setSelectedAnimationEvent('gameLoose')}
                className={`p-3 rounded-lg border transition-all ${
                  selectedAnimationEvent === 'gameLoose'
                    ? 'border-indigo-500 bg-indigo-500/20 text-white'
                    : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">😞</div>
                  <div className="text-sm font-medium">Défaite</div>
                  <div className="text-xs text-gray-400">Quand vous perdez</div>
                </div>
              </button>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAnimationEventDialogOpen(false)
                setPendingEquipItemId(null)
                setSelectedAnimationEvent('idle')
              }}
              className="border-indigo-500/30 hover:bg-gray-700/50"
            >
              Annuler
            </Button>
            <Button onClick={handleAnimationEventConfirm} className="bg-indigo-600 hover:bg-indigo-700">
              Équiper pour cet événement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

export default ShopItems
