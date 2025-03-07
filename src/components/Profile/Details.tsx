import React from 'react'

interface ProfileDetailsProps {
  user: any;
  relation: string; // 'me', 'none', 'waiting', 'friend', etc.
  renderGamesBar: (gamesStatistics: any[], playedGames: number) => JSX.Element;
  renderGameLine: (game: any, isMdj: boolean) => JSX.Element;
  renderArchivesLink: () => JSX.Element;
  renderAchievement: (achievement: any, isSouvenir?: boolean) => JSX.Element;
}

const ProfileDetails: React.FC<ProfileDetailsProps> = ({
  user,
  relation,
  renderGamesBar,
  renderGameLine,
  renderArchivesLink,
  renderAchievement,
}) => {
  // Calcul des statistiques par cartes
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

  // Séparation des badges et souvenirs
  const badgesArray = Object.values(user.achievements.possedes).filter(
    (a: any) => !a.souvenir
  )
  const souvenirsArray = Object.values(user.achievements.possedes).filter(
    (a: any) => a.souvenir
  )

  return (
    <>
      {/* Bouton Voir Plus */}
      <div className="voir-plus">
        <hr />
        <div className="voir-plus-buttons buttons" user-state="hidden">
          <a className="button_secondary">Voir plus de détails</a>
        </div>
      </div>

      {/* Contenu des onglets caché par défaut */}
      <div id="contenu-voir-plus" style={{ display: 'none' }}>
        {/* Liste des onglets */}
        <ul id="tabs_profile">
          <li className="active" id="profile_player_button" user-content="profile_player">
            Joueur
          </li>
          {user.mdj.history.length === 0 ? (
            <li
              id="profile_gm_button"
              className="mdjdisabled"
              user-tooltip={
                relation === 'me'
                  ? 'Anime des parties pour débloquer cet onglet'
                  : 'Ce joueur n’a pas encore animé de partie'
              }
            >
              MDJ
            </li>
          ) : (
            <li id="profile_gm_button" user-content="profile_gm">
              MDJ
            </li>
          )}
          <li id="profile_badge_button" user-content="profile_badge">
            Badges
          </li>
          <li id="profile_stats_button" user-content="profile_stats">
            Stats
          </li>
        </ul>

        {/* Onglet PARTIES */}
        <div id="profile_player" className="tabs_profile_content playerGm_informations">
          {user.playedGames === 0 ? (
            relation === 'me' ? (
              <p>
                Tu viens seulement de débarquer à Thiercelieux.
                <br />
                Rejoins vite les autres villageois en partie !
              </p>
            ) : (
              <p>
                <strong>{user.username}</strong> vient seulement de débarquer à Thiercelieux.
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

              {/* Barre de jeu */}
              {renderGamesBar(user.gamesStatistics, user.playedGames)}

              {/* Récapitulatif des parties */}
              <ul className="last-games">
                <li className="separateur">
                  <hr />
                </li>
                {user.gamesHistoryFull.map((game: any, index: number) => (
                  <React.Fragment key={index}>
                    {renderGameLine(game, false)}
                  </React.Fragment>
                ))}
              </ul>
              {relation === 'me' && renderArchivesLink()}
            </>
          )}
        </div>

        {/* Onglet MDJ */}
        <div id="profile_gm" className="tabs_profile_content playerGm_informations">
          <div className="gm_stats">
            <div className="gm_played">
              <div className="gm_user">
                <img src="/jeu/assets/images/dice.png" alt="Parties" />
                <strong>{user.mdj.numberGamesAnimated}</strong> parties animées
              </div>
              <div className="gm_user">
                <strong>{user.mdj.totalpoints}</strong> claps reçus
              </div>
              <div className="gm_user">
                <div
                  className="star-rating"
                  user-tooltip={`Moyenne de claps reçus : ${user.mdj.mean}/50`}
                >
                  <span
                    style={{ width: `${user.mdj.mean * 2}%` }}
                    className="star-rating-score"
                  ></span>
                </div>
              </div>
            </div>
          </div>
          <ul className="last-games">
            <li className="separateur">
              <hr />
            </li>
            {user.mdj.history
              .filter((game: any) => game.idRole === -1)
              .map((game: any, index: number) => (
                <React.Fragment key={index}>
                  {renderGameLine(game, true)}
                </React.Fragment>
              ))}
          </ul>
          {relation === 'me' && renderArchivesLink()}
        </div>

        {/* Onglet BADGES */}
        <div id="profile_badge" className="tabs_profile_content playerBadge_informations">
          <div className="achievements">
            {badgesArray.length > 0 ? (
              badgesArray.map((a: any, index: number) => (
                <React.Fragment key={index}>{renderAchievement(a)}</React.Fragment>
              ))
            ) : relation === 'me' ? (
              <p>
                Tu n'as pas encore remporté de badge.
                <br />
                Joue une partie pour commencer ta collection !
              </p>
            ) : (
              <p>
                <strong>{user.username}</strong> n'a pas encore remporté de badge.
                <br />
                Invite {user.isMale ? 'le' : 'la'} à jouer pour l'aider à débuter sa collection !
              </p>
            )}
          </div>
          <div className="achievements">
            <h2>Souvenirs</h2>
            <p>Pour montrer que tu étais là au bon moment</p>
            {souvenirsArray.length > 0 ? (
              souvenirsArray.map((a: any, index: number) => (
                <React.Fragment key={index}>{renderAchievement(a, true)}</React.Fragment>
              ))
            ) : relation === 'me' ? (
              <p>Tu n'as pas encore remporté de souvenirs.</p>
            ) : (
              <p>
                <strong>{user.username}</strong> n'a pas encore remporté de souvenirs.
              </p>
            )}
          </div>
        </div>

        {/* Onglet CARDS STATS */}
        <div id="profile_stats" className="tabs_profile_content playerBadge_informations">
          <div className="profile_stats">
            <div className="achievements">
              <h2>Statistiques par cartes</h2>
              {Object.keys(cardsStatistics).length === 0 && (
                <>
                  <br />
                  <p>
                    <strong>{user.username}</strong> n'a joué aucune partie.
                  </p>
                </>
              )}
              <div id="roles-stats">
                {Object.entries(calculatedStats).map(([idRole, stats]: [string, any], index) => {
                  const es = stats.total > 1 ? 's' : ''
                  const tooltip = `<b>Statistiques sur ${stats.total} parti${es} joué${es}.</b><br/><b>Victoires : ${stats.victories}</b>・<b>Défaites : ${stats.defeats}</b>・<b>Égalités : ${stats.draws}</b> <br/><b>Ratio :</b> ${stats.ratio}`
                  return (
                    <div
                      className="role role-stats sound-tick"
                      key={index}
                      user-tooltip={tooltip}
                    >
                      <img
                        className="carte"
                        src={`/jeu/assets/images/carte${idRole}.png`}
                        alt=""
                      />
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
