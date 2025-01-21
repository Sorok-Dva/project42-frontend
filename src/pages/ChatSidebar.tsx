import React from 'react'
import { Box, List, ListItem, ListItemText, Typography, Badge } from '@mui/material'

interface ChatSidebarProps {
  setSelectedRoom: (roomId: string) => void;
  unreadMessages: { [roomId: string]: number }; // Propriété pour les messages non lus
}

const rooms = ['General', 'Technology', 'Music', 'Sports'] // Exemple de salons

const ChatSidebar: React.FC<ChatSidebarProps> = ({ setSelectedRoom, unreadMessages }) => {
  return (
    <Box width="250px" bgcolor="lightgray" p={2}>
      <Typography variant="h6" gutterBottom>
        Salons
      </Typography>
      <List>
        {rooms.map((room) => (
          <ListItem component="button" key={room} onClick={() => setSelectedRoom(room)}>
            <Badge
              color="primary"
              badgeContent={unreadMessages[room] || 0}
              invisible={unreadMessages[room] === 0}
            >
              <ListItemText primary={room} />
            </Badge>
          </ListItem>
        ))}
      </List>
    </Box>
  )
}

export default ChatSidebar
