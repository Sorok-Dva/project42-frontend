'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { RoomData } from 'hooks/useGame'
import { Play, Users, Clock, Settings, Eye } from 'lucide-react'
import axios from 'axios'
import useDropdown from 'hooks/useDropdown'

const Games: React.FC = () => {
  const { toggleOpen } = useDropdown()
  const [topRooms, setTopRooms] = useState<RoomData[]>([])
  const [roomKind, setRoomKind] = useState<'game' | 'archive'>('game')

  useEffect(() => {
    async function retrieveTopRooms() {
      const topRoomResponse = await axios.get('/api/games/rooms/top')
      setTopRooms(Object.values(topRoomResponse.data.rooms))

      if (topRoomResponse.data.rooms.length === 0) {
        const topRoomResponse = await axios.get('/api/games/rooms/archives')
        setTopRooms(Object.values(topRoomResponse.data.rooms))
        setRoomKind('archive')
      }
    }
    retrieveTopRooms()
  }, [])

  return (
    <section className="py-20 px-4 relative">
      {/* Effet de fond */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 to-blue-900/10"></div>

      <div className="max-w-7xl mx-auto relative">
        {/* En-tête */}
        <motion.div
          className="flex items-center justify-between mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Parties{' '}
              <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                en cours
              </span>
            </h2>
            <p className="text-gray-400 text-lg">Rejoignez une partie ou observez les stratégies</p>
          </div>

          <motion.button
            onClick={toggleOpen}
            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 rounded-full text-white font-semibold hover:scale-105 transition-transform"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play className="w-5 h-5" />
            Créer une partie
          </motion.button>
        </motion.div>

        {/* Grille des parties */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topRooms.map((room, index) => (
            <motion.div
              key={room.id}
              className="group bg-black/40 backdrop-blur-sm border border-gray-800/50 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              {/* En-tête de la carte */}
              <div className="relative p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50">
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      roomKind === 'game'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${roomKind === 'game' ? 'bg-green-400' : 'bg-gray-400'}`}
                      ></div>
                      {roomKind === 'game' ? 'En cours' : 'Terminée'}
                    </div>
                  </span>

                  <div className="flex items-center gap-2 text-gray-400">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{room.maxPlayers}</span>
                  </div>
                </div>

                <Link to={`/game/${room.id}`} className="block group-hover:text-purple-400 transition-colors">
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{room.name}</h3>
                </Link>
                <p className="text-gray-400 text-sm">Créé par {room.creator}</p>
              </div>

              {/* Contenu de la carte */}
              <div className="p-6 space-y-4">
                {/* Informations de la partie */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-lg">
                    <Settings className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-300">Options</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-lg">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300">6 min</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-800/50">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{room.maxPlayers} joueurs max</span>
                  </div>

                  <Link
                    to={`/game/${room.id}`}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Observer
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Message si aucune partie */}
        {topRooms.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Aucune partie en cours</h3>
            <p className="text-gray-400 mb-6">Soyez le premier à créer une partie !</p>
            <button
              onClick={toggleOpen}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-white font-semibold hover:scale-105 transition-transform"
            >
              Créer une partie
            </button>
          </motion.div>
        )}
      </div>
    </section>
  )
}

export default Games
