import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { useAuth } from 'contexts/AuthContext'
import { toast } from 'react-toastify'
import { ToastDefaultOptions } from 'utils/toastOptions'
import { useUser } from 'contexts/UserContext'
import { Award, Info } from 'lucide-react'
import { Tooltip } from 'react-tooltip'

interface Badge {
  id: number
  unique: boolean
  level: number
  total: number
  nextLevelTo?: number
  description: string
  title: { [key: number]: string }
}

export interface BadgesData {
  possessed: Badge[]
  favorites: { [key: number] : Badge } // clés de 1 à 6
}

const Badges : React.FC = () => {
  const { token } = useAuth()
  const { user, setUser } = useUser()
  const [achievements, setAchievements] = useState<BadgesData>({
    possessed: [],
    favorites: [],
  })
  const [showPopup, setShowPopup] = useState(false)
  const [selectedSocket, setSelectedSocket] = useState<number | null>(null)
  const [favorites, setFavorites] = useState<{
    [slot: number] : Badge | null
  }>(() => {
    const initial: { [slot : number]: Badge | null } = {}
    for (let slot = 1; slot <= 6; slot++) {
      initial[slot] = achievements.favorites[slot] ?? null
    }
    return initial
  })
  const [currentTitle, setCurrentTitle] = useState<string>(user?.title || 'Tu n\'as pas encore sélectionné de titre')

  useEffect(() => {
    async function retrieveMyAchievements() {
      try {
        const { data } = await axios.get('/api/users/achievements', {
          headers: {
            Authorization: `Bearer ${ token }`,
          },
        })
        setAchievements(data.achievements)
        setCurrentTitle(data.playerTitle === '' ? 'Tu n\'as pas encore sélectionné de titre': data.playerTitle)
      } catch (err) {
        console.error('Failed to fetch achievements', err)
      }
    }

    retrieveMyAchievements()
  }, [])

  useEffect(() => {
    const newFavorites : { [slot : number] : Badge | null } = {}
    for (let slot = 1; slot <= 6; slot++) {
      newFavorites[slot] = achievements.favorites[slot] ?? null
    }
    setFavorites(newFavorites)
  }, [achievements])

  const popupRef = useRef<HTMLDivElement>(null)

  const favoritesIds = Object.values(favorites)
    .filter((b) : b is Badge => b !== null)
    .map((badge) => badge.id)

  const openAchievementPanel = (slot : number) => {
    setSelectedSocket(slot)
    setShowPopup(true)
  }

  const hideAchievementPanel = () => {
    setSelectedSocket(null)
    setShowPopup(false)
  }

  const handleBadgePopupClick = (badge : Badge) => {
    if (favoritesIds.includes(badge.id)) return

    if (selectedSocket !== null) {
      setFavorites((prev) => ({
        ...prev,
        [selectedSocket]: badge,
      }))
    }
    hideAchievementPanel()
  }

  const removeBadgeFromSocket = (slot : number) => {
    setFavorites((prev) => ({
      ...prev,
      [slot]: null,
    }))
  }

  const saveAchievements = async () => {
    const favoritesToSave = Array.from({ length: 6 }, (_, i) => favorites[i + 1]?.id || 0)
    try {
      const { data } = await axios.post(
        '/api/users/actions/setFavBadges',
        { favorites: favoritesToSave },
        {
          headers: {
            Authorization: `Bearer ${ token }`,
          },
        },
      )
      if (data.message) {
        toast.success('Tes badges préférés ont été modifiés avec succès.', ToastDefaultOptions)
      } else {
        toast.error(`Tes badges préférés n'ont pas pu être modifiés : ${ data.error }.`, ToastDefaultOptions)
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(
          `Tes badges préférés n'ont pas pu être modifiés : ${ err.response?.data.error }.`,
          ToastDefaultOptions,
        )
      } else {
        console.log(err)
      }
    }
  }

  const handleSetTitle = async (badgeId : number, level : number) => {
    try {
      const { data } = await axios.post(
        '/api/users/actions/setTitle',
        { idAchievement: badgeId, lvl: level },
        {
          headers: {
            Authorization: `Bearer ${ token }`,
          },
        },
      )
      if (data.message) {
        setCurrentTitle(data.newTitle)
        if (user) setUser({ ...user, title: data.newTitle })
        toast.success('Ton titre a été modifié avec succès.', ToastDefaultOptions)
      } else {
        toast.error(`Ton titre n'a pas pu être modifié : ${ data.error }.`, ToastDefaultOptions)
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(`Ton titre n'a pas pu être modifié : ${ err.response?.data.error }.`, ToastDefaultOptions)
      } else {
        console.log(err)
      }
    }
  }

  const deleteTitle = async () => {
    try {
      const { data } = await axios.post(
        '/api/users/actions/removeTitle',
        {},
        {
          headers: {
            Authorization: `Bearer ${ token }`,
          },
        },
      )
      if (data.message) {
        setCurrentTitle('Tu n\'as pas encore sélectionné de titre')
        toast.info('Ton titre a été supprimé avec succès.', ToastDefaultOptions)
      } else {
        toast.error(`Ton titre n'a pas pu être supprimé : ${ data.error }.`, ToastDefaultOptions)
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(`Ton titre n'a pas pu être supprimé : ${ err.response?.data.error }.`, ToastDefaultOptions)
      } else {
        console.log(err)
      }
    }
  }

  useEffect(() => {
    const handleClickOutside = (e : MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        hideAchievementPanel()
      }
    }
    if (showPopup) {
      document.addEventListener('mouseup', handleClickOutside)
    } else {
      document.removeEventListener('mouseup', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mouseup', handleClickOutside)
    }
  }, [showPopup])

  const getAchievementIcon = (id : number, unique : boolean, level : number, disabled = false) : JSX.Element => {
    return (
      <div className="relative group">
        { !unique && level !== 0 && (
          <div
            className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold shadow-lg z-10">
            { level }
          </div>
        ) }
        <div
          className={`${disabled ? 'cursor-not-allowed' : '' } w-12 h-12 rounded-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center shadow-lg group-hover:shadow-blue-500/30 transition-all`}>
          <img src={ `/assets/images/pictos/${ id }.png` } className={ `${ disabled ? 'cursor-not-allowed': 'cursor-pointer' } w-8 h-8` }
            alt="Badge"/>
        </div>
      </div>
    )
  }

  // Rendu des titres débloqués pour un badge
  const renderBadgeTitles = (badge : Badge) => {
    if (badge.level === 0) return null
    let levelMax = true
    const lines = []
    for (let i = badge.level; i > 0; i--) {
      const spanStyle = !levelMax ? { color: 'rgb(156 163 175)' }: {}
      const setTitleSpan = (
        <>
          <span
            className={ `inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium cursor-pointer ${ badge.title[i] === currentTitle ? 'bg-blue-900/40 text-blue-300 hover:bg-blue-800/60': 'bg-gray-800/40 text-gray-400' } mr-2` }
            onClick={ () => handleSetTitle(badge.id, i) }
            data-tooltip-id={ `${ badge.id }_title` }
            data-tooltip-html={ `Choisir le titre <b>&laquo; ${ badge.title[i] } &raquo;</b>` }
          >
            Niveau { i }
          </span>
          <Tooltip id={`${badge.id}_title`} />
        </>
      )

      // Affichage avec ou sans détails (pour le niveau le plus haut)
      if (levelMax) {
        const number = badge.unique ? '': `${ badge.total } `
        lines.push(
          <div key={ i } className="mb-2">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              { setTitleSpan }
              <span
                className="font-bold text-white title-anim">&laquo; { badge.title[i] } &raquo;</span>
            </div>
            <div className="text-sm text-blue-300 ml-1">
              ({ number }
              { badge.description })
            </div>
          </div>,
        )
      } else {
        lines.push(
          <div key={ i } className="mb-2">
            <div className="flex items-center gap-2">
              { setTitleSpan }
              <span
                style={ spanStyle } className="title-anim">&laquo; { badge.title[i] } &raquo;</span>
            </div>
          </div>,
        )
      }
      if (badge.unique) break
      levelMax = false
    }
    return <>
      { lines }
    </>
  }

  const noBadge = achievements.possessed.length === 0

  return (
    <div className="space-y-8">
      {/* Explication du rôle des achievements */ }
      <motion.div
        className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-sm rounded-xl border border-blue-500/30 p-4"
        initial={ { opacity: 0, y: 20 } }
        animate={ { opacity: 1, y: 0 } }
        transition={ { duration: 0.5, delay: 0.2 } }
      >
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-300 mt-1 flex-shrink-0"/>
          <p className="text-blue-300">
            Les <strong className="text-white">badges</strong> sont des
            récompenses que tu peux obtenir en effectuant
            certaines actions en jeu ou sur le site !
          </p>
        </div>
      </motion.div>

      <div className="row">
        {/* Achievements préférés */ }
        <motion.div
          className="bg-gradient-to-r col-lg-6 col-12 from-black/60 to-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-500/30 overflow-hidden"
          initial={ { opacity: 0, y: 20 } }
          animate={ { opacity: 1, y: 0 } }
          transition={ { duration: 0.5 } }
        >
          <div
            className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-6 py-4 border-b border-blue-500/30">
            <h3 className="text-xl font-bold flex items-center gap-2 title-anim">
              <Award className="w-5 h-5"/>
              Modifier mes badges préférés
            </h3>
          </div>

          <div className="p-6">
            <p className="text-blue-300 mb-4">Tu peux mettre en avant jusqu'à 6
              badges de ton choix sur ton profil.</p>

            { noBadge ? (
              <div className="bg-black/40 rounded-lg p-4 text-center">
                <p className="text-gray-400 italic">Débloque des achievements
                  pour obtenir cette fonctionnalité !</p>
              </div>
            ): (
              <>
                <div className="flex flex-wrap gap-4 mb-6 justify-center">
                  { [1, 2, 3, 4, 5, 6].map((slot) => {
                    const favBadge = favorites[slot]
                    return (
                      <motion.div
                        key={ slot }
                        className="relative cursor-pointer"
                        onClick={ () => openAchievementPanel(slot) }
                        whileHover={ { scale: 1.05 } }
                        whileTap={ { scale: 0.95 } }
                      >
                        { favBadge ? (
                          <>
                            { getAchievementIcon(favBadge.id, favBadge.unique, favBadge.level) }
                            <button
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white shadow-lg z-20"
                              onClick={ (e) => {
                                e.stopPropagation()
                                removeBadgeFromSocket(slot)
                              } }
                            >
                              &times;
                            </button>
                          </>
                        ): (
                          <div
                            className="w-12 h-12 rounded-full bg-black/40 border-2 border-dashed border-blue-500/30 flex items-center justify-center text-blue-300 hover:border-blue-400/60 hover:text-blue-200 transition-all">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round"
                                strokeWidth={ 2 } d="M12 4v16m8-8H4"/>
                            </svg>
                          </div>
                        ) }

                        {/* Indicateur de sélection */ }
                        { selectedSocket === slot && (
                          <motion.div
                            className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-blue-500"
                            initial={ { opacity: 0 } }
                            animate={ { opacity: 1 } }
                          />
                        ) }
                      </motion.div>
                    )
                  }) }
                </div>

                {/* Bouton de sauvegarde */ }
                <div className="text-center">
                  <motion.button
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all shadow-lg shadow-blue-500/20"
                    onClick={ saveAchievements }
                    whileHover={ { scale: 1.05 } }
                    whileTap={ { scale: 0.95 } }
                  >
                    Mettre à jour
                  </motion.button>
                </div>
              </>
            ) }
          </div>
        </motion.div>

        {/* Popup des achievements */ }
        { showPopup && !noBadge && (
          <motion.div
            ref={ popupRef }
            className="inset-0 z-50 flex items-center justify-center"
            initial={ { opacity: 0 } }
            animate={ { opacity: 1 } }
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={ hideAchievementPanel }></div>
            <motion.div
              className="relative bg-gradient-to-r from-black/80 to-blue-900/40 backdrop-blur-md rounded-xl border border-blue-500/30 p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
              initial={ { scale: 0.9, y: 20 } }
              animate={ { scale: 1, y: 0 } }
              style={{ marginTop: '-15%' }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Sélectionner un badge</h3>
                <button
                  className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-gray-400 hover:text-white hover:bg-black/60 transition-colors"
                  onClick={ hideAchievementPanel }
                >
                  &times;
                </button>
              </div>

              <div className="flex flex-wrap gap-4 justify-center">
                { achievements.possessed.map(
                  (badge) =>
                    badge.level !== 0 && (
                      <>
                        <motion.div
                          key={ badge.id }
                          className={ ` ${ favoritesIds.includes(badge.id) ? 'opacity-50 cursor-not-allowed': 'cursor-pointer' }` }
                          data-tooltip-content={badge.description}
                          data-tooltip-id={String(badge.id)}
                          onClick={ () => handleBadgePopupClick(badge) }
                          whileHover={ { scale: favoritesIds.includes(badge.id) ? 1: 1.1 } }
                          title={ badge.description }
                        >
                          { getAchievementIcon(badge.id, badge.unique, badge.level, favoritesIds.includes(badge.id)) }
                        </motion.div>
                        <Tooltip id={String(badge.id)}/>
                      </>
                    ),
                ) }
              </div>
            </motion.div>
          </motion.div>
        ) }

        {/* Modifier mon titre */ }
        <motion.div
          className="bg-gradient-to-r from-black/60 col-lg-6 col-12 to-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-500/30 overflow-hidden"
          initial={ { opacity: 0, y: 20 } }
          animate={ { opacity: 1, y: 0 } }
          transition={ { duration: 0.5, delay: 0.1 } }
        >
          <div
            className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-6 py-4 border-b border-blue-500/30">
            <h3 className="text-xl font-bold flex items-center gap-2 title-anim">
              <Award className="w-5 h-5"/>
              Modifier mon titre
            </h3>
          </div>

          <div className="p-6">
            <p className="text-blue-300 italic mb-4">
              Clique sur un niveau débloqué pour sélectionner ce titre.
              <br/>
              Ton titre s'affichera sur ton profil et lorsque tu entres en partie
              !
            </p>

            <div className="bg-black/40 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-300 mb-1">Titre actuel:</p>
              <p className="text-xl font-bold text-white">{ currentTitle }</p>
            </div>

            { currentTitle !== 'Tu n\'as pas encore sélectionné de titre' && (
              <div className="text-center">
                <motion.button
                  className="btn-half-border position-relative d-inline-block py-2 px-6 rounded-pill z-2 bgred transition-all"
                  onClick={ deleteTitle }
                  whileHover={ { scale: 1.05 } }
                  whileTap={ { scale: 0.95 } }
                >
                  Supprimer mon titre
                </motion.button>
              </div>
            ) }
          </div>
        </motion.div>
      </div>

      {/* Liste des achievements */ }
      <motion.div
        className="bg-gradient-to-r from-black/60 to-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-500/30 overflow-hidden"
        initial={ { opacity: 0, y: 20 } }
        animate={ { opacity: 1, y: 0 } }
        transition={ { duration: 0.5, delay: 0.3 } }
      >
        <div
          className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-6 py-4 border-b border-blue-500/30">
          <h3 className="text-xl font-bold flex items-center gap-2 title-anim">
            <Award className="w-5 h-5"/>
            Mes badges
          </h3>
        </div>

        <div className="p-6">
          { noBadge ? (
            <div className="bg-black/40 rounded-lg p-4 text-center">
              <p className="text-gray-400">Tu n'as gagné aucun badge pour le
                moment.</p>
            </div>
          ): (
            <div className="space-y-6">
              { achievements.possessed.map((badge) => {
                const level = badge.level
                let canProgress = false
                let nextLevel = 0
                if (badge.nextLevelTo) {
                  nextLevel = badge.nextLevelTo - badge.total
                  canProgress = true
                }

                return (
                  <div key={ badge.id }
                    className="flex gap-4 p-4 bg-black/40 rounded-lg">
                    <div
                      className="flex-shrink-0">{ getAchievementIcon(badge.id, badge.unique, level) }</div>

                    <div className="flex-grow">
                      { level === 0 ? (
                        <p className="text-gray-400 italic text-sm">
                          Aucun titre n'a été gagné pour l'instant.
                          <br/>
                          Il te manque{ ' ' }
                          <strong className="text-white">
                            { nextLevel } { badge.description }
                          </strong>{ ' ' }
                          pour obtenir le premier titre !
                        </p>
                      ): (
                        <>
                          { renderBadgeTitles(badge) }
                          { canProgress && (
                            <p className="text-gray-400 italic text-sm">
                              Il te manque{ ' ' }
                              <strong className="text-white">
                                { nextLevel } { badge.description }
                              </strong>{ ' ' }
                              pour obtenir le prochain niveau !
                            </p>
                          ) }
                        </>
                      ) }
                    </div>
                  </div>
                )
              }) }
            </div>
          ) }
        </div>
      </motion.div>
    </div>
  )
}

export default Badges

