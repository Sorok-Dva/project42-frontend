import React from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ToastDefaultOptions } from 'utils/toastOptions'
import { useAuth } from 'contexts/AuthContext'
import { Friendship } from 'components/Layouts/navbar/Friends'

interface Data {
  id: number;
  nickname: string;
  canGuildInvite: boolean;
  guild: {
    id: number;
  };
}

interface ActionsProps {
  data: Data;
  relation: 'me' | 'none' | 'waiting' | 'friend';
}

const Actions: React.FC<ActionsProps> = ({ data, relation }) => {
  const { token } = useAuth()
  const [playerRelation, setPlayerRelation] = React.useState<'me' | 'none' | 'waiting' | 'friend'>(relation)
  const handleAddFriend = async (friendId: number) => {
    try {
      const response = await axios.post<Friendship>(
        '/api/friends/add',
        { addresseeId: friendId },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      window.dispatchEvent(new CustomEvent('friendsChanged'))
      toast.info(`Votre demande d'ami a été envoyée à ${response.data.nickname}.`, ToastDefaultOptions)
      setPlayerRelation('waiting')
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

  const handleCancelRequest = (id: number, nickname: string) => {
    axios.delete(`/api/friends/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        toast.info(`Votre demande d'ami pour <b>${nickname}</b> a été annulée.`, ToastDefaultOptions)
        window.dispatchEvent(new CustomEvent('friendsChanged'))
        setPlayerRelation('none')
      })
      .catch((err) => {
        toast.error('Une erreur est survenue dans l\'annulation de votre demande d\'ami.', ToastDefaultOptions)
        console.error('Erreur lors de la suppression de la relation d’amitié', err)
      })
  }

  const handleRemoveFriend = (id: number, nickname: string) => {
    axios.delete(`/api/friends/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        toast.info(`Vous avez retiré <b>${nickname}</b> de vos amis.`, ToastDefaultOptions)
        window.dispatchEvent(new CustomEvent('friendsChanged'))
        setPlayerRelation('none')
      })
      .catch((err) => {
        toast.error(`Une erreur est survenue lors du retrait de ${nickname} de vos amis.`, ToastDefaultOptions)
        console.error('Erreur lors de la suppression de la relation d’amitié', err)
      })
  }

  return (
    <div className="parametres-profil">
      <div className="profile_actions buttons">
        {playerRelation === 'me' ? (
          <a className="button_secondary" href="/account/settings" target="_blank" rel="noopener noreferrer">
            Modifier le profil
          </a>
        ) : (
          <>
            {playerRelation !== 'none' && (
              <div className="button_secondary new-talk disabled" data-nickname={data.nickname}>
                Envoyer un MP
              </div>
            )}
            {data.canGuildInvite && (
              <div className="button_secondary disabled" data-invite-hamlet={data.guild.id}>
                Inviter dans a station
              </div>
            )}
            {playerRelation === 'none' && (
              <div className="button_secondary" onClick={() => handleAddFriend(data.id)}>
                Ajouter à mes amis
              </div>
            )}
            {playerRelation === 'waiting' && (
              <div className="button_secondary" onClick={() => handleCancelRequest(data.id, data.nickname)}>
                Annuler la demande
              </div>
            )}
            {playerRelation === 'friend' && (
              <div className="button_secondary" onClick={() => handleRemoveFriend(data.id, data.nickname)}>
                Retirer de mes amis
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Actions
