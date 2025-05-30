import axios from 'axios'
import React, { FC, useEffect, useState } from 'react'
import { useAuth } from 'contexts/AuthContext'
import { Spinner } from 'reactstrap'

import 'styles/Modal.css'
import '../styles/ProfileModal.scss'
import { rolify } from 'utils/rolify'
import RenderGameLine from 'components/Profile/RenderGameLine'
import AchievementBadge from 'components/Profile/AchievementBadge'
import Actions from './Profile/Actions'
import Details from './Profile/Details'
import Activity from 'components/Profile/Activity'
import { Tooltip } from 'react-tooltip'

interface AchievementResult { [favorite: number]:  {
    id: number
    description: string
    total: number
    unique: boolean
    memory: boolean
    level: number
    title?: string | { [level: number]: string }
    nextLevelTo?: number
  } }

export interface User {
  id : number
  nickname: string;
  points: number;
  level: number;
  isPremium: boolean;
  title: string;
  signature: string;
  avatar: string;
  isMale: boolean;
  rank: string;
  playedGames: number;
  canGuildInvite: boolean;
  role: { name: string };
  summaryHistory: [{
    id: string;
    date: string;
    result: string;
    name: string;
    link: string;
    type: string;
    idRole: number;
    meanClaps: number;
  }];
  stats: [{
    type: number | 'all';
    playedGames: number;
  }],
  guild: {
    id: number;
    name: string;
    banner: string | null;
    tag: string;
    picture: string;
    border: string;
    role: string;
    membersCount: string;
  },
  achievements: {
    favorites: AchievementResult,
    possessed: [{
      id: string
      title: string
      description: string
      unique: boolean
      level: number
      total?: number
      nextLevelTo?: number
    }]
  },
  cardsStatistics: {
    statsByRole: { cardsPlayed: number, wins: number, losses: number, winRate: number, lossRate: number }[],
    topCard: {
      name: string
      playedCount: 50
    }
  },
  gamesStatistics: [],
  gamesHistoryFull: {
    id: string
    idRole: number,
    date: string,
    link: string,
    meanClaps: number,
    name: string
    result: string
    type: string
  }[],
  activity: {
    state: 'ingame' | 'pregame' | 'spectator' | 'none' | string;
    gameId?: number;
  }
  createdAt: Date;
}

interface ProfileModalProps {
  nickname: string;
  onClose: () => void;
}

