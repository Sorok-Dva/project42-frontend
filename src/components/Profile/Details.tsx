import React, { useState, useRef, useEffect } from 'react'
import { Tooltip } from 'react-tooltip'
import { usePermissions } from 'hooks/usePermissions'

import AchievementBadge from 'components/Profile/AchievementBadge'
import ModerationPanel from 'components/Moderation/ProfilePanel'
import RenderGameLine from 'components/Profile/RenderGameLine'
import { User } from 'components/ProfileModal'

interface ProfileDetailsProps {
  user: User;
  relation: string; // 'me', 'none', 'waiting', 'friend', etc.
}

const ProfileDetails: React.FC<ProfileDetailsProps> = ({ user, relation }) => {
  const { checkPermission } = usePermissions()
  const [detailsIsShown, setDetailsIsShown] = useState(false)
  const [moderationIsShown, setModerationIsShown] = useState(false)
  const [activeTab, setActiveTab] = useState('player')
  const detailsRef = useRef<HTMLDivElement>(null)
  const modPanelRef = useRef<HTMLDivElement>(null)
  const isModerator = checkPermission('site', 'warn')

  const showDetails = () => {
    setDetailsIsShown(prev => !prev)
  }

  const showModeration = () => {
    if (!isModerator) return
    setModerationIsShown(prev => !prev)
  }

  useEffect(() => {
    if (detailsIsShown && detailsRef.current) {
      detailsRef.current.scrollIntoView({ behavior: 'smooth' })
    }
    if (moderationIsShown && modPanelRef.current) {
      modPanelRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [detailsIsShown, moderationIsShown])

  const cardsStatistics = user.cardsStatistics.statsByRole

  const badgesArray = Object.values(user.achievements.possessed).filter(
    (a: any) => !a.memory
  )
  const memoriesArray = Object.values(user.achievements.possessed).filter(
    (a: any) => a.memory
  )

  return (
    <>
      {/* Bouton Voir Plus */}
      <div className="voir-plus">
        { !moderationIsShown && (
          <>
            <hr />
            <div className="voir-plus-buttons buttons" onClick={showDetails}>
              <a className="button_secondary">
                {detailsIsShown ? 'Masquer les détails' : 'Voir plus de détails'}
              </a>
            </div>
          </>
        )}

        { isModerator && (
          <div className="moderation-buttons buttons" onClick={showModeration}>
            <a className="button_secondary">
              {moderationIsShown ? 'Fermer' : 'Modération'}
            </a>
          </div>
        )}
      </div>

      {/* Contenu des onglets caché par défaut */}
      {detailsIsShown && (
        <div
          id="contenu-voir-plus"
          ref={detailsRef}
        >
          {/* Liste des onglets */}
          <ul id="tabs_profile">
            <li
              className={activeTab === 'player' ? 'active' : ''}
              onClick={() => setActiveTab('player')}
              id="profile_player_button"
            >
              Joueur
            </li>
            <li
              className={activeTab === 'badge' ? 'active' : ''}
              onClick={() => setActiveTab('badge')}
              id="profile_badge_button"
            >
              Badges
            </li>
            <li
              className={activeTab === 'stats' ? 'active' : ''}
              onClick={() => setActiveTab('stats')}
              id="profile_stats_button"
            >
              Stats
            </li>
          </ul>

          {/* Onglet JOUEUR */}
          <div
            id="profile_player"
            className="tabs_profile_content playerGm_informations"
            style={{ display: activeTab === 'player' ? 'block' : 'none' }}
          >
            {user.playedGames === 0 ? (
              relation === 'me' ? (
                <p>
                  Tu viens seulement de débarquer sur Project 42.
                  <br />
                  Rejoins vite les autres villageois en partie !
                </p>
              ) : (
                <p>
                  <strong>{user.nickname}</strong> vient seulement de débarquer sur Project 42.
                  <br />
                  {user.isMale ? 'Il' : 'Elle'} n'a pas encore joué de partie.
                </p>
              )
            ) : (
              <>
                {/* Statistiques de parties */}
                <div className="games-statistics">
                  <div className="games-statistics-wrapper">
                    <div className="games-types">
                      {user.gamesStatistics.map((stat: any, index: number) => (
                        <div className="game-type" key={index}>
                          <div className={`bullet-game type-${stat.id}`}></div>
                          <strong>
                            {stat.type}
                            {stat.id === 1 ? '' : 's'}
                          </strong>
                          <div className="game-type-user">
                            <span>
                              {user.playedGames > 0
                                ? Math.round((stat.playedGames / user.playedGames) * 100)
                                : 0}
                            %
                            </span>
                            <span className="ratio">
                            ({stat.playedGames}/{user.playedGames})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Récapitulatif des parties */}
                <ul className="last-games">
                  <li className="separateur">
                    <hr />
                  </li>
                  {user.gamesHistoryFull.map((game: any, index: number) => (
                    <React.Fragment key={game.id}>
                      <RenderGameLine game={game} key="all" />
                    </React.Fragment>
                  ))}
                </ul>
                {relation === 'me' && (
                  <div className="all-archives-parties">
                    <a href="/game/archives" target="_blank">
                      Voir toutes mes parties
                    </a>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Onglet BADGES */}
          <div
            id="profile_badge"
            className="tabs_profile_content playerBadge_informations"
            style={{ display: activeTab === 'badge' ? 'block' : 'none' }}
          >
            <div className="achievements">
              {badgesArray.length > 0 && badgesArray.filter((b: any) => b.level > 0).length !== 0 ? (
                badgesArray.map((a: any, index: number) => {
                  if (a.level > 0) {
                    return (
                      <React.Fragment key={index}>
                        <div className="badges">
                          <div className="achievement_badge">
                            <AchievementBadge achievement={a} isMemory={a.memory} aKey="all" />
                          </div>
                        </div>
                      </React.Fragment>
                    )
                  }
                })
              ) : relation === 'me' ? (
                <p>
                  Tu n'as pas encore remporté de badge.
                  <br />
                  Joue une partie pour commencer ta collection !
                </p>
              ) : (
                <p>
                  <strong>{user.nickname}</strong> n'a pas encore remporté de badge.
                  <br />
                  Invite {user.isMale ? 'le' : 'la'} à jouer pour l'aider à débuter sa collection !
                </p>
              )}
            </div>
            <div className="memory-achievements">
              <h2>Souvenirs</h2>
              <p>Pour montrer que tu étais là au bon moment</p>
              {memoriesArray.length > 0 ? (
                memoriesArray.map((a: any, index: number) => (
                  <React.Fragment key={index}>
                    <div className="badges">
                      <div className="achievement_badge">
                        <AchievementBadge achievement={a} isMemory={true} aKey="memory" />
                      </div>
                    </div>
                  </React.Fragment>
                ))
              ) : relation === 'me' ? (
                <p>Tu n'as pas encore remporté de souvenirs.</p>
              ) : (
                <p>
                  <strong>{user.nickname}</strong> n'a pas encore remporté de souvenirs.
                </p>
              )}
            </div>
          </div>

          {/* Onglet STATS */}
          <div
            id="profile_stats"
            className="tabs_profile_content playerBadge_informations"
            style={{ display: activeTab === 'stats' ? 'block' : 'none' }}
          >
            <div className="profile_stats">
              <div className="stats">
                <h2>Statistiques par cartes</h2>
                {Object.keys(cardsStatistics).length === 0 && (
                  <>
                    <br />
                    <p>
                      <strong>{user.nickname}</strong> n'a joué aucune partie.
                    </p>
                  </>
                )}
                <div id="roles-stats">
                  {Object.entries(cardsStatistics).map(([cardId, { cardsPlayed, wins, losses, winRate, lossRate}], index) => {
                    if (cardId === 'unknown') return
                    const s = cardsPlayed > 1 ? 's' : ''
                    const tooltip = `<b>Statistiques sur <strong>${cardsPlayed}</strong> partie${s} jouée${s}.</b><br/><b>Victoires</b> : <strong>${wins}</strong>・<b>Défaites</b> : <strong>${losses}</strong>・<br/><b>Taux de victoire :</b> <strong>${winRate}%</strong>`
                    return (
                      <div
                        className="role role-stats sound-tick"
                        key={index}
                        data-tooltip-html={tooltip}
                        data-tooltip-id={String(index)}
                      >
                        <img
                          className="carte"
                          src={`/assets/images/carte${cardId}.png`}
                          alt=""
                        />
                        <Tooltip id={String(index)} />
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {moderationIsShown && (
        <div id="contenu-voir-plus" ref={modPanelRef}>
          <ModerationPanel />
        </div>
      )}
    </>
  )
}

export default ProfileDetails
