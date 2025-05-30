'use client'

import type React from 'react'
import { motion } from 'framer-motion'
import { Img as Image } from 'react-image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, EffectCoverflow, Navigation } from 'swiper/modules'
import { ChevronLeft, ChevronRight, Github, Heart, Code } from 'lucide-react'
import sorokDva from 'assets/images/team/42.gif'
import 'swiper/css'
import 'swiper/css/navigation'

const slides = [
  {
    id: 1,
    img: sorokDva,
    nickname: 'Sorok-Dva',
    role: 'Fondateur / Développeur',
    description:
      'Project 42 est le fruit d\'une envie passionnée de voir le jeu LGeL perdurer sur le web, loin des limites d\'une appli mobile aux fonctionnalités restreintes. Développé en solo, ce jeu de rôle vous plonge dans l\'univers énigmatique de la station spatiale Mir, où l\'équipage d\'innocents doit démasquer les aliens infiltrés. Rejoignez-moi dans cette aventure immersive et innovante où chaque décision compte.',
    socialLinks: [
      {
        iconName: 'github',
        url: 'https://github.com/Sorok-Dva',
        icon: <Github className="w-5 h-5" />,
      },
      {
        iconName: 'patreon',
        url: 'https://www.patreon.com/sorokdva',
        icon: <Heart className="w-5 h-5" />,
      },
    ],
  },
]

const TeamMembers: React.FC = () => {
  return (
    <section className="py-20 px-4 relative">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <motion.div
          className="flex items-center justify-between mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              L'équipe de{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Project 42
              </span>
            </h2>
            <p className="text-gray-400 text-lg">Rencontrez les créateurs passionnés derrière le projet</p>
          </div>

          <div className="hidden sm:flex items-center gap-4">
            <button className="team-prev w-12 h-12 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/30 rounded-full flex items-center justify-center text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="team-next w-12 h-12 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/30 rounded-full flex items-center justify-center text-white transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Slider de l'équipe */}
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
            speed={1000}
            effect="coverflow"
            modules={[Autoplay, Navigation, EffectCoverflow]}
            autoplay={{ delay: 4000 }}
            coverflowEffect={{
              rotate: 5,
              stretch: 30,
              depth: 0,
              modifier: 1,
              slideShadows: false,
            }}
            navigation={{
              prevEl: '.team-prev',
              nextEl: '.team-next',
            }}
            breakpoints={{
              1400: { slidesPerView: 1 },
              1024: { slidesPerView: 1 },
              768: { slidesPerView: 1 },
              640: { slidesPerView: 1 },
            }}
            className="pb-4"
          >
            {slides.map((teamMember) => (
              <SwiperSlide key={teamMember.id}>
                <motion.div
                  className="max-w-4xl mx-auto bg-black/40 backdrop-blur-sm border border-gray-800/50 rounded-3xl overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="grid lg:grid-cols-2 gap-8 p-8">
                    {/* Image et informations de base */}
                    <div className="text-center lg:text-left">
                      <div className="relative inline-block mb-6">
                        <div className="absolute -top-4 -right-4 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-white text-sm font-semibold">
                          <Code className="w-4 h-4" />
                          {teamMember.role}
                        </div>
                        <Image
                          className="w-48 h-48 rounded-2xl object-cover border-4 border-purple-500/30 mx-auto lg:mx-0"
                          src={teamMember.img || '/placeholder.svg'}
                          alt="team member"
                        />
                      </div>

                      <h3 className="text-3xl font-bold text-white mb-4">{teamMember.nickname}</h3>

                      {/* Liens sociaux */}
                      <div className="flex items-center justify-center lg:justify-start gap-4">
                        {teamMember.socialLinks.map((link, index) => (
                          <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center w-12 h-12 bg-gray-800/50 hover:bg-purple-600/50 border border-gray-600/30 hover:border-purple-500/50 rounded-full text-gray-400 hover:text-white transition-all"
                          >
                            {link.icon}
                          </a>
                        ))}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="flex items-center">
                      <div>
                        <h4 className="text-xl font-semibold text-white mb-4">À propos du projet</h4>
                        <p className="text-gray-300 leading-relaxed text-lg">{teamMember.description}</p>
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

export default TeamMembers
