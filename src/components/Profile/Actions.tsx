'use client'

import React from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ToastDefaultOptions } from 'utils/toastOptions'
import { useAuth } from 'contexts/AuthContext'
import type { Friendship } from 'components/Layouts/navbar/Friends'
import { motion } from 'framer-motion'

interface Data {
  id: number
  nickname: string
  canGuildInvite: boolean
  guild: {
    id: number
  }
}

interface ActionsProps {
  data: Data
  relation: 'me' | 'none' | 'waiting' | 'friend'
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
    axios
      .delete(`/api/friends/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        toast.info(`Votre demande d'ami pour <b>${nickname}</b> a été annulée.`, ToastDefaultOptions)
        window.dispatchEvent(new CustomEvent('friendsChanged'))
        setPlayerRelation('none')
      })
      .catch((err) => {
        toast.error('Une erreur est survenue dans l\'annulation de votre demande d\'ami.', ToastDefaultOptions)
        console.error('Erreur lors de la suppression de la relation d\'amitié', err)
      })
  }

  const handleRemoveFriend = (id: number, nickname: string) => {
    axios
      .delete(`/api/friends/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        toast.info(`Vous avez retiré <b>${nickname}</b> de vos amis.`, ToastDefaultOptions)
        window.dispatchEvent(new CustomEvent('friendsChanged'))
        setPlayerRelation('none')
      })
      .catch((err) => {
        toast.error(`Une erreur est survenue lors du retrait de ${nickname} de vos amis.`, ToastDefaultOptions)
        console.error('Erreur lors de la suppression de la relation d\'amitié', err)
      })
  }

  return (
    <div className="flex justify-center space-x-3">
      {playerRelation === 'me' ? (
        <motion.a
          href="/account/settings"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Modifier le profil
        </motion.a>
      ) : (
        <>
          {playerRelation !== 'none' && (
            <motion.button
              className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm font-medium transition-all opacity-50 cursor-not-allowed"
              disabled
            >
              Envoyer un MP
            </motion.button>
          )}
          {data.canGuildInvite && (
            <motion.button
              className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm font-medium transition-all opacity-50 cursor-not-allowed"
              disabled
            >
              Inviter dans la station
            </motion.button>
          )}
          {playerRelation === 'none' && (
            <motion.button
              onClick={() => handleAddFriend(data.id)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Ajouter à mes amis
            </motion.button>
          )}
          {playerRelation === 'waiting' && (
            <motion.button
              onClick={() => handleCancelRequest(data.id, data.nickname)}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Annuler la demande
            </motion.button>
          )}
          {playerRelation === 'friend' && (
            <motion.button
              onClick={() => handleRemoveFriend(data.id, data.nickname)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Retirer de mes amis
            </motion.button>
          )}
        </>
      )}
    </div>
  )
}

export default Actions
