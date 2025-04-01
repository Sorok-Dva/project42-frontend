import React from 'react'
import { Img as Image } from 'react-image'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ToastDefaultOptions } from 'utils/toastOptions'
import { Link } from 'react-router-dom'
import { Friendship } from './Layouts/navbar/Friends'
import { useAuth } from 'contexts/AuthContext'
import { useUser } from 'contexts/UserContext'

interface FriendshipProps {
  friendship: Friendship;
  friendships: Friendship[];
  setFriendships: React.Dispatch<React.SetStateAction<Friendship[]>>
}

const FriendshipComponent: React.FC<FriendshipProps> = ({
  friendship,
  friendships,
  setFriendships
}) => {
  const { token } = useAuth()
  const { user } = useUser()
  const currentUserId = user?.id

  const handleCancelRequest = () => {
    axios.delete(`/api/friends/${friendship.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        setFriendships(friendships.filter((f) => f.id !== friendship.id))
        toast.info(`Votre demande d'ami pour <b>${friendship.nickname}</b> a été annulée.`, ToastDefaultOptions)
      })
      .catch((err) => {
        toast.error('Une erreur est survenue dans l\'annulation de votre demande d\'ami.', ToastDefaultOptions)
        console.error('Erreur lors de la suppression de la relation d’amitié', err)
      })
  }

  const handleAcceptRequest = () => {
    // Supposons que vous ayez une route pour accepter la demande : PUT /api/friends/:id/accept
    axios.put(`/api/friends/${friendship.id}/accept`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        setFriendships(friendships.map((f) =>
          f.id === friendship.id ? { ...f, status: 'accepted' } : f))
        toast.info(`Vous avez accepté la demande d'ami de <b>${friendship.nickname}</b>.`, ToastDefaultOptions)
      })
      .catch((err) => {
        toast.error('Une erreur est survenue lors de l\'acceptation de la demande d\'ami.', ToastDefaultOptions)
        console.error('Erreur lors de l\'acceptation de la demande d’amitié', err)
      })
  }

  const handleRefuseRequest = () => {
    // Pour refuser, on supprime la demande (DELETE /api/friends/:id)
    axios.delete(`/api/friends/${friendship.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        setFriendships(friendships.filter((f) => f.id !== friendship.id))
        toast.info(`Vous avez refusé la demande d'ami de <b>${friendship.nickname}</b>.`, ToastDefaultOptions)
      })
      .catch((err) => {
        toast.error(`Une erreur est survenue lors du refus de la demande d'ami de ${friendship.nickname}.`, ToastDefaultOptions)
        console.error('Erreur lors du refus de la relation d’amitié', err)
      })
  }

  const handleRemoveFriend = () => {
    axios.delete(`/api/friends/${friendship.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        setFriendships(friendships.filter((f) => f.id !== friendship.id))
        toast.info(`Vous avez retiré <b>${friendship.nickname}</b> de vos amis.`, ToastDefaultOptions)
      })
      .catch((err) => {
        toast.error(`Une erreur est survenue lors du retrait de ${friendship.nickname} de vos amis.`, ToastDefaultOptions)
        console.error('Erreur lors de la suppression de la relation d’amitié', err)
      })
  }

  let actionButtons = null

  if (friendship.status === 'pending') {
    // Si le joueur connecté est celui qui a envoyé la demande, afficher "Annuler la demande"
    if (currentUserId === friendship.requesterId) {
      actionButtons = (
        <button className="btn btn-warning" onClick={handleCancelRequest}>
          Annuler la demande
        </button>
      )
    }
    // Sinon, le joueur connecté a reçu la demande : afficher "Accepter" et "Refuser"
    else if (currentUserId === friendship.addresseeId) {
      actionButtons = (
        <>
          <button className="btn btn-success" onClick={handleAcceptRequest}>
            Accepter
          </button>
          <button className="btn btn-danger" onClick={handleRefuseRequest}>
            Refuser
          </button>
        </>
      )
    }
  } else if (friendship.status === 'accepted') {
    actionButtons = (
      <button className="btn btn-warning" onClick={handleRemoveFriend}>
        Retirer l’ami
      </button>
    )
  }

  return (
    <Link to="#" key={friendship.id}>
      <div className="card-item d-flex align-items-center gap-4">
        <div className="card-img-area">
          <Image
            className="w-100 rounded-circle"
            src={friendship.avatar}
            alt={`Avatar de ${friendship.nickname}`}
          />
        </div>
        <div className="card-info">
          <b className="card-title d-block tcn-1" data-profile={friendship.nickname}>
            {` ${friendship.nickname}`}
          </b>
          <div>
            {actionButtons}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default FriendshipComponent
