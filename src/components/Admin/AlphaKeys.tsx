import React, { useEffect, useState } from 'react'
import {
  Col,
  Input,
  Row,
  Table,
} from 'reactstrap'
import { Link } from 'react-router-dom'
import { useAuth } from 'contexts/AuthContext'
import { User, useUser } from 'contexts/UserContext'
import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faKey, faCopy } from '@fortawesome/free-solid-svg-icons'

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
  const { isAdmin } = useUser()

  const [alphaKeys, setAlphaKeys] = useState<AlphaKey[]>([])
  const [sortedField, setSortedField] = useState<SortableFields | null>(null)
  const [isAsc, setIsAsc] = useState<boolean>(true)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [rowsPerPage, setRowsPerPage] = useState<number>(10)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  if (!isAdmin) return null

  useEffect(() => {
    const fetchAlphaKeys = async () => {
      try {
        const response = await axios.get<AlphaKey[]>('/api/admin/alpha-keys', {
          headers: { Authorization: `Bearer ${token}` },
        })
        setAlphaKeys(response.data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAlphaKeys()
  }, [token])

  const handleGenerateKey = async () => {
    try {
      const response = await axios.post<{ keys: AlphaKey[] }>('/api/admin/alpha-keys', {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setAlphaKeys((prev) => [...prev, ...response.data.keys])
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleCopy = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key)
    } catch {
      alert('Erreur lors de la copie de la clé')
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

  const filteredKeys = alphaKeys.filter((alphaKey) => {
    const search = searchTerm.toLowerCase()
    const idStr = alphaKey.id.toString()
    const keyStr = alphaKey.key.toLowerCase()

    return (
      idStr.includes(search) ||
      keyStr.includes(search)
    )
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  return (
    <>
      <div className="container">
        <div className="page-tabs">
          <header>
            <h1><FontAwesomeIcon icon={faKey} /> Gestion des clés alphas</h1>
          </header>
          <Row className="mb-3">
            <Col>
              <p>Total: {filteredKeys.length}</p>
            </Col>
            <Col>
              <Input
                type="text"
                placeholder="Chercher par ID ou par clé"
                value={searchTerm}
                onChange={handleSearch}
              />
            </Col>
          </Row>

          {/* Bouton pour générer des clés */}
          <Row className="mb-3">
            <Col>
              <button className="btn btn-primary" onClick={handleGenerateKey}>
                Générer 5 nouvelles clés
              </button>
            </Col>
          </Row>

          {/* Affichage des erreurs / chargement */}
          {loading && <p>Chargement...</p>}
          {error && <p className="text-danger">Erreur : {error}</p>}

          {/* Tableau */}
          <Table hover>
            <thead>
              <tr>
                <th onClick={() => handleSort('id')}>
                # {sortedField === 'id' && (isAsc ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('key')}>
                Clé {sortedField === 'key' && (isAsc ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('createdAt')}>
                Date de création {sortedField === 'createdAt' && (isAsc ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('used_by')}>
                Utilisée par {sortedField === 'used_by' && (isAsc ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('used_at')}>
                Date d'utilisation {sortedField === 'used_at' && (isAsc ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('parrain_id')}>
                Parrain ID {sortedField === 'parrain_id' && (isAsc ? '↑' : '↓')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentKeys.map((alphaKey) => (
                <tr key={alphaKey.id}>
                  <td>{alphaKey.id}</td>
                  <td>{alphaKey.key}</td>
                  <td>{new Date(alphaKey.createdAt).toLocaleString()}</td>
                  <td>{alphaKey.used_by ? alphaKey.user?.nickname : '-'}</td>
                  <td>{alphaKey.used_at ? new Date(alphaKey.used_at).toLocaleString() : '-'}</td>
                  <td>{alphaKey.parrain_id ?? '-'}</td>
                  <td>
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => handleCopy(alphaKey.key)}
                    >
                      <FontAwesomeIcon icon={faCopy} /> Copier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

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
    </>
  )
}

export default AlphaKeys
