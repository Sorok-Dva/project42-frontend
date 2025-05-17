'use client'

import React, { useEffect } from 'react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'components/UI/Tabs'
import { Badge } from 'components/UI/Badge'
import { Button } from 'components/UI/Button'
import { Card } from 'components/UI/Card'
import { Input } from 'components/UI/Input'
import { Textarea } from 'components/UI/Textarea'
import { Switch } from 'components/UI/Switch'
import { Label } from 'components/UI/Label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from 'components/UI/Dialog'
import { Popover, PopoverContent, PopoverTrigger } from 'components/UI/Popover'
import { Calendar } from 'components/UI/Calendar'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { X, Plus, CalendarIcon, Edit, Trash2, Save, Tag, ShoppingBasket } from 'lucide-react'
import axios from 'axios'
import { useAuth } from 'contexts/AuthContext'
import { toast } from 'react-toastify'
import { Category, Item, ShopData, TagType } from 'types/shop'
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

const AdminShopPage: React.FC = () => {
  const { token } = useAuth()
  const [loading, setLoading] = useState<boolean>(true)
  const [activeTab, setActiveTab] = useState('categories')
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<TagType[]>([])
  const [items, setItems] = useState<Item[]>([])

  // Form states
  const [newCategory, setNewCategory] = useState<Partial<Category>>({ name: '', icon: 'sparkles' })
  const [newTag, setNewTag] = useState<Partial<TagType>>({ name: '', color: 'bg-blue-500' })
  const [newItem, setNewItem] = useState<Partial<Item>>({
    name: '',
    description: '',
    resourceId: 0,
    price: 0,
    categoryId: 1,
    rarity: 'common',
    isNew: true,
    isFeatured: false,
    tagId: null,
    image: '/assets/images/custom/',
  })

  // Edit states
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null)
  const [editingTagId, setEditingTagId] = useState<number | null>(null)
  const [editingItemId, setEditingItemId] = useState<number | null>(null)

  // Filter states
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Promotion state
  const [promotionDate, setPromotionDate] = useState<Date | null>(null)
  const [promotionPercentage, setPromotionPercentage] = useState<number>(10)

  // Filtered items
  const filteredItems = items.filter((item) => {
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  useEffect(() => {
    async function retrieveShop() {
      try {
        const response = await axios.get<ShopData>('/api/shop')

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

  const handleAddCategory = async () => {
    if (!newCategory.name) return

    try {
      const response = await axios.post('/api/admin/shop/category', newCategory, {
        headers: {
          Authorization: `Bearer ${token}`
        }
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
    const updatedCategories = categories.map((category) =>
      category.id === id ? { ...category, ...newCategory, id } : category,
    )
    try {
      const response = await axios.put(`/api/admin/shop/category/${id}`, newCategory, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.data.category) {
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
        headers: {
          Authorization: `Bearer ${token}`
        }
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
        headers: {
          Authorization: `Bearer ${token}`
        }
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
    const updatedTags = tags.map((tag) => (tag.id === id ? { ...tag, ...newTag, id } : tag))
    try {
      const response = await axios.put(`/api/admin/shop/tag/${id}`, newTag, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.data.tag) {
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
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.data.message === 'success') {
        setTags(tags.filter((tag) => tag.id !== id))
        // Also remove this tag from all items
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
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.data.name) {
        setItems([...items, response.data])
        setNewItem({
          name: '',
          description: '',
          price: 0,
          resourceId: 0,
          categoryId: 1,
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
    const updatedItems = items.map((item) => (item.id === id ? { ...item, ...newItem, id } : item))

    try {
      const response = await axios.put(`/api/admin/shop/item/${id}`, updatedItems[0], {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.data.name) {
        setItems(updatedItems)
        setEditingItemId(null)
        setNewItem({
          name: '',
          description: '',
          price: 0,
          resourceId: 0,
          categoryId: 1,
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
        headers: {
          Authorization: `Bearer ${token}`
        }
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
      tagId,
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
            Administration de la Boutique
          </h1>
        </div>

        <Tabs defaultValue="categories" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-lg"></div>
            <TabsList className="relative grid w-full grid-cols-3 bg-gray-800/50 backdrop-blur-sm border border-indigo-500/30 rounded-lg h-14">
              <TabsTrigger
                value="categories"
                className="data-[state=active]:bg-indigo-900/50 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/20 rounded-md transition-all"
              >
                <span className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
                  </svg>
                  Catégories
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="tags"
                className="data-[state=active]:bg-indigo-900/50 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/20 rounded-md transition-all"
              >
                <span className="flex items-center">
                  <Tag className="h-4 w-4 mr-2" />
                  Tags
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="items"
                className="data-[state=active]:bg-indigo-900/50 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/20 rounded-md transition-all"
              >
                <span className="flex items-center">
                  <ShoppingBasket className="h-4 w-4 mr-2" />
                  Items
                </span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Categories Tab */}
          <TabsContent value="categories" className="mt-0">
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
          </TabsContent>

          {/* Tags Tab */}
          <TabsContent value="tags" className="mt-0">
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
          </TabsContent>

          {/* Items Tab */}
          <TabsContent value="items" className="mt-0">
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
                      <Textarea
                        id="item-description"
                        value={newItem.description}
                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                        placeholder="Description de l'item"
                        className="bg-gray-900/50 border-indigo-500/30 mt-1"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="item-resourceId">ResourceId</Label>
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
                        className="w-full bg-gray-900/50 border border-indigo-500/30 rounded-md p-2 mt-1"
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
                        className="w-full bg-gray-900/50 border border-indigo-500/30 rounded-md p-2 mt-1"
                      >
                        <option value="common">Commun</option>
                        <option value="rare">Rare</option>
                        <option value="epic">Épique</option>
                        <option value="legendary">Légendaire</option>
                      </select>
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
                              newItem.tagId === tag.id ? 'opacity-100' : 'opacity-50'
                            }`}
                            onClick={() => handleToggleTag(tag.id)}
                          >
                            {tag.name}
                            {newItem.tagId === tag.id && <X className="h-3 w-3 ml-1" />}
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
                                categoryId: 1,
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
              <div className="lg:col-span-3">
                <div className="space-y-6">
                  {/* Filters */}
                  <Card className="bg-gray-800/50 backdrop-blur-sm border border-indigo-500/30 p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-grow">
                        <Input
                          type="text"
                          placeholder="Rechercher..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-gray-900/50 border-indigo-500/30 pl-10"
                        />
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 absolute left-3 top-2.5 text-gray-400"
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
                        className="bg-gray-900/50 border border-indigo-500/30 rounded-md p-2"
                      >
                        <option value="all">Toutes les catégories</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </Card>

                  {/* Items Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredItems.map((item) => (
                      <Card
                        key={item.id}
                        className="bg-gray-800/50 backdrop-blur-sm border border-indigo-500/30 overflow-hidden"
                      >
                        <div className="relative">
                          <img
                            src={item.image || '/placeholder.svg'}
                            alt={item.name}
                            className="w-full h-48"
                          />
                          <div className="absolute top-2 left-2 flex flex-col gap-2">
                            {item.isNew && <Badge className="bg-green-500">Nouveau</Badge>}
                            {item.isFeatured && <Badge className="bg-blue-500">Vedette</Badge>}
                          </div>
                          <div className="absolute top-2 right-2">
                            <Badge className={getRarityColor(item.rarity)}>
                              {item.rarity === 'common' && 'Commun'}
                              {item.rarity === 'rare' && 'Rare'}
                              {item.rarity === 'epic' && 'Épique'}
                              {item.rarity === 'legendary' && 'Légendaire'}
                            </Badge>
                          </div>
                        </div>

                        <div className="p-4">
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

                          <p className="text-gray-400 text-sm mb-3 line-clamp-2">{item.description}</p>

                          <div className="flex flex-wrap gap-1 mb-3">
                            {item.tag && (
                              <Badge key={item.tag.id} className={item.tag.color}>
                                {item.tag.name}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
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
                                              className="w-full justify-start text-left font-normal border-indigo-500/30"
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
                    ))}
                  </div>

                  {/* Empty state */}
                  {filteredItems.length === 0 && (
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
                        Aucun article ne correspond à votre recherche. Essayez de modifier vos critères ou ajoutez-en un
                        nouveau.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}

export default AdminShopPage
