'use client'

import React, { useEffect } from 'react'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Users, Zap, Shield, Star, Eye, X } from 'lucide-react'
import { Card, CardContent } from 'components/UI/Card'
import { Input } from 'components/UI/Input'
import { Button } from 'components/UI/Button'
import { Badge } from 'components/UI/Badge'
import axios from 'axios'

interface GameCard {
  id: number
  equivalent: string
  camp: 'Équipage' | 'Aliens' | 'Solitaires' | 'Spéciaux'
}

const gameCards: GameCard[] = [
  {
    id: 1,
    equivalent: 'Villageois',
    camp: 'Équipage',
  },
  {
    id: 2,
    equivalent: 'Loup-Garou',
    camp: 'Aliens',
  },
  {
    id: 3,
    equivalent: 'Voyante',
    camp: 'Équipage',
  },
  {
    id: 4,
    equivalent: 'Salvateur',
    camp: 'Équipage',
  },
  {
    id: 5,
    equivalent: 'Sorcière',
    camp: 'Équipage',
  },
  {
    id: 6,
    equivalent: 'Chasseur',
    camp: 'Équipage',
  },
  {
    id: 7,
    equivalent: 'Cupidon',
    camp: 'Équipage',
  },
  {
    id: 8,
    equivalent: 'Ancien',
    camp: 'Équipage',
  },
  {
    id: 9,
    equivalent: 'Loup-Garou Blanc',
    camp: 'Solitaires',
  },
  {
    id: 10,
    equivalent: 'Chaman',
    camp: 'Équipage',
  },
  {
    id: 11,
    equivalent: 'Voleur',
    camp: 'Équipage',
  },
  {
    id: 12,
    equivalent: 'Petite fille',
    camp: 'Équipage',
  },
  {
    id: 13,
    equivalent: 'Villageois-Villageois',
    camp: 'Équipage',
  },
  {
    id: 15,
    equivalent: 'Joueur de flûte',
    camp: 'Solitaires',
  },
  {
    id: 16,
    equivalent: 'Les Sœurs',
    camp: 'Équipage',
  },
  {
    id: 17,
    equivalent: 'Les Frères',
    camp: 'Équipage',
  },
  {
    id: 19,
    equivalent: 'L\'ange',
    camp: 'Solitaires',
  },
  {
    id: 20,
    equivalent: 'L\'infect père des loups',
    camp: 'Aliens',
  },
  {
    id: 21,
    equivalent: 'Grand Méchant Loup',
    camp: 'Aliens',
  },
  {
    id: 22,
    equivalent: 'Role exclusif à Project 42',
    camp: 'Équipage',
  },
  {
    id: 23,
    equivalent: 'Role exclusif à Project 42',
    camp: 'Équipage',
  },
  {
    id: 24,
    equivalent: 'Le Bouc Émissaire',
    camp: 'Équipage',
  },
]

interface Card { id: number; name: string; description: string, equivalent: string, camp: string }

const CardsPage: React.FC = () => {
  const [selectedCamp, setSelectedCamp] = useState<string>('Tous')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [cards, setCards] = useState<Card[]>([])

  useEffect(() => {
    axios
      .get('/api/games/cards')
      .then(res => setCards(res.data.cards.map((c: Card) => {
        const equivalent = gameCards.find(gc => gc.id === c.id)
        return {
          id: c.id,
          name: c.name,
          description: c.description,
          ...equivalent,
        }
      })))
      .catch(err => console.error('Erreur récupération cartes :', err))
  }, [])

  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      const matchesCamp = selectedCamp === 'Tous' || card.camp === selectedCamp
      const matchesSearch =
        card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.equivalent.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesCamp && matchesSearch
    })
  }, [selectedCamp, searchTerm, cards])

  const camps = ['Tous', 'Équipage', 'Aliens', 'Solitaires', 'Spéciaux']

  const getCampIcon = (camp: string) => {
    switch (camp) {
    case 'Équipage':
      return <Users className="w-4 h-4" />
    case 'Aliens':
      return <Zap className="w-4 h-4" />
    case 'Solitaires':
      return <Shield className="w-4 h-4" />
    case 'Spéciaux':
      return <Star className="w-4 h-4" />
    default:
      return <Filter className="w-4 h-4" />
    }
  }

  const getCampColor = (camp: string) => {
    switch (camp) {
    case 'Équipage':
      return 'from-blue-500 to-cyan-500'
    case 'Aliens':
      return 'from-red-500 to-orange-500'
    case 'Solitaires':
      return 'from-gray-500 to-slate-500'
    case 'Spéciaux':
      return 'from-purple-500 to-pink-500'
    default:
      return 'from-gray-500 to-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Animated background stars */}
      <div className="absolute inset-0 opacity-30">
        {Array.from({ length: 200 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Nebula effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="absolute top-3/4 left-3/4 w-64 h-64 bg-pink-500 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '2s' }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 mt-20">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            🃏 Cartes de Project 42
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Découvrez tous les rôles disponibles dans l'univers spatial de Project 42 et leurs équivalents dans le jeu
            classique Loup-Garou
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-black/30 border-gray-800/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Rechercher une carte..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-black/30 border-gray-700 text-white placeholder:text-gray-500"
                  />
                </div>

                {/* Camp filters */}
                <div className="flex flex-wrap gap-2">
                  {camps.map((camp) => (
                    <Button
                      key={camp}
                      variant={selectedCamp === camp ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCamp(camp)}
                      className={`flex items-center gap-2 ${
                        selectedCamp === camp
                          ? `bg-gradient-to-r ${getCampColor(camp)} hover:opacity-90`
                          : 'bg-black/30 border-gray-700 text-white hover:bg-white/10'
                      }`}
                    >
                      {getCampIcon(camp)}
                      {camp}
                    </Button>
                  ))}
                </div>

                {/* Results count */}
                <div className="text-sm text-gray-400">
                  {filteredCards.length} carte{filteredCards.length > 1 ? 's' : ''} trouvée
                  {filteredCards.length > 1 ? 's' : ''}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Cards Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {filteredCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                className="cursor-pointer"
                onClick={() => setSelectedCard(card)}
              >
                <Card
                  className={'bg-black/40 border-gray-800/50 backdrop-blur-sm hover:bg-black/60 transition-all duration-300 overflow-hidden'}
                >
                  <CardContent className="p-0">
                    {/* Card Image */}
                    <div className="relative h-auto bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                      <img
                        src={`/assets/images/carte${card.id}.png`}
                        alt={card.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          target.nextElementSibling?.classList.remove('hidden')
                        }}
                      />
                      <div className="hidden flex-col items-center justify-center text-gray-400">
                        <Eye className="w-12 h-12 mb-2" />
                        <span className="text-sm">Image non disponible</span>
                      </div>
                    </div>

                    {/* Card Info */}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {getCampIcon(card.camp)}
                        <Badge className={`bg-gradient-to-r ${getCampColor(card.camp)} text-white border-0`}>
                          {card.camp}
                        </Badge>
                      </div>

                      <h3 className="text-lg font-bold text-white mb-1">{card.name}</h3>
                      <p className="text-sm text-blue-300 mb-2">≈ {card.equivalent}</p>
                      <p className="text-xs text-gray-400 line-clamp-2">{card.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* No results */}
        {filteredCards.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">Aucune carte trouvée</div>
            <p className="text-gray-500">Essayez de modifier vos critères de recherche</p>
          </motion.div>
        )}
      </div>

      {/* Card Detail Modal */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedCard(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-black/90 border border-gray-800/50 backdrop-blur-md rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    {getCampIcon(selectedCard.camp)}
                    <h2 className="text-2xl font-bold text-white">{selectedCard.name}</h2>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCard(null)}
                    className="bg-black/30 border-gray-700 text-white hover:bg-white/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Image */}
                  <div className="relative">
                    <div
                      className={'relative h-64 md:h-80 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden'}
                    >
                      <img
                        src={`/assets/images/carte${selectedCard.id}.png`}
                        alt={selectedCard.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          target.nextElementSibling?.classList.remove('hidden')
                        }}
                      />
                      <div className="hidden flex-col items-center justify-center text-gray-400 h-full">
                        <Eye className="w-16 h-16 mb-4" />
                        <span>Image non disponible</span>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-4">
                    <div>
                      <Badge className={`bg-gradient-to-r ${getCampColor(selectedCard.camp)} text-white border-0 mb-2`}>
                        {selectedCard.camp}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Équivalent Loup-Garou</h3>
                      <p className="text-blue-300">{selectedCard.equivalent}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                      <p className="text-gray-300">{selectedCard.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CardsPage
