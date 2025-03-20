import React, { useState, useRef, useEffect } from 'react'
import AchievementBadge from 'components/Profile/AchievementBadge'
import { Tooltip } from 'react-tooltip'
import RenderGameLine from 'components/Profile/RenderGameLine'

interface ProfileDetailsProps {
  user: any;
  relation: string; // 'me', 'none', 'waiting', 'friend', etc.
}

const ProfileDetails: React.FC<ProfileDetailsProps> = ({ user, relation }) => {
  const [detailsIsShown, setDetailsIsShown] = useState(false)
  const [activeTab, setActiveTab] = useState('player') // onglet actif par défaut
  const detailsRef = useRef<HTMLDivElement>(null)

  const showDetails = () => {
    setDetailsIsShown(prev => !prev)
  }

  useEffect(() => {
    if (detailsIsShown && detailsRef.current) {
      detailsRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [detailsIsShown])

  const cardsStatistics = user.cardsStatistics.reduce((acc: any, game: any) => {
    const { idRole, state } = game
    if (!acc[idRole]) {
      acc[idRole] = { victories: 0, defeats: 0, draws: 0 }
    }
    if (state === 'Victoire') {
      acc[idRole].victories += 1
    } else if (state === 'Défaite') {
      acc[idRole].defeats += 1
    } else if (state === 'Égalité') {
      acc[idRole].draws += 1
    }
    return acc
  }, {})

  const calculateRatios = (stats: any) => {
    for (const idRole in stats) {
      const { victories, defeats, draws } = stats[idRole]
      stats[idRole].total = victories + defeats + draws
      stats[idRole].ratio =
        defeats === 0 ? (victories > 0 ? 'Infinity' : 0) : (victories / defeats).toFixed(2)
      stats[idRole].ratio = stats[idRole].ratio === 'Infinity' ? victories : parseFloat(stats[idRole].ratio)
    }
    return stats
  }

  const calculatedStats = calculateRatios({ ...cardsStatistics })

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
        <hr />
        <div className="voir-plus-buttons buttons" onClick={showDetails}>
          <a className="button_secondary">
            {detailsIsShown ? 'Masquer les détails' : 'Voir plus de détails'}
          </a>
        </div>
      </div>

      {/* Contenu des onglets caché par défaut */}
      <div
        id="contenu-voir-plus"
        ref={detailsRef}
        style={ detailsIsShown ? { display: 'block' } : { display: 'none' } }
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
                <strong>{user.username}</strong> vient seulement de débarquer sur Project 42.
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
            {badgesArray.length > 0 ? (
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
                {Object.entries(calculatedStats).map(([idRole, stats]: [string, any], index) => {
                  const s = stats.total > 1 ? 's' : ''
                  const tooltip = `<b>Statistiques sur ${stats.total} partie${s} jouée${s}.</b><br/><b>Victoires : ${stats.victories}</b>・<b>Défaites : ${stats.defeats}</b>・<b>Égalités : ${stats.draws}</b> <br/><b>Ratio :</b> ${stats.ratio}`
                  return (
                    <div
                      className="role role-stats sound-tick"
                      key={index}
                      data-tooltip-html={tooltip}
                      data-tooltip-id={String(index)}
                    >
                      <img
                        className="carte"
                        src={`/jeu/assets/images/carte${idRole}.png`}
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
    </>
  )
}

export default ProfileDetails
