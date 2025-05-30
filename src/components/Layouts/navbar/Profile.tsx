'use client'

import type React from 'react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Img as Image } from 'react-image'
import clsx from 'clsx'
import useDropdown from 'hooks/useDropdown'
import { useUser } from 'contexts/UserContext'

const Profile: React.FC = () => {
  const { user, logout } = useUser()
  const { open, toggleOpen } = useDropdown()

  // Coefficient pour la formule de niveau (ajusté pour une progression plus douce)
  // Formula: level = floor(levelCoefficient * sqrt(points)) + 1
  const levelCoefficient = 0.32

  /**
   * Calcule le niveau d'un utilisateur basé sur ses points.
   * La formule est: niveau = floor(levelCoefficient * sqrt(points)) + 1
   * @param {number} points Le nombre de points de l'utilisateur.
   * @returns {number} Le niveau calculé.
   */
  const calculateLevel = (points: number): number => {
    const safePoints = Math.max(0, points)
    return Math.floor(levelCoefficient * Math.sqrt(safePoints)) + 1
  }

  let progressPercentage = 0
  let nextLevelPointsDisplay = ''

  if (user) {
    const currentPoints = user.points || 0
    const currentLevel = calculateLevel(currentPoints)

    const pointsRequiredForCurrentLevel = currentLevel === 1 ? 0 : Math.ceil(Math.pow((currentLevel - 1) / levelCoefficient, 2))

    const pointsRequiredForNextLevel = Math.ceil(Math.pow(currentLevel / levelCoefficient, 2))

    const pointsEarnedInCurrentLevel = currentPoints - pointsRequiredForCurrentLevel

    const totalPointsForCurrentLevel = pointsRequiredForNextLevel - pointsRequiredForCurrentLevel

    progressPercentage = totalPointsForCurrentLevel > 0
      ? (pointsEarnedInCurrentLevel / totalPointsForCurrentLevel) * 100
      : 0 // Si pas de points à gagner pour le niveau, la progression est 0

    if (progressPercentage > 100) {
      progressPercentage = 100
    }
  }

  const handleLogout = () => {
    logout()
    localStorage.removeItem('token')
  }

  useEffect(() => {
    // Gère la fermeture du dropdown lorsque l'utilisateur clique en dehors
    const handleMouseUp = (event: MouseEvent) => {
      // Vérifie si le clic est en dehors du dropdown et du bouton d'ouverture
      const dropdownElement = document.getElementById('profile-dropdown-menu')
      const toggleButton = document.getElementById('profile-toggle-button')

      if (open && dropdownElement && toggleButton && !dropdownElement.contains(event.target as Node) && !toggleButton.contains(event.target as Node)) {
        toggleOpen()
      }
    }

    if (open) {
      document.addEventListener('mouseup', handleMouseUp)
    } else {
      document.removeEventListener('mouseup', handleMouseUp)
    }
    return () => {
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [open, toggleOpen])


  if (!user) return null

  return (
    <div className="relative flex-shrink-0">
      <div
        id="profile-toggle-button" // Ajout d'un ID pour la référence dans useEffect
        onClick={toggleOpen}
        className="flex items-center gap-3 px-3 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 cursor-pointer hover:bg-slate-700/50 transition-all duration-300"
      >
        <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-indigo-500/50 shadow-lg shadow-indigo-500/20">
          <Image className="w-full h-full object-cover" src={user.avatar || '/placeholder.svg'} alt="profile" />
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-transparent"></div>
        </div>
        <span className="text-slate-200 font-medium hidden lg:block">{user.nickname}</span>
        <i className="ti ti-chevron-down text-slate-400 hidden lg:block"></i>
      </div>

      <div
        id="profile-dropdown-menu" // Ajout d'un ID pour la référence dans useEffect
        className={clsx(
          'absolute right-0 top-full mt-2 w-64 bg-slate-900/90 backdrop-blur-md rounded-lg border border-slate-700/50 shadow-xl shadow-indigo-900/20 z-50 transform transition-all duration-300 origin-top-right',
          open ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none',
        )}
      >
        <div className="p-4 space-y-3">
          <div className="bg-slate-800/70 rounded-lg p-3 border border-slate-700/50">
            <div className="flex justify-between items-center">
              <span className="text-slate-100 font-medium">{user.nickname}</span>
              {/* Badges could be added here */}
            </div>
            <div className="mt-2">
              <span className="text-sm text-slate-400">Niveau {user.level}</span>
              <div className="h-2 bg-slate-700/50 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
                  style={{ width: `${progressPercentage}%` }} // Largeur dynamique
                ></div>
              </div>
              <div className="flex justify-end text-xs font-medium text-gray-400 mt-1">
                <span>{nextLevelPointsDisplay}</span> {/* Affichage des points de progression */}
              </div>
            </div>
          </div>

          <Link
            to="#"
            data-profile={user.nickname}
            className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-800/70 text-slate-300 hover:text-slate-100 transition-colors"
          >
            <i className="ti ti-user text-indigo-400"></i>
            Voir mon profil
          </Link>

          <Link
            to="/account/settings"
            className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-800/70 text-slate-300 hover:text-slate-100 transition-colors"
          >
            <i className="ti ti-settings text-indigo-400"></i>
            Mon compte
          </Link>

          <div className="border-t border-slate-700/50 my-2"></div>

          <button
            className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-red-900/20 text-slate-300 hover:text-red-300 transition-colors text-left"
            onClick={handleLogout}
          >
            <i className="ti ti-logout text-red-400"></i>
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile
