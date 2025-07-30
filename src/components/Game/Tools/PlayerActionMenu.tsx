'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import axios from 'axios'
import type { Socket } from 'socket.io-client'
import type { Item, UserInventory } from 'types/shop'
import { useAuth } from 'contexts/AuthContext'

interface PlayerActionMenuProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToModeratorMenu?: () => void
  playerName: string
  playerId: number
  position: { x: number; y: number }
  socket: Socket | null
  gameId: string
}

const PlayerActionMenu: React.FC<PlayerActionMenuProps> = ({
  isOpen,
  onClose,
  onSwitchToModeratorMenu,
  playerName,
  playerId,
  position,
  socket,
  gameId,
}) => {
  const { token } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [showItems, setShowItems] = useState(false)
  const [items, setItems] = useState<Item[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!showItems) return
    const fetchItems = async () => {
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
      }
    }
    fetchItems()
  }, [showItems, token])

  if (!isOpen || !mounted) return null

  const baseHeight = 120 + (showItems ? Math.ceil(items.length / 4) * 70 : 0)
  const menuWidth = 220
  const adjustedPosition = {
    x: Math.min(position.x, window.innerWidth - menuWidth),
    y: Math.min(position.y, window.innerHeight - baseHeight),
  }

  const handleAddFriend = async () => {
    try {
      await axios.post(
        '/api/friends/add',
        { addresseeId: playerId },
        { headers: { Authorization: `Bearer ${token}` } },
      )
    } catch (e) {
      console.error(e)
    }
    onClose()
  }

  const handleThrowItem = (itemId: number) => {
    if (socket) {
      socket.emit('player:throw_item', { gameId, itemId, targetId: playerId })
    }
    onClose()
  }

  const menuContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={onClose} />
          <motion.div
            className="fixed z-40 bg-gradient-to-r from-black/90 to-gray-900/90 backdrop-blur-md rounded-xl border border-gray-500/30 shadow-2xl min-w-[200px]"
            style={{ left: adjustedPosition.x, top: adjustedPosition.y }}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            <div className="px-4 py-3 border-b border-gray-500/30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="font-bold text-sm">{playerName.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h4 className="text-white font-medium">{playerName}</h4>
                  <p className="text-xs text-gray-400">Actions joueur</p>
                </div>
              </div>
            </div>
            <div className="py-2">
              <motion.button
                onClick={handleAddFriend}
                className="w-full px-4 py-2 text-left hover:bg-black/40 transition-colors flex items-center gap-3"
                whileHover={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
              >
                <span className="text-lg">👥</span>
                <span className="text-blue-300 font-medium">Ajouter à mes amis</span>
              </motion.button>
              <motion.button
                onClick={() => setShowItems(!showItems)}
                className="w-full px-4 py-2 text-left hover:bg-black/40 transition-colors flex items-center gap-3"
                whileHover={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
              >
                <span className="text-lg">🍅</span>
                <span className="text-orange-400 font-medium">Lancer un objet</span>
              </motion.button>
              {showItems && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="grid grid-cols-4 gap-2 p-2"
                >
                  {items.map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleThrowItem(item.id)}
                      className="hover:bg-white/10 p-1 rounded"
                    >
                      <img src={item.image} alt={item.name} className="w-10 h-10 object-contain" />
                    </button>
                  ))}
                  {items.length === 0 && <p className="text-white text-sm">Aucun objet</p>}
                </motion.div>
              )}
            </div>
            <div className="px-4 py-2 border-t border-gray-500/30 text-center text-xs text-gray-500">
              {onSwitchToModeratorMenu && (
                <button onClick={onSwitchToModeratorMenu} className="underline">
                  Ouvrir menu modérateur
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  return <>{mounted && createPortal(menuContent, document.body)}</>
}

export default PlayerActionMenu
