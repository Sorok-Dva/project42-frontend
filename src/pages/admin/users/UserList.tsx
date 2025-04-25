import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import AdminSidebar from 'components/Admin/Sidebar'
import { useMediaQuery } from 'hooks/useMediaQuery'

import {
  Search,
  Filter,
  UserPlus,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Shield,
  Ban,
  UserCheck,
  Trash2,
} from 'lucide-react'
import { User } from 'contexts/UserContext'
import { useAuth } from 'contexts/AuthContext'

const UserList: React.FC = () => {
  const { token } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [sortedField, setSortedField] = useState<keyof User | null>(null)
  const [isAsc, setIsAsc] = useState<boolean>(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [rowsPerPage, setRowsPerPage] = useState<number>(10)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)

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
      } catch (err) {
        console.error('Failed to fetch users', err)
      }
    }

    fetchUsers()
  }, [token])

  const handleSort = (field: keyof User) => {
    if (sortedField === field) {
      setIsAsc(!isAsc)
    } else {
      setSortedField(field)
      setIsAsc(true)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const filteredUsers = users.filter((user) =>
    user.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortedField) {
      if (a[sortedField] !== undefined && b[sortedField] !== undefined && a[sortedField] < b[sortedField]) {
        return isAsc ? -1 : 1
      }
      if (a[sortedField] !== undefined && b[sortedField] !== undefined && a[sortedField] > b[sortedField]) {
        return isAsc ? 1 : -1
      }
    }
    return 0
  })

  const indexOfLastUser = currentPage * rowsPerPage
  const indexOfFirstUser = indexOfLastUser - rowsPerPage
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser)

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage)

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber)
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  // Auto-close sidebar on mobile
  if (!isDesktop && sidebarOpen) {
    setSidebarOpen(false)
  }

  const toggleSelectUser = (userId: string) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const toggleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(users.map((user) => user.id.toString()))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
    case 'Validated':
      return 'bg-green-500'
    case 'Inactive':
      return 'bg-yellow-500'
    case 'Banned':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
    case 'Admin':
      return 'bg-purple-600 text-white'
    case 'Moderator':
      return 'bg-blue-600 text-white'
    case 'User':
      return 'bg-gray-600 text-white'
    default:
      return 'bg-gray-600 text-white'
    }
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
          className={`flex-1 transition-all duration-300 ${sidebarOpen && isDesktop ? 'ml-64' : 'ml-0'} overflow-auto`}
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
                  User Management
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <button className="text-blue-400 hover:text-blue-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                  </button>
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    3
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="font-bold text-sm">A</span>
                  </div>
                  <span className="hidden md:inline-block">Admin</span>
                </div>
              </div>
            </div>
          </header>

          {/* Users content */}
          <main className="p-4 md:p-6 space-y-6">
            {/* Page header */}
            <motion.div
              className="bg-gradient-to-r from-black/60 to-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Users</h2>
                  <p className="text-blue-300">Manage user accounts, roles, and permissions</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all flex items-center justify-center gap-2">
                    <UserPlus size={18} />
                    <span>Add User</span>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Filters and search */}
            <motion.div
              className="bg-gradient-to-r from-black/60 to-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-500/30 p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="w-full bg-black/40 border border-blue-500/30 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-black/40 hover:bg-black/60 text-blue-300 hover:text-white border border-blue-500/30 rounded-lg transition-all flex items-center gap-2">
                    <Filter size={18} />
                    <span>Filter</span>
                  </button>
                  <button className="px-4 py-2 bg-black/40 hover:bg-black/60 text-blue-300 hover:text-white border border-blue-500/30 rounded-lg transition-all">
                    Export
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Users table */}
            <motion.div
              className="bg-gradient-to-r from-black/60 to-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-500/30 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Bulk actions */}
              {selectedUsers.length > 0 && (
                <div className="bg-blue-900/30 p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-blue-300 mr-4">{selectedUsers.length} users selected</span>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all flex items-center gap-1">
                        <UserCheck size={16} />
                        <span>Activate</span>
                      </button>
                      <button className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-all flex items-center gap-1">
                        <Shield size={16} />
                        <span>Change Role</span>
                      </button>
                      <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all flex items-center gap-1">
                        <Ban size={16} />
                        <span>Ban</span>
                      </button>
                      <button className="px-3 py-1 bg-red-800 hover:bg-red-900 text-white rounded-lg transition-all flex items-center gap-1">
                        <Trash2 size={16} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                  <button className="text-blue-300 hover:text-white" onClick={() => setSelectedUsers([])}>
                    Cancel
                  </button>
                </div>
              )}

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-black/40 border-b border-blue-500/30">
                      <th className="p-4 text-left">
                        <input
                          type="checkbox"
                          className="rounded bg-black/60 border-blue-500/50 text-blue-600 focus:ring-blue-500/50"
                          checked={selectedUsers.length === users.length}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th className="p-4 text-left">User</th>
                      <th className="p-4 text-left">Email</th>
                      <th className="p-4 text-left">Role</th>
                      <th className="p-4 text-left">Status</th>
                      <th className="p-4 text-left">Last Login</th>
                      <th className="p-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-blue-500/10 hover:bg-blue-900/10">
                        <td className="p-4">
                          <input
                            type="checkbox"
                            className="rounded bg-black/60 border-blue-500/50 text-blue-600 focus:ring-blue-500/50"
                            checked={selectedUsers.includes(user.id.toString())}
                            onChange={() => toggleSelectUser(user.id.toString())}
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-3">
                              <span className="font-bold text-sm">{user.nickname.charAt(0)}</span>
                            </div>
                            <span>{user.nickname}</span>
                          </div>
                        </td>
                        <td className="p-4">{user.email}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${getRoleColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(user.validated ? 'Validated' : 'Inactive')} mr-2`}></div>
                            <span>{user.validated ? 'Compte validé' : 'Compte non validé'}</span>
                          </div>
                        </td>
                        <td className="p-4">{user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString('fr-FR') : 'Date inconnue'}</td>
                        <td className="p-4">
                          <div className="flex items-center">
                            <button className="text-blue-400 hover:text-blue-300 transition-colors">
                              <MoreHorizontal size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 flex items-center justify-between border-t border-blue-500/30">
                <div className="text-sm text-blue-300">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
                  <span className="font-medium">100</span> users
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 bg-black/40 hover:bg-black/60 text-blue-300 hover:text-white border border-blue-500/30 rounded-lg transition-all">
                    <ChevronLeft size={18} />
                  </button>
                  <button className="px-3 py-1 bg-blue-600 text-white rounded-lg">1</button>
                  <button className="px-3 py-1 bg-black/40 hover:bg-black/60 text-blue-300 hover:text-white border border-blue-500/30 rounded-lg transition-all">
                    2
                  </button>
                  <button className="px-3 py-1 bg-black/40 hover:bg-black/60 text-blue-300 hover:text-white border border-blue-500/30 rounded-lg transition-all">
                    3
                  </button>
                  <span className="text-blue-300">...</span>
                  <button className="px-3 py-1 bg-black/40 hover:bg-black/60 text-blue-300 hover:text-white border border-blue-500/30 rounded-lg transition-all">
                    10
                  </button>
                  <button className="p-2 bg-black/40 hover:bg-black/60 text-blue-300 hover:text-white border border-blue-500/30 rounded-lg transition-all">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default UserList
