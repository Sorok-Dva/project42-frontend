import React from 'react'
import { useParams } from 'react-router-dom'
import { GameProvider } from 'contexts/GameContext'
import GamePageContent from 'components/Game/GamePageContent'
import ModalProvider from 'contexts/ModalProvider'

const GamePage: React.FC = () => {
  const { id: gameId } = useParams<{ id: string }>()

  if (!gameId) {
    return (
      <main className="min-h-screen bg-black bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black flex items-center justify-center text-white">
        <div className="bg-black/60 backdrop-blur-md rounded-xl border border-red-500/30 p-8 max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-4">Identifiant de partie manquant</h1>
          <p className="text-gray-400">Impossible de charger la partie sans identifiant.</p>
          <button
            onClick={() => window.history.back()}
            className="mt-6 px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white rounded-lg transition-all"
          >
            Retour
          </button>
        </div>
      </main>
    )
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
