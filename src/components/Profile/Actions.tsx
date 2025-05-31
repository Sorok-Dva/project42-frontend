'use client'

import React from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { UserPlus, MessageCircle, Users, UserMinus, UserX, Settings } from 'lucide-react'
import { ToastDefaultOptions } from 'utils/toastOptions'
import { useAuth } from 'contexts/AuthContext'
import type { Friendship } from 'components/Layouts/navbar/Friends'

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

  const actionButtons = [
    ...(playerRelation === 'me'
      ? [
        {
          icon: Settings,
          label: 'Modifier le profil',
          onClick: () => window.open('/account/settings', '_blank'),
          variant: 'primary' as const,
        },
      ]
      : [
        ...(playerRelation !== 'none'
          ? [
            {
              icon: MessageCircle,
              label: 'Envoyer un MP',
              onClick: () => {}, // TODO: Implement MP functionality
              variant: 'secondary' as const,
              disabled: true,
            },
          ]
          : []),
        ...(data.canGuildInvite
          ? [
            {
              icon: Users,
              label: 'Inviter dans la station',
              onClick: () => {}, // TODO: Implement guild invite
              variant: 'secondary' as const,
              disabled: true,
            },
          ]
          : []),
        ...(playerRelation === 'none'
          ? [
            {
              icon: UserPlus,
              label: 'Ajouter à mes amis',
              onClick: () => handleAddFriend(data.id),
              variant: 'primary' as const,
            },
          ]
          : []),
        ...(playerRelation === 'waiting'
          ? [
            {
              icon: UserX,
              label: 'Annuler la demande',
              onClick: () => handleCancelRequest(data.id, data.nickname),
              variant: 'danger' as const,
            },
          ]
          : []),
        ...(playerRelation === 'friend'
          ? [
            {
              icon: UserMinus,
              label: 'Retirer de mes amis',
              onClick: () => handleRemoveFriend(data.id, data.nickname),
              variant: 'danger' as const,
            },
          ]
          : []),
      ]),
  ]

  const getButtonStyles = (variant: 'primary' | 'secondary' | 'danger', disabled?: boolean) => {
    const baseStyles =
      'flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'

    if (disabled) {
      return `${baseStyles} bg-gray-700/50 text-gray-400 cursor-not-allowed`
    }

    switch (variant) {
    case 'primary':
      return `${baseStyles} bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-blue-500/25`
    case 'secondary':
      return `${baseStyles} bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-600/50`
    case 'danger':
      return `${baseStyles} bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 border border-red-500/50`
    default:
      return baseStyles
    }
  }

  return (
    <motion.div
      className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="text-lg font-bold text-white mb-4">Actions</h3>
      <div className="flex flex-wrap gap-3">
        {actionButtons.map((button, index) => (
          <motion.button
            key={index}
            className={getButtonStyles(button.variant, button.disabled)}
            onClick={button.onClick}
            disabled={button.disabled}
            whileHover={!button.disabled ? { scale: 1.02 } : {}}
            whileTap={!button.disabled ? { scale: 0.98 } : {}}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <button.icon size={16} />
            <span>{button.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

export default Actions
