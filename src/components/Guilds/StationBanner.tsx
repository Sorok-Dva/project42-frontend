import React from 'react'
import { Img as Image } from 'react-image'
import { Link } from 'react-router-dom'
import star from 'assets/img/star.png'
import trophy2 from 'assets/img/tropy2.png'
import wallet2 from 'assets/img/wallet2.png'
import { Guild } from './Guilds'

interface StationBannerProps {
  guild: Guild
}

const StationBanner: React.FC<StationBannerProps> = ({
  guild,
})=> {
  const goToBack = () => {
    window.history.back()
  }

  const leaderNickname = guild.members.find(m => guild.leader === m.userId)?.user.nickname || ''

  return (
    <section className="team-profile-banner pb-50 pt-120 mt-lg-0 mt-sm-15 mt-10">
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
                <ul className="player-lists d-md-flex align-items-center d-none">
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
    </section>
  )
}

export default StationBanner
