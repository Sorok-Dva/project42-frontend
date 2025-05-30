'use client'

import clsx from 'clsx'
import { Link, useLocation } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Notification from './Notification'
import Profile from './Profile'
import Login from 'components/Layouts/navbar/Login'
import logo from 'assets/img/logo2.png'
import { Img as Image } from 'react-image'
import { useUser } from 'contexts/UserContext'
import Friends from 'components/Layouts/navbar/Friends'

const menuData = [
  { id: 1, title: 'Accueil', url: '/', icon: 'ti-home' },
  { id: 2, title: 'Actualités', url: '/news', icon: 'ti-news' },
  { id: 3, title: 'Stations', url: '/stations/', icon: 'ti-building' },
  { id: 4, title: 'Classement', url: '/leaderboard/players/', icon: 'ti-trophy' },
  { id: 5, title: 'Boutique', url: '/shop', isUser: true, icon: 'ti-shopping-cart' },
  {
    id: 6,
    title: 'Admin',
    isAdmin: true,
    icon: 'ti-settings',
    submenus: [
      { id: 1, title: 'Dashboard', url: '/admin', icon: 'ti-dashboard' },
      { id: 2, title: 'Joueurs', url: '/admin/users', icon: 'ti-users' },
      { id: 3, title: 'Clés Alpha', url: '/admin/alpha-keys', icon: 'ti-key' },
      { id: 4, title: 'News', url: '/admin/news', icon: 'ti-article' },
    ],
  },
  {
    id: 7,
    title: 'Modération',
    isMod: true,
    icon: 'ti-shield',
    submenus: [
      { id: 1, title: 'Dashboard', url: '/moderator', icon: 'ti-dashboard' },
      { id: 2, title: 'Joueurs', url: '/moderator/users', icon: 'ti-users' },
      { id: 3, title: 'Clés Alpha', url: '/moderator/alpha-keys', icon: 'ti-key' },
    ],
  },
]

type Submenu = { id: number; title: string; url: string; icon?: string }

