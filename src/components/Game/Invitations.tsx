import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Share2 } from 'lucide-react'
import { Tooltip } from 'react-tooltip'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ToastDefaultOptions } from 'utils/toastOptions'
import { useAuth } from 'contexts/AuthContext'
import { Player } from 'types/room'

interface InvitationBlockProps {
  gameId: string | undefined
  isCreator: boolean
  players: Player[]
}

export interface Friend {
  id: number
  nickname: string
  avatar: string
  isOnline: boolean
}

const InvitationBlock: React.FC<InvitationBlockProps> = ({ gameId, players, isCreator }) => {
  const { token } = useAuth()
  const [invitedPlayers, setInvitedPlayers] = useState<number[]>([])
  const [discordAnnouncementSent, setDiscordAnnouncementSent] = useState(false)
  const [friends, setFriends] = useState<Friend[]>([])

  // Générer le lien d'invitation
  const invitationLink =
    typeof window !== 'undefined' ? `${window.location.origin}/game/${gameId}` : `/game/${gameId}`

  // récupérer la liste des amis dispo
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await axios.get<Friend[]>('/api/friends/available', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        setFriends(response.data)
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const errorData = await error?.response?.data
          if (errorData && errorData.errors && Array.isArray(errorData.errors)) {
            errorData.errors.forEach((error : { msg : string }) => {
              toast.error(error.msg, ToastDefaultOptions)
            })
          } else if (errorData.error) {
            toast.error(errorData.error, ToastDefaultOptions)
          }
        } else {
          toast.error('Une erreur est survenue.', ToastDefaultOptions)
        }
      }
    }
    fetchFriends()
    setInterval(fetchFriends, 30000)
  }, [])

  // Vérifier si une annonce a déjà été envoyée
  useEffect(() => {
    const announcementSent = localStorage.getItem(`discord_announcement_${gameId}`)
    if (announcementSent === 'true') {
      setDiscordAnnouncementSent(true)
    }
  }, [gameId])

  // Envoyer une annonce sur Discord
  const sendDiscordAnnouncement = async () => {
    if (discordAnnouncementSent || !gameId) return

    try {
      await axios.post(
        `/api/discord/game/waiting/${gameId}`,
        {
          invitationLink,
          playersCount: players.length,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      toast.success('Annonce envoyée sur Discord !', ToastDefaultOptions)
      setDiscordAnnouncementSent(true)
      localStorage.setItem(`discord_announcement_${gameId}`, 'true')
    } catch (error) {
      console.error('Erreur lors de l’envoi au webhook Discord :', error)
      toast.error('Échec de l’envoi de l’annonce Discord.', ToastDefaultOptions)
    }
  }

  const inviteFriendToGame = async (friendId: number) => {
    try {
      await axios.post(
        '/api/friends/invite/game',
        {
          friendId,
          gameId,
          playersCount: players.length,
          invitationLink,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      toast.success('Invitation envoyée avec succès !', ToastDefaultOptions)
      setInvitedPlayers(prev => [...prev, friendId])
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'invitation :', error)
      toast.error('Erreur lors de l\'envoi de l\'invitation.', ToastDefaultOptions)
    }
  }

  return (
    <motion.div
      className="bg-gradient-to-r from-black/60 to-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-500/30 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-4 py-3 border-b border-blue-500/30">
        <h3 className="text-lg font-bold text-white">Inviter vos amis</h3>
      </div>

      <div className="p-4">
        {/* Liste des joueurs */}
        <div className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {friends.filter(f => f !== null).map((player, index) => (
              <motion.button
                key={index}
                className={`px-3 py-2 rounded-lg flex items-center justify-between ${
                  invitedPlayers.includes(player.id)
                    ? 'bg-green-600/30 border border-green-500/50 text-green-300 cursor-not-allowed'
                    : 'bg-black/40 border border-blue-500/30 hover:bg-black/60 text-white'
                }`}
                onClick={() => inviteFriendToGame(player.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={invitedPlayers.includes(player.id)}
              >
                <span>{player.nickname}</span>
                {invitedPlayers.includes(player.id) ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Message si aucun joueur */}
        {friends.filter(f => f !== null).length === 0 && (
          <div className="bg-black/40 rounded-lg p-4 text-center">
            <p className="text-gray-400">Aucun ami disponible pour le moment.</p>
          </div>
        )}

        {/* Boutons pour envoyer une annonce Discord */}
        {isCreator && (
          <div className="mt-4 flex flex-col sm:flex-row justify-center gap-3">
            <motion.button
              className={`px-4 py-2 ${
                discordAnnouncementSent ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#5865F2] hover:bg-[#4752C4]'
              } text-white rounded-lg transition-all shadow-lg flex items-center gap-2`}
              whileHover={!discordAnnouncementSent ? { scale: 1.05 } : {}}
              whileTap={!discordAnnouncementSent ? { scale: 0.95 } : {}}
              onClick={sendDiscordAnnouncement}
              disabled={discordAnnouncementSent}
              data-tooltip-id="discord-tooltip"
              data-tooltip-content={discordAnnouncementSent ? 'Une annonce a déjà été faite sur le serveur Discord' : ''}
            >
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 127.14 96.36" fill="currentColor">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
              </svg>
              Envoyer une annonce sur Discord
            </motion.button>
          </div>
        )}
      </div>

      {/* Tooltip pour le bouton Discord */}
      <Tooltip id="discord-tooltip" />
    </motion.div>
  )
}

export default InvitationBlock
