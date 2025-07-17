'use client'

import React, { useState, useEffect } from 'react'
import { useUser } from 'contexts/UserContext'
import { useAuth } from 'contexts/AuthContext'
import {
  AvatarCreator,
  type AvatarCreatorConfig,
  type AvatarExportedEvent,
} from '@readyplayerme/react-avatar-creator'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package,
  X,
  Lock,
  Edit,
  User,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { Button } from 'components/UI/Button'
import { Badge } from 'components/UI/Badge'
import { AvatarCanvas } from 'components/Avatar/Animated'

interface Asset {
  id: string
  name: string
  iconUrl: string
  modelUrl: string
  locked: boolean
}

const editorConfig: AvatarCreatorConfig = {
  clearCache: true,
  bodyType: 'fullbody',
  quickStart: false,
  language: 'fr',
}

export default function AvatarPage() {
  const { user, setUser } = useUser()
  const { token } = useAuth()
  const [avatarUrl, setAvatarUrl] = useState(user?.rpmAvatarId ? `https://models.readyplayer.me/${user.rpmAvatarId}` : '')
  const [avatarToken, setAvatarToken] = useState('')
  const [assets, setAssets] = useState<Asset[]>([])
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [switchEditor, setSwitchEditor] = useState(false)
  const [avatarEdited, setAvatarEdited] = useState(false)
  const [currentAnimation, setCurrentAnimation] = useState('feminine/fbx/idle/F_Standing_Idle_Variations_001')
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(true)
  const [isAvatarExpanded, setIsAvatarExpanded] = useState(false)

  // 🔐 Auth Guard : si pas de token, redirige vers /login
  useEffect(() => {
    if (token === null) {
      window.location.href = '/'
    }
    const auth = async () => {
      if (avatarToken !== '' && switchEditor) return
      const res = await axios.get('/api/avatar/auth', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      })
      setAvatarToken(res.data.data.token)
    }
    auth()
  }, [token, isEditing])

  useEffect(() => {
    if (!user?.id || !token) return
    const fetchAssets = async () => {
      try {
        const res = await axios.get('/api/avatar/fetch/assets', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        })
        setAssets(res.data.data)
      } catch (err) {
        console.error('Impossible de charger les assets RPM :', err)
      }
    }
    fetchAssets()
  }, [user?.id, token])

  const onAvatarExported = (e: AvatarExportedEvent) => {
    if (!user) return
    axios.post(`/api/avatar/save/${e.data.url.split('https://models.readyplayer.me/')[1]}`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    setAvatarUrl(e.data.url)
    setIsEditing(false)
    setSwitchEditor(false)
    setAvatarEdited(true)

    user.rpmAvatarId = e.data.url.split('https://models.readyplayer.me/')[1]
    setUser(user)
  }

  const handleEditAvatar = () => {
    setIsEditing(true)
    setSwitchEditor(true)
  }

  const handleAnimationChange = (animationPath: string) => {
    setCurrentAnimation(animationPath)
  }

  const toggleAnimation = () => {
    setIsAnimationPlaying(!isAnimationPlaying)
  }

  const toggleAvatarExpansion = () => {
    setIsAvatarExpanded(!isAvatarExpanded)
  }

  const unlockedAssets = assets.filter((a) => !a.locked)
  const lockedAssets = assets.filter((a) => a.locked)

  if (avatarToken === '') return null

  // Vue éditeur (pas d'avatar ou en mode édition)
  if (!avatarUrl || isEditing) {
    return (
      <>
        {/* Éditeur plein écran */}
        <div className="flex-1 px-6">
          <motion.div
            className="h-full bg-black/20 backdrop-blur-sm rounded-xl border border-blue-500/30 overflow-hidden shadow-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <AvatarCreator
              subdomain="project-42-pf686s"
              config={{
                ...editorConfig,
                token: avatarToken,
              }}
              style={{
                width: '100%',
                height: 'calc(100vh - 80px)',
                border: 'none',
                borderRadius: '12px',
              }}
              onAvatarExported={onAvatarExported}
            />
          </motion.div>
        </div>
      </>
    )
  }

  // Vue avatar possédé
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex relative">
      {/* Vue avatar expandé plein écran */}
      <AnimatePresence>
        {isAvatarExpanded && (
          <motion.div
            className="fixed inset-0 z-40 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-full h-full">
              <div className="w-full h-full bg-gray-900/30 rounded-lg border border-gray-600/30">
                <AvatarCanvas avatarUrl={avatarUrl} animation={currentAnimation} />
              </div>
            </div>

            {/* Bouton pour revenir */}
            <Button
              onClick={toggleAvatarExpansion}
              className="fixed top-32 right-6 z-50 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 border border-blue-500/30 backdrop-blur-sm"
              size="sm"
            >
              <Minimize2 className="w-5 h-5 text-white" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layout normal côte à côte */}
      {!isAvatarExpanded && (
        <>
          {/* Section Avatar - 1/3 gauche */}
          <motion.div
            className="w-1/3 h-screen bg-black/20 backdrop-blur-sm border-r border-blue-500/30 flex flex-col relative"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Avatar 3D */}
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="w-full h-full bg-gray-900/30 rounded-lg border border-gray-600/30">
                <AvatarCanvas avatarUrl={avatarUrl} animation={currentAnimation} />
              </div>
            </div>

            {/* Bouton d'expansion */}
            <Button
              onClick={toggleAvatarExpansion}
              className="absolute top-1/2 -right-4 transform -translate-y-1/2 z-30 w-8 h-16 rounded-r-lg bg-black/50 hover:bg-black/70 border border-l-0 border-blue-500/30 backdrop-blur-sm transition-all group"
              size="sm"
            >
              <Maximize2 className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
            </Button>
          </motion.div>

          {/* Section Informations et Animations - 2/3 droite */}
          <div className="w-2/3 h-screen overflow-y-auto">
            <div className="p-8 max-w-4xl mx-auto">
              {/* Header */}
              <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex items-center justify-center gap-3 mb-4 mt-24">
                  <User className="w-10 h-10 text-green-400" />
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                    Mon Avatar
                  </h1>
                </div>
                {avatarEdited && (
                  <p className="text-xl text-green-300">Avatar { !user?.rpmAvatarId ? 'créé' : 'modifié'} avec succès !</p>
                )}
              </motion.div>

              {/* Action principale */}
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Button
                  onClick={handleEditAvatar}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 text-xl font-semibold h-16"
                >
                  <Edit className="w-6 h-6 mr-3" />
                  Modifier mon avatar
                </Button>
              </motion.div>

              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
              >
                {/* Bouton Assets */}
                <Button
                  onClick={() => setIsPopupOpen(true)}
                  variant="outline"
                  className="w-full border-blue-500/50 text-blue-400 hover:bg-blue-500/10 py-4 bg-transparent"
                >
                  <Package className="w-5 h-5 mr-2" />
                  Gérer mes Assets ({assets.length})
                </Button>
              </motion.div>
            </div>
          </div>
        </>
      )}

      {/* Modal Assets */}
      <AnimatePresence>
        {isPopupOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsPopupOpen(false)} />
            <motion.div
              className="relative bg-gray-900/95 backdrop-blur-md rounded-xl border border-blue-500/30 p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <Package className="w-6 h-6 text-blue-400" />
                  <h2 className="text-2xl font-bold text-white">Mes Assets</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPopupOpen(false)}
                  className="text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-full w-8 h-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Liste d'assets */}
              <div className="overflow-y-auto max-h-96">
                {unlockedAssets.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <h3 className="text-lg font-semibold text-green-400">Assets disponibles</h3>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        {unlockedAssets.length}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                      {unlockedAssets.map((a) => (
                        <div
                          key={a.id}
                          className="flex flex-col items-center p-3 bg-green-900/20 rounded-lg border border-green-500/30 hover:bg-green-900/30 transition-colors"
                        >
                          <img
                            src={a.iconUrl || '/placeholder.svg'}
                            alt={a.name}
                            className="w-12 h-12 mb-2 rounded-md object-cover"
                          />
                          <span className="text-xs text-gray-300 text-center leading-tight">{a.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {lockedAssets.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <h3 className="text-lg font-semibold text-red-400">Assets verrouillés</h3>
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">{lockedAssets.length}</Badge>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                      {lockedAssets.map((a) => (
                        <div
                          key={a.id}
                          className="relative flex flex-col items-center p-3 bg-red-900/20 rounded-lg border border-red-500/30 opacity-75"
                        >
                          <div className="relative">
                            <img
                              src={a.iconUrl || '/placeholder.svg'}
                              alt={a.name}
                              className="w-12 h-12 mb-2 rounded-md object-cover grayscale"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Lock className="w-4 h-4 text-red-400" />
                            </div>
                          </div>
                          <span className="text-xs text-gray-500 text-center leading-tight">{a.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {assets.length === 0 && (
                  <div className="text-center py-8">
                    <Package className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">Aucun asset disponible</h3>
                    <p className="text-gray-500">Les assets se chargeront automatiquement une fois disponibles.</p>
                  </div>
                )}
              </div>
              {/* Footer stats */}
              {assets.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-700/50 text-sm text-gray-400 flex justify-between">
                  <span>Total : {assets.length}</span>
                  <span>Progression : {Math.round((unlockedAssets.length / assets.length) * 100)}%</span>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
