import React, { useEffect } from 'react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useUser } from 'contexts/UserContext'

import {
  Medal,
  UserCog,
  SettingsIcon,
  Shield,
  Users,
  VenetianMask,
} from 'lucide-react'

import Badges from './Badges'
import Profile from './Profile'
import Settings from './Settings'
import ModHistory from './ModHistory'
import Discord from './Discord'
import Referral from './Referral'
import AvatarPage from 'pages/AvatarCreator'
import AvatarIntroPopup from 'components/Avatar/AvatarIntroPopup'

const UserSettings : React.FC = () => {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState<string>('tab-badges')
  const [showAvatarPopup, setShowAvatarPopup] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const code = params.get('code')
    if (code) setActiveTab('tab-discord')
    const avatarIntro = params.get('avatarIntro')
    if (avatarIntro) {
      setActiveTab('tab-avatar')
      setShowAvatarPopup(true)
    }
  }, [location.search])

  const openTabSection = (tabName : string) => {
    setActiveTab(tabName)
  }

  const tabs = [
    {
      id: 'tab-badges',
      label: 'Badges & Titre',
      icon: <Medal className="w-5 h-5"/>,
    },
    {
      id: 'tab-avatar',
      label: 'Mon avatar',
      icon: <VenetianMask className="w-5 h-5"/>,
    },
    {
      id: 'tab-profile',
      label: 'Gestion du profil',
      icon: <UserCog className="w-5 h-5"/>,
    },
    {
      id: 'tab-referral',
      label: 'Parrainage',
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: 'tab-settings',
      label: 'Paramètres',
      icon: <SettingsIcon className="w-5 h-5"/>,
    },
    {
      id: 'tab-behavior',
      label: 'Comportement',
      icon: <Shield className="w-5 h-5"/>,
    },
    {
      id: 'tab-discord',
      label: 'Discord',
      icon: <svg
        className="w-5 h-5"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 127.14 96.36"
        fill="currentColor"
      >
        <path
          d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
      </svg>,
    },
  ]

  return (
    <div className="p-6">
      <header className="mb-8 text-center">
        <motion.h1
          className="text-3xl font-bold mb-2"
          initial={ { opacity: 0 } }
          animate={ { opacity: 1 } }
          transition={ { delay: 0.2 } }
        >
          Centre de Contrôle Spatial
        </motion.h1>
        <motion.div
          className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full"
          initial={ { width: 0 } }
          animate={ { width: 96 } }
          transition={ { delay: 0.4, duration: 0.8 } }
        ></motion.div>
      </header>

      {/* Tabs Navigation */ }
      <div className="flex flex-wrap justify-center mb-8 gap-2">
        { tabs.map((tab) => (
          <motion.button
            key={ tab.id }
            className={ `flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-black/40 text-blue-300 hover:bg-black/60 hover:text-white border border-blue-500/30'
            }` }
            onClick={ () => openTabSection(tab.id) }
            whileHover={ { scale: 1.05 } }
            whileTap={ { scale: 0.95 } }
          >
            { tab.icon }
            <span>{ tab.label }</span>
            { activeTab === tab.id && (
              <motion.span
                className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-600/20 to-purple-600/20 -z-10"
                layoutId="activeTab"
                transition={ { type: 'spring', duration: 0.6 } }
              />
            ) }
          </motion.button>
        )) }
      </div>

      {/* Tab Content */ }
      <motion.div
        className="bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/20 p-6 shadow-xl"
        initial={ { opacity: 0, y: 20 } }
        animate={ { opacity: 1, y: 0 } }
        transition={ { duration: 0.5 } }
      >
        { activeTab === 'tab-badges' && (
          <motion.div
            initial={ { opacity: 0 } }
            animate={ { opacity: 1 } }
            transition={ { duration: 0.3 } }
            className="space-y-6"
          >
            <Badges/>
          </motion.div>
        ) }

        { activeTab === 'tab-avatar' && (
          <motion.div
            initial={ { opacity: 0 } }
            animate={ { opacity: 1 } }
            transition={ { duration: 0.3 } }
            className="space-y-6"
          >
            <AvatarPage />
          </motion.div>
        ) }

        { activeTab === 'tab-profile' && (
          <motion.div
            initial={ { opacity: 0 } }
            animate={ { opacity: 1 } }
            transition={ { duration: 0.3 } }
            className="space-y-6"
          >
            <Profile user={ user! } openTabSection={ openTabSection }/>
          </motion.div>
        ) }

        { activeTab === 'tab-settings' && (
          <motion.div
            initial={ { opacity: 0 } }
            animate={ { opacity: 1 } }
            transition={ { duration: 0.3 } }
            className="space-y-6"
          >
            <Settings/>
          </motion.div>
        ) }

        {activeTab === 'tab-referral' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <Referral />
          </motion.div>
        )}

        { activeTab === 'tab-behavior' && (
          <motion.div
            initial={ { opacity: 0 } }
            animate={ { opacity: 1 } }
            transition={ { duration: 0.3 } }
            className="space-y-6"
          >
            <ModHistory />
          </motion.div>
        ) }

        { activeTab === 'tab-discord' && (
          <motion.div
            initial={ { opacity: 0 } }
            animate={ { opacity: 1 } }
            transition={ { duration: 0.3 } }
            className="space-y-6"
          >
            <Discord />
          </motion.div>
        ) }
        { showAvatarPopup && (
          <AvatarIntroPopup onClose={() => setShowAvatarPopup(false)} />
        ) }
      </motion.div>
    </div>
  )
}

export default UserSettings

