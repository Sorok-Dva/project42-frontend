import '../../../styles/Account.scss'

import React, { useState } from 'react'
import { useUser } from 'contexts/UserContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faMedal,
  faIdCardAlt,
  faCogs, faUserGraduate,
} from '@fortawesome/free-solid-svg-icons'

import Badges from './Badges'
import Settings from './Settings'
import Profile from './Profile'
import ModHistory from 'components/Auth/Settings/ModHistory'

const UserSettings: React.FC = () => {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState<string>('tab-badges')

  const openTabSection = (tabName: string) => {
    setActiveTab(tabName)
  }

  return (
    <div className="industries-area pb-100 mt-30">
      <div className="container">
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
                <Badges />
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
