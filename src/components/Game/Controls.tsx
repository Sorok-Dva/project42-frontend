import React from 'react'
import { usePermissions } from '../../hooks/usePermissions'
import { Button } from '@mui/material'
import axios from 'axios'

interface GameControlsProps {
  gameId: string | undefined;
  fetchGameDetails: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({ gameId, fetchGameDetails }) => {
  const { checkPermission } = usePermissions()

  const canEditGame = checkPermission('game', 'edit')
  const canSendMessage = checkPermission('gamePowers', 'message')
  const canAddBot = checkPermission('godPowers', 'addBot')

  const handleAddBot = async () => {
    try {
      if (canAddBot) {
        await axios.post(`/api/admin/games/rooms/${gameId}/add-bot`)
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

      <div>
        <h1>Contrôles du jeu</h1>
        { checkPermission('game', 'edit')
          && (<button>Modifier le salon</button>) }
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
    </>
  )
}

export default GameControls
