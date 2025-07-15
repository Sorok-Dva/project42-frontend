'use client'

import type React from 'react'
import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Badge } from 'components/UI/Badge'
import { Button } from 'components/UI/Button'
import { Card } from 'components/UI/Card'
import { Input } from 'components/UI/Input'
import { Switch } from 'components/UI/Switch'
import { Label } from 'components/UI/Label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from 'components/UI/Dialog'
import { Popover, PopoverContent, PopoverTrigger } from 'components/UI/Popover'
import { Calendar } from 'components/UI/Calendar'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Plus, CalendarIcon, Edit, Trash2, Save, Tag, ShoppingBasket, CreditCard, Crown } from 'lucide-react'
import axios from 'axios'
import { useAuth } from 'contexts/AuthContext'
import { toast } from 'react-toastify'
import type { Category, CreditPack, Item, PremiumPlan, ShopData, TagType } from 'types/shop'
import { ToastDefaultOptions } from 'utils/toastOptions'

// Helper function to get icon component
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

// Helper function to get rarity color
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

const ITEMS_PER_PAGE = 24

const AdminShopPage: React.FC = () => {
  const { token } = useAuth()
  const [loading, setLoading] = useState<boolean>(true)
  const [activeTab, setActiveTab] = useState('categories')
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<TagType[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [creditPacks, setCreditPacks] = useState<CreditPack[]>([])
  const [premiumPlans, setPremiumPlans] = useState<PremiumPlan[]>([])

  // Form states
  const [newCategory, setNewCategory] = useState<Partial<Category>>({ name: '', icon: 'sparkles' })
  const [newTag, setNewTag] = useState<Partial<TagType>>({ name: '', color: 'bg-blue-500' })
  const [newItem, setNewItem] = useState<Partial<Item>>({
    name: '',
    description: '',
    resourceId: 0,
    price: 0,
    categoryId: categories.length > 0 ? categories[0].id : 1,
    rarity: 'common',
    isNew: true,
    isFeatured: false,
    tagId: null,
    image: '/assets/images/custom/',
  })
  const [newCreditPack, setNewCreditPack] = useState<Partial<CreditPack>>({
    credits: 0,
    bonus: 0,
    price: 0,
    popular: false,
  })
  const [newPremiumPlan, setNewPremiumPlan] = useState<Partial<PremiumPlan>>({
    name: '',
    price: 0,
    duration: 1,
    credits: 0,
    discount: 0,
    popular: false,
  })

  // Edit states
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null)
  const [editingTagId, setEditingTagId] = useState<number | null>(null)
  const [editingItemId, setEditingItemId] = useState<number | null>(null)
  const [editingCreditPackId, setEditingCreditPackId] = useState<number | null>(null)
  const [editingPremiumPlanId, setEditingPremiumPlanId] = useState<number | null>(null)

  // Filter states
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [sortBy, setSortBy] = useState('featured')
  const [currentPage, setCurrentPage] = useState(1)

  // Promotion state
  const [promotionDate, setPromotionDate] = useState<Date | null>(null)
  const [promotionPercentage, setPromotionPercentage] = useState<number>(10)

  // Filtered items with useMemo for performance
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory = categoryFilter === 'all' || item.categoryId.toString() === categoryFilter
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [items, categoryFilter, searchQuery])

  // Sorted items with useMemo for performance
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
  }, [categoryFilter, searchQuery, sortBy])

  useEffect(() => {
    async function retrieveShop() {
      try {
        const response = await axios.get<ShopData>('/api/shop')
        const cpResponse = await axios.get<CreditPack[]>('/api/shop/credits_packs')
        const ppResponse = await axios.get<PremiumPlan[]>('/api/shop/premium_plans')

        setCreditPacks(cpResponse.data)
        setPremiumPlans(ppResponse.data)
        setCategories(response.data.categories)
        setItems(response.data.items)
        setTags(response.data.tags)
      } catch (e) {
        console.log(e)
      } finally {
        setLoading(false)
      }
    }
    retrieveShop()
  }, [])

  // Update newItem categoryId when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && !editingItemId) {
      setNewItem((prev) => ({
        ...prev,
        categoryId: categories[0].id,
      }))
    }
  }, [categories, editingItemId])

  // Category handlers
  const handleAddCategory = async () => {
    if (!newCategory.name) return
    try {
      const response = await axios.post('/api/admin/shop/category', newCategory, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.data.category) {
        setCategories([...categories, response.data.category])
        setNewCategory({ name: '', icon: 'sparkles' })
        toast.info(`La catégorie ${response.data.category.name} a bien été ajoutée !`, ToastDefaultOptions)
      } else {
        toast.info('Une erreur est survenue', ToastDefaultOptions)
      }
    } catch (e) {
      console.log(e)
      toast.info('Une erreur est survenue', ToastDefaultOptions)
    }
  }

  const handleUpdateCategory = async (id: number) => {
    try {
      const response = await axios.put(`/api/admin/shop/category/${id}`, newCategory, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.data.category) {
        const updatedCategories = categories.map((category) =>
          category.id === id ? { ...category, ...newCategory, id } : category,
        )
        setCategories(updatedCategories)
        setEditingCategoryId(null)
        setNewCategory({ name: '', icon: 'sparkles' })
        toast.info(`La catégorie ${newCategory.name} a bien été modifiée !`, ToastDefaultOptions)
      } else {
        toast.info('Une erreur est survenue', ToastDefaultOptions)
      }
    } catch (e) {
      console.log(e)
      toast.info('Une erreur est survenue', ToastDefaultOptions)
    }
  }

  const handleDeleteCategory = async (id: number) => {
    try {
      const response = await axios.delete(`/api/admin/shop/category/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.data.message === 'success') {
        setCategories(categories.filter((category) => category.id !== id))
        toast.info('Catégorie supprimée', ToastDefaultOptions)
      } else {
        toast.info('Une erreur est survenue', ToastDefaultOptions)
      }
    } catch (e) {
      console.log(e)
      toast.info('Une erreur est survenue', ToastDefaultOptions)
    }
  }

  const startEditingCategory = (category: Category) => {
    setNewCategory({ name: category.name, icon: category.icon })
    setEditingCategoryId(category.id)
  }

  // Tag handlers
  const handleAddTag = async () => {
    if (!newTag.name) return
    try {
      const response = await axios.post('/api/admin/shop/tag', newTag, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.data.tag) {
        setTags([...tags, response.data.tag])
        setNewTag({ name: '', color: 'bg-blue-500' })
        toast.info(`Le tag ${newTag.name} a bien été ajouté !`, ToastDefaultOptions)
      } else {
        toast.info('Une erreur est survenue', ToastDefaultOptions)
      }
    } catch (e) {
      console.log(e)
      toast.info('Une erreur est survenue', ToastDefaultOptions)
    }
  }

  const handleUpdateTag = async (id: number) => {
    try {
      const response = await axios.put(`/api/admin/shop/tag/${id}`, newTag, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.data.tag) {
        const updatedTags = tags.map((tag) => (tag.id === id ? { ...tag, ...newTag, id } : tag))
        setTags(updatedTags)
        setEditingTagId(null)
        setNewTag({ name: '', color: 'bg-blue-500' })
        toast.info(`Le tag ${newTag.name} a bien été modifié !`, ToastDefaultOptions)
      } else {
        toast.info('Une erreur est survenue', ToastDefaultOptions)
      }
    } catch (e) {
      console.log(e)
      toast.info('Une erreur est survenue', ToastDefaultOptions)
    }
  }

  const handleDeleteTag = async (id: number) => {
    try {
      const response = await axios.delete(`/api/admin/shop/tag/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.data.message === 'success') {
        setTags(tags.filter((tag) => tag.id !== id))
        setItems(
          items.map((item) => ({
            ...item,
            tagId: item.tagId && item.tagId === id ? null : item.tagId,
          })),
        )
        toast.info('Tag supprimé', ToastDefaultOptions)
      } else {
        toast.info('Une erreur est survenue', ToastDefaultOptions)
      }
    } catch (e) {
      console.log(e)
      toast.info('Une erreur est survenue', ToastDefaultOptions)
    }
  }

  const startEditingTag = (tag: TagType) => {
    setNewTag({ name: tag.name, color: tag.color })
    setEditingTagId(tag.id)
  }

  // Item handlers
  const handleAddItem = async () => {
    if (!newItem.name || !newItem.description) return
    try {
      const response = await axios.post('/api/admin/shop/item', newItem, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.data.name) {
        setItems([...items, response.data])
        setNewItem({
          name: '',
          description: '',
          price: 0,
          resourceId: 0,
          categoryId: categories.length > 0 ? categories[0].id : 1,
          rarity: 'common',
          isNew: true,
          isFeatured: false,
          tagId: null,
          image: '/assets/images/custom/',
        })
        toast.info(`Item ${response.data.name} ajouté !`, ToastDefaultOptions)
      } else {
        toast.info('Une erreur est survenue', ToastDefaultOptions)
      }
    } catch (e) {
      console.log(e)
      toast.info('Une erreur est survenue', ToastDefaultOptions)
    }
  }

  const handleUpdateItem = async (id: number) => {
    try {
      const response = await axios.put(`/api/admin/shop/item/${id}`, newItem, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.data.name) {
        const updatedItems = items.map((item) => (item.id === id ? { ...item, ...newItem, id } : item))
        setItems(updatedItems)
        setEditingItemId(null)
        setNewItem({
          name: '',
          description: '',
          price: 0,
          resourceId: 0,
          categoryId: categories.length > 0 ? categories[0].id : 1,
          rarity: 'common',
          isNew: true,
          isFeatured: false,
          tagId: null,
          image: '/assets/images/custom/',
        })
        toast.info(`Item ${response.data.name} modifié !`, ToastDefaultOptions)
      } else {
        toast.info('Une erreur est survenue', ToastDefaultOptions)
      }
    } catch (e) {
      console.log(e)
      toast.info('Une erreur est survenue', ToastDefaultOptions)
    }
  }

  const handleDeleteItem = async (id: number) => {
    try {
      const response = await axios.delete(`/api/admin/shop/item/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.data.message === 'success') {
        setItems(items.filter((item) => item.id !== id))
        toast.info('Item supprimé', ToastDefaultOptions)
      } else {
        toast.info('Une erreur est survenue', ToastDefaultOptions)
      }
    } catch (e) {
      console.log(e)
      toast.info('Une erreur est survenue', ToastDefaultOptions)
    }
  }

  const startEditingItem = (item: Item) => {
    setNewItem({
      resourceId: item.resourceId,
      name: item.name,
      description: item.description,
      price: item.price,
      categoryId: item.categoryId,
      rarity: item.rarity,
      isNew: item.isNew,
      isFeatured: item.isFeatured,
      tagId: item.tagId,
      image: item.image,
    })
    setEditingItemId(item.id)
    if (item.promotion) {
      setPromotionDate(item.promotion.endDate)
      setPromotionPercentage(item.promotion.discountPercentage)
    } else {
      setPromotionDate(null)
      setPromotionPercentage(10)
    }
  }

  const handleToggleTag = (tagId: number) => {
    setNewItem({
      ...newItem,
      tagId: newItem.tagId === tagId ? null : tagId,
    })
  }

  const handleAddPromotion = (itemId: number) => {
    if (!promotionDate) return
    const discountPrice = Math.round(items.find((item) => item.id === itemId)!.price * (1 - promotionPercentage / 100))
    const updatedItems = items.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          discountPrice,
          promotion: {
            id: 1,
            discountPercentage: promotionPercentage,
            endDate: promotionDate,
          },
        }
      }
      return item
    })
    setItems(updatedItems)
    setPromotionDate(null)
    setPromotionPercentage(10)
  }

  const handleRemovePromotion = (itemId: number) => {
    const updatedItems = items.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          discountPrice: null,
          promotion: null,
        }
      }
      return item
    })
    setItems(updatedItems)
  }

  // Credit Pack handlers
  const handleAddCreditPack = async () => {
    if (!newCreditPack.credits || !newCreditPack.price) return
    try {
      const response = await axios.post('/api/admin/shop/creditPack', newCreditPack, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.data) {
        setCreditPacks([...creditPacks, response.data])
        setNewCreditPack({
          credits: 0,
          bonus: 0,
          price: 0,
          popular: false,
        })
        toast.info(`Pack de crédit ${response.data.credits} ajouté !`, ToastDefaultOptions)
      } else {
        toast.info('Une erreur est survenue', ToastDefaultOptions)
      }
    } catch (e) {
      console.log(e)
      toast.info('Une erreur est survenue', ToastDefaultOptions)
    }
  }

  const handleUpdateCreditPack = async (id: number) => {
    try {
      const response = await axios.put(`/api/admin/shop/creditPack/${id}`, newCreditPack, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.data) {
        const updatedCreditPacks = creditPacks.map((pack) =>
          pack.id === id ? { ...pack, ...newCreditPack, id } : pack,
        )
        setCreditPacks(updatedCreditPacks)
        setEditingCreditPackId(null)
        setNewCreditPack({
          credits: 0,
          bonus: 0,
          price: 0,
          popular: false,
        })
        toast.info(`Pack de crédit ${response.data.credits} modifié !`, ToastDefaultOptions)
      } else {
        toast.info('Une erreur est survenue', ToastDefaultOptions)
      }
    } catch (e) {
      console.log(e)
      toast.info('Une erreur est survenue', ToastDefaultOptions)
    }
  }

  const handleDeleteCreditPack = async (id: number) => {
    try {
      const response = await axios.delete(`/api/admin/shop/creditPack/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.data.message === 'success') {
        setCreditPacks(creditPacks.filter((pack) => pack.id !== id))
        toast.info('Pack de crédit supprimé', ToastDefaultOptions)
      } else {
        toast.info('Une erreur est survenue', ToastDefaultOptions)
      }
    } catch (e) {
      console.log(e)
      toast.info('Une erreur est survenue', ToastDefaultOptions)
    }
  }

  const startEditingCreditPack = (pack: CreditPack) => {
    setNewCreditPack({
      credits: pack.credits,
      bonus: pack.bonus,
      price: pack.price,
      popular: pack.popular,
    })
    setEditingCreditPackId(pack.id)
  }

  // Premium Plan handlers
  const handleAddPremiumPlan = async () => {
    if (!newPremiumPlan.name || !newPremiumPlan.price || !newPremiumPlan.duration) return
    try {
      const response = await axios.post('/api/admin/shop/premiumPlan', newPremiumPlan, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.data.name) {
        setPremiumPlans([...premiumPlans, response.data])
        setNewPremiumPlan({
          name: '',
          price: 0,
          duration: 1,
          credits: 0,
          discount: 0,
          popular: false,
        })
        toast.info(`Plan premium ${response.data.name} ajouté !`, ToastDefaultOptions)
      } else {
        toast.info('Une erreur est survenue', ToastDefaultOptions)
      }
    } catch (e) {
      console.log(e)
      toast.info('Une erreur est survenue', ToastDefaultOptions)
    }
  }

  const handleUpdatePremiumPlan = async (id: number) => {
    try {
      const response = await axios.put(`/api/admin/shop/premiumPlan/${id}`, newPremiumPlan, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.data.name) {
        const updatedPremiumPlans = premiumPlans.map((plan) =>
          plan.id === id ? { ...plan, ...newPremiumPlan, id } : plan,
        )
        setPremiumPlans(updatedPremiumPlans)
        setEditingPremiumPlanId(null)
        setNewPremiumPlan({
          name: '',
          price: 0,
          duration: 1,
          credits: 0,
          discount: 0,
          popular: false,
        })
        toast.info(`Plan premium ${response.data.name} modifié !`, ToastDefaultOptions)
      } else {
        toast.info('Une erreur est survenue', ToastDefaultOptions)
      }
    } catch (e) {
      console.log(e)
      toast.info('Une erreur est survenue', ToastDefaultOptions)
    }
  }

  const handleDeletePremiumPlan = async (id: number) => {
    try {
      const response = await axios.delete(`/api/admin/shop/premiumPlan/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.data.message === 'success') {
        setPremiumPlans(premiumPlans.filter((plan) => plan.id !== id))
        toast.info('Plan premium supprimé', ToastDefaultOptions)
      } else {
        toast.info('Une erreur est survenue', ToastDefaultOptions)
      }
    } catch (e) {
      console.log(e)
      toast.info('Une erreur est survenue', ToastDefaultOptions)
    }
  }

  const startEditingPremiumPlan = (plan: PremiumPlan) => {
    setNewPremiumPlan({
      name: plan.name,
      price: plan.price,
      duration: plan.duration,
      credits: plan.credits,
      discount: plan.discount,
      popular: plan.popular,
    })
    setEditingPremiumPlanId(plan.id)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-indigo-950 to-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-500/20 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="mt-4 text-blue-300">Chargement de l'administration...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-b from-gray-900 via-indigo-950 to-gray-900 text-white p-4 md:p-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar with categories */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-indigo-500/30 p-4 sticky top-4">
            <h3 className="text-lg font-semibold mb-4 text-indigo-300">Administration</h3>
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('categories')}
                className={`w-full flex items-center p-3 rounded-md transition-all ${
                  activeTab === 'categories'
                    ? 'bg-indigo-900/70 text-white shadow-lg shadow-indigo-500/20'
                    : 'hover:bg-gray-700/50 text-gray-300'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
                </svg>
                <span className="flex-1 text-left">Catégories</span>
                <span className="text-xs bg-gray-600/50 px-2 py-1 rounded">{categories.length}</span>
              </button>

              <button
                onClick={() => setActiveTab('tags')}
                className={`w-full flex items-center p-3 rounded-md transition-all ${
                  activeTab === 'tags'
                    ? 'bg-indigo-900/70 text-white shadow-lg shadow-indigo-500/20'
                    : 'hover:bg-gray-700/50 text-gray-300'
                }`}
              >
                <Tag className="h-5 w-5 mr-3" />
                <span className="flex-1 text-left">Tags</span>
                <span className="text-xs bg-gray-600/50 px-2 py-1 rounded">{tags.length}</span>
              </button>

              <button
                onClick={() => setActiveTab('items')}
                className={`w-full flex items-center p-3 rounded-md transition-all ${
                  activeTab === 'items'
                    ? 'bg-indigo-900/70 text-white shadow-lg shadow-indigo-500/20'
                    : 'hover:bg-gray-700/50 text-gray-300'
                }`}
              >
                <ShoppingBasket className="h-5 w-5 mr-3" />
                <span className="flex-1 text-left">Items</span>
                <span className="text-xs bg-gray-600/50 px-2 py-1 rounded">{items.length}</span>
              </button>

              <button
                onClick={() => setActiveTab('credits')}
                className={`w-full flex items-center p-3 rounded-md transition-all ${
                  activeTab === 'credits'
                    ? 'bg-indigo-900/70 text-white shadow-lg shadow-indigo-500/20'
                    : 'hover:bg-gray-700/50 text-gray-300'
                }`}
              >
                <CreditCard className="h-5 w-5 mr-3" />
                <span className="flex-1 text-left">Packs Crédits</span>
                <span className="text-xs bg-gray-600/50 px-2 py-1 rounded">{creditPacks.length}</span>
              </button>

              <button
                onClick={() => setActiveTab('premium')}
                className={`w-full flex items-center p-3 rounded-md transition-all ${
                  activeTab === 'premium'
                    ? 'bg-indigo-900/70 text-white shadow-lg shadow-indigo-500/20'
                    : 'hover:bg-gray-700/50 text-gray-300'
                }`}
              >
                <Crown className="h-5 w-5 mr-3" />
                <span className="flex-1 text-left">Plans Premium</span>
                <span className="text-xs bg-gray-600/50 px-2 py-1 rounded">{premiumPlans.length}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
              Administration de la Boutique
            </h1>
          </div>

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Add/Edit Category Form */}
              <div className="lg:col-span-1">
                <Card className="bg-gray-800/50 backdrop-blur-sm border border-indigo-500/30 p-6">
                  <h3 className="text-xl font-semibold mb-4">
                    {editingCategoryId ? 'Modifier la catégorie' : 'Ajouter une catégorie'}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="category-name">Nom</Label>
                      <Input
                        id="category-name"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        placeholder="Nom de la catégorie"
                        className="bg-gray-900/50 border-indigo-500/30 mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category-icon">Icône</Label>
                      <select
                        id="category-icon"
                        value={newCategory.icon}
                        onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                        className="w-full bg-gray-900/50 border border-indigo-500/30 rounded-md p-2 mt-1"
                      >
                        <option value="sparkles">Étoiles</option>
                        <option value="zap">Éclair</option>
                        <option value="user">Utilisateur</option>
                        <option value="message-circle">Message</option>
                        <option value="image">Image</option>
                      </select>
                    </div>
                    <div className="pt-4">
                      {editingCategoryId ? (
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleUpdateCategory(editingCategoryId)}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Mettre à jour
                          </Button>
                          <Button
                            onClick={() => {
                              setEditingCategoryId(null)
                              setNewCategory({ name: '', icon: 'sparkles' })
                            }}
                            variant="outline"
                            className="border-indigo-500/30 hover:bg-gray-700/50"
                          >
                            Annuler
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={handleAddCategory}
                          className="w-full bg-indigo-600 hover:bg-indigo-700"
                          disabled={!newCategory.name}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter la catégorie
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Categories List */}
              <div className="lg:col-span-2">
                <Card className="bg-gray-800/50 backdrop-blur-sm border border-indigo-500/30 p-6">
                  <h3 className="text-xl font-semibold mb-4">Catégories existantes</h3>
                  <div className="space-y-3">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-indigo-500/20"
                      >
                        <div className="flex items-center">
                          <span className="mr-3 text-indigo-400">{getIcon(category.icon)}</span>
                          <span>{category.name}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => startEditingCategory(category)}
                            variant="outline"
                            size="sm"
                            className="border-indigo-500/30 hover:bg-gray-700/50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button onClick={() => handleDeleteCategory(category.id)} variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {categories.length === 0 && (
                      <div className="text-center p-6 text-gray-400">
                        Aucune catégorie n'a été créée. Ajoutez-en une !
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Tags Tab */}
          {activeTab === 'tags' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Add/Edit Tag Form */}
              <div className="lg:col-span-1">
                <Card className="bg-gray-800/50 backdrop-blur-sm border border-indigo-500/30 p-6">
                  <h3 className="text-xl font-semibold mb-4">{editingTagId ? 'Modifier le tag' : 'Ajouter un tag'}</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="tag-name">Nom</Label>
                      <Input
                        id="tag-name"
                        value={newTag.name}
                        onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                        placeholder="Nom du tag"
                        className="bg-gray-900/50 border-indigo-500/30 mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tag-color">Couleur</Label>
                      <select
                        id="tag-color"
                        value={newTag.color}
                        onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                        className="w-full bg-gray-900/50 border border-indigo-500/30 rounded-md p-2 mt-1"
                      >
                        <option value="bg-blue-500">Bleu</option>
                        <option value="bg-green-500">Vert</option>
                        <option value="bg-red-500">Rouge</option>
                        <option value="bg-yellow-500">Jaune</option>
                        <option value="bg-purple-500">Violet</option>
                        <option value="bg-pink-500">Rose</option>
                        <option value="bg-indigo-500">Indigo</option>
                        <option value="bg-gray-500">Gris</option>
                      </select>
                    </div>
                    <div className="pt-4">
                      {editingTagId ? (
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleUpdateTag(editingTagId)}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Mettre à jour
                          </Button>
                          <Button
                            onClick={() => {
                              setEditingTagId(null)
                              setNewTag({ name: '', color: 'bg-blue-500' })
                            }}
                            variant="outline"
                            className="border-indigo-500/30 hover:bg-gray-700/50"
                          >
                            Annuler
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={handleAddTag}
                          className="w-full bg-indigo-600 hover:bg-indigo-700"
                          disabled={!newTag.name}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter le tag
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Tags List */}
              <div className="lg:col-span-2">
                <Card className="bg-gray-800/50 backdrop-blur-sm border border-indigo-500/30 p-6">
                  <h3 className="text-xl font-semibold mb-4">Tags existants</h3>
                  <div className="space-y-3">
                    {tags.map((tag) => (
                      <div
                        key={tag.id}
                        className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-indigo-500/20"
                      >
                        <div className="flex items-center">
                          <Badge className={`${tag.color} mr-3`}>{tag.name}</Badge>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => startEditingTag(tag)}
                            variant="outline"
                            size="sm"
                            className="border-indigo-500/30 hover:bg-gray-700/50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button onClick={() => handleDeleteTag(tag.id)} variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {tags.length === 0 && (
                      <div className="text-center p-6 text-gray-400">Aucun tag n'a été créé. Ajoutez-en un !</div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Items Tab */}
          {activeTab === 'items' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Add/Edit Item Form */}
              <div className="lg:col-span-1">
                <Card className="bg-gray-800/50 backdrop-blur-sm border border-indigo-500/30 p-6 sticky top-4">
                  <h3 className="text-xl font-semibold mb-4">
                    {editingItemId ? 'Modifier l\'item' : 'Ajouter un item'}
                  </h3>
                  <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                    <div>
                      <Label htmlFor="item-name">Nom</Label>
                      <Input
                        id="item-name"
                        value={newItem.name}
                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                        placeholder="Nom de l'item"
                        className="bg-gray-900/50 border-indigo-500/30 mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="item-description">Description</Label>
                      <textarea
                        id="item-description"
                        value={newItem.description}
                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                        placeholder="Description de l'item"
                        className="w-full bg-gray-900/50 border border-indigo-500/30 rounded-md p-2 mt-1 min-h-[80px] text-white"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="item-resourceId">Resource ID</Label>
                      <Input
                        id="item-resourceId"
                        type="number"
                        value={newItem.resourceId?.toString() || '0'}
                        onChange={(e) => setNewItem({ ...newItem, resourceId: Number.parseInt(e.target.value) || 0 })}
                        placeholder="Resource id interne"
                        className="bg-gray-900/50 border-indigo-500/30 mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="item-price">Prix</Label>
                      <Input
                        id="item-price"
                        type="number"
                        value={newItem.price?.toString() || '0'}
                        onChange={(e) => setNewItem({ ...newItem, price: Number.parseInt(e.target.value) || 0 })}
                        placeholder="Prix de l'item"
                        className="bg-gray-900/50 border-indigo-500/30 mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="item-image">Image URL</Label>
                      <Input
                        id="item-image"
                        value={newItem.image}
                        onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                        placeholder="URL de l'image"
                        className="bg-gray-900/50 border-indigo-500/30 mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="item-category">Catégorie</Label>
                      <select
                        id="item-category"
                        value={newItem.categoryId}
                        onChange={(e) => setNewItem({ ...newItem, categoryId: Number(e.target.value) })}
                        className="w-full bg-gray-900/50 border border-indigo-500/30 rounded-md p-2 mt-1 text-white"
                      >
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="item-rarity">Rareté</Label>
                      <select
                        id="item-rarity"
                        value={newItem.rarity}
                        onChange={(e) => setNewItem({ ...newItem, rarity: e.target.value as any })}
                        className="w-full bg-gray-900/50 border border-indigo-500/30 rounded-md p-2 mt-1 text-white"
                      >
                        <option value="common">Commun</option>
                        <option value="rare">Rare</option>
                        <option value="epic">Épique</option>
                        <option value="legendary">Légendaire</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="item-new"
                        checked={newItem.isNew}
                        onCheckedChange={(checked) => setNewItem({ ...newItem, isNew: checked })}
                      />
                      <Label htmlFor="item-new">Nouveau</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="item-featured"
                        checked={newItem.isFeatured}
                        onCheckedChange={(checked) => setNewItem({ ...newItem, isFeatured: checked })}
                      />
                      <Label htmlFor="item-featured">En vedette</Label>
                    </div>
                    <div>
                      <Label className="block mb-2">Tags</Label>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <Badge
                            key={tag.id}
                            className={`${tag.color} cursor-pointer ${
                              newItem.tagId === tag.id ? 'opacity-100 ring-2 ring-white' : 'opacity-50'
                            }`}
                            onClick={() => handleToggleTag(tag.id)}
                          >
                            {tag.name}
                            {newItem.tagId === tag.id && <span className="ml-1">✓</span>}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="pt-4">
                      {editingItemId ? (
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleUpdateItem(editingItemId)}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Mettre à jour
                          </Button>
                          <Button
                            onClick={() => {
                              setEditingItemId(null)
                              setNewItem({
                                name: '',
                                description: '',
                                price: 0,
                                resourceId: 0,
                                categoryId: categories.length > 0 ? categories[0].id : 1,
                                rarity: 'common',
                                isNew: true,
                                isFeatured: false,
                                tagId: null,
                                image: '/assets/images/custom/',
                              })
                            }}
                            variant="outline"
                            className="border-indigo-500/30 hover:bg-gray-700/50"
                          >
                            Annuler
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={handleAddItem}
                          className="w-full bg-indigo-600 hover:bg-indigo-700"
                          disabled={!newItem.name || !newItem.description}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter l'item
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Items List */}
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
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-gray-800/50 backdrop-blur-sm border border-indigo-500/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="all">Toutes les catégories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id.toString()}>
                        {category.name}
                      </option>
                    ))}
                  </select>
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
                  {paginatedItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="overflow-hidden bg-gray-800/50 backdrop-blur-sm border border-indigo-500/30 hover:border-indigo-400/50 transition-all h-full flex flex-col">
                        <div className="relative">
                          <img
                            src={item.image || '/placeholder.svg'}
                            alt={item.name}
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute top-2 left-2 flex flex-col gap-2">
                            {item.isNew && <Badge className="bg-green-500 hover:bg-green-600">Nouveau</Badge>}
                            {item.isFeatured && <Badge className="bg-blue-500 hover:bg-blue-600">Vedette</Badge>}
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
                        <div className="p-4 flex-grow flex flex-col">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold">{item.name}</h3>
                            <div className="flex space-x-1">
                              <Button
                                onClick={() => startEditingItem(item)}
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 border-indigo-500/30"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteItem(item.id)}
                                variant="destructive"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-gray-400 text-sm mb-4 flex-grow">{item.description}</p>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {item.tag && (
                              <Badge key={item.tag.id} className={item.tag.color}>
                                {item.tag.name}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-auto">
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
                            {/* Promotion Dialog */}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant={item.promotion ? 'destructive' : 'default'}
                                  size="sm"
                                  className={item.promotion ? '' : 'bg-indigo-600 hover:bg-indigo-700'}
                                >
                                  {item.promotion ? 'Supprimer promo' : 'Ajouter promo'}
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-gray-800 border border-indigo-500/30">
                                <DialogHeader>
                                  <DialogTitle>
                                    {item.promotion ? 'Gérer la promotion' : 'Ajouter une promotion'}
                                  </DialogTitle>
                                </DialogHeader>
                                {item.promotion ? (
                                  <div className="space-y-4">
                                    <div className="bg-gray-900/50 p-4 rounded-lg">
                                      <p className="text-sm text-gray-300 mb-1">Promotion active</p>
                                      <p className="font-medium">{item.promotion.discountPercentage}% de réduction</p>
                                      <p className="text-sm text-gray-300 mt-2 mb-1">Date de fin</p>
                                      <p className="font-medium">
                                        {item.promotion.endDate
                                          ? format(item.promotion.endDate, 'dd MMMM yyyy', { locale: fr })
                                          : 'Non définie'}
                                      </p>
                                    </div>
                                    <Button variant="destructive" onClick={() => handleRemovePromotion(item.id)}>
                                      Supprimer la promotion
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="promo-percentage">Pourcentage de réduction</Label>
                                      <div className="flex items-center mt-1">
                                        <Input
                                          id="promo-percentage"
                                          type="number"
                                          min="1"
                                          max="99"
                                          value={promotionPercentage}
                                          onChange={(e) =>
                                            setPromotionPercentage(Number.parseInt(e.target.value) || 10)
                                          }
                                          className="bg-gray-900/50 border-indigo-500/30"
                                        />
                                        <span className="ml-2">%</span>
                                      </div>
                                    </div>
                                    <div>
                                      <Label>Date de fin</Label>
                                      <div className="mt-1">
                                        <Popover>
                                          <PopoverTrigger asChild>
                                            <Button
                                              variant="outline"
                                              className="w-full justify-start text-left font-normal border-indigo-500/30 bg-transparent"
                                            >
                                              <CalendarIcon className="mr-2 h-4 w-4" />
                                              {promotionDate
                                                ? format(promotionDate, 'dd MMMM yyyy', { locale: fr })
                                                : 'Sélectionner une date'}
                                            </Button>
                                          </PopoverTrigger>
                                          <PopoverContent className="w-auto p-0 bg-gray-800 border border-indigo-500/30">
                                            <Calendar
                                              mode="single"
                                              selected={promotionDate || undefined}
                                              onSelect={(date) => setPromotionDate(date || null)}
                                              initialFocus
                                              disabled={(date) => date < new Date()}
                                              className="bg-gray-800"
                                            />
                                          </PopoverContent>
                                        </Popover>
                                      </div>
                                    </div>
                                    <div className="pt-2">
                                      <Button
                                        onClick={() => handleAddPromotion(item.id)}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                                        disabled={!promotionDate}
                                      >
                                        Appliquer la promotion
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
                          {item.promotion && (
                            <div className="mt-2 text-xs text-gray-400">
                              Promotion jusqu'au{' '}
                              {item.promotion.endDate
                                ? format(item.promotion.endDate, 'dd/MM/yyyy', { locale: fr })
                                : '?'}
                            </div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
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
          )}

          {/* Credits Tab */}
          {activeTab === 'credits' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Add/Edit Credit Pack Form */}
              <div className="lg:col-span-1">
                <Card className="bg-gray-800/50 backdrop-blur-sm border border-indigo-500/30 p-6 sticky top-4">
                  <h3 className="text-xl font-semibold mb-4">
                    {editingCreditPackId ? 'Modifier le pack de crédits' : 'Ajouter un pack de crédits'}
                  </h3>
                  <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                    <div>
                      <Label htmlFor="pack-credits">Nombre de crédits</Label>
                      <Input
                        id="pack-credits"
                        type="number"
                        value={newCreditPack.credits?.toString() || '0'}
                        onChange={(e) =>
                          setNewCreditPack({ ...newCreditPack, credits: Number.parseInt(e.target.value) || 0 })
                        }
                        placeholder="Nombre de crédits"
                        className="bg-gray-900/50 border-indigo-500/30 mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pack-bonus">Bonus de crédits</Label>
                      <Input
                        id="pack-bonus"
                        type="number"
                        value={newCreditPack.bonus?.toString() || '0'}
                        onChange={(e) =>
                          setNewCreditPack({ ...newCreditPack, bonus: Number.parseInt(e.target.value) || 0 })
                        }
                        placeholder="Bonus de crédits"
                        className="bg-gray-900/50 border-indigo-500/30 mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pack-price">Prix (€)</Label>
                      <Input
                        id="pack-price"
                        type="number"
                        value={newCreditPack.price?.toString() || '0'}
                        onChange={(e) =>
                          setNewCreditPack({ ...newCreditPack, price: Number.parseInt(e.target.value) || 0 })
                        }
                        placeholder="Prix du pack"
                        className="bg-gray-900/50 border-indigo-500/30 mt-1"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="pack-popular"
                        checked={newCreditPack.popular}
                        onCheckedChange={(checked) => setNewCreditPack({ ...newCreditPack, popular: checked })}
                      />
                      <Label htmlFor="pack-popular">Pack populaire</Label>
                    </div>
                    <div className="pt-4">
                      {editingCreditPackId ? (
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleUpdateCreditPack(editingCreditPackId)}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Mettre à jour
                          </Button>
                          <Button
                            onClick={() => {
                              setEditingCreditPackId(null)
                              setNewCreditPack({
                                credits: 0,
                                bonus: 0,
                                price: 0,
                                popular: false,
                              })
                            }}
                            variant="outline"
                            className="border-indigo-500/30 hover:bg-gray-700/50"
                          >
                            Annuler
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={handleAddCreditPack}
                          className="w-full bg-indigo-600 hover:bg-indigo-700"
                          disabled={!newCreditPack.credits || !newCreditPack.price}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter le pack
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Credit Packs List */}
              <div className="lg:col-span-3">
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
                    Packs de Crédits
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {creditPacks.map((pack) => (
                      <Card
                        key={pack.id}
                        className={`overflow-hidden bg-gray-800/50 backdrop-blur-sm border ${
                          pack.popular ? 'border-indigo-500 shadow-lg shadow-indigo-500/20' : 'border-indigo-500/30'
                        } transition-all h-full flex flex-col`}
                      >
                        {pack.popular && (
                          <div className="bg-indigo-500 text-white text-center py-1 font-medium">MEILLEURE OFFRE</div>
                        )}
                        <div className="p-6 flex flex-col items-center text-center">
                          <div className="mb-4">
                            <div className="text-3xl font-bold text-white mb-1">{pack.credits}</div>
                            <div className="text-indigo-300 font-medium">Crédits</div>
                          </div>
                          {pack.bonus > 0 && <Badge className="mb-4 bg-green-500">+{pack.bonus} BONUS</Badge>}
                          <div className="text-2xl font-bold mb-6">{pack.price}€</div>
                          <div className="flex space-x-2 mt-auto">
                            <Button
                              onClick={() => startEditingCreditPack(pack)}
                              variant="outline"
                              size="sm"
                              className="border-indigo-500/30"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button onClick={() => handleDeleteCreditPack(pack.id)} variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                    {creditPacks.length === 0 && (
                      <div className="col-span-5 text-center p-6 text-gray-400">
                        Aucun pack de crédits n'a été créé. Ajoutez-en un !
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Premium Tab */}
          {activeTab === 'premium' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Add/Edit Premium Plan Form */}
              <div className="lg:col-span-1">
                <Card className="bg-gray-800/50 backdrop-blur-sm border border-indigo-500/30 p-6 sticky top-4">
                  <h3 className="text-xl font-semibold mb-4">
                    {editingPremiumPlanId ? 'Modifier le plan premium' : 'Ajouter un plan premium'}
                  </h3>
                  <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                    <div>
                      <Label htmlFor="plan-name">Nom</Label>
                      <Input
                        id="plan-name"
                        value={newPremiumPlan.name}
                        onChange={(e) => setNewPremiumPlan({ ...newPremiumPlan, name: e.target.value })}
                        placeholder="Nom du plan"
                        className="bg-gray-900/50 border-indigo-500/30 mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="plan-price">Prix (€)</Label>
                      <Input
                        id="plan-price"
                        type="number"
                        value={newPremiumPlan.price?.toString() || '0'}
                        onChange={(e) =>
                          setNewPremiumPlan({ ...newPremiumPlan, price: Number.parseInt(e.target.value) || 0 })
                        }
                        placeholder="Prix du plan"
                        className="bg-gray-900/50 border-indigo-500/30 mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="plan-credits">Crédits offerts</Label>
                      <Input
                        id="plan-credits"
                        type="number"
                        value={newPremiumPlan.credits?.toString() || '0'}
                        onChange={(e) =>
                          setNewPremiumPlan({ ...newPremiumPlan, credits: Number.parseInt(e.target.value) || 0 })
                        }
                        placeholder="Crédits offerts"
                        className="bg-gray-900/50 border-indigo-500/30 mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="plan-duration">Durée (jours)</Label>
                      <Input
                        id="plan-duration"
                        type="number"
                        value={newPremiumPlan.duration?.toString() || '30'}
                        onChange={(e) =>
                          setNewPremiumPlan({ ...newPremiumPlan, duration: Number.parseInt(e.target.value) || 30 })
                        }
                        placeholder="Durée en jours"
                        className="bg-gray-900/50 border-indigo-500/30 mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="plan-discount">Réduction (%)</Label>
                      <Input
                        id="plan-discount"
                        type="number"
                        value={newPremiumPlan.discount?.toString() || '0'}
                        onChange={(e) =>
                          setNewPremiumPlan({ ...newPremiumPlan, discount: Number.parseInt(e.target.value) || 0 })
                        }
                        placeholder="Réduction en pourcentage"
                        className="bg-gray-900/50 border-indigo-500/30 mt-1"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="plan-popular"
                        checked={newPremiumPlan.popular}
                        onCheckedChange={(checked) => setNewPremiumPlan({ ...newPremiumPlan, popular: checked })}
                      />
                      <Label htmlFor="plan-popular">Plan populaire</Label>
                    </div>
                    <div className="pt-4">
                      {editingPremiumPlanId ? (
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleUpdatePremiumPlan(editingPremiumPlanId)}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Mettre à jour
                          </Button>
                          <Button
                            onClick={() => {
                              setEditingPremiumPlanId(null)
                              setNewPremiumPlan({
                                name: '',
                                price: 0,
                                credits: 0,
                                duration: 30,
                                popular: false,
                                discount: 0,
                              })
                            }}
                            variant="outline"
                            className="border-indigo-500/30 hover:bg-gray-700/50"
                          >
                            Annuler
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={handleAddPremiumPlan}
                          className="w-full bg-indigo-600 hover:bg-indigo-700"
                          disabled={!newPremiumPlan.name}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter le plan
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Premium Plans List */}
              <div className="lg:col-span-3">
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                    Plans Premium
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {premiumPlans.map((plan) => (
                      <Card
                        key={plan.id}
                        className={`overflow-hidden bg-gray-800/50 backdrop-blur-sm border ${
                          plan.popular ? 'border-purple-500 shadow-lg shadow-purple-500/20' : 'border-indigo-500/30'
                        } transition-all h-full flex flex-col`}
                      >
                        {plan.popular && (
                          <div className="bg-purple-500 text-white text-center py-1 font-medium">PLUS POPULAIRE</div>
                        )}
                        <div className="p-6 flex flex-col h-full">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold">{plan.name}</h3>
                            <div className="flex space-x-1">
                              <Button
                                onClick={() => startEditingPremiumPlan(plan)}
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 border-indigo-500/30"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() => handleDeletePremiumPlan(plan.id)}
                                variant="destructive"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-baseline mb-4">
                            <span className="text-3xl font-bold">{plan.price}€</span>
                            {plan.discount > 0 && <Badge className="ml-2 bg-green-500">-{plan.discount}%</Badge>}
                          </div>
                          <ul className="space-y-3 mb-6 flex-grow">
                            <li className="flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mr-2 text-green-500"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              Durée: {plan.duration} jours
                            </li>
                            <li className="flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mr-2 text-green-500"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              <span className="font-semibold text-indigo-300">{plan.credits}</span> crédits offerts
                            </li>
                          </ul>
                        </div>
                      </Card>
                    ))}
                    {premiumPlans.length === 0 && (
                      <div className="col-span-3 text-center p-6 text-gray-400">
                        Aucun plan premium n'a été créé. Ajoutez-en un !
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default AdminShopPage
