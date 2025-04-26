'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Filter,
  UserPlus,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Ban,
  UserCheck,
  Trash2,
  Download,
  AlertTriangle,
  Check,
  ChevronDown,
  Eye,
} from 'lucide-react'
import { Img as Image } from 'react-image'
import { User, useUser } from 'contexts/UserContext'
import { useAuth } from 'contexts/AuthContext'
import { rolify } from 'utils/rolify'

// Rôles et leurs couleurs
const roleColors = {
  SuperAdmin: 'bg-red-500 text-white',
  Admin: 'bg-red-700 text-white',
  Developer: 'bg-blue-600 text-white',
  Moderator: 'bg-green-700 text-white',
  ModeratorTest: 'bg-green-500 text-white',
  Animator: 'bg-orange-400 text-white',
  User: 'bg-gray-600 text-white',
  Banned: 'bg-red-600 text-white',
}

const UsersPage: React.FC = () => {
  const { token } = useAuth()
  const { user: _user } = useUser()
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [showRowsDropdown, setShowRowsDropdown] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [sortField, setSortField] = useState<keyof User>('updatedAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [filters, setFilters] = useState({
    role: '',
    status: '',
  })
  const [actionDropdown, setActionDropdown] = useState<string | null>(null)

  // Simuler un appel API pour récupérer les utilisateurs
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users', {
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
      user?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user?.registerIp?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user?.lastLoginIp?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRoleFilter = filters.role === '' || user.role === filters.role
    const matchesStatusFilter =
      filters.status === '' ||
      (filters.status === 'validated' && user.validated) ||
      (filters.status === 'not-validated' && !user.validated) ||
      (filters.status === 'banned' && user.role === 'Banned')

    return matchesSearch && matchesRoleFilter && matchesStatusFilter
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

  // Gérer la sélection des utilisateurs
  const handleSelectAll = () => {
    if (selectedUsers.length === currentUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(currentUsers.map((user) => user.id.toString()))
    }
  }

  const handleSelectUser = (userId : string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId))
    } else {
      setSelectedUsers([...selectedUsers, userId])
    }
  }

  // Gérer le tri
  const handleSort = (field : keyof User) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc': 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Exporter en CSV
  const exportToCSV = () => {
    if (!_user || !_user.isAdmin) return
    const headers = ['ID', 'Pseudo', 'Email', 'Rôle', 'Statut', 'Dernière Connexion', 'IP d\'inscription', 'Dernière IP', 'Date d\'inscription']

    const csvData = filteredUsers.map((user) => [
      user.id,
      user.nickname,
      user.email || 'Anonymisé',
      user.role,
      user.validated ? 'Validé': user.role === 'Banned' ? 'Banni': 'Non validé',
      new Date(user.updatedAt || 'now').toLocaleString('fr-FR'),
      user.registerIp,
      user.lastLoginIp,
      new Date(user.createdAt || 'now').toLocaleString('fr-FR'),
    ])

    const csvContent = [headers.join(','), ...csvData.map((row) => row.join(','))].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `utilisateurs_${ new Date().toISOString().split('T')[0] }.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Actions sur les utilisateurs
  const handleWarnUser = async (userId : string) => {
    try {
      // Appel API pour avertir l'utilisateur
      const response = await fetch(`/api/admin/users/${ userId }/warn`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Erreur lors de l\'avertissement')
      // Mettre à jour l'interface utilisateur si nécessaire
      setActionDropdown(null)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleBanUser = async (userId : string) => {
    try {
      // Appel API pour bannir l'utilisateur
      const response = await fetch(`/api/admin/users/${ userId }/ban`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Erreur lors du bannissement')

      // Mettre à jour l'état local
      setUsers(users.map((user) => (user.id.toString() === userId ? {
        ...user,
        banned: true,
      }: user)))
      setActionDropdown(null)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleValidateUser = async (userId : string) => {
    try {
      // Appel API pour valider le compte
      const response = await fetch(`/api/admin/users/${ userId }/validate`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Erreur lors de la validation')

      // Mettre à jour l'état local
      setUsers(users.map((user) => (user.id.toString() === userId ? {
        ...user,
        validated: true,
      }: user)))
      setActionDropdown(null)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  // Pagination function
  const paginate = (pageNumber : number) => setCurrentPage(pageNumber)

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Barre supérieure */ }
      <div
        className="bg-gradient-to-r from-black/80 to-blue-900/30 backdrop-blur-sm border-b border-blue-500/30 shadow-lg p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h1
              className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Gestion des Utilisateurs
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
                  Utilisateurs</h2>
                <span
                  className="ml-2 px-2 py-1 bg-blue-900/40 text-blue-300 text-xs rounded-full">
                  { filteredUsers.length } utilisateurs
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

                  { showFilterDropdown && (
                    <div
                      className="absolute right-0 mt-2 w-64 bg-black/90 border border-blue-500/30 rounded-lg shadow-lg z-50 p-4">
                      <div className="mb-4">
                        <label
                          className="block text-blue-300 text-sm mb-2">Rôle</label>
                        <select
                          value={ filters.role }
                          onChange={ (e) => setFilters({
                            ...filters,
                            role: e.target.value,
                          }) }
                          className="w-full bg-black/60 border border-blue-500/30 rounded-lg px-3 py-2 text-white"
                        >
                          <option value="">Tous les rôles</option>
                          <option value="SuperAdmin">SuperAdmin</option>
                          <option value="Admin">Administrateur</option>
                          <option value="Developer">Développeur</option>
                          <option value="Moderator">Modérateur</option>
                          <option value="ModeratorTest">Modérateur Test</option>
                          <option value="Animator">Animateur</option>
                          <option value="User">Utilisateur</option>
                          <option value="Banned">Banni</option>
                        </select>
                      </div>
                      <div className="mb-4">
                        <label
                          className="block text-blue-300 text-sm mb-2">Statut</label>
                        <select
                          value={ filters.status }
                          onChange={ (e) => setFilters({
                            ...filters,
                            status: e.target.value,
                          }) }
                          className="w-full bg-black/60 border border-blue-500/30 rounded-lg px-3 py-2 text-white"
                        >
                          <option value="">Tous les statuts</option>
                          <option value="validated">Validé</option>
                          <option value="not-validated">Non validé</option>
                          <option value="banned">Banni</option>
                        </select>
                      </div>
                      <div className="flex justify-between">
                        <button
                          onClick={ () => setFilters({
                            role: '',
                            status: '',
                          }) }
                          className="px-3 py-1 text-blue-300 hover:text-white"
                        >
                          Réinitialiser
                        </button>
                        <button
                          onClick={ () => setShowFilterDropdown(false) }
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                        >
                          Appliquer
                        </button>
                      </div>
                    </div>
                  ) }
                </div>

                <button
                  onClick={ exportToCSV }
                  className="px-4 py-2 bg-black/40 hover:bg-black/60 text-blue-300 hover:text-white border border-blue-500/30 rounded-lg transition-all flex items-center gap-2"
                >
                  <Download size={ 16 }/>
                  <span>Exporter CSV</span>
                </button>

                <button
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all flex items-center gap-2">
                  <UserPlus size={ 16 }/>
                  <span>Ajouter</span>
                </button>
              </div>
            </div>
          </div>

          {/* Actions en masse */ }
          { selectedUsers.length > 0 && (
            <div
              className="bg-blue-900/30 p-4 flex items-center justify-between">
              <div className="flex items-center">
                <span
                  className="text-blue-300 mr-4">{ selectedUsers.length } utilisateurs sélectionnés</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-all flex items-center gap-1">
                    <AlertTriangle size={ 16 }/>
                    <span>Avertir</span>
                  </button>
                  <button
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all flex items-center gap-1">
                    <UserCheck size={ 16 }/>
                    <span>Valider</span>
                  </button>
                  <button
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all flex items-center gap-1">
                    <Ban size={ 16 }/>
                    <span>Bannir</span>
                  </button>
                  <button
                    className="px-3 py-1 bg-red-800 hover:bg-red-900 text-white rounded-lg transition-all flex items-center gap-1">
                    <Trash2 size={ 16 }/>
                    <span>Supprimer</span>
                  </button>
                </div>
              </div>
              <button className="text-blue-300 hover:text-white"
                onClick={ () => setSelectedUsers([]) }>
                Annuler
              </button>
            </div>
          ) }

          {/* Tableau */ }
          <div>
            <table className="w-full">
              <thead>
                <tr className="bg-black/40 border-b border-blue-500/30">
                  <th className="p-4 text-left">
                    <input
                      type="checkbox"
                      className="rounded bg-black/60 border-blue-500/50 text-blue-600 focus:ring-blue-500/50"
                      checked={ selectedUsers.length === currentUsers.length && currentUsers.length > 0 }
                      onChange={ handleSelectAll }
                    />
                  </th>
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
                    onClick={ () => handleSort('roleId') }
                  >
                    <div className="flex items-center">
                      <span>Rôle</span>
                      { sortField === 'roleId' && <span
                        className="ml-1">{ sortDirection === 'asc' ? '↑': '↓' }</span> }
                    </div>
                  </th>
                  <th className="p-4 text-left">Statut</th>
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
                  <th className="p-4 text-left">IP d'inscription</th>
                  <th className="p-4 text-left">Dernière IP</th>
                  <th
                    className="p-4 text-left cursor-pointer hover:text-blue-300"
                    onClick={ () => handleSort('updatedAt') }
                  >
                    <div className="flex items-center">
                      <span>Date d'inscription</span>
                      { sortField === 'createdAt' && (
                        <span
                          className="ml-1">{ sortDirection === 'asc' ? '↑': '↓' }</span>
                      ) }
                    </div>
                  </th>
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
                      <td className="p-4">
                        <input
                          type="checkbox"
                          className="rounded bg-black/60 border-blue-500/50 text-blue-600 focus:ring-blue-500/50"
                          checked={ selectedUsers.includes(String(user.id)) }
                          onChange={ () => handleSelectUser(String(user.id)) }
                        />
                      </td>
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
                        <span
                          className={ `px-2 py-1 rounded-full text-xs ${ roleColors[user.role as keyof typeof roleColors] || 'bg-gray-600 text-white' }` }
                        >
                          { rolify(user.role) }
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          { user.role === 'Banned' ? (
                            <>
                              <div
                                className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                              <span>Banni</span>
                            </>
                          ): user.validated ? (
                            <>
                              <div
                                className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                              <span>Validé</span>
                            </>
                          ): (
                            <>
                              <div
                                className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                              <span>Non validé</span>
                            </>
                          ) }
                        </div>
                      </td>
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
                      <td className="p-4">{ user.registerIp }</td>
                      <td className="p-4">{ user.lastLoginIp }</td>
                      <td className="p-4">{ new Date(user.createdAt || 'now').toLocaleString('fr-FR') }</td>
                      <td className="p-4">
                        <div className="relative">
                          <button
                            onClick={ () => setActionDropdown(actionDropdown === String(user.id) ? null : String(user.id)) }
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <MoreHorizontal size={ 18 }/>
                          </button>

                          { actionDropdown === String(user.id) && (
                            <div
                              className="absolute right-0 mt-2 w-48 bg-black/90 border border-blue-500/30 rounded-lg shadow-lg z-50">
                              <ul>
                                <li>
                                  <a
                                    href={ `/${['SuperAdmin', 'Admin'].includes(user?.role || '') ? 'admin' : 'moderator'}/users/${ user.id }` }
                                    className="w-full text-left px-4 py-2 hover:bg-blue-900/30 flex items-center gap-2"
                                  >
                                    <Eye size={ 16 }
                                      className="text-green-500"/>
                                    <span>Voir l'utilisateur en détails</span>
                                  </a>
                                </li>
                                <li>
                                  <button
                                    className="w-full text-left px-4 py-2 hover:bg-blue-900/30 flex items-center gap-2"
                                  >
                                    <AlertTriangle size={ 16 }
                                      className="text-yellow-500"/>
                                    <span>Avertir</span>
                                  </button>
                                </li>
                                { !user.validated && (
                                  <li>
                                    <button
                                      onClick={ () => handleValidateUser(String(user.id)) }
                                      className="w-full text-left px-4 py-2 hover:bg-blue-900/30 flex items-center gap-2"
                                    >
                                      <Check size={ 16 }
                                        className="text-green-500"/>
                                      <span>Valider le compte</span>
                                    </button>
                                  </li>
                                ) }
                                { user.role !== 'Banned' ? (
                                  <li>
                                    <button
                                      onClick={ () => handleBanUser(String(user.id)) }
                                      className="w-full text-left px-4 py-2 hover:bg-blue-900/30 flex items-center gap-2"
                                    >
                                      <Ban size={ 16 }
                                        className="text-red-500"/>
                                      <span>Bannir</span>
                                    </button>
                                  </li>
                                ) : (
                                  <li>
                                    <button
                                      // onClick={ () => handleUnbanUser(String(user.id)) }
                                      className="w-full text-left px-4 py-2 hover:bg-blue-900/30 flex items-center gap-2"
                                    >
                                      <Ban size={ 16 }
                                        className="text-green-500"/>
                                      <span>Débannir</span>
                                    </button>
                                  </li>
                                ) }
                                {['SuperAdmin', 'Admin'].includes(_user?.role || '') && (
                                  <li>
                                    <button
                                      className="w-full text-left px-4 py-2 hover:bg-blue-900/30 flex items-center gap-2">
                                      <Trash2 size={ 16 } className="text-red-500"/>
                                      <span>Supprimer</span>
                                    </button>
                                  </li>
                                )}
                              </ul>
                            </div>
                          ) }
                        </div>
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

export default UsersPage
