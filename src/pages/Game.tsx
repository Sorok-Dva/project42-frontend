import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useUser } from 'context/UserContext'
import { useSocket } from 'context/SocketContext'
import { Box, Typography, TextField, Button, List, ListItem, ListItemText } from '@mui/material'
import axios from 'axios'
import DOMPurify from 'dompurify'
import 'styles/GamePage.css'
import { Container, Spinner } from 'reactstrap'
import { useAuth } from '../context/AuthContext'
import { initModeration } from '../core/moderation'
import Controls from '../components/Game/Controls'

interface RoomData {
  id: number
  creator: string
  name: string
  type: number
  maxPlayers: number
}

interface Message {
  nickname: string
  message: string
  playerId: number
  channel: number
  createdAt: Date
}

export const GAME_TYPES: Record<number, string> = {
  0: 'Normal',
  1: 'Fun',
  2: 'Sérieuse',
  3: 'Carnage',
}

const GamePage = () => {
  const { id: gameId } = useParams<{ id: string }>()
  const { user } = useUser()
  const { token } = useAuth()
  const socket = useSocket().socket
  const playerId = user?.id

  const [roomData, setRoomData] = useState<RoomData>({
    id: 0,
    creator: '',
    name: 'Chargement...',
    type: 0,
    maxPlayers: 6,
  })
  const [loading, setLoading] = useState(true)
  const [isCreator, setIsCreator] = useState(false)
  const [player, setPlayer] = useState<any>([])
  const [players, setPlayers] = useState<any[]>([])
  const [hasJoined, setHasJoined] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [gameDetails, setGameDetails] = useState<any>(null)
  const [gameError, setGameError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (!user) return
    const { handleChatCommand, getUserPermissions } = initModeration(user.role)
  }, [user])

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const response = await axios(`/api/games/room/${gameId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.data.error) {
          return setGameError(response.data.error)
        }
        const { creator } = response.data.room
        if (creator === response.data.player.nickname) {
          setIsCreator(true)
        }
        setRoomData(response.data.room)
        setPlayer(response.data.player)
      } catch (err) {
        console.error('Failed to fetch room data', err)
      }
    }

    fetchRoomData()
  }, [gameId])

  useEffect(() => {
    fetchGameDetails()
    fetchPlayers()
    fetchChatMessages()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!socket) return

    socket.onAny((eventName, ...args) => {
      console.log(`Événement reçu : ${eventName}`, args)
    })

    return () => {
      socket.offAny()
    }
  }, [socket])

  useEffect(() => {
    if (!socket || !user) return

    const handlePlayerLeft = (data: { message: string }) => {
      setMessages((prev) => [
        ...prev,
        {
          nickname: 'Système',
          message: data.message,
          playerId: -1,
          channel: 0,
          createdAt: new Date(),
        },
      ])

      if (data.message.includes(user?.nickname)) {
        setGameError('Vous avez bien quitté la partie. Vous pouvez fermer cet onglet.')
      }
    }

    socket.on('playerLeft', handlePlayerLeft)

    return () => {
      socket.off('playerLeft', handlePlayerLeft)
    }
  }, [socket, user])

  useEffect(() => {
    if (!socket || !gameId || !user || hasJoined) return

    socket.emit('joinRoom', {
      roomId: gameId,
      player: { id: user.id, nickname: user.nickname },
    })

    socket.on('playerJoined', (data) => {
      setMessages((prev) => [
        ...prev,
        {
          nickname: 'Système',
          message: data.message,
          playerId: -1,
          channel: 0,
          createdAt: new Date(),
        },
      ])
    })

    socket.on('updatePlayers', (updatedPlayers) => {
      setPlayers(updatedPlayers)
    })

    setHasJoined(true)
  }, [socket, gameId, user, hasJoined])

  useEffect(() => {
    if (!socket) return

    socket.on('newMessage', (message) => {
      setMessages((prev) => [...prev, message])
    })

    socket.on('playerKicked', (nickname) => {
      if (nickname === player?.nickname) {
        setGameError('Vous avez été expulsé de la partie.')
      }
    })

    return () => {
      socket.off('newMessage')
    }
  }, [socket, player])

  const fetchGameDetails = async () => {
    try {
      const { data } = await axios.get(`/api/games/room/${gameId}`)
      setGameDetails(data)
    } catch (error) {
      console.error('Erreur lors du chargement des détails de la partie:', error)
    }
  }

  const fetchPlayers = async () => {
    try {
      const { data } = await axios.get(`/api/games/room/${gameId}/players`)
      setPlayers(data)
    } catch (error) {
      console.error('Erreur lors du chargement des joueurs:', error)
    }
  }

  const fetchChatMessages = async () => {
    try {
      const { data } = await axios.get(`/api/games/room/${gameId}/tchat`)
      setMessages(data)
      setLoading(false)
    } catch (error) {
      console.error('Erreur lors du chargement du chat:', error)
    }
  }

  const handleSendMessage = async () => {
    const trimmedMessage = newMessage.trim()
    if (!trimmedMessage) return

    try {
      if (trimmedMessage.startsWith('/')) {
        const commandString = trimmedMessage.slice(1).trim()
        const [command, arg, ...rest] = commandString.split(' ')
        const text = rest.join(' ')

        socket.emit('moderationCommand', {
          command,
          arg,
          text,
          roomId: gameId,
          playerId,
          currentUserRole: user?.role,
          moderator: {
            id: user?.id,
            username: user?.nickname,
          },
        })

        setNewMessage('')
      } else {
        socket.emit('sendMessage', {
          roomId: gameId,
          playerId: playerId,
          content: trimmedMessage,
        })
        setNewMessage('')
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message ou de la commande:', error)
    }
  }

  const handleKickPlayer = async (nickname: string) => {
    try {
      if (isCreator) {
        socket.emit('kickPlayer', {
          roomId: gameId,
          nickname,
        })
      } else throw new Error('Droits insuffisants pour expulser un joueur.')
    } catch (error) {
      console.error('Erreur lors du kick:', error)
    }
  }

  const handleClearChat = async () => {
    try {
      setMessages([])
    } catch (error) {
      console.error('Erreur lors de l\'effacement du chat:', error)
    }
  }

  const handleLeaveGame = async () => {
    try {
      const response = await axios.post('/api/games/players/room/leave', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.data.message) {
        socket.emit('leaveRoom', {
          roomId: gameId,
          player: { id: playerId, nickname: user?.nickname },
        })
        setGameError('Vous avez bien quitter votre partie. Vous pouvez fermer cet onglet.')
      }
    } catch (error) {
      console.error('Erreur lors de la sortie de la partie:', error)
    }
  }

  if (gameError) {
    return (
      <div className="alert alert-danger">{gameError}</div>
    )
  }

  return (
    <Box display="flex" flexDirection="column" height="100vh">
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px={2}
        py={1}
        bgcolor="#f0f0f0"
      >
        <Typography variant="h6">
          [{GAME_TYPES[roomData.type]}] Partie : {roomData.name} ({players.length}/{roomData.maxPlayers})
        </Typography>

        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleClearChat}
          >
            ♻️
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={handleLeaveGame}
          >
            Quitter
          </Button>
        </Box>
      </Box>

      <Box display="flex" flex={1} p={2} className="game-page-container">
        <Box
          display="flex"
          flexDirection="column"
          width="25%"
          className="left-column"
          mr={2}
        >
          <Box mb={2}>
            <Controls
              gameId={gameId}
              fetchGameDetails={fetchGameDetails}
              isCreator={isCreator}
            />
          </Box>
        </Box>

        <Box
          display="flex"
          flexDirection="column"
          width="50%"
          className="chat-column"
          mr={2}
          height="90vh"
        >
          <Box flex={1} bgcolor="#f5f5f5" p={2} overflow="auto">
            {loading && (
              <Container className="loader-container">
                <div className="spinner-wrapper">
                  <Spinner animation="border" role="status" className="custom-spinner">
                    <span className="sr-only">Loading...</span>
                  </Spinner>
                  <div className="loading-text">Loading...</div>
                </div>
              </Container>
            )}
            {messages.map((msg, index) => {
              const htmlContent = DOMPurify.sanitize(`
                <small>[${new Date(msg.createdAt).toLocaleTimeString()}]</small>
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
            <Button variant="contained" color="primary" onClick={handleSendMessage}>
              Envoyer
            </Button>
          </Box>
        </Box>

        {/* Colonne droite: Liste des joueurs */}
        <Box
          display="flex"
          flexDirection="column"
          width="25%"
          className="right-column"
        >
          <Typography variant="h6" gutterBottom>
            Joueurs ({players.length}/{roomData.maxPlayers})
          </Typography>
          <List>
            {players.map((player, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={player.nickname}
                  secondary={
                    player.ready
                      ? 'Prêt'
                      : 'Non prêt'
                  }
                />
                {isCreator && roomData.creator !== player.nickname && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleKickPlayer(player.nickname)}
                  >
                    Kick
                  </Button>
                )}
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>
    </Box>
  )
}

export default GamePage
