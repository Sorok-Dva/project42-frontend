import React, { useState } from 'react'
import { Img as Image } from 'react-image'
import { Link } from 'react-router-dom'
import star from 'assets/img/star.png'
import trophy2 from 'assets/img/tropy2.png'
import wallet2 from 'assets/img/wallet2.png'
import { Guild } from 'types/guild'
import { Button } from 'reactstrap'
import { useUser } from 'contexts/UserContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ToastDefaultOptions } from 'utils/toastOptions'
import { useAuth } from 'contexts/AuthContext'
import JoinGuildModal from 'components/Guilds/JoinModal'

interface StationBannerProps {
  guild: Guild
}

const StationBanner: React.FC<StationBannerProps> = ({
  guild,
})=> {
  const { token } = useAuth()
  const { user, reloadUser } = useUser()
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
  const [joinGuild, setJoinGuild] = useState<Guild | null>(null)

  const goToBack = () => {
    window.history.back()
  }

  const handleLeaveGuild = async () => {
    try {
      if (confirm('Voulez vous vraiment quitter votre station ?')) {
        const response = await axios.post('/api/guilds/leave', {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (response.status === 200) {
          toast.warn('Vous avez bien quitté votre station', ToastDefaultOptions)
          window.dispatchEvent(new CustomEvent('reloadGuildData'))
          reloadUser(true)
        }
      }
    } catch (err: any) {
      console.log('failed to leave guild', err)
    }
  }

  const handleJoinGuild = async (guild: Guild) => {
    if (!user) return
    setIsJoinModalOpen(true)
    setJoinGuild(guild)
  }

  const closeJoinGuild = async () => {
    setIsJoinModalOpen(false)
  }

  const leaderNickname = guild.members.find(m => guild.leader === m.userId)?.user.nickname || ''

  return (
    <section className="team-profile-banner pb-50 mt-lg-0 mt-sm-15 mt-10">
      <div className="container position-relative">
        <div className="row">
          <div className="col-12">
            <Link to="#" onClick={goToBack} className="back-btn">
              <i className="ti ti-arrow-narrow-left fs-2xl"></i>
            </Link>
          </div>
        </div>
        <div className="row">
          <div className="col-12 mb-4 pb-lg-10 pb-6">
            <div className="parallax-banner-area parallax-container">
              <Image
                className="w-100 rounded-5 parallax-img"
                src={guild.banner ? guild.banner : '/img/stations_banner.png'}
                alt="Banniere de la station"
              />
              <div className="team-profile d-between position-absolute z-1 w-100 px-lg-15 px-md-10 px-sm-6 px-4" style={{ marginTop: '-10vh' }}>
                <div className="d-flex align-items-center gap-sm-6 gap-3">
                  <div className="team-details mb-3">
                    <h3 className="team-name">{ guild.name } [{guild.tag.toUpperCase()}]</h3>
                    <div className="d-flex gap-sm-6 gap-2 align-items-center flex-wrap">
                      <div className="d-flex gap-3 align-items-center">
                        <i className="ti ti-crown fs-2xl" style={{ color: 'gold' }}></i>
                        <span className="tcn-6 cursor-pointer" data-profile={leaderNickname}>
                          {leaderNickname}
                        </span>
                      </div>
                      <div className="d-flex gap-sm-3 gap-1 align-items-center">
                        <i className="ti ti-users fs-2xl"></i>
                        <span className="tcn-6">{guild.members.length} joueurs</span>
                      </div>
                      <div className="d-flex gap-sm-3 gap-1 align-items-center">
                        <i className="ti ti-clock fs-2xl"></i>
                        <span className="tcn-6">Créée le {new Date(guild.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="player-lists d-md-flex align-items-center d-none">
                  { !user?.guildMembership && (
                    <Button
                      onClick={() => handleJoinGuild(guild)}
                      className="btn-half-border position-relative d-inline-block py-2 px-6 rounded-pill z-2">
                      Demander à rejoindre
                    </Button>
                  )}
                  { user?.guildMembership?.guild.id === guild.id && (
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
        </div>
        <div className="row g-lg-6 g-4">
          <div className="col-lg-4 col-sm-6">
            <div className="team-info p-xl-8 p-md-6 p-2 bgn-4 d-flex align-items-center gap-lg-6 gap-4 rounded">
              <div className="team-info-icon">
                <Image className="w-100" src={wallet2} alt="img" />
              </div>
              <div className="team-info-details">
                <h3 className="team-info-text tcn-1">{ guild.money }</h3>
                <span className="team-info-title tcn-6">Argent gagné</span>
              </div>
            </div>
          </div>
          <div className="col-lg-4 col-sm-6">
            <div className="team-info p-xl-8 p-md-6 p-2 bgn-4 d-flex align-items-center gap-lg-6 gap-4 rounded">
              <div className="team-info-icon">
                <Image className="w-100" src={star} alt="img" />
              </div>
              <div className="team-info-details">
                <h3 className="team-info-text tcn-1">{guild.points}</h3>
                <span className="team-info-title tcn-6">
                  Points gagnés
                </span>
              </div>
            </div>
          </div>
          <div className="col-lg-4 col-sm-6">
            <div className="team-info p-xl-8 p-md-6 p-2 bgn-4 d-flex align-items-center gap-lg-6 gap-4 rounded">
              <div className="team-info-icon">
                <Image className="w-100" src={trophy2} alt="img" />
              </div>
              <div className="team-info-details">
                <h3 className="team-info-text tcn-1">0 fois</h3>
                <span className="team-info-title tcn-6">Dans le top 3 du mois</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isJoinModalOpen && (
        <JoinGuildModal guild={joinGuild} onClose={closeJoinGuild} />
      )}
    </section>
  )
}

export default StationBanner
