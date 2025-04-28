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
} from 'lucide-react'

interface AdminSidebarProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

interface NavItem {
  title: string
  icon: React.ReactNode
  href: string
  subItems?: { title: string; href: string }[]
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, setIsOpen }) => {
  const { pathname } = useLocation()
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})

  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      href: '/admin',
    },
    {
      title: 'Users',
      icon: <Users size={20} />,
      href: '/admin/users',
      subItems: [
        { title: 'Liste', href: '/admin/users' },
        { title: 'Joueurs sous Surveillance', href: '/admin/users/stalklist' },
      ],
    },
    {
      title: 'Clé Alpha',
      icon: <Key size={20} />,
      href: '/admin/alpha-keys',
    },
    {
      title: 'News',
      icon: <Newspaper size={20} />,
      href: '/admin/news',
      subItems: [
        { title: 'Liste', href: '/admin/news' },
        { title: 'Créer une news', href: '/admin/news/create' },
      ],
    },
    {
      title: 'Parties',
      icon: <Database size={20} />,
      href: '/admin/rooms',
    },
    {
      title: 'Chat Logs',
      icon: <MessageSquare size={20} />,
      href: '/admin/chats',
    },
    {
      title: 'Statistics',
      icon: <BarChart3 size={20} />,
      href: '/admin/statistics',
    },
    {
      title: 'Cartes',
      icon: <Gamepad2 size={20} />,
      href: '/admin/cards',
    },
    {
      title: 'Modération',
      icon: <Shield size={20} />,
      href: '/admin/moderation',
    },
    {
      title: 'Paramètres',
      icon: <Settings size={20} />,
      href: '/admin/settings',
    },
    {
      title: 'Grafana',
      icon: <ChartArea size={20} />,
      href: process.env.REACT_APP_GRAFANA_DASHBOARD || '/admin',
    },
  ]

  console.log(navItems)

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [title]: !prev[title],
    }))
  }

  const isActive = (href: string) => pathname.indexOf(href) > -1

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsOpen(false)} />}

      {/* Sidebar */}
      <motion.div
        className={`fixed top-0 left-0 h-full bg-gradient-to-b from-black/90 to-blue-900/30 backdrop-blur-md border-r border-blue-500/30 w-64 z-50 overflow-y-auto transition-transform transform ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        initial={false}
        animate={{
          width: isOpen ? 256 : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Logo */}
        <div className="p-6 border-b border-blue-500/30">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-3">
              <span className="font-bold text-lg">P42</span>
            </div>
            <div>
              <h2 className="text-xl font-bold">Project 42</h2>
              <p className="text-xs text-blue-300">Admin Control Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.title}>
                {item.subItems ? (
                  <div>
                    <button
                      onClick={() => toggleExpand(item.title)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${isActive(item.href) ? 'bg-blue-900/50 text-white' : 'text-blue-300 hover:bg-blue-900/30 hover:text-white'}`}
                    >
                      <div className="flex items-center">
                        <span className="mr-3">{item.icon}</span>
                        <span>{item.title}</span>
                      </div>
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${expandedItems[item.title] ? 'rotate-180' : ''}`}
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
                          {item.subItems.map((subItem) => (
                            <li key={subItem.title}>
                              <Link to={subItem.href}>
                                <span
                                  className={`block p-2 rounded-lg transition-colors ${isActive(subItem.href) ? 'bg-blue-900/50 text-white' : 'text-blue-300 hover:bg-blue-900/30 hover:text-white'}`}
                                >
                                  {subItem.title}
                                </span>
                              </Link>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link to={item.href}>
                    <span
                      className={`flex items-center p-3 rounded-lg transition-colors ${isActive(item.href) ? 'bg-blue-900/50 text-white' : 'text-blue-300 hover:bg-blue-900/30 hover:text-white'}`}
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

        {/* Logout button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-500/30">
          <button onClick={() => { window.location.href = '/' }} className="flex items-center w-full p-3 rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors">
            <LogOut size={20} className="mr-3" />
            <span>Retour sur Project 42</span>
          </button>
        </div>
      </motion.div>
    </>
  )
}

export default AdminSidebar