const ProfileModal: FC<ProfileModalProps> = ({ nickname, onClose }) => {
  const { token } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [relation, setRelation] = useState<'me' | 'friend' | 'waiting' | 'none'>('none')
  const [error, setError] = useState<string | null>(null)
  const [role, setRole] = useState<{ name: string, color: string } | null>(null)

  useEffect(() => {
    const fetchuser = async () => {
      try {
        const response = await axios.get(`/api/users/${nickname}`, token ? {
          headers: { Authorization: `Bearer ${token}` },
        } : {})
        setUser(response.data.user)
        setRelation(response.data.relation)
        setRole(rolify(response.data.user.role.name, response.data.user.isMale))
      } catch (e: any) {
        if (e.response?.data.error) {
          setError(e.response.data.error)
        }
        console.error('Erreur lors de la récupération des données :', e)
      }
    }

    fetchuser()
  }, [nickname])

  /**
   * Close the modal if we click on the overlay
   */
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  if (error) {
    return (
      <div className="modal-overlay" onClick={handleOverlayClick}>
        <div className="modal-container" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Profil de {nickname}</h2>
            <button className="close-btn" onClick={onClose}>
              &times;
            </button>
          </div>
          <div className="modal-content">
            <div className="alert alert-danger">{error}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-container"
        style={{ width: '750px' }}
        onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-center">Profil de {nickname}</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-content">
          <div className="profile">
            <div className="profile-infos">
              <div className="profile-infos-wrapper">
                {user ? (
                  <>
                    {role && (
                      <div className="role-profile">
                        <span
                          className="user-role"
                          data-team={role.name}
                          style={{ backgroundColor: role.color }}
                        >
                          {role.name}
                        </span>
                      </div>
                    )}

                    <div className="profile-infos-user">
                      <img
                        className="profile-avatar"
                        src={ user.avatar }
                        alt="Avatar"
                      />

                      <div className="profile-name">
                        <div className="presentation">
                          <strong className="username">{ user.nickname }</strong>
                          <p className="featured-achievement">{ user.title }</p>
                          <p className="signature">
                            « { user.signature ? (user.signature): ('...') } »
                          </p>
                        </div>
                      </div>

                      <div className="information-profil">
                        {/*<div className="profil-premium">
                          <a>
                            { user.isMale ? ('Joueur'): ('Joueuse') }
                            { user.isPremium ? (' premium'): (' non premium') }
                          </a>
                        </div>*/}
                        <div className="infos-niveau">
                          <div><img src="/assets/images/profile/level.png"
                            alt="Niveau"/> Niveau <strong>{ user.level }</strong>
                          </div>
                          <div>
                            <img id="gm_commands"
                              src="/assets/images/profile/level1.svg"
                              alt="Rang MDJ"/> Rang MDJ
                          </div>
                        </div>
                        <div className="infos-parties">
                          <div>
                            <img src="/assets/images/dice.png" alt="Parties"/>
                            <strong>{ user.playedGames }</strong> parties jouées
                          </div>
                          <div>
                            <img src="/assets/images/star.png" alt="Points"/>
                            <strong>{ user.points }</strong> points
                          </div>
                        </div>
                      </div>

                      <div className="autres-infos">
                        <p>
                          <img src={`/assets/images/${user.isMale ? 'boy' : 'girl'}.png`} alt="Gender Avatar" />
                          Inscrit{user.isMale ? '' : 'e'} le {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </p>
                        <p></p>
                      </div>
                    </div>

                    <div className="fav-badges">
                      {Object.values(user.achievements.favorites).length > 0 ? (
                        Object.values(user.achievements.favorites).map((a, index) => (
                          <div className="badges" key={index}>
                            <div className="achievement_badge">
                              <AchievementBadge achievement={a} isMemory={a.memory} aKey='fav' />
                            </div>
                          </div>
                        ))
                      ) : relation === 'me' ? (
                        <p>
                          Tu n'as pas encore indiqué quels étaient tes badges favoris.
                          Fais le vite dans l'onglet <strong>Badges et titre</strong> de ton Compte !
                        </p>
                      ) : (
                        <p>
                          <strong>{user.nickname}</strong> n'a pas encore décidé quels talents {user.isMale ? 'il' : 'elle'} souhaitait mettre en avant.
                        </p>
                      )}
                    </div>

                    <div className="profil-info-game">
                      {/* Dernières parties */}
                      <div className="resume-last-game">
                        {user.playedGames === 0 && relation === 'me' ? (
                          <p>
                              Tu viens seulement de débarquer dans la station Mir.
                            <br />
                              Rejoins vite les autres explorateurs en partie !
                          </p>
                        ) : user.playedGames === 0 ? (
                          <p>
                            <strong>{user.nickname}</strong> vient seulement de débarquer dans la station Mir.
                            <br />
                            {user.isMale ? 'Il' : 'Elle'} n'a pas encore joué de partie.
                          </p>
                        ) : (
                          <>
                            <div className="games-bar">
                              {user.stats.filter(s => s.type !== 'all').map((stat: { type: number | 'all', playedGames: number }) => {
                                const flexValue = Math.round((stat.playedGames / user.playedGames) * 100)
                                return (
                                  <div
                                    key={stat.type}
                                    className={`games-bar-section type-${stat.type}`}
                                    style={{ flex: flexValue }}
                                  ></div>
                                )
                              })}
                            </div>
                            {/* Récap des parties */}
                            <div className="game-tableau">
                              <ul className="last-games">
                                {user.summaryHistory.map((game) => (
                                  <li key={game.id}>
                                    <RenderGameLine game={game} key='fav' />
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Stations */}
                      <div className="hameau-user">
                        {user.guild ? (
                          <a
                            className="profile-infos-hamlet"
                            href={`/station/${user.guild.tag}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <div
                              className={`hamlet-banner ${
                                user.guild.border ? `hamlet-border-${user.guild.border}` : ''
                              }`}
                              style={{ backgroundImage: `url(${user.guild.banner ? user.guild.banner : '/img/stations_banner.png'})` }}
                            ></div>
                            <h2>
                              <small>[{user.guild.tag}]</small>
                              {user.guild.name}
                            </h2>
                            <ul className="hamlet-details">
                              <li
                                data-tooltip-content={`Rôle de ${user.nickname} dans sa station`}
                                data-tooltip-id="role-tooltip"
                              >
                                <img src="/assets/images/icon-capitaine.png" alt="Rôle" />{' '}
                                {user.guild.role}
                                <Tooltip id="role-tooltip"/>
                              </li>
                              <li data-tooltip="Joueurs membres de la station">
                                <img src="/assets/images/icon-people.png" alt="Membres" /> {user.guild.membersCount}/50
                              </li>
                            </ul>
                          </a>
                        ) : relation === 'me' ? (
                        // C'est mon profil et je n'ai pas de station
                          <div>
                            <p>
                              <strong>Tu n’as pas de station spatiale.</strong>{' '}
                              {user.level >= 3 ? (
                                <>
                                    Rejoins-en un dès maintenant pour faire de nouvelles rencontres !
                                </>
                              ) : (
                                <>Atteins le niveau 3 pour pouvoir en rejoindre une !</>
                              )}
                            </p>
                            {user.level >= 3 && (
                              <a className="button" href="/stations-spatiales" target="_blank" rel="noopener noreferrer">
                                  Voir les stations spatiales
                              </a>
                            )}
                          </div>
                        ) : (
                        // C'est le profil d'un autre et il n'a pas de hameau
                          <p>
                            <strong>{user.nickname} n'a aucune station.</strong>
                            <br />
                            <br />
                              Ce joueur n'a rejoint aucune station spatiale !
                          </p>
                        )}
                      </div>
                    </div>

                    <Actions data={user} relation={relation} />
                  </>
                ): (
                  <div
                    style={ {
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: '200px',
                    }}
                  >
                    <Spinner className="custom-spinner" />
                    <div style={{ marginTop: '1rem' }}>
                      Chargement du profil...
                    </div>
                  </div>
                )}
              </div>
            </div>

            { user && relation !== 'me' && user.activity.state !== 'none' && (
              <Activity user={user} relation={relation} />
            )}
            { user && (
              <div className="profile-tabs">
                <Details user={user} relation={relation} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileModal
