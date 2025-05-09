'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Filter, Loader2 } from 'lucide-react'
import CardItem from 'components/Admin/Cards/Item'
import CardForm from 'components/Admin/Cards/Form'
import type { Card, CardFormData } from 'types/card'
import axios from 'axios'

const mockCards: Card[] = [
  {
    id: 0,
    name: 'Explorateur Stellaire',
    description: 'Permet de découvrir une nouvelle planète et d\'obtenir un bonus de ressources.',
    imageUrl: '/placeholder.svg?height=200&width=150',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-02-20'),
  },
  {
    id: 1,
    name: 'Diplomate Galactique',
    description: 'Établit une alliance avec une faction étrangère, augmentant votre influence politique.',
    imageUrl: '/placeholder.svg?height=200&width=150',
    createdAt: new Date('2023-01-20'),
    updatedAt: new Date('2023-03-05'),
  },
  {
    id: 2,
    name: 'Vaisseau de Combat',
    description: 'Augmente votre puissance militaire et vous permet d\'attaquer les flottes ennemies.',
    imageUrl: '/placeholder.svg?height=200&width=150',
    createdAt: new Date('2023-02-10'),
    updatedAt: new Date('2023-04-15'),
  },
  {
    id: 3,
    name: 'Station Commerciale',
    description: 'Génère des crédits supplémentaires à chaque tour et améliore vos relations commerciales.',
    imageUrl: '/placeholder.svg?height=200&width=150',
    createdAt: new Date('2023-03-05'),
    updatedAt: new Date('2023-05-12'),
  },
  {
    id: 4,
    name: 'Saboteur',
    description: 'Permet de saboter les installations d\'un adversaire, réduisant sa production.',
    imageUrl: '/placeholder.svg?height=200&width=150',
    createdAt: new Date('2023-04-18'),
    updatedAt: new Date('2023-06-22'),
  },
]

const AdminCardsPage: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([])
  const [filteredCards, setFilteredCards] = useState<Card[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [currentCard, setCurrentCard] = useState<Card | undefined>(undefined)

  useEffect(() => {
    const loadCards = async () => {
      const response = await axios.get('/api/cards')
      setCards(response.data)
      setFilteredCards(response.data)
      setIsLoading(false)
    }

    loadCards()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCards(cards)
    } else {
      const filtered = cards.filter(
        (card) =>
          card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredCards(filtered)
    }
  }, [searchTerm, cards])

  const handleAddCard = () => {
    setCurrentCard(undefined)
    setIsFormOpen(true)
  }

  const handleEditCard = (id: number) => {
    const cardToEdit = cards.find((card) => card.id === id)
    if (cardToEdit) {
      setCurrentCard(cardToEdit)
      setIsFormOpen(true)
    }
  }

  const handleDeleteCard = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette carte ?')) {
      // Simuler un délai de traitement
      await new Promise((resolve) => setTimeout(resolve, 500))
      setCards((prevCards) => prevCards.filter((card) => card.id !== id))
    }
  }

  const handleSubmitCard = (formData: CardFormData, id?: number) => {
    if (id) {
      // Mise à jour d'une carte existante
      setCards((prevCards) =>
        prevCards.map((card) =>
          card.id === id
            ? {
              ...card,
              ...formData,
              updatedAt: new Date(),
            }
            : card,
        ),
      )
    } else {
      // Ajout d'une nouvelle carte
      const newCard: Card = {
        id: 10,
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setCards((prevCards) => [...prevCards, newCard])
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Gestion des Cartes
            </h1>
            <p className="text-gray-400 mt-1">
              Gérez les cartes du jeu, modifiez leurs attributs ou ajoutez-en de nouvelles.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddCard}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center gap-2 text-white font-medium"
          >
            <Plus size={18} />
            Ajouter une carte
          </motion.button>
        </div>

        <div className="bg-gray-800/60 backdrop-blur-sm border border-blue-500/30 rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher par nom, description ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2">
              <Filter size={18} />
              Filtres
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 size={40} className="animate-spin text-blue-500 mb-4" />
            <p className="text-gray-400">Chargement des cartes...</p>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="bg-gray-800/60 backdrop-blur-sm border border-blue-500/30 rounded-lg p-8 text-center">
            <p className="text-gray-400 mb-4">Aucune carte trouvée</p>
            <button onClick={handleAddCard} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white">
              Ajouter votre première carte
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCards.map((card) => (
              <CardItem key={card.id} card={card} onEdit={handleEditCard} onDelete={handleDeleteCard} />
            ))}
          </div>
        )}
      </div>

      <CardForm
        card={currentCard}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmitCard}
      />
    </div>
  )
}

export default AdminCardsPage
