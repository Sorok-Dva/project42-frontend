import React, { createContext, useContext } from 'react'
import { useGame } from 'hooks/useGame'
import { useAuth } from 'contexts/AuthContext'
import { useUser } from 'contexts/UserContext'
import { useSocket } from 'contexts/SocketContext'

interface GameProviderProps {
  gameId: string;
  children: React.ReactNode;
}

type GameContextType = ReturnType<typeof useGame>;

const GameContext = createContext<GameContextType | undefined>(undefined)

export const GameProvider: React.FC<GameProviderProps> = ({ gameId, children }) => {
  const { token } = useAuth()
  const { user } = useUser()
  const { socket } = useSocket()

  const game = useGame(gameId, user, token, socket)

  return (
    <GameContext.Provider value={game}>
      {children}
    </GameContext.Provider>
  )
}

export const useGameContext = (): GameContextType => {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGameContext doit être utilisé dans un GameProvider')
  }
  return context
}
