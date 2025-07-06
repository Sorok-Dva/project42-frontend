'use client'

import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import axios from 'axios'
import { useAuth } from 'contexts/AuthContext'
import type { Item, UserInventory } from 'types/shop'

interface ThrowItemModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (itemId: number) => void
}

const ThrowItemModal: React.FC<ThrowItemModalProps> = ({ isOpen, onClose, onSelect }) => {
  const { token } = useAuth()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const fetchData = async () => {
      setLoading(true)
      try {
        const [shopRes, invRes] = await Promise.all([
          axios.get('/api/shop'),
          axios.get('/api/users/inventory', { headers: { Authorization: `Bearer ${token}` } }),
        ])
        const inventory: UserInventory[] = invRes.data.inventory || []
        const owned = new Set(inventory.map(i => i.itemId))
        const shopItems: Item[] = shopRes.data.items
        setItems(shopItems.filter(i => i.categoryId === 4 && owned.has(i.id)))
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [isOpen, token])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-gradient-to-r from-black/90 to-gray-900/90 rounded-xl border border-gray-500/30 p-6 max-w-md w-full mx-4"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-white mb-4">Choisir un objet</h2>
            {loading ? (
              <p className="text-white">Chargement...</p>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => onSelect(item.id)}
                    className="flex flex-col items-center gap-1 hover:bg-white/10 p-2 rounded"
                  >
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-contain" />
                    <span className="text-white text-xs text-center">{item.name}</span>
                  </button>
                ))}
                {items.length === 0 && <p className="text-white">Aucun objet disponible</p>}
              </div>
            )}
            <div className="mt-4 text-right">
              <button onClick={onClose} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded">Fermer</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ThrowItemModal
