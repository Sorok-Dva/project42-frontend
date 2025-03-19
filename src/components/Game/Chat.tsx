import React, { useState } from 'react'
import { ListItem, ListItemText } from '@mui/material'
import { Box, TextField } from '@mui/material'
import { List } from '@mui/material'
import { PlayerType, Viewer } from 'hooks/useGame'
import { User } from 'contexts/UserContext'
import { useSocket } from 'contexts/SocketContext'
import ChatMessages from 'components/Game/ChatMessage'

interface Message {
  nickname: string
  message: string
  playerId: number
  channel: number
  isMeneur: boolean
  isPerso: boolean
  isMsgSite: boolean
  icon: string | null
  createdAt: Date
}

interface ChatProps {
  gameId: string
  players?: PlayerType[]
  playerId?: string | number
  player?: PlayerType
  user?: User
  viewer?: Viewer
  userRole?: string
  isNight: boolean
  gameStarted: boolean
  gameFinished: boolean
  isArchive: boolean
  messages: Message[]
  highlightedPlayers: { [nickname: string]: string }
}

const Chat: React.FC<ChatProps> = ({
  gameId,
  playerId,
  players,
  player,
  viewer,
  user,
  userRole,
  messages,
  highlightedPlayers,
  isNight,
  gameStarted,
  gameFinished,
  isArchive,
}) => {
  const { socket } = useSocket()
  const [newMessage, setNewMessage] = useState('')
  const [currentCommand, setCurrentCommand] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const inputRef = React.useRef<HTMLInputElement>(null)

  const developerCommand = ['startPhase', 'endPhase', 'listCards']
  const handleSendMessage = () => {
    if (isArchive) return
    const trimmedMessage = newMessage.trim()
    if (!trimmedMessage || !socket) return

    try {
      if (trimmedMessage.startsWith('/')) {
        if (userRole !== 'User') {
          // Commande de modération
          const commandString = trimmedMessage.slice(1).trim()
          const [command, arg, ...rest] = commandString.split(' ')
          const text = rest.join(' ')

          socket.emit(developerCommand.includes(command) ? 'developerCommand' : 'moderationCommand', {
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
        let channelToSend = player ? 0 : viewer ? 1 : null
        if (channelToSend === null) return
        if (isNight
          && ([2, 9, 20, 21].includes(player?.card?.id || -1) || player?.isInfected)
          && gameStarted
          && !gameFinished
        ) channelToSend = 3

        if (isNight
          && player?.card?.id === 16
          && gameStarted
          && !gameFinished
        ) channelToSend = 4

        if (isNight
          && (player?.card?.id === 17)
          && gameStarted
          && !gameFinished
        ) channelToSend = 5

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
      <Box flex={ 1 } id="block_chat" className="shadow rounded" p={ 2 }
        overflow="auto">
        <Box id="block_chat_content"
          className="block_scrollable_wrapper scrollbar-dark">
          <Box id="block_chat_game" className="block_scrollable_content" sx={{ flex: 1, height: '100%' }}>
            <Box className="canal_meneur game-rules">
              <div>Rappel : vous êtes sur une partie <span className='bullet-game type-0'></span> <b>Normale</b> :<br />
                <ul>
                  <li>Il est strictement <b>interdit d'insulter</b> un autre joueur et d'avoir une attitude malsaine. Toute forme d'<b>anti-jeu</b> sera sanctionnée.</li>
                  <li>Le dévoilement est <b>interdit</b> et <b>sanctionné</b> systématiquement. Il est aussi <b>interdit</b> de donner toute forme d'indice sur son rôle.</li>
                  <li>Tous les joueurs <b>doivent</b> participer au débat. Il n'est pas autorisé d'être <b>AFK</b>.</li>
                </ul>
                Soyez courtois et aimable. Bon jeu ! <br /> <br />
                <b>Rappel :</b> ne divulguez <b>jamais</b> vos informations privées sur le jeu.
              </div>
              <hr />
            </Box>
            <div id="scroll_chat"></div>
            <div id="load_chat">Chargement des messages plus anciens...</div>
            <ChatMessages
              messages={messages}
              highlightedPlayers={highlightedPlayers}
              player={player}
              isNight={isNight}
              gameFinished={gameFinished}
              handleMentionClick={handleMentionClick}
            />
          </Box>
        </Box>
      </Box>
      { (!isArchive && (player || viewer?.user?.id || (!player && ['SuperAdmin', 'Admin', 'Developer', 'Moderator', 'ModeratorTest'].includes(userRole as string)))) && (
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
