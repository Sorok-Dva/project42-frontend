'use client'

import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  Newspaper,
  MessageSquare,
  Settings,
  Shield,
  Database,
  BarChart3,
  ChevronDown,
  LogOut,
  Key,
  Gamepad2,
  ChartArea,
  Store,
} from 'lucide-react'
import { useUser } from 'contexts/UserContext'

interface AdminSidebarProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

interface NavItem {
  title: string
  icon: React.ReactNode
  href: string               // chemin **relatif** au préfixe
  subItems?: { title: string; href: string }[]
  disabled?: boolean
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, setIsOpen }) => {
  const { user } = useUser()
  const { pathname } = useLocation()
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})

  const isMod = ['Moderator', 'ModeratorTest'].includes(user?.role || '')
  const prefix = isMod ? '/moderator' : '/admin'

  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      href: '',
    },
    {
      title: 'Users',
      icon: <Users size={20} />,
      href: '/users',
      subItems: [
        { title: 'Liste', href: '/users' },
        { title: 'Surveillance', href: '/users/stalklist' },
      ],
    },
    {
      title: 'Clé Alpha',
      icon: <Key size={20} />,
      href: '/alpha-keys',
    },
    {
      title: 'News',
      icon: <Newspaper size={20} />,
      href: '/news',
      subItems: [
        { title: 'Liste', href: '/news' },
        { title: 'Créer', href: '/news/create' },
      ],
      disabled: !['SuperAdmin', 'Admin', 'Developer'].includes(user?.role || ''),
    },
    {
      title: 'Parties',
      icon: <Database size={20} />,
      href: '/rooms',
    },
    {
      title: 'Chat Logs',
      icon: <MessageSquare size={20} />,
      href: '/chats',
    },
    {
      title: 'Statistics',
      icon: <BarChart3 size={20} />,
      href: '/statistics',
    },
    {
      title: 'Boutique',
      icon: <Store size={20} />,
      href: '/shop',
      subItems: [
        { title: 'Gestion', href: '/shop' },
        { title: 'Transactions', href: '/shop/transactions' },
      ],
      disabled: !['SuperAdmin', 'Admin', 'Developer'].includes(user?.role || ''),
    },
    {
      title: 'Cartes',
      icon: <Gamepad2 size={20} />,
      href: '/cards',
      disabled: !['SuperAdmin', 'Admin', 'Developer'].includes(user?.role || ''),
    },
    {
      title: 'Modération',
      icon: <Shield size={20} />,
      href: '/moderation',
    },
    {
      title: 'Paramètres',
      icon: <Settings size={20} />,
      href: '/settings',
      disabled: !['SuperAdmin', 'Admin', 'Developer'].includes(user?.role || ''),
    },
    {
      title: 'Grafana',
      icon: <ChartArea size={20} />,
      href: process.env.REACT_APP_GRAFANA_DASHBOARD || '/',
      disabled: !['SuperAdmin', 'Admin', 'Developer'].includes(user?.role || ''),
    },
  ]

  const toggleExpand = (title: string) => {
    setExpandedItems(prev => ({ ...prev, [title]: !prev[title] }))
  }

  const isActive = (relativeHref: string) =>
    pathname.startsWith(prefix + relativeHref)

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      <motion.div
        className={`fixed top-0 left-0 h-full bg-gradient-to-b from-black/90 to-blue-900/30 backdrop-blur-md border-r border-blue-500/30 w-64 z-50 overflow-y-auto transition-transform transform ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        initial={false}
        animate={{ width: isOpen ? 256 : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Logo */}
        <div className="p-6 border-b border-blue-500/30">
          {/* … */}
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems
              .filter(item => !item.disabled)
              .map(item => (
                <li key={item.title}>
                  {item.subItems ? (
                    <>
                      <button
                        onClick={() => toggleExpand(item.title)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                          isActive(item.href)
                            ? 'bg-blue-900/50 text-white'
                            : 'text-blue-300 hover:bg-blue-900/30 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center">
                          <span className="mr-3">{item.icon}</span>
                          <span>{item.title}</span>
                        </div>
                        <ChevronDown
                          size={16}
                          className={`transition-transform ${
                            expandedItems[item.title] ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      <AnimatePresence>
                        {expandedItems[item.title] && (
                          <motion.ul
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="ml-6 mt-2 space-y-1 overflow-hidden"
                          >
                            {item.subItems.map(sub => (
                              <li key={sub.title}>
                                <Link to={prefix + sub.href}>
                                  <span
                                    className={`block p-2 rounded-lg transition-colors ${
                                      isActive(sub.href)
                                        ? 'bg-blue-900/50 text-white'
                                        : 'text-blue-300 hover:bg-blue-900/30 hover:text-white'
                                    }`}
                                  >
                                    {sub.title}
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link to={prefix + item.href}>
                      <span
                        className={`flex items-center p-3 rounded-lg transition-colors ${
                          isActive(item.href)
                            ? 'bg-blue-900/50 text-white'
                            : 'text-blue-300 hover:bg-blue-900/30 hover:text-white'
                        }`}
                      >
                        <span className="mr-3">{item.icon}</span>
                        <span>{item.title}</span>
                      </span>
                    </Link>
                  )}
                </li>
              ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-500/30">
          <button
            onClick={() => {
              window.location.href = '/'
            }}
            className="flex items-center w-full p-3 rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors"
          >
            <LogOut size={20} className="mr-3" />
            <span>Retour sur Project 42</span>
          </button>
        </div>
      </motion.div>
    </>
  )
}

export default AdminSidebar
