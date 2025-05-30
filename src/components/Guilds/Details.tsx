import React, { useEffect, useState } from 'react'
import { Img as Image } from 'react-image'
import { Guild } from 'types/guild'
import { useAuth } from 'contexts/AuthContext'
import { useUser } from 'contexts/UserContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ToastDefaultOptions } from 'utils/toastOptions'
import { Button } from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowAltCircleUp, faCommentDots, faSignOutAlt } from '@fortawesome/free-solid-svg-icons'
import { Tooltip } from 'react-tooltip'
import { User } from 'types/user'

interface GuildDetailsProps {
  guild: Guild
}

const guildRoles: Record<string, string> = {
  captain: 'Capitaine',
  lieutenant: 'Lieutenant',
  ensign: 'Enseigne',
  cadet: 'Cadet',
  trial: 'Essai',
  punished: 'Punis',
}

export interface GuildApplication {
  id: number;
  userId: number;
  guildId: number;
  motivationText: string;
  user: User;
}

const GuildDetails: React.FC<GuildDetailsProps> = ({
  guild,
}) => {
  const { token } = useAuth()
  const { user } = useUser()

  const [belongsToGuild, setBelongsToGuild] = useState(false)
  const [permissions, setPermissions] = useState<{ level: number, role: string}>({ level: 0, role: 'none' })
  const [applications, setApplications] = useState<GuildApplication[]>([])

  useEffect(() => {
    if (user?.guildMembership?.guild.id === guild.id) setBelongsToGuild(true)
  }, [user, guild])

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await axios.get(`/api/guilds/${guild.id}/permissions`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (response.status === 200) {
          setPermissions(response.data)
        }
      } catch (error) {
        console.error(error)
      }
    }

    fetchPermissions()
  }, [belongsToGuild])

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await axios.get(`/api/guilds/${guild.id}/applications`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (response.status === 200) {
          setApplications(response.data)
        }
      } catch (error) {
        console.error(error)
      }
    }

    fetchApplications()
  }, [])

  const handleAcceptApplication = async (id: number, isAccepted: boolean, nickname: string) => {
    if (permissions.level <= 1) return
    try {
      const response = await axios.get(`/api/guilds/${guild.id}/application/${id}/${isAccepted ? 'accept' : 'refuse'}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.status === 200) {
        setApplications(applications.filter(a => a.id !== id))
        toast.success(`Vous avez ${isAccepted ? 'accepté' : 'refusé'} la candidature de ${nickname} avec succès.`, ToastDefaultOptions)
        if (isAccepted) window.dispatchEvent(new CustomEvent('reloadGuildData'))
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = await error?.response?.data
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorData.errors.forEach((error : { msg : string }) => {
            toast.error(error.msg, ToastDefaultOptions)
          })
        } else if (errorData.error) {
          toast.error(errorData.error, ToastDefaultOptions)
        }
      } else {
        toast.error('Une erreur est survenue.', ToastDefaultOptions)
      }
    }
  }

  const handleKickUser = async (userId: number, nickname: string) => {
    try {
      if (confirm('Voulez vous vraiment expulser ce joueur de votre station ?')) {
        const response = await axios.post(`/api/guilds/${guild.id}/kick/${userId}`, {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (response.status === 200) {
          toast.info(`Vous avez bien expulsé ${nickname} de votre station.`, ToastDefaultOptions)
          window.dispatchEvent(new CustomEvent('reloadGuildData'))
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = await error?.response?.data
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorData.errors.forEach((error : { msg : string }) => {
            toast.error(error.msg, ToastDefaultOptions)
          })
        } else if (errorData.error) {
          toast.error(errorData.error, ToastDefaultOptions)
        }
      } else {
        toast.error('Une erreur est survenue.', ToastDefaultOptions)
        console.log(error)
      }
    }
  }

  return (
    <section className="player-details-section pb-120">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <ul
              className="nav nav-pills gap-3 mb-lg-10 mb-6"
              id="pills-tab"
              role="tablist"
            >
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link"
                  id="parent-tab1"
                  data-bs-toggle="pill"
                  data-bs-target="#pills-parent1"
                  role="tab"
                  aria-selected="true"
                >
                  Présentation
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link active"
                  id="parent-tab1"
                  data-bs-toggle="pill"
                  data-bs-target="#pills-parent2"
                  role="tab"
                  aria-selected="true"
                >
                  Membres ({guild.members.length})
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link"
                  id="parent-tab1"
                  data-bs-toggle="pill"
                  data-bs-target="#pills-parent3"
                  role="tab"
                  aria-selected="true"
                >
                  Annonces
                </button>
              </li>
              { belongsToGuild && (
                <li className="nav-item" role="presentation">
                  <button
                    className="nav-link"
                    id="parent-tab1"
                    data-bs-toggle="pill"
                    data-bs-target="#pills-parent4"
                    role="tab"
                    aria-selected="true"
                  >
                    Candidatures { applications.length > 0 ? (<b>({applications.length})</b>) : `(${applications.length})`}
                  </button>
                </li>
              )}
            </ul>
            <div className="tab-content" id="pills-tabContent">
              <div
                className="tab-pane fade show"
                id="pills-parent1"
                role="tabpanel"
              >
                <h2>{guild.description}</h2>
              </div>
              <div
                className="tab-pane fade show active"
                id="pills-parent2"
                role="tabpanel"
              >
                <div className="player-list-wrapper">
                  <ul className="player-list d-grid gap-6">
                    { guild.members.map(member => {
                      const isLeader = member.userId === guild.leader
                      return (
                        <li key={member.userId} className="d-between bgn-4 py-sm-4 py-3 px-sm-8 px-3 rounded">
                          <div className="d-flex gap-3 align-items-center">
                            <div className="player-img">
                              <Image
                                className="rounded-circle"
                                src={member.user.avatar}
                                alt="player"
                                style={{ width: '50px', cursor: 'pointer', border: `2px solid ${(member.isOnline || member.userId === user?.id) ? 'green' : 'red'}`}}
                                data-profile={ member.user.nickname }
                              />
                            </div>
                            <h5 className="player-name tcn-1 cursor-pointer" data-profile={ member.user.nickname }>{ member.user.nickname }</h5>
                            <div className="player-badge">
                              { isLeader && (<i className="ti ti-crown fs-2xl" style={{ color: 'gold' }}></i>)}
                              ({ member.user.points} points)
                            </div>
                          </div>
                          <span className="player-type">
                            { guildRoles[member.role] }
                            { (permissions.level > 1 && member.userId !== user?.id) && (
                              <>
                                <Button
                                  className="btn btn-success"
                                  data-tooltip-html={`Promouvoir <b>${member.user.nickname}</b> dans la station.`}
                                  data-tooltip-id={`promote_${member.userId}`}
                                  onClick={() => console.log('ok')}
                                >
                                  <FontAwesomeIcon icon={faArrowAltCircleUp} />
                                </Button>
                                <Button
                                  className="btn btn-danger"
                                  data-tooltip-html={`Expulser <b>${member.user.nickname}</b> de la station.`}
                                  data-tooltip-id={`kick_${member.userId}`}
                                  onClick={() => handleKickUser(member.userId, member.user.nickname)}
                                >
                                  <FontAwesomeIcon icon={faSignOutAlt} />
                                </Button>
                                <Tooltip id={`promote_${member.userId}`} />
                                <Tooltip id={`kick_${member.userId}`} />
                              </>
                            )}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>
              <div className="tab-pane fade" id="pills-parent3" role="tabpanel">

              </div>
              { belongsToGuild && (
                <div
                  className="tab-pane fade show"
                  id="pills-parent4"
                  role="tabpanel"
                >
                  <div className="player-list-wrapper">
                    <ul className="player-list d-grid gap-6">
                      { applications.length === 0 && (
                        <li className="d-between bgn-4 py-sm-4 py-3 px-sm-8 px-3 rounded">
                          <div className="d-flex gap-3 align-items-center">
                            <h2>Aucune candidatures</h2>
                          </div>
                        </li>
                      )}
                      { applications.map(application => {
                        return (
                          <li key={application.userId} className="d-between bgn-4 py-sm-4 py-3 px-sm-8 px-3 rounded">
                            <div className="d-flex gap-3 align-items-center">
                              <div className="player-img">
                                <Image
                                  className="rounded-circle"
                                  src={application.user.avatar}
                                  alt="player"
                                  style={{ width: '50px'}}
                                />
                              </div>
                              <h5 className="player-name tcn-1 cursor-pointer" data-profile={ application.user.nickname }>{ application.user.nickname }</h5>
                              ({ application.user.points} points)
                              { application.motivationText && (
                                <>
                                  <span
                                    data-tooltip-html={`<strong>Motivation :</strong> ${application.motivationText}`}
                                    data-tooltip-id={`motivation_${application.id}`}
                                  >
                                    <FontAwesomeIcon icon={faCommentDots} />
                                    <Tooltip id={`motivation_${application.id}`} />
                                  </span>
                                </>
                              )}
                            </div>
                            <div className="player-type">
                              { permissions.level > 1 && (
                                <>
                                  <Button
                                    className="btn btn-success"
                                    onClick={() => handleAcceptApplication(application.id, true, application.user.nickname)}
                                  >
                                    Accepter
                                  </Button>
                                  <Button
                                    className="btn btn-danger"
                                    onClick={() => handleAcceptApplication(application.id, false, application.user.nickname)}
                                  >
                                    Refuser
                                  </Button>
                                </>
                              )}
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default GuildDetails
