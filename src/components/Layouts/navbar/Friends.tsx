import React, { useState, useEffect } from 'react'
import axios from 'axios'
import clsx from 'clsx'
import { useAuth } from 'contexts/AuthContext'
import useDropdown from 'hooks/useDropdown'
import Button from 'components/Layouts/Button'
import { Button as Btn } from '@mui/material'
import { Input } from 'reactstrap'
import { toast } from 'react-toastify'
import { ToastDefaultOptions } from 'utils/toastOptions'
import Friendship from 'components/Friendship'

export interface Friendship {
  id: number
  nickname: string
  avatar: string
  status: 'pending' | 'refused' | 'accepted'
  requesterId: number
  addresseeId: number
  isOnline: boolean
}

interface User {
  id: number
  nickname: string
}

const Friends: React.FC = () => {
  const { token } = useAuth()
  const { open, ref, toggleOpen } = useDropdown()

  const [friendships, setFriendships] = useState<Friendship[]>([])
  const [acceptedFriends, setAcceptedFriends] = useState<Friendship[]>([])
  const [onlineFriends, setOnlineFriends] = useState<Friendship[]>([])
  const [showAddFriendInput, setShowAddFriendInput] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchResults, setSearchResults] = useState<User[]>([])

  useEffect(() => {
    fetchFriendships()

    window.addEventListener('friendsChanged', fetchFriendships)

    return () => {
      window.removeEventListener('friendsChanged', fetchFriendships)
    }
  }, [open])

  const fetchFriendships = async () => {
    try {
      const response = await axios.get<Friendship[]>('/api/friends', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setFriendships(response.data)
      setAcceptedFriends(response.data.filter(f => f.status === 'accepted'))
      setOnlineFriends(response.data.filter(f => f.isOnline && f.status === 'accepted'))
    } catch (error) {
      console.error('Erreur lors du chargement des amitiés', error)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchQuery.trim() === '') {
        setSearchResults([])
        return
      }
      try {
        const res = await axios.get<User[]>('/api/users/search', {
          params: { query: searchQuery },
          headers: { Authorization: `Bearer ${token}` },
        })
        setSearchResults(res.data)
      } catch (error) {
        console.error('Erreur lors de la recherche d\'utilisateurs', error)
      }
    }
    fetchSearchResults()
  }, [searchQuery, token])

  const handleAddFriend = async (friendId: number) => {
    try {
      const response = await axios.post<Friendship>(
        '/api/friends/add',
        { addresseeId: friendId },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      setFriendships([...friendships, response.data])
      // Réinitialisation et fermeture du champ de recherche
      setSearchQuery('')
      setSearchResults([])
      setShowAddFriendInput(false)

      toast.info(`Votre demande d'ami a été envoyée à ${response.data.nickname}.`, ToastDefaultOptions)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = await error?.response?.data
        if (errorData.error) {
          toast.error(errorData.error, ToastDefaultOptions)
        }
      } else {
        toast.error('Une erreur est survenue.', ToastDefaultOptions)
      }
    }
  }

  // Fonction pour afficher le champ de recherche sans fermer le dropdown
  const showAddFriend = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setShowAddFriendInput(true)
  }

  // Fonction pour annuler la recherche
  const cancelAddFriend = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setShowAddFriendInput(false)
    setSearchQuery('')
    setSearchResults([])
  }

  return (
    <div ref={ref} className="position-relative flex-shrink-0">
      <Button onClick={toggleOpen} classes="ntf-btn fs-2xl" badgeCount={onlineFriends.length} type='friends'>
        <i className="ti ti-users"></i>
      </Button>
      <div className={clsx('notification-area p-4', { open: open })} data-lenis-prevent>
        <h3>Mes amis ({onlineFriends.length} / {acceptedFriends.length})</h3>
        <hr />
        <div className="notification-card d-grid gap-4" data-tilt>
          {friendships.length === 0 && <h5>Vous n'avez pas encore d'amis.</h5>}

          {friendships.map((friendship) => (
            <Friendship friendship={friendship} friendships={friendships} setFriendships={setFriendships} key={friendship.id}/>
          ))}

          {showAddFriendInput ? (
            <div>
              <div style={{ position: 'relative' }}>
                <Input
                  type="text"
                  placeholder="Saisissez un pseudo"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <button
                  onClick={cancelAddFriend}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    background: 'transparent',
                    border: 'none',
                    fontSize: '1rem',
                    color: '#999',
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              </div>
              {searchResults.length > 0 ? (
                <ul
                  style={{
                    listStyleType: 'none',
                    padding: '8px',
                    margin: '8px 0 0 0',
                    backgroundColor: '#000',
                    borderRadius: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                    maxHeight: '200px',
                    overflowY: 'auto',
                  }}
                >
                  {searchResults.map((user) => (
                    <li
                      key={user.id}
                      style={{
                        cursor: 'pointer',
                        padding: '8px',
                        borderBottom: '1px solid #444',
                        color: '#fff',
                      }}
                      onClick={() => handleAddFriend(user.id)}
                    >
                      {user.nickname}
                    </li>
                  ))}
                </ul>
              ) : (
                searchQuery.trim() !== '' && (
                  <p style={{ color: '#fff', padding: '8px', backgroundColor: '#000', borderRadius: '4px', marginTop: '8px' }}>
                    Aucune correspondance
                  </p>
                )
              )}
            </div>
          ) : (
            <Btn onClick={showAddFriend}>Ajouter un ami</Btn>
          )}
        </div>
      </div>
    </div>
  )
}

export default Friends
