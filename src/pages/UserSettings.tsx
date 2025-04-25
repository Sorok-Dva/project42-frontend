import type React from 'react'
import { motion } from 'framer-motion'
import UserSettings from 'components/Auth/Settings/index'
import { staticStars, parallaxStars } from 'utils/animations'

const UserSettingsPage : React.FC = () => {
  return (
    <div
      className="relative min-h-screen bg-black bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black text-white overflow-hidden">
      {/* Fond étoilé statique */ }
      <div className="absolute inset-0 z-0">{ staticStars }</div>

      {/* Nébuleuses colorées */ }
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 opacity-30"
          style={ {
            background:
              'radial-gradient(circle at 70% 30%, rgba(111, 66, 193, 0.6), transparent 60%), radial-gradient(circle at 30% 70%, rgba(59, 130, 246, 0.6), transparent 60%), radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.3), transparent 70%)',
          } }
        />
      </div>

      {/* Étoiles avec parallaxe */ }
      <div className="absolute inset-0 z-1">{ parallaxStars }</div>

      {/* Bannière de page */ }
      <div
        className="relative z-10 mt-100 w-full bg-gradient-to-r from-blue-900/50 via-purple-900/50 to-blue-900/50 backdrop-blur-sm border-b border-blue-500/30 shadow-lg">
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Paramètres du compte
              </h1>
              <div className="flex items-center text-blue-300 mt-2">
                <a href="/" className="hover:text-white transition-colors">
                  Accueil
                </a>
                <span className="mx-2">/</span>
                <span className="text-white">Paramètres du compte</span>
              </div>
            </div>
            <motion.div
              className="hidden md:block"
              animate={ {
                rotate: [0, 360],
              } }
              transition={ {
                duration: 120,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'linear',
              } }
            >
              <div
                className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-70 blur-sm"></div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Contenu principal */ }
      <section className="relative z-10 py-12">
        <div className="container mx-auto px-4">
          <motion.div
            className="bg-black/60 backdrop-blur-md rounded-2xl border border-blue-500/20 shadow-xl overflow-hidden"
            initial={ { opacity: 0, y: 20 } }
            animate={ { opacity: 1, y: 0 } }
            transition={ { duration: 0.5 } }
          >
            <UserSettings/>
          </motion.div>
        </div>
      </section>

      {/* Planète décorative en bas */ }
      <div
        className="absolute -bottom-32 left-1/2 z-0 h-64 w-full max-w-3xl -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-900 to-purple-900 opacity-20 blur-3xl"></div>
    </div>
  )
}

export default UserSettingsPage

