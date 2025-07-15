'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Img as Image } from 'react-image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation } from 'swiper/modules'
import { ChevronLeft, ChevronRight, Crown, Star, Users } from 'lucide-react'
import axios from 'axios'
import type { UserProfile } from 'components/ProfileModal'
import 'swiper/css'
import 'swiper/css/navigation'

const TopPlayer: React.FC = () => {
  const [topPlayers, setTopPlayers] = useState<UserProfile[]>([])

  useEffect(() => {
    async function retrieveTopPlayers() {
      const response = await axios.get('/api/users/leaderboard?limit=5')
      setTopPlayers(response.data.players)
    }
    retrieveTopPlayers()
  }, [])

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="w-6 h-6 text-yellow-400" />
    if (index === 1) return <Crown className="w-6 h-6 text-gray-300" />
    if (index === 2) return <Crown className="w-6 h-6 text-amber-600" />
    return <Star className="w-5 h-5 text-blue-400" />
  }

  const getRankBorder = (index: number) => {
    if (index === 0) return 'border-yellow-400/50 bg-gradient-to-br from-yellow-400/10 to-yellow-600/5'
    if (index === 1) return 'border-gray-300/50 bg-gradient-to-br from-gray-300/10 to-gray-500/5'
    if (index === 2) return 'border-amber-600/50 bg-gradient-to-br from-amber-600/10 to-amber-800/5'
    return 'border-blue-400/30 bg-gradient-to-br from-blue-400/10 to-blue-600/5'
  }

  return (
    <section className="py-20 px-4 relative">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <motion.div
          className="flex items-center justify-between mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Top Players
              </span>
            </h2>
            <p className="text-gray-400 text-lg">Les meilleurs joueurs de la station</p>
          </div>

          <div className="hidden sm:flex items-center gap-4">
            <button className="top-player-prev w-12 h-12 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/30 rounded-full flex items-center justify-center text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="top-player-next w-12 h-12 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/30 rounded-full flex items-center justify-center text-white transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Slider des joueurs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Swiper
            slidesPerView="auto"
            loop={true}
            centeredSlides={true}
            spaceBetween={24}
            speed={1000}
            modules={[Autoplay, Navigation]}
            autoplay={{ delay: 3000 }}
            navigation={{
              prevEl: '.top-player-prev',
              nextEl: '.top-player-next',
            }}
            breakpoints={{
              1024: { slidesPerView: 3 },
              768: { slidesPerView: 2 },
              640: { slidesPerView: 1 },
            }}
            className="pb-4"
          >
            {topPlayers.map((user, index) => (
              <SwiperSlide key={user.id}>
                <motion.div
                  className={`relative p-6 rounded-2xl border-2 backdrop-blur-sm ${getRankBorder(index)} hover:scale-105 transition-all duration-300`}
                  whileHover={{ y: -5 }}
                >
                  {/* Badge de rang */}
                  <div className="absolute -top-3 left-6 flex items-center gap-2 px-4 py-2 bg-black/80 rounded-full border border-gray-600/30">
                    {getRankIcon(index)}
                    <span className="text-white font-bold">#{index + 1}</span>
                  </div>

                  {/* Informations du joueur */}
                  <div className="pt-4">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative">
                        <Image
                          className="w-16 h-16 rounded-full object-cover border-3 border-white/20"
                          src={user.avatar || '/placeholder.svg'}
                          alt="player"
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-black"></div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">{user.nickname}</h3>
                        <p className="text-gray-400 text-sm">{user.title || 'Joueur'}</p>
                      </div>
                    </div>

                    {/* Statistiques */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black/30 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-white mb-1">{user.points}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wide">Points</div>
                      </div>
                      <div className="bg-black/30 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-white mb-1 flex items-center justify-center gap-1">
                          <Users className="w-4 h-4" />
                          {user.guild?.name ? user.guild.name.slice(0, 8) : 'Aucune'}
                        </div>
                        <div className="text-xs text-gray-400 uppercase tracking-wide">Guilde</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      </div>
    </section>
  )
}

export default TopPlayer
