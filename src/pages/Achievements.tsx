'use client'
import type React from 'react'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { useAuth } from 'contexts/AuthContext'
import { useUser } from 'contexts/UserContext'
import { Award, Search, Trophy, Users, Target, Star, Lock, CheckCircle, TrendingUp, Zap } from 'lucide-react'
import { Badge } from 'components/UI/Badge'
import { Button } from 'components/UI/Button'
import { Input } from 'components/UI/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'components/UI/Select'
import type { JSX } from 'react/jsx-runtime'

interface AchievementLevel {
  level: number
  levelName: string
  levelNameF: string
  number: number
  percentage: number
}

interface Achievement {
  id: number
  description: string
  type: string
  memory: boolean
  unique: boolean
  internal_name: string
  levels: AchievementLevel[]
}

interface UserAchievement {
  id: number
  level: number
  total: number
}

const AchievementsPage: React.FC = () => {
  const { token } = useAuth()
  const { user } = useUser()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('rarity')
  const [filterBy, setFilterBy] = useState('all')
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [achievementsRes, userAchievementsRes] = await Promise.all([
          axios.get('/api/achievements'),
          axios.get('/api/users/achievements', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        setAchievements(achievementsRes.data)
        setUserAchievements(userAchievementsRes.data.achievements.possessed || [])
      } catch (err) {
        console.error('Failed to fetch achievements', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token])

  // Get user progress for an achievement
  const getUserProgress = (achievementId: number) => {
    return userAchievements.find((ua) => ua.id === achievementId)
  }

  // Check if user has achievement at specific level
  const hasAchievementLevel = (achievementId: number, level: number) => {
    const userAch = getUserProgress(achievementId)
    return userAch && userAch.level >= level
  }

  // Get rarity based on percentage
  const getRarity = (percentage: number) => {
    if (percentage >= 50) return { name: 'Commun', color: 'bg-gray-500', textColor: 'text-gray-300' }
    if (percentage >= 25) return { name: 'Peu commun', color: 'bg-green-500', textColor: 'text-green-300' }
    if (percentage >= 15) return { name: 'Rare', color: 'bg-blue-500', textColor: 'text-blue-300' }
    if (percentage >= 5) return { name: 'Épique', color: 'bg-purple-500', textColor: 'text-purple-300' }
    return { name: 'Légendaire', color: 'bg-yellow-500', textColor: 'text-yellow-300' }
  }

  // Get difficulty based on requirements
  const getDifficulty = (achievement: Achievement) => {
    // Check if it's a memory/souvenir badge
    if (achievement.memory) {
      return { name: 'Impossible', color: 'text-red-900' }
    }

    if (achievement.unique) {
      return { name: 'Exclusif', color: 'text-pink-400' }
    }

    const maxNumber = Math.max(...achievement.levels.map((l) => l.number))
    if (maxNumber <= 10) return { name: 'Facile', color: 'text-green-400' }
    if (maxNumber <= 100) return { name: 'Moyen', color: 'text-yellow-400' }
    if (maxNumber <= 1000) return { name: 'Difficile', color: 'text-orange-400' }
    return { name: 'Extrême', color: 'text-red-400' }
  }

  // Calculate total levels across all achievements
  const getTotalLevels = () => {
    return achievements.reduce((total, achievement) => total + achievement.levels.length, 0)
  }

  // Calculate user's unlocked levels
  const getUserUnlockedLevels = () => {
    return userAchievements.reduce((total, ua) => total + ua.level, 0)
  }

  // Filter and sort achievements
  const filteredAchievements = achievements
    .filter((achievement) => {
      // Search filter
      const matchesSearch =
        achievement.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        achievement.levels.some(
          (level) =>
            level.levelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            level.levelNameF.toLowerCase().includes(searchQuery.toLowerCase()),
        )

      if (!matchesSearch) return false

      // Possession filter
      if (filterBy === 'owned') {
        return getUserProgress(achievement.id)
      }
      if (filterBy === 'unowned') {
        return !getUserProgress(achievement.id)
      }

      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
      case 'owned': {
        const aOwned = getUserProgress(a.id) ? 1 : 0
        const bOwned = getUserProgress(b.id) ? 1 : 0
        return bOwned - aOwned
      }
      case 'percentage': {
        const aMinPercentage = Math.min(...a.levels.map((l) => l.percentage))
        const bMinPercentage = Math.min(...b.levels.map((l) => l.percentage))
        return bMinPercentage - aMinPercentage
      }
      case 'difficulty': {
        const aMaxNumber = Math.max(...a.levels.map((l) => l.number))
        const bMaxNumber = Math.max(...b.levels.map((l) => l.number))
        return bMaxNumber - aMaxNumber
      }
      case 'rarity':
      default: {
        const aRarest = Math.min(...a.levels.map((l) => l.percentage))
        const bRarest = Math.min(...b.levels.map((l) => l.percentage))
        return aRarest - bRarest
      }
      }
    })

  const getAchievementIcon = (achievement: Achievement, level: number): JSX.Element => {
    const userProgress = getUserProgress(achievement.id)
    const isUnlocked = hasAchievementLevel(achievement.id, level)

    return (
      <div className="relative group">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all ${
            isUnlocked
              ? 'bg-gradient-to-br from-blue-900 to-purple-900 group-hover:shadow-blue-500/30'
              : 'bg-gray-800 opacity-50'
          }`}
        >
          {isUnlocked ? (
            <img src={`/assets/images/pictos/${achievement.id}.png`} className="w-10 h-10" alt="Achievement" />
          ) : (
            <Lock className="w-8 h-8 text-gray-500" />
          )}
        </div>
        {!achievement.levels.find((l) => l.level === 1) && level !== 0 && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold shadow-lg z-10">
            {level}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-blue-300 text-lg">Chargement des succès...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mt-24 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-12 h-12 text-yellow-400" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Galerie des Succès
            </h1>
          </div>
          <p className="text-xl text-blue-300 max-w-2xl mx-auto">
            Découvrez tous les succès disponibles et débloquez-les pour prouver votre maîtrise !
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="bg-gradient-to-r from-black/60 to-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-500/30 p-4">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">{getTotalLevels()}</p>
                <p className="text-blue-300 text-sm">Titres totaux</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-black/60 to-green-900/20 backdrop-blur-sm rounded-xl border border-green-500/30 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">{getUserUnlockedLevels()}</p>
                <p className="text-green-300 text-sm">Titres débloqués</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-black/60 to-purple-900/20 backdrop-blur-sm rounded-xl border border-purple-500/30 p-4">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {getTotalLevels() > 0 ? Math.round((getUserUnlockedLevels() / getTotalLevels()) * 100) : 0}%
                </p>
                <p className="text-purple-300 text-sm">Progression</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-black/60 to-yellow-900/20 backdrop-blur-sm rounded-xl border border-yellow-500/30 p-4">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-2xl font-bold text-white">{achievements.length}</p>
                <p className="text-yellow-300 text-sm">Succès uniques</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          className="bg-gradient-to-r from-black/60 to-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Rechercher un succès..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-black/40 border-blue-500/30 text-white placeholder-gray-400"
              />
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-48 bg-black/40 border-blue-500/30 text-white">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-blue-500/30">
                <SelectItem value="rarity">Rareté</SelectItem>
                <SelectItem value="owned">Possession</SelectItem>
                <SelectItem value="percentage">% Communauté</SelectItem>
                <SelectItem value="difficulty">Difficulté</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-full lg:w-48 bg-black/40 border-blue-500/30 text-white">
                <SelectValue placeholder="Filtrer" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-blue-500/30">
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="owned">Possédés</SelectItem>
                <SelectItem value="unowned">Non possédés</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredAchievements.map((achievement, index) => {
              const userProgress = getUserProgress(achievement.id)
              const difficulty = getDifficulty(achievement)
              const rarestLevel = achievement.levels.reduce((rarest, level) =>
                level.percentage < rarest.percentage ? level : rarest,
              )
              /*const rarity = getRarity(rarestLevel.percentage)*/

              const primaryLevel = achievement.levels.find((l) => l.level === 1)
              const rarity = getRarity(primaryLevel?.percentage ?? 0)

              return (
                <motion.div
                  key={achievement.id}
                  className={`bg-gradient-to-r from-black/60 to-blue-900/20 backdrop-blur-sm rounded-xl border transition-all cursor-pointer ${
                    userProgress
                      ? 'border-blue-500/50 hover:border-blue-400/70'
                      : 'border-gray-700/50 hover:border-gray-600/70'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  onClick={() => setSelectedAchievement(achievement)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        {getAchievementIcon(achievement, userProgress?.level || 0)}
                        <div className="flex-1">
                          <h3 className={`text-lg font-bold mb-1 ${userProgress ? 'text-white' : 'text-gray-400'}`}>
                            {achievement.description}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={`${rarity.color} text-xs`}>{rarity.name}</Badge>
                            <Badge variant="outline" className={`${difficulty.color} border-current text-xs`}>
                              {difficulty.name}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress */}
                    {userProgress && !achievement.unique && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-blue-300">Progression</span>
                          <span className="text-sm font-bold text-white">Niveau {userProgress.level}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                            style={{
                              width: `${Math.min((userProgress.level / achievement.levels.length) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Levels Preview */}
                    <div className="space-y-2">
                      {achievement.levels.slice(0, 3).map((level) => {
                        const isUnlocked = hasAchievementLevel(achievement.id, level.level)
                        return (
                          <div
                            key={level.level}
                            className={`flex items-center justify-between p-2 rounded-lg ${
                              isUnlocked ? 'bg-blue-900/30' : 'bg-gray-800/30'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isUnlocked ? (
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              ) : (
                                <Lock className="w-4 h-4 text-gray-500" />
                              )}
                              <span className={`text-sm ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                                {level.levelName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-400">{level.percentage}%</span>
                              </div>
                            </div>
                          </div>
                        )
                      })}

                      {achievement.levels.length > 3 && (
                        <div className="text-center">
                          <span className="text-xs text-gray-400">
                            +{achievement.levels.length - 3} niveaux supplémentaires
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="mt-4 pt-4 border-t border-gray-700/50">
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>
                            {rarestLevel.percentage === 0 ? 'Jamais obtenu' : `Obtenu par ${rarestLevel.percentage}%`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          <span>{achievement.levels.length} niveaux</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredAchievements.length === 0 && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Award className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">Aucun succès trouvé</h3>
            <p className="text-gray-500">Essayez de modifier vos critères de recherche ou de filtrage.</p>
          </motion.div>
        )}

        {/* Achievement Detail Modal */}
        {selectedAchievement && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setSelectedAchievement(null)}
            />
            <motion.div
              className="relative bg-gradient-to-r from-black/80 to-blue-900/40 backdrop-blur-md rounded-xl border border-blue-500/30 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  {getAchievementIcon(selectedAchievement, getUserProgress(selectedAchievement.id)?.level || 0)}
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{selectedAchievement.description}</h2>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`${getRarity(selectedAchievement.levels.find((l) => l.level === 1)?.percentage ?? 0).color}`}
                      >
                        {getRarity(selectedAchievement.levels.find((l) => l.level === 1)?.percentage ?? 0).name}
                      </Badge>
                      <Badge variant="outline" className={`${getDifficulty(selectedAchievement).color} border-current`}>
                        {getDifficulty(selectedAchievement).name}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedAchievement(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-3">Tous les niveaux</h3>
                {selectedAchievement.levels.map((level) => {
                  const isUnlocked = hasAchievementLevel(selectedAchievement.id, level.level)
                  const userProgress = getUserProgress(selectedAchievement.id)

                  return (
                    <div
                      key={level.level}
                      className={`p-4 rounded-lg border ${
                        isUnlocked ? 'bg-blue-900/30 border-blue-500/30' : 'bg-gray-800/30 border-gray-700/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {isUnlocked ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <Lock className="w-5 h-5 text-gray-500" />
                          )}
                          <div>
                            <h4 className={`font-semibold ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                              {level.levelName}
                            </h4>
                            <p className={`text-sm ${isUnlocked ? 'text-blue-300' : 'text-gray-500'}`}>
                              Niveau {level.level}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span
                              className={`font-bold ${
                                level.percentage < 1
                                  ? 'text-yellow-400'
                                  : level.percentage < 5
                                    ? 'text-purple-400'
                                    : level.percentage < 20
                                      ? 'text-blue-400'
                                      : level.percentage < 50
                                        ? 'text-green-400'
                                        : 'text-gray-400'
                              }`}
                            >
                              {level.percentage}%
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">de la communauté</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className={`text-sm ${isUnlocked ? 'text-gray-300' : 'text-gray-500'}`}>
                          Requis: {level.number} {selectedAchievement.description.toLowerCase()}
                        </p>
                        {userProgress && isUnlocked && (
                          <Badge variant="outline" className="text-green-400 border-green-400">
                            Débloqué
                          </Badge>
                        )}
                      </div>

                      {userProgress && userProgress.level >= level.level && (
                        <div className="mt-2 pt-2 border-t border-gray-700/50">
                          <p className="text-xs text-blue-300">
                            Votre progression: {userProgress.total} / {level.number}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default AchievementsPage
