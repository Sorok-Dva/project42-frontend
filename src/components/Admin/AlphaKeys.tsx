'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from 'contexts/AuthContext'
import { toast } from 'react-toastify'
import { ToastDefaultOptions } from 'utils/toastOptions'
import { motion } from 'framer-motion'
import { Copy, Key, Plus, Trash2, RefreshCw, Search, Download } from 'lucide-react'
import { User } from 'types/user'
import { Link } from 'react-router-dom'

interface AlphaKey {
  id: number
  key: string
  used_at: string | null
  used_by: number | null
  parrain_id: number | null
  createdAt: string
  updatedAt: string
  user?: Partial<User>
}

type SortableFields = keyof AlphaKey

const AlphaKeys: React.FC = () => {
  const { token } = useAuth()
  const [keys, setKeys] = useState<AlphaKey[]>([])
  const [sortedField, setSortedField] = useState<SortableFields | null>(null)
  const [isAsc, setIsAsc] = useState<boolean>(true)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [rowsPerPage, setRowsPerPage] = useState<number>(100)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [keyCount, setKeyCount] = useState(10)
  const [showUsed, setShowUsed] = useState(true)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'used' | 'unused'>('newest')
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownOpen && event.target instanceof Element) {
        const dropdownElement = document.getElementById('sort-dropdown')
        if (dropdownElement && !dropdownElement.contains(event.target)) {
          setDropdownOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen])
  useEffect(() => {
    fetchKeys()
  }, [])

  const fetchKeys = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/admin/alpha-keys', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setKeys(response.data)
    } catch (error) {
      console.error('Error fetching alpha keys:', error)
      toast.error('Erreur lors de la récupération des clés alpha', ToastDefaultOptions)
    } finally {
      setLoading(false)
    }
  }

  const generateKeys = async () => {
    try {
      setGenerating(true)
      const response = await axios.post(
        '/api/admin/alpha-keys',
        { count: keyCount },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      setKeys((prev) => [...response.data.keys, ...prev])
      toast.success(`${keyCount} clés alpha générées avec succès`, ToastDefaultOptions)
    } catch (error) {
      console.error('Error generating alpha keys:', error)
      toast.error('Erreur lors de la génération des clés alpha', ToastDefaultOptions)
    } finally {
      setGenerating(false)
    }
  }

  const deleteKey = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette clé ?')) return

    try {
      await axios.delete(`/api/admin/alpha-keys/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setKeys((prev) => prev.filter((key) => key.id !== id))
      toast.success('Clé alpha supprimée avec succès', ToastDefaultOptions)
    } catch (error) {
      console.error('Error deleting alpha key:', error)
      toast.error('Erreur lors de la suppression de la clé alpha', ToastDefaultOptions)
    }
  }

  const handleSort = (field: SortableFields) => {
    if (sortedField === field) {
      setIsAsc(!isAsc)
    } else {
      setSortedField(field)
      setIsAsc(true)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.info('Clé copiée dans le presse-papier', ToastDefaultOptions)
  }

  const exportKeys = () => {
    const keysToExport = keys
      .filter((key) => !key.used_at)
      .map((key) => key.key)
      .join('\n')
    const blob = new Blob([keysToExport], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `alpha-keys-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }


  const filteredKeys = keys.filter((alphaKey) => {
    const search = searchTerm.toLowerCase()
    const idStr = alphaKey.id.toString()
    const keyStr = alphaKey.key.toLowerCase()

    return (
      idStr.includes(search) ||
      keyStr.includes(search)
    )
  }).filter((key) => showUsed || !key.used_at)
    .filter(
      (key) =>
        key.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (key.user && key.user?.nickname?.includes(searchTerm.toLowerCase())),
    )
    .sort((a, b) => {
      switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'used':
        return a.used_by === b.used_by ? 0 : a.used_by ? -1 : 1
      case 'unused':
        return a.used_by === b.used_by ? 0 : a.used_by ? 1 : -1
      default:
        return 0
      }
    })

  const sortedKeys = [...filteredKeys].sort((a, b) => {
    if (!sortedField) return 0
    const valA = a[sortedField]
    const valB = b[sortedField]

    if (typeof valA === 'string' && typeof valB === 'string') {
      return isAsc ? valA.localeCompare(valB) : valB.localeCompare(valA)
    }

    if (valA === null || valB === null) {
      return valA === null ? 1 : -1
    }
    if (typeof valA === 'number' && typeof valB === 'number') {
      return isAsc ? valA - valB : valB - valA
    }

    return 0
  })

  const indexOfLast = currentPage * rowsPerPage
  const indexOfFirst = indexOfLast - rowsPerPage
  const currentKeys = sortedKeys.slice(indexOfFirst, indexOfLast)

  const totalPages = Math.ceil(filteredKeys.length / rowsPerPage)

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber)
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* Card for generating keys */}
        <div className="bg-gray-800/70 backdrop-blur-md rounded-lg shadow-lg border border-gray-700/50 mb-6">
          <div className="px-6 py-4 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <h3 className="text-white text-xl font-semibold">Générer des clés alpha</h3>
              <button
                onClick={fetchKeys}
                disabled={loading}
                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 transition-colors"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-grow">
                <label className="block text-sm font-medium text-gray-300 mb-1">Nombre de clés à générer</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={keyCount}
                  onChange={(e) => setKeyCount(Number.parseInt(e.target.value))}
                  className="bg-gray-700 text-white rounded-md border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 block w-full p-2.5"
                />
              </div>
              <button
                onClick={generateKeys}
                disabled={generating}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {generating ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Plus size={16} /> Générer
                  </>
                )}
              </button>
              <button
                onClick={exportKeys}
                disabled={keys.filter((key) => !key.used_by).length === 0}
                className="px-4 py-2.5 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                <Download size={16} /> Exporter
              </button>
            </div>
          </div>
        </div>

        {/* Card for keys list */}
        <div className="bg-gray-800/70 backdrop-blur-md rounded-lg shadow-lg border border-gray-700/50">
          <div className="px-6 py-4 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <h3 className="text-white text-xl font-semibold">Liste des clés alpha</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowUsed(!showUsed)}
                  className={`px-3 py-1.5 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors ${
                    showUsed
                      ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                      : 'bg-gray-600 text-gray-200 hover:bg-gray-500 focus:ring-gray-500'
                  }`}
                >
                  {showUsed ? 'Masquer utilisées' : 'Afficher toutes'}
                </button>
                <div id="sort-dropdown"
                  className="relative backdrop-blur-sm"
                  style={{ position: 'relative', zIndex: 50 }}
                >
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors flex items-center gap-1"
                  >
                    Trier: {sortBy}
                    <svg
                      className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-700/90 backdrop-blur-md rounded-md shadow-lg z-[999] border border-gray-600/70">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setSortBy('newest')
                            setDropdownOpen(false)
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                        >
                          Plus récentes
                        </button>
                        <button
                          onClick={() => {
                            setSortBy('oldest')
                            setDropdownOpen(false)
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                        >
                          Plus anciennes
                        </button>
                        <button
                          onClick={() => {
                            setSortBy('used')
                            setDropdownOpen(false)
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                        >
                          Utilisées d'abord
                        </button>
                        <button
                          onClick={() => {
                            setSortBy('unused')
                            setDropdownOpen(false)
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                        >
                          Non utilisées d'abord
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher une clé ou un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-700/80 backdrop-blur-sm text-white rounded-md border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 block w-full pl-10 p-2.5"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-gray-400">Chargement des clés...</p>
              </div>
            ) : filteredKeys.length === 0 ? (
              <div className="text-center py-12">
                <Key size={48} className="mx-auto mb-4 text-gray-500 opacity-50" />
                <h4 className="text-xl font-semibold text-white mb-2">Aucune clé trouvée</h4>
                <p className="text-gray-400">
                  {searchTerm ? 'Essayez une autre recherche' : 'Générez des clés pour commencer'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto backdrop-blur-sm bg-gray-800/30 rounded-lg">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      <th scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                        onClick={() => handleSort('id')}
                      >
                        # {sortedField === 'id' && (isAsc ? '↑' : '↓')}
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                        onClick={() => handleSort('key')}>
                        Clé {sortedField === 'key' && (isAsc ? '↑' : '↓')}
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                      >
                      Statut
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                        onClick={() => handleSort('used_by')}>
                        Utilisée par {sortedField === 'used_by' && (isAsc ? '↑' : '↓')}
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                        onClick={() => handleSort('used_at')}>
                        Date d'utilisation {sortedField === 'used_at' && (isAsc ? '↑' : '↓')}
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                      >
                      Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {currentKeys.map((key) => (
                      <motion.tr
                        key={key.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className={key.used_by ? 'bg-gray-800/50' : ''}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          {key.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <code className="bg-gray-900/bg-gray-900/40 backdrop-blur-sm px-2 py-1 rounded text-sm font-mono">{key.key}</code>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              key.used_by
                                ? 'bg-red-900/20 text-red-300 border border-red-700'
                                : 'bg-green-900/20 text-green-300 border border-green-700'
                            }`}
                          >
                            {key.used_by ? 'Utilisée' : 'Disponible'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {key.used_by ? (
                            <span className="text-white font-medium">{key.used_by ? key.user?.nickname : '-'}</span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {key.used_at ? new Date(key.used_at).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }) : '-' }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => copyToClipboard(key.key)}
                              className="p-1.5 bg-cyan-600/30 text-cyan-300 rounded hover:bg-cyan-600/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
                            >
                              <Copy size={16} />
                            </button>
                            <button
                              onClick={() => deleteKey(key.id)}
                              className="p-1.5 bg-red-600/30 text-red-300 rounded hover:bg-red-600/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex flex-wrap justify-between items-center mt-6 gap-4">
              <div className="text-white">
                Total:{' '}
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/20 text-blue-300 border border-blue-700">
                  {filteredKeys.length}
                </span>{' '}
                clés
              </div>
              <div className="text-white">
                Disponibles:{' '}
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/20 text-green-300 border border-green-700">
                  {keys.filter((k) => !k.used_by).length}
                </span>{' '}
                clés
              </div>
              <div className="text-white">
                Utilisées:{' '}
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/20 text-red-300 border border-red-700">
                  {keys.filter((k) => k.used_by).length}
                </span>{' '}
                clés
              </div>
            </div>

            {/* Pagination */}
            <div className="col-lg-12">
              <div className="page-navigation-area">
                <nav aria-label="Page navigation example text-center">
                  <ul className="pagination">
                    {/* Première page */}
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <Link to="#" className="page-link page-links" onClick={() => paginate(1)}>
                        <i className="bx bx-chevrons-left"></i>
                      </Link>
                    </li>

                    {/* Page précédente */}
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <Link
                        to="#"
                        className="page-link"
                        onClick={() => paginate(currentPage - 1)}
                      >
                        <i className="bx bx-chevron-left"></i>
                      </Link>
                    </li>

                    {/* Pages intermédiaires */}
                    {[...Array(totalPages)].map((_, index) => (
                      <li
                        key={index}
                        className={`page-item ${index + 1 === currentPage ? 'active' : ''}`}
                      >
                        <Link
                          to="#"
                          className="page-link"
                          onClick={() => paginate(index + 1)}
                        >
                          {index + 1}
                        </Link>
                      </li>
                    ))}

                    {/* Page suivante */}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <Link
                        to="#"
                        className="page-link"
                        onClick={() => paginate(currentPage + 1)}
                      >
                        <i className="bx bx-chevron-right"></i>
                      </Link>
                    </li>

                    {/* Dernière page */}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <Link
                        to="#"
                        className="page-link page-links"
                        onClick={() => paginate(totalPages)}
                      >
                        <i className="bx bx-chevrons-right"></i>
                      </Link>
                    </li>
                  </ul>
                </nav>

                <div className="col">
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value))
                      paginate(1) // On repart de la première page
                    }}
                    className="form-select w-auto"
                  >
                    {[10, 30, 50, 100, 500].map((size) => (
                      <option key={size} value={size}>
                        {size} lignes par page
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default AlphaKeys
