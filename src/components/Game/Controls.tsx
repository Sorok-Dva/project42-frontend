import React from 'react'
import { usePermissions } from '../../hooks/usePermissions'
import { Button } from '@mui/material'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import { useUser } from '../../context/UserContext'

interface GameControlsProps {
  gameId: string | undefined;
  isCreator: boolean;
  fetchGameDetails: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({ isCreator, gameId, fetchGameDetails }) => {
  const { token } = useAuth()
  const { user } = useUser()
  const { checkPermission } = usePermissions()

  const canEditGame = checkPermission('game', 'edit')
  const canSendMessage = checkPermission('gamePowers', 'message')
  const canAddBot = checkPermission('godPowers', 'addBot')

  const handleAddBot = async () => {
    try {
      if (canAddBot) {
        await axios.post(`/api/admin/games/room/${gameId}/add-bot`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        fetchGameDetails()
      } else throw new Error('Vous n\'avez pas la permission d\'ajouter un bot')
    } catch (error) {
      console.error('Erreur lors de l\'ajout du bot:', error)
    }
  }

  const handleStartGame = async () => {
    try {
      await axios.post(`/api/games/${gameId}/start`)
      fetchGameDetails()
    } catch (error) {
      console.error('Erreur lors du lancement de la partie:', error)
    }
  }

  const handleTransferCreator = async (newCreatorId: string) => {
    try {
      await axios.post(`/api/games/${gameId}/transfer`, { newCreatorId })
      fetchGameDetails() // Actualiser les détails
    } catch (error) {
      console.error('Erreur lors du transfert des droits de créateur:', error)
    }
  }
  return (
    <>
      {isCreator && (
        <>
          <Button
            variant="contained"
            color="primary"
            onClick={ () => handleStartGame() }
          >
          Lancer la partie
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={ () => handleTransferCreator('1') }
          >

          Léguer les droits du salon
          </Button>
        </>
      )}

      { [
        'SuperAdmin',
        'Admin',
        'Developers',
        'Moderator',
        'ModeratorTest',
        'Animator'
      ].includes(user?.role as string) && (
        <div>
          <h1>Contrôles du jeu</h1>
          { checkPermission('game', 'edit')
            && (
              <>
                <button>Modifier le salon</button>
              </>
            ) }
          { canAddBot
            && (
              <Button
                variant="outlined"
                color="warning"
                onClick={ () => handleAddBot() }
              >
                Ajouter un bot
              </Button>
            ) }
        </div>
      ) }
    </>
  )
}

export default GameControls
