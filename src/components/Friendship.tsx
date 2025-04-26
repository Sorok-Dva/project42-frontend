'use client'

import type React from 'react'
import { Img as Image } from 'react-image'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ToastDefaultOptions } from 'utils/toastOptions'
import { Link } from 'react-router-dom'
import type { Friendship } from './Layouts/navbar/Friends'
import { useAuth } from 'contexts/AuthContext'
import { useUser } from 'contexts/UserContext'

interface FriendshipProps {
  friendship: Friendship
  friendships: Friendship[]
  setFriendships: React.Dispatch<React.SetStateAction<Friendship[]>>
}

const FriendshipComponent: React.FC<FriendshipProps> = ({ friendship, friendships, setFriendships }) => {
  const { token } = useAuth()
  const { user } = useUser()
  const currentUserId = user?.id

  const handleCancelRequest = () => {
    axios
      .delete(`/api/friends/${friendship.requesterId === user?.id ? friendship.addresseeId : friendship.requesterId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setFriendships(friendships.filter((f) => f.id !== friendship.id))
        toast.info(`Votre demande d'ami pour <b>${friendship.nickname}</b> a été annulée.`, ToastDefaultOptions)
      })
      .catch((err) => {
        toast.error('Une erreur est survenue dans l\'annulation de votre demande d\'ami.', ToastDefaultOptions)
        console.error('Erreur lors de la suppression de la relation d\'amitié', err)
      })
  }

  const handleAcceptRequest = () => {
    // Supposons que vous ayez une route pour accepter la demande : PUT /api/friends/:id/accept
    axios
      .put(
        `/api/friends/${friendship.requesterId === user?.id ? friendship.addresseeId : friendship.requesterId}/accept`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      .then(() => {
        setFriendships(friendships.map((f) => (f.id === friendship.id ? { ...f, friendshipStatus: 'accepted' } : f)))
        toast.info(`Vous avez accepté la demande d'ami de <b>${friendship.nickname}</b>.`, ToastDefaultOptions)
      })
      .catch((err) => {
        toast.error('Une erreur est survenue lors de l\'acceptation de la demande d\'ami.', ToastDefaultOptions)
        console.error('Erreur lors de l\'acceptation de la demande d\'amitié', err)
      })
  }

  const handleRefuseRequest = () => {
    // Pour refuser, on supprime la demande (DELETE /api/friends/:id)
    axios
      .delete(`/api/friends/${friendship.requesterId === user?.id ? friendship.addresseeId : friendship.requesterId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setFriendships(friendships.filter((f) => f.id !== friendship.id))
        toast.info(`Vous avez refusé la demande d'ami de <b>${friendship.nickname}</b>.`, ToastDefaultOptions)
      })
      .catch((err) => {
        toast.error(
          `Une erreur est survenue lors du refus de la demande d'ami de ${friendship.nickname}.`,
          ToastDefaultOptions,
        )
        console.error('Erreur lors du refus de la relation d\'amitié', err)
      })
  }

  const handleRemoveFriend = () => {
    axios
      .delete(`/api/friends/${friendship.requesterId === user?.id ? friendship.addresseeId : friendship.requesterId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setFriendships(friendships.filter((f) => f.id !== friendship.id))
        toast.info(`Vous avez retiré <b>${friendship.nickname}</b> de vos amis.`, ToastDefaultOptions)
      })
      .catch((err) => {
        toast.error(
          `Une erreur est survenue lors du retrait de ${friendship.nickname} de vos amis.`,
          ToastDefaultOptions,
        )
        console.error('Erreur lors de la suppression de la relation d\'amitié', err)
      })
  }

  let actionButtons = null

  if (friendship.friendshipStatus === 'pending') {
    // Si le joueur connecté est celui qui a envoyé la demande, afficher "Annuler la demande"
    if (currentUserId === friendship.requesterId) {
      actionButtons = (
        <button
          className="text-xs py-1 px-2 bg-amber-600/70 hover:bg-amber-500/80 text-white rounded transition-colors"
          onClick={handleCancelRequest}
        >
          <i className="ti ti-x mr-1"></i>
          Annuler
        </button>
      )
    }
    // Sinon, le joueur connecté a reçu la demande : afficher "Accepter" et "Refuser"
    else if (currentUserId === friendship.addresseeId) {
      actionButtons = (
        <div className="flex gap-2">
          <button
            className="text-xs py-1 px-2 bg-emerald-600/70 hover:bg-emerald-500/80 text-white rounded transition-colors"
            onClick={handleAcceptRequest}
          >
            <i className="ti ti-check mr-1"></i>
            Accepter
          </button>
          <button
            className="text-xs py-1 px-2 bg-rose-600/70 hover:bg-rose-500/80 text-white rounded transition-colors"
            onClick={handleRefuseRequest}
          >
            <i className="ti ti-x mr-1"></i>
            Refuser
          </button>
        </div>
      )
    }
  } else if (friendship.friendshipStatus === 'accepted') {
    actionButtons = (
      <button
        className="text-xs py-1 px-2 bg-slate-600/70 hover:bg-slate-500/80 text-white rounded transition-colors"
        onClick={handleRemoveFriend}
      >
        <i className="ti ti-user-minus mr-1"></i>
        Retirer
      </button>
    )
  }

  // Determine the status color and glow effect
  const statusColor = friendship.isOnline ? 'bg-emerald-500' : 'bg-rose-500'

  const statusGlow = friendship.isOnline ? 'shadow-emerald-500/50' : 'shadow-rose-500/50'

  return (
    <div className="group relative bg-slate-800/50 hover:bg-slate-700/50 rounded-lg p-3 transition-all duration-200 border border-slate-700/50 hover:border-indigo-500/30">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Image
            className="w-10 h-10 rounded-full object-cover border-2 border-slate-600/50"
            src={friendship.avatar || '/placeholder.svg'}
            alt={`Avatar de ${friendship.nickname}`}
            data-profile={friendship.nickname}
          />
          <span
            className={`absolute bottom-0 right-0 w-3 h-3 ${statusColor} rounded-full border-2 border-slate-800 shadow-sm ${statusGlow}`}
          ></span>
        </div>

        <div className="flex-1">
          <Link
            to="#"
            className="font-medium text-slate-200 hover:text-indigo-300 transition-colors block"
            data-profile={friendship.nickname}
          >
            {friendship.nickname}
          </Link>

          <div className="mt-1.5">{actionButtons}</div>
        </div>

        {friendship.friendshipStatus === 'pending' && (
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center justify-center w-5 h-5 bg-amber-500/70 text-xs text-white rounded-full">
              <i className="ti ti-clock text-[10px]"></i>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default FriendshipComponent
