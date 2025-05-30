'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Img as Image } from 'react-image'
import Tilt from 'react-parallax-tilt'
import useDropdown from 'hooks/useDropdown'
import axios from 'axios'
import { Rocket, Users, Trophy, Zap } from 'lucide-react'

interface User {
  id: number
  nickname: string
  isMale: boolean
  role: string
  roleId: number
  isAdmin: boolean
  level: number
  avatar: string
  points: string
}

const Hero: React.FC = () => {
  const { toggleOpen } = useDropdown()
  const [connectedUsers, setConnectedUsers] = useState<User[]>([])
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([])

  useEffect(() => {
    async function retrieveServerData() {
      const connectedResponse = await axios.get('/api/users/connected')
      const registeredResponse = await axios.get('/api/users/lastRegisteredUsers')
      setConnectedUsers(Object.values(connectedResponse.data.users))
      setRegisteredUsers(Object.values(registeredResponse.data.users))
    }
    retrieveServerData()
  }, [])

  return (
    <section className="relative pt-32 pb-20 px-4">
      {/* Grille de fond */}
      <div className="absolute inset-0 opacity-20">
        <div className="grid grid-cols-12 h-full">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="border-r border-blue-500/20"></div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Contenu principal */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Tags animés */}
            <motion.div
              className="flex flex-wrap gap-4 text-sm font-semibold"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {['Jouer', 'Débattre', 'Gagner'].map((tag, index) => (
                <motion.span
                  key={tag}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-full text-purple-300"
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  {tag}
                </motion.span>
              ))}
            </motion.div>

            {/* Titre principal */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <h1 className="text-6xl lg:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  Project 42
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Plongez dans l'univers mystérieux de la station spatiale Mir. Démasquez les aliens infiltrés dans ce jeu
                de rôle immersif inspiré des Loups-Garous.
              </p>
            </motion.div>

            {/* Bouton CTA */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <button
                onClick={toggleOpen}
                className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-white font-semibold text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
              >
                <span className="relative z-10 flex items-center gap-3">
                  <Rocket className="w-5 h-5" />
                  Jouer maintenant
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </motion.div>

            {/* Statistiques */}
            <motion.div
              className="grid grid-cols-3 gap-6 pt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-600/20 rounded-full mb-2 mx-auto">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-white">{connectedUsers.length}</div>
                <div className="text-sm text-gray-400">Joueurs actifs</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-600/20 rounded-full mb-2 mx-auto">
                  <Trophy className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white">21</div>
                <div className="text-sm text-gray-400">Cartes uniques</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-pink-600/20 rounded-full mb-2 mx-auto">
                  <Zap className="w-6 h-6 text-pink-400" />
                </div>
                <div className="text-2xl font-bold text-white">∞</div>
                <div className="text-sm text-gray-400">Parties possibles</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Panneau latéral */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Derniers inscrits */}
            <Tilt className="bg-black/40 backdrop-blur-md border border-gray-800/50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <h3 className="text-xl font-semibold text-white">Derniers joueurs inscrits</h3>
              </div>
              <div className="space-y-4">
                {registeredUsers.slice(0, 4).map((user) => (
                  <motion.div
                    key={user.id}
                    className="flex items-center gap-4 p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="relative">
                      <Image
                        className="w-12 h-12 rounded-full object-cover border-2 border-purple-500/30"
                        src={user.avatar || '/placeholder.svg'}
                        alt="profile"
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black"></div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{user.nickname}</h4>
                      <p className="text-sm text-gray-400">
                        Niveau {user.level} • {user.points} points
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Tilt>

            {/* Joueurs connectés */}
            <motion.div
              className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-500/20 rounded-2xl p-6"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-white font-semibold">Joueurs en ligne</span>
                <span className="text-2xl font-bold text-purple-400">{connectedUsers.length}</span>
              </div>
              <div className="flex items-center -space-x-2">
                {connectedUsers.slice(0, 8).map((user) => (
                  <Image
                    key={user.id}
                    src={user.avatar || '/placeholder.svg'}
                    alt={user.nickname}
                    className="w-10 h-10 rounded-full border-2 border-purple-500 object-cover"
                  />
                ))}
                {connectedUsers.length > 8 && (
                  <div className="w-10 h-10 rounded-full bg-purple-600 border-2 border-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                    +{connectedUsers.length - 8}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Hero
