import '../assets/vendor/nucleo/css/nucleo.css'

import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from 'components/Admin/Sidebar'
import { useMediaQuery } from 'hooks/useMediaQuery'
import { useUser } from 'contexts/UserContext'

const AdminLayout : React.FC = (props) => {
  {
    const { user } = useUser()
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const isDesktop = true

    if (!user || user.role === 'User' || user.role === 'Banned') {
      window.location.href = '/'
      return
    }

    return (
      <div className="min-h-screen bg-black bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black text-white">
        {/* Background stars */}
        <div className="fixed inset-0 z-0">
          {Array.from({ length: 100 }).map((_, i) => {
            const size = Math.random() * 3 + 1
            return (
              <div
                key={`star-${i}`}
                className="absolute rounded-full"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  backgroundColor: '#ffffff',
                  opacity: Math.random() * 0.8 + 0.2,
                  animation: `twinkle ${Math.random() * 5 + 3}s infinite ${Math.random() * 5}s`,
                }}
              />
            )
          })}
        </div>

        <div className="flex h-screen relative z-10">
          {/* Sidebar */}
          <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

          {/* Main content */}
          <div
            className={`flex-1 transition-all duration-300 ${sidebarOpen && isDesktop ? 'ml-72' : 'ml-0'} overflow-auto`}
          >
            {/* Header */}
            <header className="bg-gradient-to-r from-black/80 to-blue-900/30 backdrop-blur-sm border-b border-blue-500/30 shadow-lg p-4 sticky top-0 z-30">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  {!isDesktop && (
                    <button
                      onClick={() => setSidebarOpen(!sidebarOpen)}
                      className="mr-4 text-blue-400 hover:text-blue-300"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                  )}
                  <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    Panel d'administration
                  </h1>
                </div>
              </div>
            </header>

            {/* Dashboard content */}
            <Outlet />

            {/* Footer */}
            <footer className="bg-gradient-to-r from-black/80 to-blue-900/30 backdrop-blur-sm border-t border-blue-500/30 p-4 text-center text-blue-300 text-sm">
              <p>Project 42 Admin Dashboard • v{process.env.REACT_APP_GAME_VERSION}</p>
            </footer>
          </div>
        </div>
      </div>
    )
  }
}

export default AdminLayout
