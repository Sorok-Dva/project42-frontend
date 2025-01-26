import React, { useState } from 'react'
import { Box, TextField, Button, Typography } from '@mui/material'
import DOMPurify from 'dompurify'
import { Socket } from 'socket.io-client'

interface Message {
  nickname: string
  message: string
  playerId: number
  channel: number
  icon: string | null
  createdAt: Date
}

interface ChatProps {
  gameId: string
  playerId?: string | number
  userRole?: string
  messages: Message[]
  messagesEndRef: React.RefObject<HTMLDivElement>
  socket: Socket | null
}

const Chat: React.FC<ChatProps> = ({
  gameId,
  playerId,
  userRole,
  messages,
  messagesEndRef,
  socket,
}) => {
  const [newMessage, setNewMessage] = useState('')

  const handleSendMessage = () => {
    const trimmedMessage = newMessage.trim()
    if (!trimmedMessage || !socket) return

    try {
      if (trimmedMessage.startsWith('/')) {
        // Commande de modération
        const commandString = trimmedMessage.slice(1).trim()
        const [command, arg, ...rest] = commandString.split(' ')
        const text = rest.join(' ')

        socket.emit('moderationCommand', {
          command,
          arg,
          text,
          roomId: gameId,
          playerId,
          currentUserRole: userRole,
          moderator: {
            id: playerId,
            username: '', // Au besoin, tu peux récupérer la valeur dans les props
          },
        })
      } else {
        // Message normal
        socket.emit('sendMessage', {
          roomId: gameId,
          playerId,
          content: trimmedMessage,
        })
      }
      setNewMessage('')
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message ou de la commande:', error)
    }
  }

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Box flex={1} bgcolor="#f5f5f5" p={2} overflow="auto">
        {messages.map((msg, index) => {
          const htmlContent = DOMPurify.sanitize(`
            <small>[${new Date(msg.createdAt).toLocaleTimeString()}]</small>
            ${msg.icon ? `<img src="/assets/images/${msg.icon}" class="msg-icon" />` : ''}
            <strong>${msg.nickname}:</strong> ${msg.message}
          `)

          return (
            <Typography
              key={index}
              variant="body1"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          )
        })}
        <div ref={messagesEndRef} />
      </Box>
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
        <Button
          variant="contained"
          color="primary"
          onClick={handleSendMessage}
        >
          Envoyer
        </Button>
      </Box>
    </Box>
  )
}

export default Chat
