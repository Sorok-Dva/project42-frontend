'use client'
import React, { useState, useEffect } from 'react'
import { useUser } from 'contexts/UserContext'
import { useAuth } from 'contexts/AuthContext'
import { AvatarCreator, type AvatarCreatorConfig, type AvatarExportedEvent } from '@readyplayerme/react-avatar-creator'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, X, Lock, Edit, User, Play, Pause, ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from 'components/UI/Button'
import { Badge } from 'components/UI/Badge'
import { Card, CardContent, CardHeader, CardTitle } from 'components/UI/Card'
import { AvatarCanvas } from 'components/Avatar/Animated'

interface Asset {
  id: string
  name: string
  iconUrl: string
  modelUrl: string
  locked: boolean
}

interface Animation {
  name: string
  path: string
  category: string
  gender: string
}

const editorConfig: AvatarCreatorConfig = {
  clearCache: true,
  bodyType: 'fullbody',
  quickStart: false,
  language: 'fr',
}

// Structure des animations disponibles
const animationCategories = {
  masculine: {
    idle: [
      'F_Standing_Idle_001',
      'F_Standing_Idle_Variations_001',
      'F_Standing_Idle_Variations_002',
      'F_Standing_Idle_Variations_003',
      'F_Standing_Idle_Variations_004',
      'F_Standing_Idle_Variations_005',
      'F_Standing_Idle_Variations_006',
      'F_Standing_Idle_Variations_007',
      'F_Standing_Idle_Variations_008',
      'F_Standing_Idle_Variations_009',
      'M_Standing_Idle_001',
      'M_Standing_Idle_002',
      'M_Standing_Idle_Variations_001',
      'M_Standing_Idle_Variations_002',
      'M_Standing_Idle_Variations_003',
      'M_Standing_Idle_Variations_004',
      'M_Standing_Idle_Variations_005',
      'M_Standing_Idle_Variations_006',
      'M_Standing_Idle_Variations_007',
      'M_Standing_Idle_Variations_008',
      'M_Standing_Idle_Variations_009',
      'M_Standing_Idle_Variations_010',
    ],
    dance: [
      'F_Dances_001',
      'F_Dances_004',
      'F_Dances_005',
      'F_Dances_006',
      'F_Dances_007',
      'M_Dances_001',
      'M_Dances_002',
      'M_Dances_003',
      'M_Dances_004',
      'M_Dances_005',
      'M_Dances_006',
      'M_Dances_007',
      'M_Dances_008',
      'M_Dances_009',
      'M_Dances_011',
    ],
    expression: [
      'F_Talking_Variations_001',
      'F_Talking_Variations_002',
      'F_Talking_Variations_003',
      'F_Talking_Variations_004',
      'F_Talking_Variations_005',
      'F_Talking_Variations_006',
      'M_Standing_Expressions_001',
      'M_Standing_Expressions_002',
      'M_Standing_Expressions_004',
      'M_Standing_Expressions_005',
      'M_Standing_Expressions_006',
      'M_Standing_Expressions_007',
      'M_Standing_Expressions_008',
      'M_Standing_Expressions_009',
      'M_Standing_Expressions_010',
      'M_Standing_Expressions_011',
      'M_Standing_Expressions_012',
      'M_Standing_Expressions_013',
      'M_Standing_Expressions_014',
      'M_Standing_Expressions_015',
      'M_Standing_Expressions_016',
      'M_Standing_Expressions_017',
      'M_Standing_Expressions_018',
      'M_Talking_Variations_001',
      'M_Talking_Variations_002',
      'M_Talking_Variations_003',
      'M_Talking_Variations_004',
      'M_Talking_Variations_005',
      'M_Talking_Variations_006',
      'M_Talking_Variations_007',
      'M_Talking_Variations_008',
      'M_Talking_Variations_009',
      'M_Talking_Variations_010',
    ],
    locomotion: [
      'F_Crouch_Strafe_Left',
      'F_Crouch_Strafe_Right',
      'F_Crouch_Walk_001',
      'F_CrouchedWalk_Backwards_001',
      'F_Falling_Idle_000',
      'F_Falling_Idle_001',
      'F_Jog_001',
      'F_Jog_Backwards_001',
      'F_Jog_Jump_Small_001',
      'F_Jog_Strafe_Left_002',
      'F_Jog_Strafe_Right_002',
      'F_Run_001',
      'F_Run_Backwards_001',
      'F_Run_Jump_001',
      'F_Run_Strafe_Left_001',
      'F_Run_Strafe_Right_001',
      'F_Walk_002',
      'F_Walk_003',
      'F_Walk_Backwards_001',
      'F_Walk_Jump_001',
      'F_Walk_Jump_002',
      'F_Walk_Strafe_Left_001',
      'F_Walk_Strafe_Right_001',
      'M_Crouch_Strafe_Left_002',
      'M_Crouch_Strafe_Right_002',
      'M_Crouch_Walk_003',
      'M_CrouchedWalk_Backwards_002',
      'M_Falling_Idle_002',
      'M_Jog_001',
      'M_Jog_003',
      'M_Jog_Backwards_001',
      'M_Jog_Jump_001',
      'M_Jog_Jump_002',
      'M_Jog_Strafe_Left_001',
      'M_Jog_Strafe_Right_001',
      'M_Run_001',
      'M_Run_Backwards_002',
      'M_Run_Jump_001',
      'M_Run_Jump_002',
      'M_Run_Strafe_Left_002',
      'M_Run_Strafe_Right_002',
      'M_Walk_001',
      'M_Walk_002',
      'M_Walk_Backwards_001',
      'M_Walk_Jump_001',
      'M_Walk_Jump_002',
      'M_Walk_Jump_003',
      'M_Walk_Strafe_Left_002',
      'M_Walk_Strafe_Right_002',
    ],
  },
  feminine: {
    idle: [
      'F_Standing_Idle_001',
      'F_Standing_Idle_Variations_001',
      'F_Standing_Idle_Variations_002',
      'F_Standing_Idle_Variations_003',
      'F_Standing_Idle_Variations_004',
      'F_Standing_Idle_Variations_005',
      'F_Standing_Idle_Variations_006',
      'F_Standing_Idle_Variations_007',
      'F_Standing_Idle_Variations_008',
      'F_Standing_Idle_Variations_009',
      'M_Standing_Idle_001',
      'M_Standing_Idle_002',
      'M_Standing_Idle_Variations_001',
      'M_Standing_Idle_Variations_002',
      'M_Standing_Idle_Variations_003',
      'M_Standing_Idle_Variations_004',
      'M_Standing_Idle_Variations_005',
      'M_Standing_Idle_Variations_006',
      'M_Standing_Idle_Variations_007',
      'M_Standing_Idle_Variations_008',
      'M_Standing_Idle_Variations_009',
      'M_Standing_Idle_Variations_010',
    ],
    dance: [
      'F_Dances_001',
      'F_Dances_004',
      'F_Dances_005',
      'F_Dances_006',
      'F_Dances_007',
      'M_Dances_001',
      'M_Dances_002',
      'M_Dances_003',
      'M_Dances_004',
      'M_Dances_005',
      'M_Dances_006',
      'M_Dances_007',
      'M_Dances_008',
      'M_Dances_009',
      'M_Dances_011',
    ],
    expression: [
      'F_Talking_Variations_001',
      'F_Talking_Variations_002',
      'F_Talking_Variations_003',
      'F_Talking_Variations_004',
      'F_Talking_Variations_005',
      'F_Talking_Variations_006',
      'M_Standing_Expressions_001',
      'M_Standing_Expressions_002',
      'M_Standing_Expressions_004',
      'M_Standing_Expressions_005',
      'M_Standing_Expressions_006',
      'M_Standing_Expressions_007',
      'M_Standing_Expressions_008',
      'M_Standing_Expressions_009',
      'M_Standing_Expressions_010',
      'M_Standing_Expressions_011',
      'M_Standing_Expressions_012',
      'M_Standing_Expressions_013',
      'M_Standing_Expressions_014',
      'M_Standing_Expressions_015',
      'M_Standing_Expressions_016',
      'M_Standing_Expressions_017',
      'M_Standing_Expressions_018',
      'M_Talking_Variations_001',
      'M_Talking_Variations_002',
      'M_Talking_Variations_003',
      'M_Talking_Variations_004',
      'M_Talking_Variations_005',
      'M_Talking_Variations_006',
      'M_Talking_Variations_007',
      'M_Talking_Variations_008',
      'M_Talking_Variations_009',
      'M_Talking_Variations_010',
    ],
    locomotion: [
      'F_Crouch_Strafe_Left',
      'F_Crouch_Strafe_Right',
      'F_Crouch_Walk_001',
      'F_CrouchedWalk_Backwards_001',
      'F_Falling_Idle_000',
      'F_Falling_Idle_001',
      'F_Jog_001',
      'F_Jog_Backwards_001',
      'F_Jog_Jump_Small_001',
      'F_Jog_Strafe_Left_002',
      'F_Jog_Strafe_Right_002',
      'F_Run_001',
      'F_Run_Backwards_001',
      'F_Run_Jump_001',
      'F_Run_Strafe_Left_001',
      'F_Run_Strafe_Right_001',
      'F_Walk_002',
      'F_Walk_003',
      'F_Walk_Backwards_001',
      'F_Walk_Jump_001',
      'F_Walk_Jump_002',
      'F_Walk_Strafe_Left_001',
      'F_Walk_Strafe_Right_001',
      'M_Crouch_Strafe_Left_002',
      'M_Crouch_Strafe_Right_002',
      'M_Crouch_Walk_003',
      'M_CrouchedWalk_Backwards_002',
      'M_Falling_Idle_002',
      'M_Jog_001',
      'M_Jog_003',
      'M_Jog_Backwards_001',
      'M_Jog_Jump_001',
      'M_Jog_Jump_002',
      'M_Jog_Strafe_Left_001',
      'M_Jog_Strafe_Right_001',
      'M_Run_001',
      'M_Run_Backwards_002',
      'M_Run_Jump_001',
      'M_Run_Jump_002',
      'M_Run_Strafe_Left_002',
      'M_Run_Strafe_Right_002',
      'M_Walk_001',
      'M_Walk_002',
      'M_Walk_Backwards_001',
      'M_Walk_Jump_001',
      'M_Walk_Jump_002',
      'M_Walk_Jump_003',
      'M_Walk_Strafe_Left_002',
      'M_Walk_Strafe_Right_002',
    ],
  },
}

