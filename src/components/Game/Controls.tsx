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
  const canUseGodPowers = checkPermission('godPowers', 'addBot')

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
        { canEditGame ? <button>Modifier le jeu</button> :
          <p>Vous ne pouvez pas modifier le jeu.</p> }
        { canSendMessage ? <button>Envoyer un message</button> :
          <p>Vous ne pouvez pas envoyer de message.</p> }
        { canUseGodPowers ? <button>Ajouter un bot</button> :
          <p>Vous ne pouvez pas ajouter de bot.</p> }
      </div>
    </>
  )
}

export default GameControls
