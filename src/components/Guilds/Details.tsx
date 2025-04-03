import React, { useEffect, useState } from 'react'
import { Img as Image } from 'react-image'
import { Guild } from 'components/Guilds/Guilds'
import { useAuth } from 'contexts/AuthContext'
import { User, useUser } from 'contexts/UserContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ToastDefaultOptions } from 'utils/toastOptions'
import { Button } from '@mui/material'

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
  motivation: string;
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
  }, [])

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

  const handleAcceptApplication = (userId: number) => {
    alert(userId)
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
                  Membres
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
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link"
                  id="parent-tab1"
                  data-bs-toggle="pill"
                  data-bs-target="#pills-parent4"
                  role="tab"
                  aria-selected="true"
                >
                  Candidatures
                </button>
              </li>
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
                                style={{ width: '50px'}}
                              />
                            </div>
                            <h5 className="player-name tcn-1 cursor-pointer" data-profile={ member.user.nickname }>{ member.user.nickname }</h5>
                            <div className="player-badge">
                              { isLeader && (<i className="ti ti-crown fs-2xl" style={{ color: 'gold' }}></i>)}
                            </div>
                          </div>
                          <span className="player-type">{ guildRoles[member.role] }</span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>
              <div className="tab-pane fade" id="pills-parent3" role="tabpanel">

              </div>
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
                          </div>
                          <div className="player-type">
                            { permissions.level > 1 && (
                              <>
                                <Button
                                  className="button button-success"
                                  onClick={() => handleAcceptApplication(application.id)}
                                >
                                  Accepter
                                </Button>
                                <Button
                                  className="button button-danger"
                                  onClick={() => handleAcceptApplication(application.id)}
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
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default GuildDetails
