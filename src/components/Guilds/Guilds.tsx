import React, { useEffect, useState } from 'react'
import { Img as Image } from 'react-image'
import { Link, useNavigate } from 'react-router-dom'
import { Tooltip } from 'react-tooltip'
import { User, useUser } from 'contexts/UserContext'
import CreateGuildModal from 'components/Guilds/CreateModal'
import axios from 'axios'
import { Button, Container, Spinner } from 'reactstrap'
import SplitTextAnimations from 'utils/SplitTextAnim'
import { useAuth } from 'contexts/AuthContext'
import { toast } from 'react-toastify'
import { ToastDefaultOptions } from 'utils/toastOptions'
import JoinGuildModal from './JoinModal'

export interface Guild {
  id: number;
  name: string;
  tag: string;
  description: string;
  signature: string;
  leader: number;
  banner: string;
  points: number;
  money: number;
  createdAt: Date;
  members: {
    isOnline: boolean;
    id: number;
    userId: number;
    role: string;
    user: User;
  }[]
}

const Guilds = () => {
  const { token } = useAuth()
  const { user, reloadUser } = useUser()
  const navigate = useNavigate()
  const [canCreateStation, setCanCreateStation] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
  const [joinGuild, setJoinGuild] = useState<Guild | null>(null)
  const [loading, setLoading] = useState(true)
  const [guilds, setGuilds] = useState<Guild[]>([])
  const [searchQuery, setSearchQuery] = useState('') // Champ de recherche
  const [hasLeft, setHasLeft] = useState<boolean>(false)

  const [x, setX] = useState(0)
  const [y, setY] = useState(0)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setX(e.nativeEvent.offsetX)
    setY(e.nativeEvent.offsetY)
  }
  const style = {
    '--x': `${x}px`,
    '--y': `${y}px`,
  } as React.CSSProperties

  useEffect(() => {
    const now = new Date()
    if (user?.premium && !user.guildMembership) {
      const premiumDate = new Date(user.premium)
      if (premiumDate.getTime() - now.getTime() > 7 * 24 * 60 * 60 * 1000) {
        setCanCreateStation(true)
      }
    }
  }, [user])

  useEffect(() => {
    const fetchGuilds = async () => {
      try {
        const response = await axios.get<Guild[]>('/api/guilds/')
        setGuilds(response.data)
      } catch (err: any) {
        console.log('failed to fetch guilds', err)
      } finally {
        setLoading(false)
      }
    }

    fetchGuilds()
  }, [hasLeft])

  const handleLeaveGuild = async () => {
    try {
      if (confirm('Voulez vous vraiment quitter votre station ?')) {
        const response = await axios.post('/api/guilds/leave', {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (response.status === 200) {
          setHasLeft(true)
          toast.warn('Vous avez bien quitté votre station', ToastDefaultOptions)
          reloadUser(true)
        }
      }
    } catch (err: any) {
      console.log('failed to leave guild', err)
    }
  }
  // Filtrage des guildes selon le champ de recherche (nom, tag, leaderNickname)
  const filteredGuilds = guilds.filter(guild => {
    const leaderNickname = guild.members.find(m => guild.leader === m.userId)?.user.nickname || ''
    return (
      guild.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guild.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leaderNickname.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const handleCreateGuild = async () => {
    if (!user || !canCreateStation) return
    setIsCreateModalOpen(true)
  }

  const closeCreateGuild = async () => {
    setIsCreateModalOpen(false)
  }

  const handleJoinGuild = async (guild: Guild) => {
    if (!user) return
    setIsJoinModalOpen(true)
    setJoinGuild(guild)
  }

  const closeJoinGuild = async () => {
    setIsJoinModalOpen(false)
  }

  return (
    <section className="teams-card-section pb-120">
      <SplitTextAnimations key={`${guilds.length}-${searchQuery}`} trigger={guilds.length} />

      <div className="container">
        {/* Titre et champ de recherche */}
        <div className="col-12 mb-4 d-flex justify-content-between align-items-center">
          <h2 className="display-four tcn-1 cursor-scale growUp title-anim">
            Trouver des Stations
          </h2>
          <input
            type="text"
            className="form-control"
            placeholder="Rechercher par nom, tag ou capitaine"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ minWidth: '300px', maxWidth: '400px' }}
          />
        </div>
        <div className="row">
          { !user?.guildMembership && (
            <div className="guilds-create bgblue shadow rounded mb-4">
              <h3>Tu n’as pas encore de station !</h3>
              <p>Rejoins-en une existante ou crée la tienne.</p>
              <button
                className={`button bglightblue ${!canCreateStation ? 'disabled' : ''}`}
                data-tooltip-content="Tu dois posséder minimum 7 jours premium pour créer ta propre station."
                data-tooltip-id="cantCreateGuild"
                onClick={handleCreateGuild}
              >
                Créer une station
              </button>
              { !canCreateStation && <Tooltip id="cantCreateGuild" /> }
            </div>
          )}
        </div>
        <div className="row g-6 justify-content-md-start justify-content-center mb-lg-15 mb-10">
          { loading ? (
            <Container className="loader-container">
              <div className="spinner-wrapper">
                <Spinner animation="border" role="status" className="custom-spinner">
                  <span className="sr-only">Chargement des stations...</span>
                </Spinner>
                <div className="loading-text">Chargement des stations...</div>
              </div>
            </Container>
          ) : (
            filteredGuilds.length > 0 ? (
              filteredGuilds.map((guild) => {
                const leaderNickname = guild.members.find(m => guild.leader === m.userId)?.user.nickname || ''
                return (
                  <div key={guild.id} className="col-12">
                    <div
                      style={style}
                      onMouseMove={handleMouseMove}
                      className="team-card gap-6 p-xxl-8 p-4 bgn-4 box-style alt-box"
                      data-tilt
                    >
                      <div className="col-12">
                        <div className="parallax-guild-banner-area parallax-container">
                          <Image
                            onClick={() => navigate(`/station/${guild.tag}`)}
                            className="w-100 rounded-5 parallax-img cursor-pointer"
                            src={guild.banner ? guild.banner : '/img/stations_banner.png'}
                            alt="Banniere de la station"
                          />
                        </div>
                      </div>
                      <div className="team-info w-100">
                        <div className="title-area d-flex gap-5 align-items-end mb-5">
                          <Link to={`/station/${guild.tag}`}>
                            <h4 className="tcn-1 cursor-scale growDown title-anim text-uppercase">
                              {guild.name} [{guild.tag.toUpperCase()}]
                            </h4>
                          </Link>
                          <span className="tcn-6">Rank</span>
                        </div>
                        <div className="player-info d-flex gap-6 align-items-center mb-6">
                          <div className="d-flex gap-3 align-items-center">
                            <i className="ti ti-crown fs-2xl" style={{ color: 'gold' }}></i>
                            <span className="tcn-6 cursor-pointer" data-profile={leaderNickname}>
                              {leaderNickname}
                            </span>
                          </div>
                          <div className="d-flex gap-3 align-items-center">
                            <i className="ti ti-users fs-2xl"></i>
                            <span className="tcn-6">{guild.members.length} / 50 joueurs</span>
                          </div>
                          <div className="d-flex gap-3 align-items-center">
                            <i className="ti ti-star fs-2xl"></i>
                            <span className="tcn-6">{guild.points} points</span>
                          </div>
                        </div>
                        <div className="d-between justify-content-center justify-content-xl-between flex-wrap w-100 gap-xxl-6 gap-3">
                          <ul className="player-lists d-flex align-items-center">
                            {guild.members.slice(0, 5).map((member) => (
                              <li key={member.id} className="rounded-circle overflow-hidden me-n4">
                                <Image src={member.user.avatar} alt={member.user.nickname} />
                              </li>
                            ))}
                            {guild.members.length > 5 && (
                              <li className="rounded-circle overflow-hidden me-n4">
                                +{guild.members.length - 5}
                              </li>
                            )}
                          </ul>
                          { !user?.guildMembership && (
                            <Button
                              onClick={() => handleJoinGuild(guild)}
                              className="btn-half-border position-relative d-inline-block py-2 px-6 rounded-pill z-2">
                              Demander à rejoindre
                            </Button>
                          )}
                          { !hasLeft && user?.guildMembership?.guild.id === guild.id && (
                            <Button
                              onClick={handleLeaveGuild}
                              className="btn-half-border position-relative d-inline-block py-2 px-6 rounded-pill z-2 bgred">
                              Quitter la station
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="col-12">
                <p>Aucune station trouvée</p>
              </div>
            )
          )}
        </div>
        <div className="d-center">
          <button className="btn-half-border position-relative d-inline-block py-2 bgp-1 px-6 rounded-pill z-2 border-0">
            Voir plus de Stations
          </button>
        </div>
      </div>

      {isCreateModalOpen && (
        <CreateGuildModal canCreate={canCreateStation} onClose={closeCreateGuild} />
      )}

      {isJoinModalOpen && (
        <JoinGuildModal guild={joinGuild} onClose={closeJoinGuild} />
      )}
    </section>
  )
}

export default Guilds
