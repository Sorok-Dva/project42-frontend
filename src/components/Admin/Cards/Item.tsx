'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import type { Card } from 'types/card'
import { Edit, Trash2 } from 'lucide-react'
import { Img as Image } from 'react-image'

interface CardItemProps {
  card: Card
  onEdit: (id: number) => void
  onDelete: (id: number) => void
}

const CardItem: React.FC<CardItemProps> = ({ card, onEdit, onDelete })=> {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gray-800/60 backdrop-blur-sm border border-blue-500/30 rounded-lg mb-4 overflow-hidden"
    >
      <div
        className="p-4 flex flex-col md:flex-row items-start md:items-center gap-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-shrink-0 relative w-16 h-16 md:w-20 md:h-20 rounded-md overflow-hidden border border-blue-500/50">
          <Image src={card ? `/assets/images/carte${card.id}.png` :  '/placeholder.svg'} alt={card.name} className="object-cover" />
        </div>

        <div className="flex-grow">
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-400 font-mono">{card.id}</span>
            <h3 className="text-lg font-semibold text-white">{card.name}</h3>
          </div>
          <p className="text-gray-300 text-sm line-clamp-2">{card.description}</p>
        </div>

        <div className="flex gap-2 mt-2 md:mt-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 bg-blue-600/70 hover:bg-blue-500 rounded-md text-white"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(card.id)
            }}
          >
            <Edit size={16} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 bg-red-600/70 hover:bg-red-500 rounded-md text-white"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(card.id)
            }}
          >
            <Trash2 size={16} />
          </motion.button>
        </div>
      </div>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="px-4 pb-4 border-t border-blue-500/30 pt-3 mt-2"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-blue-400 mb-1">Détails</h4>
              <p className="text-sm text-gray-300">{card.description}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-400 mb-1">Informations</h4>
              <p className="text-xs text-gray-400">
                Créé le: {new Date(card.createdAt).toLocaleDateString()}
                <br />
                Mis à jour le: {card.updatedAt ? new Date(card.updatedAt).toLocaleDateString() : 'Jamais'}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default CardItem
