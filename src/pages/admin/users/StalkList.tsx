'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Filter,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  ChevronDown, Eye,
} from 'lucide-react'
import { Img as Image } from 'react-image'
import { useUser } from 'contexts/UserContext'
import { useAuth } from 'contexts/AuthContext'
import { User } from 'types/user'

const StalkListPage: React.FC = () => {
  const { token } = useAuth()
  const { user: _user } = useUser()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [users, setUsers] = useState<(User & { reason: string, moderator: string, expirationDate: Date | null })[]>([])
  const [loading, setLoading] = useState(true)
  const [showRowsDropdown, setShowRowsDropdown] = useState(false)
  const [sortField, setSortField] = useState<keyof User>('updatedAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)

  // Simuler un appel API pour récupérer les utilisateurs
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users/stalked', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await response.json()
        setUsers(data)
        setLoading(false)
      } catch (err) {
        console.error('Failed to fetch users', err)
        setUsers([])
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // Filtrer les utilisateurs en fonction de la recherche et des filtres
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user?.email.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSearch
  })

  // Trier les utilisateurs
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if ((a[sortField] ?? '') < (b[sortField] ?? '')) return sortDirection === 'asc' ? -1: 1
    if ((a[sortField] ?? '') > (b[sortField] ?? '')) return sortDirection === 'asc' ? 1: -1
    return 0
  })

  // Pagination
  const indexOfLastUser = currentPage * rowsPerPage
  const indexOfFirstUser = indexOfLastUser - rowsPerPage
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser)
  const totalPages = Math.ceil(sortedUsers.length / rowsPerPage)

  // Gérer le tri
  const handleSort = (field : keyof User) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc': 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Pagination function
  const paginate = (pageNumber : number) => setCurrentPage(pageNumber)

  if (!_user) return
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Barre supérieure */ }
      <div
        className="bg-gradient-to-r from-black/80 to-blue-900/30 backdrop-blur-sm border-b border-blue-500/30 shadow-lg p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h1
              className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Liste des utilisateurs surveillés
            </h1>
          </div>
        </div>
      </div>

      {/* Contenu des utilisateurs */ }
      <div className="p-4 md:p-6 min-h-screen">
        <motion.div
          initial={ { opacity: 0, y: 20 } }
          animate={ { opacity: 1, y: 0 } }
          transition={ { duration: 0.5 } }
          className="bg-gradient-to-r from-black/60 to-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-500/30 overflow-visible shadow-lg"
        >
          {/* En-tête du tableau */ }
          <div className="p-6 border-b border-blue-500/30">
            <div
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center">
                <h2 className="text-xl font-bold">Liste des
                  Utilisateurs Surveillés</h2>
                <span
                  className="ml-2 px-2 py-1 bg-blue-900/40 text-blue-300 text-xs rounded-full">
                  { filteredUsers.length } utilisateurs surveillés
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={ 16 }/>
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={ searchQuery }
                    onChange={ (e) => setSearchQuery(e.target.value) }
                    className="w-full md:w-64 bg-black/40 border border-blue-500/30 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div className="relative">
                  <button
                    onClick={ () => setShowFilterDropdown(!showFilterDropdown) }
                    className="px-4 py-2 bg-black/40 hover:bg-black/60 text-blue-300 hover:text-white border border-blue-500/30 rounded-lg transition-all flex items-center gap-2"
                  >
                    <Filter size={ 16 }/>
                    <span>Filtres</span>
                    <ChevronDown size={ 16 }/>
                  </button>
                </div>

                <button
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all flex items-center gap-2">
                  <UserPlus size={ 16 }/>
                  <span>Ajouter</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tableau */ }
          <div>
            <table className="w-full">
              <thead>
                <tr className="bg-black/40 border-b border-blue-500/30">
                  <th
                    className="p-4 text-left cursor-pointer hover:text-blue-300"
                    onClick={ () => handleSort('id') }
                  >
                    <div className="flex items-center">
                      <span>ID</span>
                      { sortField === 'id' && (
                        <span
                          className="ml-1">{ sortDirection === 'asc' ? '↑': '↓' }</span>
                      ) }
                    </div>
                  </th>
                  <th
                    className="p-4 text-left cursor-pointer hover:text-blue-300"
                    onClick={ () => handleSort('nickname') }
                  >
                    <div className="flex items-center">
                      <span>Utilisateur</span>
                      { sortField === 'nickname' && (
                        <span
                          className="ml-1">{ sortDirection === 'asc' ? '↑': '↓' }</span>
                      ) }
                    </div>
                  </th>
                  { ['SuperAdmin', 'Admin'].includes(_user?.role || '') && (
                    <th
                      className="p-4 text-left cursor-pointer hover:text-blue-300"
                      onClick={ () => handleSort('email') }
                    >
                      <div className="flex items-center">
                        <span>Email</span>
                        { sortField === 'email' && <span
                          className="ml-1">{ sortDirection === 'asc' ? '↑': '↓' }</span> }
                      </div>
                    </th>
                  )}
                  <th
                    className="p-4 text-left cursor-pointer hover:text-blue-300"
                    onClick={ () => handleSort('updatedAt') }
                  >
                    <div className="flex items-center">
                      <span>Dernière Connexion</span>
                      { sortField === 'updatedAt' && (
                        <span
                          className="ml-1">{ sortDirection === 'asc' ? '↑': '↓' }</span>
                      ) }
                    </div>
                  </th>
                  <th className="p-4 text-left">Raison</th>
                  <th className="p-4 text-left">Surveillance jusqu'au</th>
                  <th className="p-4 text-left">Ajouté par</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                { loading ? (
                  <tr>
                    <td colSpan={ 9 } className="p-4 text-center">
                      <div
                        className="flex justify-center items-center space-x-2">
                        <div
                          className="w-4 h-4 rounded-full bg-blue-500 animate-pulse"></div>
                        <div
                          className="w-4 h-4 rounded-full bg-purple-500 animate-pulse animation-delay-200"></div>
                        <div
                          className="w-4 h-4 rounded-full bg-pink-500 animate-pulse animation-delay-400"></div>
                      </div>
                    </td>
                  </tr>
                ): currentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={ 9 } className="p-4 text-center">
                    Aucun utilisateur trouvé
                    </td>
                  </tr>
                ): (
                  currentUsers.map((user) => (
                    <tr key={ user.id }
                      className="border-b border-blue-500/10 hover:bg-blue-900/10">
                      <td className="p-4">#{ user.id }</td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <div
                            className="w-8 h-8 rounded-full overflow-hidden mr-3">
                            <Image
                              src={ user.avatar || '/placeholder.svg?height=32&width=32' }
                              alt={ user.nickname }
                              width={ 32 }
                              height={ 32 }
                              className="object-cover"
                            />
                          </div>
                          <span data-profile={user.nickname} className="cursor-pointer">{ user.nickname }</span>
                        </div>
                      </td>
                      { ['SuperAdmin', 'Admin'].includes(_user?.role || '') && (
                        <td className="p-4">{ user.email }</td>
                      )}
                      <td className="p-4">
                        { new Date(user.updatedAt || 'now').toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        }) }
                      </td>
                      <td className="p-4">{ user.reason }</td>
                      <td className="p-4">{ user.expirationDate ? user.expirationDate?.toLocaleDateString() : 'Nouvel ordre' }</td>
                      <td className="p-4">{ user.moderator }</td>
                      <td className="p-4">
                        <button className="text-green-300 hover:text-white mr-2" onClick={() => window.location.href = `/${_user.role === 'Moderator' ? 'moderator' : 'admin'}/users/stalk/${user.id}`}>
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) }
              </tbody>
            </table>
          </div>

          {/* Pagination */ }
          <div
            className="p-4 flex flex-col sm:flex-row items-center justify-between border-t border-blue-500/30">
            <div className="text-sm text-blue-300 mb-4 sm:mb-0">
              Affichage de <span
                className="font-medium">{ indexOfFirstUser + 1 }</span> à{ ' ' }
              <span
                className="font-medium">{ Math.min(indexOfLastUser, filteredUsers.length) }</span> sur{ ' ' }
              <span
                className="font-medium">{ filteredUsers.length }</span> utilisateurs
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative mr-4">
                <button
                  onClick={ () => setShowRowsDropdown(!showRowsDropdown) }
                  className="px-3 py-1 bg-black/40 hover:bg-black/60 text-blue-300 hover:text-white border border-blue-500/30 rounded-lg transition-all flex items-center gap-1"
                >
                  { rowsPerPage } par page <ChevronDown size={ 14 }/>
                </button>

                { showRowsDropdown && (
                  <div
                    className="absolute right-0 mt-1 w-32 bg-black/90 border border-blue-500/30 rounded-lg shadow-lg z-50">
                    { [10, 25, 50, 100].map((num) => (
                      <button
                        key={ num }
                        onClick={ () => {
                          setRowsPerPage(num)
                          setShowRowsDropdown(false)
                          setCurrentPage(1)
                        } }
                        className={ `block w-full text-left px-4 py-2 hover:bg-blue-900/30 ${
                          rowsPerPage === num ? 'text-blue-400': 'text-white'
                        }` }
                      >
                        { num } par page
                      </button>
                    )) }
                  </div>
                ) }
              </div>

              <button
                className="p-2 bg-black/40 hover:bg-black/60 text-blue-300 hover:text-white border border-blue-500/30 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={ () => paginate(currentPage - 1) }
                disabled={ currentPage === 1 }
              >
                <ChevronLeft size={ 18 }/>
              </button>

              { Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                let pageNumber : number

                if (totalPages <= 5) {
                  pageNumber = index + 1
                } else if (currentPage <= 3) {
                  pageNumber = index + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + index
                } else {
                  pageNumber = currentPage - 2 + index
                }

                return (
                  <button
                    key={ pageNumber }
                    onClick={ () => paginate(pageNumber) }
                    className={ `px-3 py-1 rounded-lg transition-all ${
                      currentPage === pageNumber
                        ? 'bg-blue-600 text-white'
                        : 'bg-black/40 hover:bg-black/60 text-blue-300 hover:text-white border border-blue-500/30'
                    }` }
                  >
                    { pageNumber }
                  </button>
                )
              }) }

              { totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="text-blue-300">...</span>
                  <button
                    onClick={ () => paginate(totalPages) }
                    className="px-3 py-1 bg-black/40 hover:bg-black/60 text-blue-300 hover:text-white border border-blue-500/30 rounded-lg transition-all"
                  >
                    { totalPages }
                  </button>
                </>
              ) }

              <button
                className="p-2 bg-black/40 hover:bg-black/60 text-blue-300 hover:text-white border border-blue-500/30 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={ () => paginate(currentPage + 1) }
                disabled={ currentPage === totalPages }
              >
                <ChevronRight size={ 18 }/>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default StalkListPage
