'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Badge } from 'components/UI/Badge'
import { Button } from 'components/UI/Button'
import { Card } from 'components/UI/Card'

// Mock data for shop items
const shopCategories = [
  { id: 'cosmetics', name: 'Cosmétiques', icon: 'sparkles' },
  { id: 'boosters', name: 'Boosters', icon: 'zap' },
  { id: 'characters', name: 'Personnages', icon: 'user' },
  { id: 'emotes', name: 'Émotes', icon: 'message-circle' },
  { id: 'backgrounds', name: 'Arrière-plans', icon: 'image' },
]

const shopItems = [
  // Cosmetics
  {
    id: 1,
    name: 'Casque Spatial Deluxe',
    description: 'Un casque spatial brillant avec des effets de particules',
    price: 500,
    discountPrice: null,
    image: '/placeholder.svg?height=200&width=200',
    category: 'cosmetics',
    rarity: 'epic',
    isNew: true,
    isFeatured: true,
  },
  {
    id: 2,
    name: 'Combinaison Stellaire',
    description: 'Une combinaison spatiale avec des motifs d\'étoiles animés',
    price: 800,
    discountPrice: 650,
    image: '/placeholder.svg?height=200&width=200',
    category: 'cosmetics',
    rarity: 'legendary',
    isNew: false,
    isFeatured: true,
  },
  {
    id: 3,
    name: 'Gants Gravitationnels',
    description: 'Des gants qui laissent une traînée d\'étoiles quand vous bougez',
    price: 300,
    discountPrice: null,
    image: '/placeholder.svg?height=200&width=200',
    category: 'cosmetics',
    rarity: 'rare',
    isNew: false,
    isFeatured: false,
  },

  // Boosters
  {
    id: 4,
    name: 'Boost XP +50%',
    description: 'Augmente votre gain d\'XP de 50% pendant 24 heures',
    price: 200,
    discountPrice: null,
    image: '/placeholder.svg?height=200&width=200',
    category: 'boosters',
    rarity: 'common',
    isNew: false,
    isFeatured: false,
  },
  {
    id: 5,
    name: 'Boost Ressources +100%',
    description: 'Double vos gains de ressources pendant 12 heures',
    price: 350,
    discountPrice: 300,
    image: '/placeholder.svg?height=200&width=200',
    category: 'boosters',
    rarity: 'rare',
    isNew: true,
    isFeatured: false,
  },

  // Characters
  {
    id: 6,
    name: 'Commandant Nova',
    description: 'Un commandant légendaire avec des capacités de leadership améliorées',
    price: 1200,
    discountPrice: null,
    image: '/placeholder.svg?height=200&width=200',
    category: 'characters',
    rarity: 'legendary',
    isNew: false,
    isFeatured: true,
  },
  {
    id: 7,
    name: 'Technicien Orion',
    description: 'Spécialiste en réparation de vaisseaux et équipements',
    price: 800,
    discountPrice: null,
    image: '/placeholder.svg?height=200&width=200',
    category: 'characters',
    rarity: 'epic',
    isNew: true,
    isFeatured: false,
  },

  // Emotes
  {
    id: 8,
    name: 'Salut Spatial',
    description: 'Un salut avec des effets de particules stellaires',
    price: 150,
    discountPrice: null,
    image: '/placeholder.svg?height=200&width=200',
    category: 'emotes',
    rarity: 'common',
    isNew: false,
    isFeatured: false,
  },
  {
    id: 9,
    name: 'Danse Gravitationnelle',
    description: 'Une danse qui défie la gravité',
    price: 250,
    discountPrice: 200,
    image: '/placeholder.svg?height=200&width=200',
    category: 'emotes',
    rarity: 'rare',
    isNew: false,
    isFeatured: false,
  },

  // Backgrounds
  {
    id: 10,
    name: 'Nébuleuse Cosmique',
    description: 'Un arrière-plan animé d\'une nébuleuse colorée',
    price: 400,
    discountPrice: null,
    image: '/placeholder.svg?height=200&width=200',
    category: 'backgrounds',
    rarity: 'epic',
    isNew: false,
    isFeatured: false,
  },
  {
    id: 11,
    name: 'Station Spatiale',
    description: 'Un arrière-plan d\'une station spatiale orbitant autour d\'une planète',
    price: 350,
    discountPrice: null,
    image: '/placeholder.svg?height=200&width=200',
    category: 'backgrounds',
    rarity: 'rare',
    isNew: true,
    isFeatured: false,
  },
]

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

const ShopItems: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('cosmetics')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('featured')

  // Filter items by category and search query
  const filteredItems = shopItems
    .filter((item) => item.category === activeCategory)
    .filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar with categories */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-indigo-500/30 p-4 sticky top-4">
            <h3 className="text-lg font-semibold mb-4 text-indigo-300">Catégories</h3>
            <div className="space-y-2">
              {shopCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`w-full flex items-center p-3 rounded-md transition-all ${
                    activeCategory === category.id
                      ? 'bg-indigo-900/70 text-white shadow-lg shadow-indigo-500/20'
                      : 'hover:bg-gray-700/50 text-gray-300'
                  }`}
                >
                  <span className="mr-3">{getIcon(category.icon)}</span>
                  <span>{category.name}</span>
                </button>
              ))}
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

          {/* Items grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="overflow-hidden bg-gray-800/50 backdrop-blur-sm border border-indigo-500/30 hover:border-indigo-400/50 transition-all h-full flex flex-col">
                  <div className="relative">
                    <img src={item.image || '/placeholder.svg'} alt={item.name} className="w-full h-48 object-cover" />
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
                    <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
                    <p className="text-gray-400 text-sm mb-4 flex-grow">{item.description}</p>
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
                      <Button className="bg-indigo-600 hover:bg-indigo-700">Acheter</Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

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
    </motion.div>
  )
}

export default ShopItems
