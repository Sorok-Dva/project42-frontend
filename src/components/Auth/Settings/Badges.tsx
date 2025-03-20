import React, { useEffect, useRef, useState } from 'react'
import { Tooltip } from 'react-tooltip'
import { Box } from '@mui/material'
import axios from 'axios'
import { useAuth } from 'contexts/AuthContext'
import { toast } from 'react-toastify'
import { ToastDefaultOptions } from 'utils/toastOptions'

interface Badge {
  id: number;
  unique: boolean;
  level: number;
  total: number;
  nextLevelTo?: number;
  description: string;
  title: { [key: number]: string };
}

export interface BadgesData {
  possessed: Badge[];
  favorites: { [key: number]: Badge }; // clés de 1 à 6
}

interface AchievementsProps {
  achievements: BadgesData;
  playerTitle?: string;
}

const ProfileAchievements: React.FC<AchievementsProps> = ({ achievements, playerTitle }) => {
  const { token } = useAuth()

  const noBadge = achievements.possessed.length === 0

  const [showPopup, setShowPopup] = useState(false)
  const [selectedSocket, setSelectedSocket] = useState<number | null>(null)
  const [favorites, setFavorites] = useState<{ [slot: number]: Badge | null }>(() => {
    const initial: { [slot: number]: Badge | null } = {}
    for (let slot = 1; slot <= 6; slot++) {
      console.log('slot', slot, 'favorites', achievements.favorites[slot])
      initial[slot] = achievements.favorites[slot] ?? null
    }
    return initial
  })
  const [currentTitle, setCurrentTitle] = useState<string>(playerTitle || 'Tu n\'as pas encore sélectionné de titre')

  useEffect(() => {
    const newFavorites: { [slot: number]: Badge | null } = {}
    for (let slot = 1; slot <= 6; slot++) {
      newFavorites[slot] = achievements.favorites[slot] ?? null
    }
    setFavorites(newFavorites)
  }, [achievements])

  const popupRef = useRef<HTMLDivElement>(null)

  const favoritesIds = Object.values(favorites)
    .filter((b): b is Badge => b !== null)
    .map(badge => badge.id)

  const openAchievementPanel = (slot: number) => {
    setSelectedSocket(slot)
    setShowPopup(true)
  }

  const hideAchievementPanel = () => {
    setSelectedSocket(null)
    setShowPopup(false)
  }

  const handleBadgePopupClick = (badge: Badge) => {
    if (favoritesIds.includes(badge.id)) return

    if (selectedSocket !== null) {
      setFavorites(prev => ({
        ...prev,
        [selectedSocket]: badge,
      }))
    }
    hideAchievementPanel()
  }

  const removeBadgeFromSocket = (slot: number) => {
    setFavorites(prev => ({
      ...prev,
      [slot]: null,
    }))
  }

  const saveAchievements = async () => {
    const favoritesToSave = Array.from({ length: 6 }, (_, i) => favorites[i + 1]?.id || 0)
    try {
      const { data } = await axios.post('/api/users/actions/setFavBadges', { favorites: favoritesToSave }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (data.message) {
        toast.success('Tes badges préférés ont été modifiés avec succès.',
          ToastDefaultOptions)
      } else {
        toast.error(`Tes badges préférés n'ont pas pu être modifiés : ${data.error}.`,
          ToastDefaultOptions)
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(`Tes badges préférés n'ont pas pu être modifiés : ${err.response?.data.error}.`,
          ToastDefaultOptions)
      } else {
        console.log(err)
      }
    }
  }

  const handleSetTitle = async (badgeId: number, level: number) => {
    try {
      const { data } = await axios.post('/api/users/actions/setTitle', { idAchievement: badgeId, lvl: level }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (data.message) {
        setCurrentTitle(data.newTitle)
        toast.success('Ton titre a été modifié avec succès.',
          ToastDefaultOptions)
      } else {
        toast.error(`Ton titre n'a pas pu être modifié : ${data.error}.`,
          ToastDefaultOptions)
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(`Ton titre n'a pas pu être modifié : ${err.response?.data.error}.`,
          ToastDefaultOptions)
      } else {
        console.log(err)
      }
    }
  }

  const deleteTitle = async () => {
    try {
      const { data } = await axios.post('/api/users/actions/removeTitle', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (data.message) {
        setCurrentTitle('Tu n\'as pas encore sélectionné de titre')
        toast.info('Ton titre a été supprimé avec succès.',
          ToastDefaultOptions)
      } else {
        toast.error(`Ton titre n'a pas pu être supprimé : ${data.error}.`,
          ToastDefaultOptions)
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(`Ton titre n'a pas pu être supprimé : ${err.response?.data.error}.`,
          ToastDefaultOptions)
      } else {
        console.log(err)
      }
    }
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
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

  const getAchievementIcon = (id: number, unique: boolean, level: number): JSX.Element => {
    return (
      <div className="achievement_badge" data-id={id}>
        {(!unique && level !== 0) && (
          <div className="achievement_level">{level}</div>
        )}
        <img src={`/assets/images/pictos/${id}.png`} style={{ height: '20px' }} alt="Badge" />
      </div>
    )
  }

  // Rendu des titres débloqués pour un badge
  const renderBadgeTitles = (badge: Badge) => {
    if (badge.level === 0) return null
    let levelMax = true
    const lines = []
    for (let i = badge.level; i > 0; i--) {
      const spanStyle = !levelMax ? { color: 'grey' } : {}
      const setTitleSpan = (
        <>
          <span
            className="set-title"
            // Lorsqu'on clique sur ce titre, on envoie la requête pour définir le titre
            onClick={() => handleSetTitle(badge.id, i)}
            data-tooltip-id={`${badge.id}_title`}
            data-tooltip-html={`Choisir le titre <b>&laquo; ${badge.title[i]} &raquo;</b>`}
            style={{ cursor: 'pointer' }}
          >
           Niveau {i}
          </span>
          <Tooltip id={`${badge.id}_title`} />
        </>
      )
      // Affichage avec ou sans détails (pour le niveau le plus haut)
      if (levelMax) {
        const number = badge.unique ? '' : `${badge.total} `
        lines.push(
          <span key={i} style={spanStyle}>
            {setTitleSpan} - <b>&laquo; {badge.title[i]} &raquo;</b>{' '}
            <i style={{ fontSize: '12px' }}>
              ({number}{badge.description})
            </i>
            <br />
          </span>
        )
      } else {
        lines.push(
          <span key={i} style={spanStyle}>
            {setTitleSpan} - &laquo; {badge.title[i]} &raquo;
            <br />
          </span>
        )
      }
      if (badge.unique) break
      levelMax = false
    }
    return <>{lines}</>
  }

  return (
    <Box className="account-achievements">
      <Box className="profil-achievements">
        {/* Achievements préférés */}
        <Box className="achievements-presentation bgblue rounded shadow">
          <Box className="titre-compte">
            <h3>Modifier mes badges préférés</h3>
          </Box>
          <p>Tu peux mettre en avant jusqu'à 6 badges de ton choix sur ton profil.</p>
          {noBadge ? (
            <p>
              <i>Débloque des achievements pour obtenir cette fonctionnalité !</i>
            </p>
          ) : (
            <>
              <Box id="liste-achievements-fav" display="flex" flexWrap="wrap" gap={1}>
                {[1, 2, 3, 4, 5, 6].map((slot) => {
                  const favBadge = favorites[slot]
                  return (
                    <Box
                      key={slot}
                      className="achievement-socket"
                      data-socket={slot}
                      onClick={() => openAchievementPanel(slot)}
                      sx={{
                        cursor: 'pointer',
                        position: 'relative',
                      }}
                    >
                      {favBadge ? (
                        <>
                          {getAchievementIcon(favBadge.id, favBadge.unique, favBadge.level)}
                          <span
                            className="achievement-delete"
                            style={{
                              cursor: 'pointer',
                              color: 'red',
                              fontFamily: 'fantasy',
                              fontWeight: 'bolder',
                            }}
                            onClick={(e) => {
                              e.stopPropagation()
                              removeBadgeFromSocket(slot)
                            }}
                          >
                             &times;
                          </span>
                        </>
                      ) : (
                        <Box className="achievement_badge achievement-empty">
                          <img src="/assets/images/plus-badges.png" alt="Badge" />
                        </Box>
                      )}
                      {/* Ajout d'une flèche si ce socket est actif */}
                      {selectedSocket === slot && (
                        <Box className="fleche-fav" sx={{ position: 'absolute', bottom: -10, left: '50%' }}>
                          <img src="/assets/images/icons/fleche-fav-badges.png" alt="fleche badge favori" />
                        </Box>
                      )}
                    </Box>
                  )
                })}
              </Box>
              {/* Bouton de sauvegarde des modifications */}
              <button className="button_secondary set-achievements" onClick={saveAchievements}>
                Mettre à jour
              </button>
            </>
          )}
        </Box>

        {/* Popup des achievements */}
        {!noBadge && (
          <Box
            id="popupachievements"
            ref={popupRef}
            sx={{
              display: showPopup ? 'flex' : 'none !important',
              position: 'absolute',
              zIndex: 1000,
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              padding: '10px',
            }}
          >
            <Box className="close" onClick={hideAchievementPanel} sx={{ cursor: 'pointer', textAlign: 'right' }}>
              ✕
            </Box>
            {achievements.possessed.map(
              (badge) =>
                badge.level !== 0 && (
                  <Box
                    key={badge.id}
                    className="achievement_badge"
                    data-tooltip={badge.description}
                    data-id={badge.id}
                    data-use={favoritesIds.includes(badge.id) ? 1 : 0}
                    onClick={() => handleBadgePopupClick(badge)}
                    sx={{
                      margin: '5px',
                      cursor: favoritesIds.includes(badge.id) ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {!badge.unique && (
                      <Box className="achievement_level" sx={{ fontSize: '12px' }}>
                        {badge.level}
                      </Box>
                    )}
                    <img src={`/assets/images/pictos/${badge.id}.png`} style={{ height: '20px' }} alt="Badge" />
                  </Box>
                )
            )}
          </Box>
        )}

        {/* Modifier mon titre */}
        <Box className="achievements-presentation bgblue rounded shadow" mt={2}>
          <Box className="titre-compte">
            <h3>Modifier mon titre</h3>
          </Box>
          <p>
            <i>
              Clique sur un niveau débloqué pour sélectionner ce titre.
              <br />
              Ton titre s'affichera sur ton profil et lorsque tu entres en partie !
            </i>
          </p>
          <p>
            Titre actuel : <strong id="current-title">{currentTitle}</strong>
          </p>
          <button
            className="button_secondary delete-title"
            onClick={deleteTitle}
            style={{ display: currentTitle !== 'Tu n\'as pas encore sélectionné de titre' ? 'block' : 'none' }}
          >
            Supprimer mon titre
          </button>
        </Box>
      </Box>

      {/* Explication du rôle des achievements */}
      <p className="explication-achievements shadow">
        Les <strong>badges</strong> sont des récompenses que tu peux obtenir en effectuant
        certaines actions en jeu ou sur le site !
      </p>

      {/* Liste des achievements */}
      <Box id="achievements-list">
        {noBadge ? (
          <p>Tu n'as gagné aucun badge pour le moment.</p>
        ) : (
          <table cellPadding="5px" style={{ padding: '15px' }}>
            <tbody>
              {achievements.possessed.map((badge) => {
                const level = badge.level
                let canProgress = false
                let nextLevel = 0
                if (badge.nextLevelTo) {
                  nextLevel = badge.nextLevelTo - badge.total
                  canProgress = true
                }
                return (
                  <tr key={badge.id}>
                    <td style={{ width: '40px' }} align="center" valign="top">
                      {getAchievementIcon(badge.id, badge.unique, level)}
                    </td>
                    <td align="left">
                      {level === 0 ? (
                        <i style={{ fontSize: '12px', color: 'silver' }}>
                        Aucun titre n'a été gagné pour l'instant.
                          <br />
                        Il te manque <b>
                            {nextLevel} {badge.description}
                          </b>{' '}
                        pour obtenir le premier titre !
                        </i>
                      ) : (
                        <>
                          {renderBadgeTitles(badge)}
                          {canProgress && (
                            <i style={{ fontSize: '12px', color: 'silver' }}>
                            Il te manque <b>
                                {nextLevel} {badge.description}
                              </b>{' '}
                            pour obtenir le prochain niveau !
                            </i>
                          )}
                          <br />
                        </>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </Box>
    </Box>
  )
}

export default ProfileAchievements
