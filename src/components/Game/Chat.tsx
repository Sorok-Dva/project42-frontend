import React, { useState } from 'react'
import { ListItem, ListItemText } from '@mui/material'
import { Box, TextField, Button, Typography } from '@mui/material'
import { List } from '@mui/material'
import DOMPurify from 'dompurify'
import { Socket } from 'socket.io-client'
import { PlayerType } from 'hooks/useGame'
import { User } from 'context/UserContext'

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
  players?: PlayerType[]
  playerId?: string | number
  player?: PlayerType
  user?: User
  userRole?: string
  messages: Message[]
  messagesEndRef: React.RefObject<HTMLDivElement>
  socket: Socket | null
}

const Chat: React.FC<ChatProps> = ({
  gameId,
  playerId,
  players,
  user,
  userRole,
  messages,
  messagesEndRef,
  socket,
}) => {
  const [newMessage, setNewMessage] = useState('')
  const [currentCommand, setCurrentCommand] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])

  const inputRef = React.useRef<HTMLInputElement>(null)

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
          moderator: user,
        })
      } else {
        socket.emit('sendMessage', {
          roomId: gameId,
          playerId,
          content: trimmedMessage,
        })
      }
      setNewMessage('')
      setSuggestions([])
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message ou de la commande:', error)
    }
  }

  const handleInputChange = (value: string) => {
    setNewMessage(value)

    if (value.startsWith('/')) {
      const command = value.split(' ')[0].slice(1) // Extrait la commande sans le "/"
      setCurrentCommand(command)
    }

    if (
      value.startsWith('/kick ') ||
      value.startsWith('/ban ') ||
      value.startsWith('/mute ') ||
      value.startsWith('/unmute ')
    ) {
      const searchQuery = value.split(' ')[1]?.toLowerCase() || ''
      const filteredSuggestions = players
        ?.filter((p) => p.nickname.toLowerCase().includes(searchQuery) && p.id !== playerId)
        .map((p) => p.nickname) || []

      setSuggestions(filteredSuggestions)
    } else {
      setSuggestions([])
    }
  }

  const handleSuggestionClick = (command: string, nickname: string) => {
    setNewMessage(`/${command} ${nickname} `)
    setSuggestions([])
    inputRef.current?.focus()
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
      <Box mt={2} display="flex" flexDirection="column" position="relative">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Saisir un message..."
          value={newMessage}
          inputRef={inputRef}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage()
            }
          }}
          inputProps={{
            style: { zIndex: 1 }, // Mettre l'input au-dessus si nécessaire
          }}
        />
        {suggestions.length > 0 && (
          <List
            sx={{
              position: 'absolute',
              bottom: '100%', // Positionner au-dessus de l'input
              left: 0,
              width: '100%', // Correspondre à la largeur de l'input
              bgcolor: 'white',
              border: '1px solid #ccc',
              maxHeight: '150px',
              overflowY: 'auto',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              zIndex: 1000,
            }}
          >
            {suggestions.map((nickname, index) => (
              <ListItem
                key={index}
                component="li"
                onClick={() => handleSuggestionClick(currentCommand, nickname)}
                sx={{
                  cursor: 'pointer',
                  padding: '8px 16px',
                  ':hover': { bgcolor: '#f0f0f0' },
                }}
              >
                <ListItemText primary={nickname} />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Box>
  )
}

export default Chat
