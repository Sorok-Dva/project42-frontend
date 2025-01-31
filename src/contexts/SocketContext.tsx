import React, { createContext, ReactNode, useContext } from 'react'
import { io, Socket } from 'socket.io-client'

interface SocketContextType {
  socket: Socket
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const socket = io('http://localhost:3010', {
    auth: {
      token: localStorage.getItem('token'),
    },
    transports: ['websocket'],
  })

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}
