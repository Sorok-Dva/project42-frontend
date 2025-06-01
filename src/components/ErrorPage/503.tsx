import React, { useState, useEffect, useRef, useCallback } from 'react'
import { FaDiscord, FaRotateRight, FaWifi, FaTriangleExclamation } from 'react-icons/fa6'
import { motion, AnimatePresence } from 'framer-motion'

const CustomErrorContent: React.FC = () => {
  const [isReconnecting, setIsReconnecting] = useState(false)
  const [reconnectAttempt, setReconnectAttempt] = useState(0)
  const [reconnectProgress, setReconnectProgress] = useState(0)
  const [nextAttemptTime, setNextAttemptTime] = useState<number | null>(null)
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('offline')
  const [lastChecked, setLastChecked] = useState<Date>(new Date())

  const maxReconnectAttempts = 12
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null)
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 1) fonction qui vérifie si le serveur est en ligne
  const checkServerStatus = useCallback(async () => {
    try {
      setServerStatus('checking')
      const response = await fetch('/api/users/me', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      })
      setLastChecked(new Date())

      if (response.status !== 500 && response.status !== 503) {
        setServerStatus('online')
        // si le serveur redevient dispo, on se redirige au bout de 2s
        setTimeout(() => {
          window.location.reload()
        }, 2000)
        return true
      } else {
        setServerStatus('offline')
        return false
      }
    } catch (err) {
      console.error('Erreur lors de la vérification du serveur :', err)
      setServerStatus('offline')
      setLastChecked(new Date())
      return false
    }
  }, [])

  // 2) fonction pour lancer la première tentative
  const startReconnect = useCallback(() => {
    if (isReconnecting) return
    setIsReconnecting(true)
    setReconnectAttempt(1)
  }, [isReconnecting])

  // 3) fonction pour stopper la boucle
  const stopReconnect = useCallback(() => {
    setIsReconnecting(false)
    setReconnectProgress(0)
    setNextAttemptTime(null)

    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current)
      progressTimerRef.current = null
    }
  }, [])

  // 4) useEffect : à chaque fois que reconnectAttempt change, on planifie la vérification
  useEffect(() => {
    // si on n'est pas en mode "reconnexion", on ne fait rien
    if (!isReconnecting) return

    // si on a dépassé le nombre max, on arrête
    if (reconnectAttempt > maxReconnectAttempts) {
      stopReconnect()
      return
    }

    // calcul exponentiel du délai (1s, 2s, 4s, 8s, 10s max)
    const delay = Math.min(Math.pow(2, reconnectAttempt - 1) * 1000, 10000)
    const nextTime = Date.now() + delay
    setNextAttemptTime(nextTime)

    // 4.1) on initialise la barre de progression
    setReconnectProgress(0)
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current)
    }
    progressTimerRef.current = setInterval(() => {
      const now = Date.now()
      const elapsed = now - (nextTime - delay)
      const progress = Math.min((elapsed / delay) * 100, 100)
      setReconnectProgress(progress)
      if (progress >= 100 && progressTimerRef.current) {
        clearInterval(progressTimerRef.current)
      }
    }, 100)

    // 4.2) on planifie le timeout pour la prochaine tentative
    reconnectTimerRef.current = setTimeout(async () => {
      const isOnline = await checkServerStatus()
      if (isOnline) {
        stopReconnect()
      } else {
        // si le serveur est encore down, on passe à l'étape suivante
        setReconnectAttempt(prev => prev + 1)
      }
    }, delay)

    // cleanup si reconnectAttempt change avant la fin du timeout
    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current)
        reconnectTimerRef.current = null
      }
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current)
        progressTimerRef.current = null
      }
    }
  }, [reconnectAttempt, isReconnecting, checkServerStatus, stopReconnect])

  // 5) démarrer automatiquement au montage
  useEffect(() => {
    startReconnect()
    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
      if (progressTimerRef.current) clearInterval(progressTimerRef.current)
    }
  }, [startReconnect])

  // 6) handlers manuels
  const handleManualReload = () => {
    window.location.reload()
  }
  const handleManualReconnect = () => {
    stopReconnect()
    startReconnect()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden mt-20">
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Card d’erreur */}
            <div className="bg-black/40 backdrop-blur-lg rounded-2xl border border-red-500/30 p-8 md:p-12 mb-8 shadow-2xl shadow-red-500/10">
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className="text-red-400 text-6xl md:text-7xl mb-6 flex justify-center"
              >
                <FaTriangleExclamation />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent"
              >
                Service Temporairement Indisponible
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto leading-relaxed"
              >
                Nous sommes désolés, mais le serveur est actuellement indisponible. Notre système tente de rétablir la connexion automatiquement.
              </motion.p>

              {/* GIF animé */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="relative mb-4"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl" />
                <img
                  src="https://i.pinimg.com/originals/7e/1a/1e/7e1a1e67b467b09d48ae7d2dd40fca1a.gif"
                  alt="Service Unavailable Animation"
                  className="relative w-full max-w-md mx-auto rounded-2xl border border-blue-500/30 shadow-2xl shadow-blue-500/20"
                />
              </motion.div>

              {/* Indicateur de statut */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-center gap-3 mb-6 p-4 bg-black/30 rounded-xl border border-gray-700/50"
              >
                <div
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    serverStatus === 'checking'
                      ? 'bg-yellow-400 animate-pulse shadow-lg shadow-yellow-400/50'
                      : serverStatus === 'online'
                        ? 'bg-green-400 shadow-lg shadow-green-400/50'
                        : 'bg-red-400 animate-pulse shadow-lg shadow-red-400/50'
                  }`}
                />
                <span
                  className={`text-base font-medium transition-colors duration-300 ${
                    serverStatus === 'checking'
                      ? 'text-yellow-400'
                      : serverStatus === 'online'
                        ? 'text-green-400'
                        : 'text-red-400'
                  }`}
                >
                  {serverStatus === 'checking'
                    ? 'Vérification en cours...'
                    : serverStatus === 'online'
                      ? '✅ Connexion rétablie! Redirection...'
                      : '❌ Serveur hors ligne'}
                </span>
              </motion.div>

              {/* Dernière vérification */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-gray-400 mb-6"
              >
                Dernière vérification : {lastChecked.toLocaleTimeString('fr-FR')}
              </motion.p>

              { serverStatus !== 'online' && (
                <>
                  {/* Barre de progression & tentative en cours */}
                  <AnimatePresence>
                    {isReconnecting && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mb-8 p-6 bg-blue-500/10 rounded-xl border border-blue-500/30"
                      >
                        <div className="flex justify-between text-sm text-gray-300 mb-3">
                          <span className="font-medium">
                        🔄 Tentative {reconnectAttempt}/{maxReconnectAttempts}
                          </span>
                          {nextAttemptTime && (
                            <span className="text-blue-400">
                          ⏱️ Prochaine dans {Math.max(0, Math.ceil((nextAttemptTime - Date.now()) / 1000))} s
                            </span>
                          )}
                        </div>
                        <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full shadow-lg shadow-blue-500/30"
                            initial={{ width: '0%' }}
                            animate={{ width: `${reconnectProgress}%` }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Boutons d'action */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col sm:flex-row justify-center gap-4"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                      onClick={handleManualReload}
                    >
                      <FaRotateRight className="text-lg" />
                      Actualiser la page
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-lg shadow-green-500/25 hover:shadow-green-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleManualReconnect}
                      disabled={isReconnecting && reconnectAttempt < maxReconnectAttempts}
                    >
                      <FaWifi className="text-lg" />
                      Tenter la reconnexion
                    </motion.button>

                    <motion.a
                      href="https://discord.gg/FBsg7hKK7j"
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
                    >
                      <FaDiscord className="text-lg" />
                      Rejoindre Discord
                    </motion.a>
                  </motion.div>
                </>
              )}

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-8 text-center text-gray-400 text-sm"
              >
                <p>💫 Project 42 – Station Mir temporairement inaccessible</p>
                <p className="mt-1">Merci de votre patience pendant que nous rétablissons les communications.</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default CustomErrorContent