const Navbar: React.FC<{ isTransparent?: boolean }> = ({ isTransparent }) => {
  const { user } = useUser()
  const [navOpen, setNavOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null)

  const location = useLocation()
  const pathname = location.pathname

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isActiveParent = (subs?: Submenu[]) =>
    subs?.some((s) => s.url === pathname)

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        (scrolled || !isTransparent) && 'backdrop-blur-xl bg-black/20 border-b border-white/10'
      )}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-3">
              <div className="relative">
                <Image className="h-10 w-auto" src={logo || '/placeholder.svg'} alt="Project 42" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-lg" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hidden sm:block">
                Project 42
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="sm:hidden lg:flex items-center space-x-1">
            {menuData.map(({ id, title, url, icon, isUser, isAdmin, isMod, submenus }) => {
              if (isUser && !user) return null
              if (isAdmin && !user?.isAdmin) return null
              if (isMod && !['Moderator', 'ModeratorTest'].includes(user?.role || ''))
                return null

              // Simple link
              if (url) {
                return (
                  <motion.div key={id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to={url}
                      className={clsx(
                        'flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200',
                        'hover:bg-white/10 hover:backdrop-blur-sm',
                        pathname === url
                          ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-500/30'
                          : 'text-gray-300 hover:text-white'
                      )}
                    >
                      <i className={`ti ${icon} text-sm`} />
                      <span className="font-medium">{title}</span>
                    </Link>
                  </motion.div>
                )
              }

              // Parent with submenu
              return (
                <div
                  key={id}
                  className="relative"
                  onMouseEnter={() => setOpenSubmenu(id)}
                  onMouseLeave={() => setOpenSubmenu(null)}
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className={clsx(
                      'flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200',
                      'hover:bg-white/10 hover:backdrop-blur-sm',
                      isActiveParent(submenus)
                        ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-500/30'
                        : 'text-gray-300 hover:text-white'
                    )}
                  >
                    <i className={`ti ${icon} text-sm`} />
                    <span className="font-medium">{title}</span>
                    <i
                      className={clsx(
                        'ti ti-chevron-down text-xs transition-transform',
                        openSubmenu === id && 'rotate-180'
                      )}
                    />
                  </motion.button>

                  <AnimatePresence>
                    {openSubmenu === id && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute z-50 top-full left-0 mt-2 w-48 bg-black/80 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl overflow-hidden"
                      >
                        {submenus?.map(({ id: subId, title: subTitle, url: subUrl, icon: subIcon }) => (
                          <Link
                            key={subId}
                            to={subUrl}
                            className={clsx(
                              'flex items-center space-x-3 px-4 py-3 transition-all duration-200',
                              pathname === subUrl
                                ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300'
                                : 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20'
                            )}
                          >
                            <i className={`ti ${subIcon} text-sm`} />
                            <span className="font-medium">{subTitle}</span>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </nav>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setNavOpen((o) => !o)}
            className="lg:hidden p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20"
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <motion.span
                animate={navOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                className="w-6 h-0.5 bg-white block transition-all duration-300"
              />
              <motion.span
                animate={navOpen ? { opacity: 0 } : { opacity: 1 }}
                className="w-6 h-0.5 bg-white block mt-1 transition-all duration-300"
              />
              <motion.span
                animate={navOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                className="w-6 h-0.5 bg-white block mt-1 transition-all duration-300"
              />
            </div>
          </motion.button>

          {/* User Actions */}
          <div className="sm:hidden lg:flex items-center space-x-3">
            {!user ? <Login /> : <><Friends /><Notification /><Profile /></>}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {navOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-black/90 backdrop-blur-xl border-t border-white/10"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {menuData.map(({ id, title, url, icon, isUser, isAdmin, isMod, submenus }) => {
                if (isUser && !user) return null
                if (isAdmin && !user?.isAdmin) return null
                if (isMod && !['Moderator', 'ModeratorTest'].includes(user?.role || ''))
                  return null

                if (url) {
                  return (
                    <Link
                      key={id}
                      to={url}
                      onClick={() => setNavOpen(false)}
                      className={clsx(
                        'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200',
                        pathname === url
                          ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300'
                          : 'text-gray-300 hover:text-white hover:bg-white/10'
                      )}
                    >
                      <i className={`ti ${icon} text-sm`} />
                      <span className="font-medium">{title}</span>
                    </Link>
                  )
                }

                return (
                  <div key={id}>
                    <button
                      onClick={() => setOpenSubmenu((prev) => (prev === id ? null : id))}
                      className={clsx(
                        'flex items-center justify-between w-full px-4 py-3 rounded-lg transition-all duration-200',
                        isActiveParent(submenus)
                          ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300'
                          : 'text-gray-300 hover:text-white hover:bg-white/10'
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <i className={`ti ${icon} text-sm`} />
                        <span className="font-medium">{title}</span>
                      </div>
                      <motion.i
                        animate={{ rotate: openSubmenu === id ? 180 : 0 }}
                        className="ti ti-chevron-down text-xs"
                      />
                    </button>

                    <AnimatePresence>
                      {openSubmenu === id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="ml-4 mt-2 space-y-1"
                        >
                          {submenus?.map(({ id: subId, title: subTitle, url: subUrl, icon: subIcon }) => (
                            <Link
                              key={subId}
                              to={subUrl}
                              onClick={() => setNavOpen(false)}
                              className={clsx(
                                'flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200',
                                pathname === subUrl
                                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300'
                                  : 'text-gray-400 hover:text-white hover:bg-white/10'
                              )}
                            >
                              <i className={`ti ${subIcon} text-sm`} />
                              <span className="font-medium">{subTitle}</span>
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}

              {/* Mobile User Actions */}
              {!user ? (
                <div className="pt-4 border-t border-white/10">
                  <Login />
                </div>
              ) : (
                <div className="pt-4 border-t border-white/10 flex items-center space-x-3">
                  <Friends />
                  <Notification />
                  <Profile />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

export default Navbar