export default function AvatarPage() {
  const { user } = useUser()
  const { token } = useAuth()
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarToken, setAvatarToken] = useState('')
  const [assets, setAssets] = useState<Asset[]>([])
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentAnimation, setCurrentAnimation] = useState('feminine/fbx/idle/F_Standing_Idle_Variations_001')
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(true)
  const [selectedGender, setSelectedGender] = useState<'masculine' | 'feminine'>('feminine')
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    idle: true,
    dance: false,
    expression: false,
    locomotion: false,
  })

  // 🔐 Auth Guard : si pas de token, redirige vers /login
  useEffect(() => {
    if (token === null) {
      window.location.href = '/'
    }
    const auth = async () => {
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
    setAvatarUrl(e.data.url)
    setIsEditing(false)
  }

  const handleEditAvatar = () => {
    setIsEditing(true)
  }

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(avatarUrl)
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = avatarUrl
    link.download = 'avatar.glb'
    link.click()
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mon Avatar',
          text: 'Regardez mon avatar !',
          url: avatarUrl,
        })
      } catch (err) {
        console.log('Partage annulé')
      }
    } else {
      handleCopyUrl()
    }
  }

  const handleAnimationChange = (animationPath: string) => {
    setCurrentAnimation(animationPath)
  }

  const toggleAnimation = () => {
    setIsAnimationPlaying(!isAnimationPlaying)
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  const formatAnimationName = (animName: string) => {
    return animName
      .replace(/[FM]_/, '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
    case 'idle':
      return '🧍'
    case 'dance':
      return '💃'
    case 'expression':
      return '😊'
    case 'locomotion':
      return '🏃'
    default:
      return '🎭'
    }
  }

  const unlockedAssets = assets.filter((a) => !a.locked)
  const lockedAssets = assets.filter((a) => a.locked)

  if (avatarToken === '') return null

  // Vue éditeur (pas d'avatar ou en mode édition)
  if (!avatarUrl || isEditing) {
    return (
      <div className="min-h-screen bg-gradient-to-br mt-24 from-gray-900 via-blue-900 to-purple-900 flex flex-col">
        {/* Éditeur plein écran */}
        <div className="flex-1 px-6 pb-6">
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
        {/* Bouton Assets */}
        <motion.div
          className="fixed bottom-6 right-6 z-50"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Button
            onClick={() => setIsPopupOpen(true)}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg transition-all group"
            size="lg"
          >
            <div className="flex flex-col items-center">
              <Package className="w-6 h-6 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium">Assets</span>
            </div>
          </Button>
        </motion.div>
      </div>
    )
  }

  // Vue avatar possédé avec layout côte à côte
  return (
    <div className="min-h-screen bg-gradient-to-br mt-24 from-gray-900 via-blue-900 to-purple-900 flex">
      {/* Section Avatar - 1/3 gauche */}
      <motion.div
        className="w-1/3 h-screen bg-black/20 backdrop-blur-sm border-r border-blue-500/30 flex flex-col"
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
            <div className="flex items-center justify-center gap-3 mb-4 mt-8">
              <User className="w-10 h-10 text-green-400" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                Mon Avatar
              </h1>
            </div>
            <p className="text-xl text-green-300">Avatar créé avec succès !</p>
          </motion.div>

          {/* Contrôles d'animation */}
          { user?.role === 'SuperAdmin' && (
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="bg-black/40 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span className="flex items-center gap-2">🎭 Animations</span>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={toggleAnimation}
                        size="sm"
                        variant="outline"
                        className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 bg-transparent"
                      >
                        {isAnimationPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Sélecteur de genre */}
                  <div className="flex gap-2 mb-4">
                    <Button
                      onClick={() => setSelectedGender('feminine')}
                      size="sm"
                      variant={selectedGender === 'feminine' ? 'default' : 'outline'}
                      className={
                        selectedGender === 'feminine'
                          ? 'bg-pink-600 hover:bg-pink-700'
                          : 'border-pink-500/50 text-pink-400 hover:bg-pink-500/10 bg-transparent'
                      }
                    >
                      👩 Féminin
                    </Button>
                    <Button
                      onClick={() => setSelectedGender('masculine')}
                      size="sm"
                      variant={selectedGender === 'masculine' ? 'default' : 'outline'}
                      className={
                        selectedGender === 'masculine'
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'border-blue-500/50 text-blue-400 hover:bg-blue-500/10 bg-transparent'
                      }
                    >
                      👨 Masculin
                    </Button>
                  </div>

                  {/* Catégories d'animations */}
                  <div className="space-y-3">
                    {Object.entries(animationCategories[selectedGender]).map(([category, animations]) => (
                      <div key={category} className="border border-gray-600/30 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleCategory(category)}
                          className="w-full flex items-center justify-between p-3 bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
                        >
                          <span className="flex items-center gap-2 text-white font-medium">
                            {getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)}
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">{animations.length}</Badge>
                          </span>
                          {expandedCategories[category] ? (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          )}
                        </button>

                        {expandedCategories[category] && (
                          <div className="p-3 bg-gray-900/30">
                            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                              {animations.map((animName) => {
                                const animPath = `${selectedGender}/fbx/${category}/${animName}`
                                const isActive = currentAnimation === animPath
                                return (
                                  <Button
                                    key={animName}
                                    onClick={() => handleAnimationChange(animPath)}
                                    size="sm"
                                    variant={isActive ? 'default' : 'outline'}
                                    className={
                                      isActive
                                        ? 'bg-green-600 hover:bg-green-700 text-xs'
                                        : 'border-gray-500/50 text-gray-300 hover:bg-gray-500/10 text-xs bg-transparent'
                                    }
                                  >
                                    {formatAnimationName(animName)}
                                  </Button>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Animation actuelle */}
                  <div className="mt-4 p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-blue-400 font-medium">Animation actuelle:</div>
                        <div className="text-white">{formatAnimationName(currentAnimation.split('/').pop() || '')}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            isAnimationPlaying ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                          }`}
                        />
                        <span className="text-sm text-gray-400">{isAnimationPlaying ? 'En cours' : 'En pause'}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

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
              Modifier l'Avatar
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
