'use client'

import type React from 'react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import useDropdown from 'hooks/useDropdown'
import LoginForm from 'components/Auth/LoginForm'

const Login: React.FC = () => {
  const { open, toggleOpen } = useDropdown()
  const [loginFormOpened, setLoginFormOpened] = useState(false)

  const handleLoginForm = () => {
    setLoginFormOpened(!loginFormOpened)
  }

  const handleClose = () => {
    toggleOpen()
    setLoginFormOpened(false)
  }

  return (
    <div className="relative">
      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleOpen}
        className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          <i className="ti ti-user text-white text-sm"></i>
        </div>
        <span className="text-white font-medium hidden xl:block">Se connecter</span>
      </motion.button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="relative p-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <i className="ti ti-rocket text-white text-lg"></i>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {loginFormOpened ? 'Connexion' : 'Rejoindre Project 42'}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {loginFormOpened ? 'Accédez à votre station' : 'Choisissez votre méthode'}
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleClose}
                    className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                  >
                    <i className="ti ti-x text-white text-sm"></i>
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {loginFormOpened ? (
                    <motion.div
                      key="login-form"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      {/* Back Button */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLoginForm}
                        className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-4"
                      >
                        <i className="ti ti-arrow-left text-sm"></i>
                        <span className="text-sm">Retour</span>
                      </motion.button>

                      {/* Login Form */}
                      <LoginForm toggle={handleClose} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="options"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-4"
                    >
                      {/* Login Option */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLoginForm}
                        className="relative w-full p-4 bg-gradient-to-r from-blue-600/20 to-blue-700/20
             hover:from-blue-600/30 hover:to-blue-700/30 border border-blue-500/30
             rounded-xl transition-all duration-200 group"
                      >
                        {/* Contenu à gauche */}
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center
                    group-hover:bg-blue-500/30 transition-colors">
                            <i className="ti ti-login text-blue-400 text-xl"></i>
                          </div>
                          <div className="text-left">
                            <h4 className="text-white font-semibold">Se connecter</h4>
                            <p className="text-gray-400 text-sm">Accédez à votre compte existant</p>
                          </div>
                        </div>

                        {/* Chevron positionné absolument */}
                        <i
                          className="ti ti-chevron-right absolute right-4 top-1/2 transform -translate-y-1/2
               text-gray-400 group-hover:text-white transition-colors"
                        />
                      </motion.button>

                      {/* Register Option */}
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Link
                          to="/register"
                          onClick={handleClose}
                          className="block w-full p-4 bg-gradient-to-r from-purple-600/20 to-purple-700/20 hover:from-purple-600/30 hover:to-purple-700/30 border border-purple-500/30 rounded-xl transition-all duration-200 group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                                <i className="ti ti-user-plus text-purple-400 text-xl"></i>
                              </div>
                              <div className="text-left">
                                <h4 className="text-white font-semibold">S'inscrire</h4>
                                <p className="text-gray-400 text-sm">Créez votre compte et rejoignez-nous</p>
                              </div>
                            </div>
                            <i className="ti ti-chevron-right text-gray-400 group-hover:text-white transition-colors"></i>
                          </div>
                        </Link>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Login
