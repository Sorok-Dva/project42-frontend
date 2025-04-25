import React, { createContext, ReactNode, useContext, useMemo } from 'react'
import { io, Socket } from 'socket.io-client'
import { useLocation } from 'react-router-dom'

interface SocketContextType {
  socket: Socket
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const location = useLocation()

  const clientType = /^\/game\/\d+$/.test(location.pathname)
    ? 'game'
    : 'site'

  const ENDPOINT = process.env.NODE_ENV === 'production'
    ? 'https://project42.sorokdva.eu'
    : 'http://localhost:3010'

  const socket = useMemo(() => {
    return io(ENDPOINT, {
      auth: { token: localStorage.getItem('token') },
      query: { clientType },
      transports: ['websocket'],
    })
  }, [ENDPOINT, clientType])

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
