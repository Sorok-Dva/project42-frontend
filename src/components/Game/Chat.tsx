import React, { useState, useRef, useCallback } from 'react'
import { Box, TextField, List, ListItem, ListItemText } from '@mui/material'
import { Message, PlayerType, Viewer } from 'hooks/useGame'
import { User } from 'contexts/UserContext'
import { useSocket } from 'contexts/SocketContext'
import ChatMessages, { ChatMessagesHandle } from 'components/Game/ChatMessage'

interface ChatProps {
  gameId: string;
  players?: PlayerType[];
  playerId?: string | number;
  player?: PlayerType;
  user?: User;
  viewer?: Viewer;
  userRole?: string;
  isNight: boolean;
  gameStarted: boolean;
  gameFinished: boolean;
  isArchive: boolean;
  messages: Message[];
  highlightedPlayers: { [nickname: string]: string };
  isInn: boolean;
}

const Chat: React.FC<ChatProps> = ({
  gameId,
  players,
  playerId,
  player,
  user,
  viewer,
  userRole,
  messages,
  highlightedPlayers,
  isNight,
  gameStarted,
  gameFinished,
  isArchive,
  isInn,
}) => {
  const { socket } = useSocket()
  const [newMessage, setNewMessage] = useState('')
  const [currentCommand, setCurrentCommand] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [unreadCount, setUnreadCount] = useState(0)

  const chatMessagesRef = useRef<ChatMessagesHandle>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUnreadChange = useCallback((count: number) => {
    setUnreadCount(count)
  }, [])

  const developerCommand = ['startPhase', 'endPhase', 'listCards']
  const handleSendMessage = () => {
    if (isArchive) return
    const trimmedMessage = newMessage.trim()
    if (!trimmedMessage || !socket) return
    try {
      if (trimmedMessage.startsWith('/')) {
        if (userRole !== 'User') {
          const commandString = trimmedMessage.slice(1).trim()
          const [command, arg, ...rest] = commandString.split(' ')
          const text = rest.join(' ')
          socket.emit(
            developerCommand.includes(command) ? 'developerCommand' : 'moderationCommand',
            {
              command,
              arg,
              text,
              roomId: gameId,
              playerId,
              currentUserRole: userRole,
              moderator: user,
            }
          )
        }
      } else {
        let channelToSend = player ? 0 : viewer ? 1 : null
        if (channelToSend === null) return
        if (
          isNight &&
          ([2, 9, 20, 21].includes(player?.card?.id || -1) || player?.isInfected) &&
          gameStarted &&
          !gameFinished
        )
          channelToSend = 3
        if (isNight && player?.card?.id === 16 && gameStarted && !gameFinished)
          channelToSend = 4
        if (
          isNight &&
          player?.card?.id === 17 &&
          gameStarted &&
          !gameFinished
        )
          channelToSend = 5
        if (
          (isNight && isInn && gameStarted && !gameFinished) ||
          (isNight && player?.card?.id === 23)
        )
          channelToSend = 6
        socket.emit('sendMessage', {
          roomId: gameId,
          playerId,
          viewer,
          content: trimmedMessage,
          channel: channelToSend,
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
      [
        'kick', 'ban', 'mute', 'unmute', 'nick', 'crea', 'card',
        'kill', 'revive', 'achievement'
      ].includes(command)
      && !hasAdditionalArgs
    ) {
      const searchQuery = arg.toLowerCase()
      const filteredSuggestions =
        players
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
    setNewMessage((prev) => `${prev.trim()} @${nickname} `)
    inputRef.current?.focus()
  }

  return (
    <Box display="flex" flexDirection="column" height="100%">
      {/* Conteneur scrollable pour le chat */}
      <Box flex={1} id="block_chat" className="shadow rounded" p={2} overflow="auto">
        <Box id="block_chat_content" className="block_scrollable_wrapper scrollbar-dark" sx={{ height: '100%' }}>
          <Box id="block_chat_game" className="block_scrollable_content" sx={{ height: '100%' }}>
            {/* Badge des nouveaux messages en position sticky */}
            {unreadCount > 0 && (
              <div
                id="scroll_chat"
                className="visible"
                onClick={() => {
                  chatMessagesRef.current?.scrollToBottom()
                  setUnreadCount(0)
                }}
              >
                {unreadCount} nouveau{unreadCount > 1 ? 'x' : ''} message{unreadCount > 1 ? 's' : ''}
              </div>
            )}
            <div id="load_chat">Chargement des messages plus anciens...</div>
            <ChatMessages
              ref={chatMessagesRef}
              messages={messages}
              highlightedPlayers={highlightedPlayers}
              player={player}
              viewer={viewer}
              isNight={isNight}
              gameFinished={gameFinished}
              handleMentionClick={handleMentionClick}
              isInn={isInn}
              onUnreadChange={handleUnreadChange}
            />
          </Box>
        </Box>
      </Box>
      {(!isArchive &&
        (player ||
          viewer?.user?.id ||
          (!player &&
            ['SuperAdmin', 'Admin', 'Developer', 'Moderator', 'ModeratorTest'].includes(userRole as string)))) && (
        <div id="block_chat_post">
          <div className="chat_send">
            <TextField
              fullWidth
              id="block_chat_message"
              className="mousetrap"
              variant="outlined"
              placeholder="Écrire un message..."
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
                      setSelectedIndex(0)
                      setNewMessage(`/${currentCommand} ${suggestions[0]} `)
                      setSuggestions([])
                      e.preventDefault()
                    } else if (selectedIndex >= 0) {
                      const chosenNickname = suggestions[selectedIndex]
                      setNewMessage(`/${currentCommand} ${chosenNickname} `)
                      setSelectedIndex(-1)
                      setSuggestions([])
                      e.preventDefault()
                    }
                  }
                } else if (e.key === 'Enter') {
                  handleSendMessage()
                }
              }}
              inputProps={{
                style: { zIndex: 1, height: 'auto' },
                maxLength: 500,
                autoFocus: true,
              }}
              autoComplete="off"
            />
          </div>
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
        </div>
      )}
    </Box>
  )
}

export default Chat
