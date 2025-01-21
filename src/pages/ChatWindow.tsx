import React, { useEffect, useRef, useState } from 'react'
import { Box, Typography, TextField, Button, IconButton, Drawer, List, ListItem, ListItemText } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import axios from 'axios'
import io from 'socket.io-client'

interface ChatWindowProps {
  roomId: string;
  onNewMessage: (roomId: string) => void;
}

interface Message {
  nickname: string;
  content: string;
  userId: string;
  roomId: string;
}

const ChatWindow: React.FC<ChatWindowProps> = React.memo(({ roomId, onNewMessage }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [users, setUsers] = useState<string[]>([]) // Liste des utilisateurs connectés
  const [isDrawerOpen, setIsDrawerOpen] = useState(false) // Gérer l'ouverture de la sidebar
  const messagesEndRef = useRef<HTMLDivElement>(null) // Référence pour scroller en bas

  useEffect(() => {
    const socket = io('http://localhost:3010', {
      auth: {
        token: localStorage.getItem('token'), // Récupérer le token JWT
      },
      transports: ['websocket'], // Utilise uniquement WebSocket pour éviter le polling
    })

    // Événement pour recevoir les messages
    socket.on('newMessage', (message: Message) => {
      if (message.roomId === roomId) {
        setMessages((prevMessages) => [...prevMessages, message])
      } else {
        onNewMessage(message.roomId) // Incrémente les messages non lus
      }
    })

    // Événement pour recevoir la liste des utilisateurs connectés
    socket.on('connectedUsers', (userList: string[]) => {
      console.log(userList)
      setUsers(userList)
    })

    // Rejoindre la salle de chat
    socket.emit('joinRoom', roomId)

    // Charger les messages du salon
    const loadMessages = async () => {
      try {
        const response = await axios.get(`/api/rooms/${roomId}/messages`)
        setMessages(response.data)
      } catch (error) {
        console.error('Erreur lors du chargement des messages', error)
      }
    }

    loadMessages()

    return () => {
      socket.off('newMessage')
      socket.off('connectedUsers')
      socket.disconnect()
    }
  }, [roomId, onNewMessage])

  // Fonction pour scroller automatiquement vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom() // Scroller lorsque les messages sont mis à jour
  }, [messages])

  // Fonction pour envoyer un message
  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      try {
        await axios.post(
          '/api/messages',
          {
            roomId,
            message: newMessage,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`, // Ajouter le token JWT
            },
          }
        )
        setNewMessage('') // Réinitialiser le champ après l'envoi
      } catch (error) {
        console.error('Erreur lors de l\'envoi du message', error)
      }
    }
  }

  // Fonction pour ouvrir/fermer la sidebar
  const toggleDrawer = (open: boolean) => () => {
    setIsDrawerOpen(open)
  }

  return (
    <Box display="flex" flexDirection="column" flex={1} p={2}>

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" gutterBottom>
          Salon : {roomId}
        </Typography>

        {/* Bouton pour ouvrir la sidebar */}
        <IconButton onClick={toggleDrawer(true)}>
          <MenuIcon />
        </IconButton>
      </Box>

      {/* Sidebar rétractable avec la liste des utilisateurs connectés */}
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{ style: { width: '250px' } }}
      >
        <Box
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
          p={2}
        >
          <Typography variant="h6" gutterBottom>
            Utilisateurs connectés
          </Typography>
          <List>
            {users.map((user, index) => (
              <ListItem key={index}>
                <ListItemText primary={user} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Affichage des messages */}
      <Box flex={1} bgcolor="#f5f5f5" p={2} overflow="auto" maxHeight="400px">
        {messages.map((msg, index) => (
          <Typography key={index} variant="body1">
            <strong>{msg.nickname}:</strong> {msg.content}
          </Typography>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Zone de saisie des messages */}
      <Box mt={2} display="flex">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Saisir un message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage()
            }
          }}
        />
        <Button variant="contained" color="primary" onClick={handleSendMessage}>
          Envoyer
        </Button>
      </Box>
    </Box>
  )
})

ChatWindow.displayName = 'ChatWindow'

export default ChatWindow
