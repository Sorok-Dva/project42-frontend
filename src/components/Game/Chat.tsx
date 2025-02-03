import React, { useState } from 'react'
import { ListItem, ListItemText } from '@mui/material'
import { Box, TextField, Typography } from '@mui/material'
import { List } from '@mui/material'
import { Socket } from 'socket.io-client'
import { PlayerType } from 'hooks/useGame'
import { User } from 'contexts/UserContext'

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
  highlightedPlayers: { [nickname: string]: string }
}

const Chat: React.FC<ChatProps> = ({
  gameId,
  playerId,
  players,
  player,
  user,
  userRole,
  messages,
  messagesEndRef,
  socket,
  highlightedPlayers,
}) => {
  const [newMessage, setNewMessage] = useState('')
  const [currentCommand, setCurrentCommand] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleSendMessage = () => {
    const trimmedMessage = newMessage.trim()
    if (!trimmedMessage || !socket) return

    try {
      if (trimmedMessage.startsWith('/')) {
        if (userRole !== 'User') {
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
        }
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

    if (userRole === 'User') return

    const words = value.trim().split(' ')
    const command = words[0]?.startsWith('/') ? words[0].slice(1) : ''
    const arg = words[1] || ''
    const hasAdditionalArgs = words.length > 2

    setCurrentCommand(command)

    if (
      ['kick', 'ban', 'mute', 'unmute', 'nick', 'crea', 'card'].includes(command)
      && !hasAdditionalArgs
    ) {
      const searchQuery = arg.toLowerCase()
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

  const handleMentionClick = (nickname: string) => {
    setNewMessage((prevMessage) => `${prevMessage.trim()} @${nickname} `)
    inputRef.current?.focus()
  }

  const stripHTML = (input: string) => {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = input
    return tempDiv.textContent || tempDiv.innerText || ''
  }

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Box flex={1} bgcolor="#f5f5f5" p={2} overflow="auto">
        {messages.map((msg, index) => {
          const cleanNickname = stripHTML(msg.nickname)
          const escapedMessage = stripHTML(msg.message)

          const highlightColor = highlightedPlayers[cleanNickname] || 'transparent'

          const highlightMention = (message: string, nickname?: string) => {
            const regex = new RegExp(`\\b${nickname}\\b`, 'gi')
            return message.replace(
              regex,
              `<span style="background-color: #ff9100">${nickname}</span>`
            )
          }

          const shouldHighlight =
            cleanNickname !== 'Système' && cleanNickname !== 'Modération'

          let processedMessage
          if (cleanNickname === 'Modération') {
            processedMessage = msg.message
          } else if (shouldHighlight) {
            processedMessage = highlightMention(escapedMessage, player?.nickname)
          } else {
            processedMessage = escapedMessage
          }

          return (
            <Typography
              key={index}
              variant="body1"
              sx={{
                backgroundColor: highlightColor,
                padding: '4px',
                borderRadius: '4px',
              }}
              onClick={(e) => {
                const target = e.target as HTMLElement
                if (target.classList.contains('msg-nickname')) {
                  const nickname = target.getAttribute('data-highlight-nickname')
                  if (nickname) handleMentionClick(nickname)
                }
              }}
            >
              <small>[{new Date(msg.createdAt).toLocaleTimeString()}]</small>{' '}
              {msg.icon && <img src={`/assets/images/${msg.icon}`} className="msg-icon" alt="icon" />}
              <strong className="msg-nickname" data-highlight-nickname={cleanNickname}
                dangerouslySetInnerHTML={{ __html: cleanNickname === 'Modération' ? msg.nickname : cleanNickname }}>
              </strong>:{' '}
              <span dangerouslySetInnerHTML={{ __html: processedMessage }} />
            </Typography>
          )
        })}

        <div ref={messagesEndRef} />
      </Box>
      { player && (
        <Box mt={2} display="flex" flexDirection="column" position="relative">
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Saisir un message..."
            value={newMessage}
            inputRef={inputRef}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (suggestions.length > 0) {
                if (e.key === 'ArrowDown') {
                  setSelectedIndex((prev) => (prev + 1) % suggestions.length)
                  e.preventDefault()
                } else if (e.key === 'ArrowUp') {
                  setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length)
                  e.preventDefault()
                } else if (e.key === 'Enter') {
                  if (selectedIndex === -1) {
                    // Si aucune sélection, on prend la première suggestion
                    setSelectedIndex(0)
                    setNewMessage(`/${currentCommand} ${suggestions[0]} `)
                    setSuggestions([])
                    e.preventDefault()
                  } else if (selectedIndex >= 0) {
                    // Si une suggestion est sélectionnée, l'insérer
                    const chosenNickname = suggestions[selectedIndex]
                    setNewMessage(`/${currentCommand} ${chosenNickname} `)
                    setSelectedIndex(-1) // Réinitialise l'index sélectionné
                    setSuggestions([]) // Cache les suggestions
                    e.preventDefault() // Empêche l'envoi immédiat du message
                  }
                }
              } else if (e.key === 'Enter') {
                handleSendMessage()
              }
            }}
            inputProps={{
              style: { zIndex: 1 },
            }}
            autoComplete="off"
          />
          {suggestions.length > 0 && (
            <List
              sx={{
                position: 'absolute',
                bottom: '100%',
                left: 0,
                width: '100%',
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
                    bgcolor: selectedIndex === index ? '#ddd' : 'white',
                    ':hover': { bgcolor: '#f0f0f0' },
                  }}
                >
                  <ListItemText primary={nickname} />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      )}
    </Box>
  )
}

export default Chat
