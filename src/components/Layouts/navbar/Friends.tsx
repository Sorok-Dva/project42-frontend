'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import clsx from 'clsx'
import { useAuth } from 'contexts/AuthContext'
import useDropdown from 'hooks/useDropdown'
import Button from 'components/Layouts/Button'
import { Input } from 'reactstrap'
import { toast } from 'react-toastify'
import { ToastDefaultOptions } from 'utils/toastOptions'
import FriendshipComponent from 'components/Friendship'

export interface Friendship {
  id: number
  nickname: string
  avatar: string
  friendshipStatus: 'pending' | 'refused' | 'accepted'
  status: 'online' | 'away' | 'busy' | 'offline'
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
      setAcceptedFriends(response.data.filter((f) => f.friendshipStatus === 'accepted'))
      setOnlineFriends(response.data.filter((f) => f.isOnline && f.friendshipStatus === 'accepted'))
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
    <div ref={ref} className="relative flex-shrink-0">
      <Button
        onClick={toggleOpen}
        classes="relative flex items-center justify-center w-10 h-10 rounded-full bg-slate-800/70 hover:bg-slate-700/70 border border-slate-700/50 transition-all duration-300"
        badgeCount={onlineFriends.length}
        type="friends"
      >
        <i className="ti ti-users text-xl text-slate-200"></i>
      </Button>

      <div
        className={clsx(
          'absolute right-0 top-full mt-2 w-80 bg-slate-900/90 backdrop-blur-md rounded-lg border border-slate-700/50 shadow-xl shadow-indigo-900/20 z-50 transform transition-all duration-300 origin-top-right',
          open ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none',
        )}
        data-lenis-prevent
      >
        <div className="p-4">
          <h3 className="text-lg font-medium text-slate-100 flex items-center gap-2 mb-3">
            <i className="ti ti-users text-indigo-400"></i>
            Mes amis
            <span className="text-sm font-normal text-slate-400">
              ({onlineFriends.length} / {acceptedFriends.length})
            </span>
          </h3>

          <div className="border-t border-slate-700/50 mb-3"></div>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
            {friendships.length === 0 && (
              <div className="text-center py-4 text-slate-400">
                <i className="ti ti-mood-empty text-3xl mb-2 block"></i>
                Vous n'avez pas encore d'amis.
              </div>
            )}

            {friendships.map((friendship) => (
              <FriendshipComponent
                friendship={friendship}
                friendships={friendships}
                setFriendships={setFriendships}
                key={friendship.id}
              />
            ))}
          </div>

          <div className="mt-4 border-t border-slate-700/50 pt-3">
            {showAddFriendInput ? (
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Saisissez un pseudo"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full bg-slate-800/70 border border-slate-700/50 rounded-md text-slate-200 py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                  <button
                    onClick={cancelAddFriend}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <i className="ti ti-x"></i>
                  </button>
                </div>

                {searchResults.length > 0 ? (
                  <ul className="bg-slate-800/90 border border-slate-700/50 rounded-md max-h-48 overflow-y-auto">
                    {searchResults.map((user) => (
                      <li
                        key={user.id}
                        className="px-3 py-2 hover:bg-slate-700/50 cursor-pointer text-slate-300 hover:text-slate-100 transition-colors border-b border-slate-700/30 last:border-0"
                        onClick={() => handleAddFriend(user.id)}
                      >
                        {user.nickname}
                      </li>
                    ))}
                  </ul>
                ) : (
                  searchQuery.trim() !== '' && <p className="text-slate-400 text-sm py-2">Aucune correspondance</p>
                )}
              </div>
            ) : (
              <button
                onClick={showAddFriend}
                className="w-full py-2 px-4 bg-indigo-600/70 hover:bg-indigo-500/70 text-slate-100 rounded-md transition-colors flex items-center justify-center gap-2"
              >
                <i className="ti ti-user-plus"></i>
                Ajouter un ami
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Friends
