import '../../../styles/Account.scss'

import React, { useEffect, useState } from 'react'
import { useAuth } from 'contexts/AuthContext'
import { useUser } from 'contexts/UserContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMedal, faIdCardAlt } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'

import Badges, { BadgesData } from './Badges'
import Nickname from './Nickname'
import Email from './Email'
import Password from './Password'
import Other from './Other'
import Profile from './Profile'

const UserSettings: React.FC = () => {
  const { token } = useAuth()
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState<string>('tab-profile')
  const [achievements, setAchievements] = useState<{
    achievements: BadgesData;
    playerTitle?: string;
  }>({ achievements: { possessed: [], favorites: [] }, playerTitle: user?.title})

  const openTabSection = (tabName: string) => {
    setActiveTab(tabName)
  }

  useEffect(() => {
    async function retrieveMyAchievements () {
      try {
        const { data } = await axios.get('/api/users/achievements', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setAchievements(data)
      } catch (err) {
        console.error('Failed to fetch achievements', err)
      }
    }

    retrieveMyAchievements()
  }, [])

  return (
    <div className="industries-area pb-100 mt-30">
      <div className="container">
        <div className="section-title">
          <h5>Mettez à jour les paramètres de votre compte tels que le pseudo, l'e-mail ou le mot de passe.</h5>
        </div>

        <div className="tab industries-list-tab">
          <div className="row align-items-center">
            <div className="col-lg-3">
              <ul className="tabs">
                <li
                  className={activeTab === 'tab-profile' ? 'current' : ''}
                  onClick={() => openTabSection('tab-profile')}
                >
                  <span>
                    <i><FontAwesomeIcon icon={faIdCardAlt} /></i>
                    <h3>Profil</h3>
                    <p>Modifier votre profil</p>
                  </span>
                </li>

                <li
                  className={activeTab === 'tab-badges' ? 'current' : ''}
                  onClick={() => openTabSection('tab-badges')}
                >
                  <span>
                    <i><FontAwesomeIcon icon={faMedal} /></i>
                    <h3>Badges & Titre</h3>
                    <p>Modifier votre titre et vos badges favoris</p>
                  </span>
                </li>

                <li
                  className={activeTab === 'tab1' ? 'current' : ''}
                  onClick={() => openTabSection('tab1')}
                >
                  <span>
                    <i className="flaticon-user"></i>
                    <h3>Changer le pseudo</h3>
                    <p>Limite : 1 fois tous les 6 mois</p>
                  </span>
                </li>

                <li
                  className={activeTab === 'tab2' ? 'current' : ''}
                  onClick={() => openTabSection('tab2')}
                >
                  <span>
                    <i className="flaticon-envelope"></i>
                    <h3>Changer de mail</h3>
                    <p>Mettez à jour votre adresse e-mail</p>
                  </span>
                </li>

                <li
                  className={activeTab === 'tab3' ? 'current' : ''}
                  onClick={() => openTabSection('tab3')}
                >
                  <span>
                    <i className="fal fa-key"></i>
                    <h3>Changer le mot de passe</h3>
                    <p>Mettez à jour votre mot de passe</p>
                  </span>
                </li>

                <li
                  className={activeTab === 'tab4' ? 'current' : ''}
                  onClick={() => openTabSection('tab4')}
                >
                  <span>
                    <i className="fal fa-cogs"></i>
                    <h3>Autres paramètres</h3>
                    <p>Gérer les autres paramètres de votre compte.</p>
                  </span>
                </li>
              </ul>
            </div>

            <div className="col-lg-9">
              <div className="tab_content">
                {activeTab === 'tab-profile' && (
                  <div id="tab-profile" className="tabs_item active">
                    <Profile user={user!} openTabSection={openTabSection} />
                  </div>
                )}

                {activeTab === 'tab-badges' && (
                  <div id="tab-badges" className="tabs_item active">
                    <Badges achievements={achievements.achievements} playerTitle={achievements.playerTitle} />
                  </div>
                )}

                {activeTab === 'tab1' && (
                  <div id="tab1" className="tabs_item active">
                    <Nickname />
                  </div>
                )}

                {activeTab === 'tab2' && (
                  <div id="tab2" className="tabs_item active">
                    <Email />
                  </div>
                )}

                {activeTab === 'tab3' && (
                  <div id="tab3" className="tabs_item active">
                    <Password /> {/* Replace with your component */}
                  </div>
                )}

                {activeTab === 'tab4' && (
                  <div id="tab4" className="tabs_item active">
                    <Other />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserSettings
