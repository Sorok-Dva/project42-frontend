'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import { Info } from 'lucide-react'
import axios from 'axios'
import 'swiper/css'
import 'swiper/css/pagination'

interface Card { id: number; name: string; description: string }

const CardItem: React.FC<{ card: Card }> = ({ card }) => {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      className="relative rounded-2xl overflow-hidden border-2 border-gray-800/50 transition-all duration-300 hover:border-orange-500/30"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className="relative inline-block w-full">
        <img
          src={`/assets/images/carte${card.id}.png`}
          alt={card.name}
          className="block w-full h-auto transition-transform duration-500"
          style={{ transform: hovered ? 'scale(1.05)' : 'scale(1)' }}
        />

        {hovered && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 bg-black/80">
            <Info className="w-8 h-8 text-orange-400 mb-3" />
            <h4 className="text-white font-semibold mb-2 text-center">{card.name}</h4>
            <p className="text-gray-300 text-sm leading-relaxed text-center">
              {card.description}
            </p>
          </div>
        )}
      </div>

      <div className="p-4 bg-gradient-to-t from-black/80 to-transparent">
        <h3 className="text-lg font-bold text-white text-center transition-colors hover:text-orange-400">
          {card.name}
        </h3>
      </div>
    </motion.div>
  )
}

const Cards: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([])

  useEffect(() => {
    axios
      .get('/api/games/cards')
      .then(res => setCards(res.data.cards))
      .catch(err => console.error('Erreur récupération cartes :', err))
  }, [])

  return (
    <section className="py-20 px-4">
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
              Cartes du{' '}
              <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                jeu
              </span>
            </h2>
            <p className="text-gray-400 text-lg">Découvrez les 21 cartes uniques et leurs pouvoirs</p>
          </div>
        </motion.div>

        {/* Slider */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Swiper
            slidesPerView={1}
            loop
            spaceBetween={24}
            speed={1000}
            modules={[Autoplay, Pagination]}
            autoplay={{ delay: 3000 }}
            pagination={{ el: '.cards-pagination', clickable: true }}
            breakpoints={{
              1200: { slidesPerView: 4 },
              992: { slidesPerView: 3 },
              575: { slidesPerView: 2 },
            }}
            className="pb-12"
          >
            {cards.map((card, idx) => (
              <SwiperSlide key={card.id}>
                <CardItem card={card} />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Pagination */}
          <div className="flex justify-center">
            <div className="cards-pagination" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Cards
