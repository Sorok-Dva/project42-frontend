'use client'

import type React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Zap, Heart, CreditCard, Activity, Cpu, Trophy, ArrowRight } from 'lucide-react'

const aboutData = [
  {
    id: 1,
    title: 'Un revival de Loups-Garous en ligne',
    desc: 'Découvrez une adaptation moderne inspirée du célèbre jeu, avec un univers et un thème repensés pour éviter toute violation de droits.',
    icon: <Zap className="w-8 h-8" />,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 2,
    title: 'Développé de façon indépendante',
    desc: 'Ce projet a été entièrement recodé par une seule personne, utilisant les dernières technologies web pour une expérience fluide.',
    icon: <Heart className="w-8 h-8" />,
    color: 'from-pink-500 to-rose-500',
  },
  {
    id: 3,
    title: '21 cartes disponibles',
    desc: 'Le jeu propose déjà 21 cartes variées, avec de nouvelles mécaniques pour renouveler l\'expérience de jeu.',
    icon: <CreditCard className="w-8 h-8" />,
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 4,
    title: 'Une communauté grandissante',
    desc: 'Rejoignez une communauté active et conviviale, prête à accueillir de nouveaux joueurs pour des parties endiablées.',
    icon: <Activity className="w-8 h-8" />,
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 5,
    title: 'Technologies récentes',
    desc: 'Profitez d\'un site et d\'un jeu optimisés grâce à l\'utilisation de frameworks modernes et de bonnes pratiques de développement.',
    icon: <Cpu className="w-8 h-8" />,
    color: 'from-purple-500 to-violet-500',
  },
  {
    id: 6,
    title: 'Des événements réguliers',
    desc: 'Participez à des événements spéciaux et concours organisés fréquemment pour pimenter vos sessions de jeu.',
    icon: <Trophy className="w-8 h-8" />,
    color: 'from-yellow-500 to-amber-500',
  },
]

const About: React.FC = () => {
  return (
    <section className="py-20 px-4 relative">
      {/* Effet de fond */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-blue-900/10"></div>

      <div className="max-w-7xl mx-auto relative">
        {/* En-tête */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            À Propos de{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Project 42
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Plongez dans l'univers mystérieux de la station spatiale et découvrez ce qui rend notre jeu unique
          </p>
        </motion.div>

        {/* Grille des fonctionnalités */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {aboutData.map((item, index) => (
            <motion.div
              key={item.id}
              className="group relative bg-black/40 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-8 hover:border-purple-500/30 transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              {/* Icône avec gradient */}
              <div
                className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${item.color} mb-6 group-hover:scale-110 transition-transform`}
              >
                <div className="text-white">{item.icon}</div>
              </div>

              {/* Contenu */}
              <h3 className="text-xl font-bold text-white mb-4 group-hover:text-purple-400 transition-colors">
                {item.title}
              </h3>
              <p className="text-gray-400 leading-relaxed mb-6">{item.desc}</p>

              {/* Lien */}
              <Link
                to="/register"
                className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-semibold group-hover:gap-3 transition-all"
              >
                Rejoindre la station
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Effet de brillance */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-2xl"></div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default About
