import '../../../styles/Account.scss'

import React, { useEffect, useState } from 'react'
import { useAuth } from 'contexts/AuthContext'
import { useUser } from 'contexts/UserContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faMedal,
  faIdCardAlt,
  faCogs, faUserGraduate,
} from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'

import Badges, { BadgesData } from './Badges'
import Settings from './Settings'
import Profile from './Profile'
import ModHistory from 'components/Auth/Settings/ModHistory'

const UserSettings: React.FC = () => {
  const { token } = useAuth()
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState<string>('tab-badges')
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
          <h5>Mettez à jour les paramètres de votre compte tels que le pseudo,
            l'e-mail ou le mot de passe.</h5>
        </div>

        <div className="account-page page-tabs">
          <header>
            <h1>Mon compte</h1>
          </header>

          <ul className="tabs">
            <li className={activeTab === 'tab-badges' ? 'current' : ''}
              onClick={() => openTabSection('tab-badges')}>
              <i><FontAwesomeIcon icon={faMedal} /></i>{' '}Badges & Titre
            </li>
            <li className={activeTab === 'tab-profile' ? 'current' : ''}
              onClick={() => openTabSection('tab-profile')}>
              <i><FontAwesomeIcon icon={faIdCardAlt} /></i>{' '}Gestion du profil
            </li>
            <li className={activeTab === 'tab-settings' ? 'current' : ''}
              onClick={() => openTabSection('tab-settings')}>
              <i><FontAwesomeIcon icon={faCogs} /></i>{' '}Paramètres
            </li>
            <li className={activeTab === 'tab-behavior' ? 'current' : ''}
              onClick={() => openTabSection('tab-behavior')}>
              <i><FontAwesomeIcon icon={faUserGraduate} /></i>{' '}Comportement
            </li>
            <li data-tab-link="discord">Discord</li>
          </ul>

          <div className="tabs-content">
            { activeTab === 'tab-badges' && (
              <div className="account-badges">
                <Badges achievements={ achievements.achievements }
                  playerTitle={ achievements.playerTitle }/>
              </div>
            ) }

            { activeTab === 'tab-profile' && (
              <div className="account-profil">
                <Profile user={ user! } openTabSection={ openTabSection }/>
              </div>
            ) }

            { activeTab === 'tab-settings' && (
              <div className="account-settings">
                <Settings/>
              </div>
            ) }

            { activeTab === 'tab-behavior' && (
              <div className="account-antecedents">
                <ModHistory/>
              </div>
            ) }
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserSettings
