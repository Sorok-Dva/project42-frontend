import React, { useState } from 'react'
import { Box, Typography } from '@mui/material'
import ChatWindow from './ChatWindow'
import ChatSidebar from './ChatSidebar'

const ChatApp: React.FC = () => {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [unreadMessages, setUnreadMessages] = useState<{ [roomId: string]: number }>({})

  // Fonction pour mettre à jour les messages non lus
  const handleNewMessage = (roomId: string) => {
    // Si le salon n'est pas focus, incrémenter le nombre de messages non lus
    if (roomId !== selectedRoom) {
      setUnreadMessages((prev) => ({
        ...prev,
        [roomId]: (prev[roomId] || 0) + 1,
      }))
    }
  }

  // Remet à zéro les messages non lus quand on entre dans un salon
  const handleRoomSelect = (roomId: string) => {
    setSelectedRoom(roomId)
    setUnreadMessages((prev) => ({
      ...prev,
      [roomId]: 0, // Réinitialiser les nouveaux messages non lus
    }))
  }

  return (
    <Box display="flex" marginTop="6rem" height="55vh">
      {/* Sidebar pour les salons */}
      <ChatSidebar
        setSelectedRoom={handleRoomSelect}
        unreadMessages={unreadMessages} // Passer les nouveaux messages non lus
      />

      {/* Fenêtre de discussion */}
      <Box flex={1} display="flex" flexDirection="column">
        {selectedRoom ? (
          <ChatWindow roomId={selectedRoom} onNewMessage={handleNewMessage} />
        ) : (
          <Box display="flex" alignItems="center" justifyContent="center" flex={1}>
            <Typography variant="h6">Veuillez sélectionner un salon</Typography>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default ChatApp
