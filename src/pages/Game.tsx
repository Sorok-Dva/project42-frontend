import React from 'react'
import { useParams } from 'react-router-dom'
import { GameProvider } from 'contexts/GameContext'
import GamePageContent from 'components/Game/GamePageContent'
import ModalProvider from 'contexts/ModalProvider'

const GamePage: React.FC = () => {
  const { id: gameId } = useParams<{ id: string }>()

  if (!gameId) {
    return <div>Identifiant de partie manquant</div>
  }

  return (
    <GameProvider gameId={gameId}>
      <ModalProvider>
        <GamePageContent />
      </ModalProvider>
    </GameProvider>
  )
}

export default GamePage
