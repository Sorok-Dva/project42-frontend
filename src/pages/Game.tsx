import React, { useCallback, useEffect, useState } from 'react'
import { Box, Typography, Button } from '@mui/material'
import { Container, Spinner } from 'reactstrap'
import { useParams } from 'react-router-dom'

import { useAuth } from 'context/AuthContext'
import { useUser } from 'context/UserContext'
import { useSocket } from 'context/SocketContext'
import { PlayerType, useGame } from 'hooks/useGame'
import {
  fetchGameDetails,
  leaveGame,
} from 'services/gameService'
import Controls from '../components/Game/Controls'
import Chat from '../components/Game/Chat'
import PlayersList from '../components/Game/PlayersList'

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
  const { socket } = useSocket()

  // Hook custom "useGame"
  const {
    roomData,
    player,
    players,
    creator,
    isCreator,
    messages,
    canBeReady,
    canStartGame,
    gameError,
    loading,
    messagesEndRef,
    setGameError,
    setRoomData,
    setMessages,
    setIsCreator,
  } = useGame(gameId, user, token, socket)

  // temp - debug
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
    setIsCreator(player?.nickname === creator?.nickname)
  }, [creator])

  /**
   * Requête pour recharger certains détails du jeu (ex : titre, etc.)
   */
  const handleFetchGameDetails = useCallback(async () => {
    if (!gameId) return
    try {
      const data = await fetchGameDetails(gameId)
      setRoomData(data.room)
    } catch (error) {
      console.error('Erreur lors du fetchGameDetails: ', error)
    }
  }, [gameId])

  /**
   * Gère l'effacement du chat côté front
   */
  const handleClearChat = () => {
    setMessages([])
  }

  /**
   * Quitter la partie
   */
  const handleLeaveGame = async () => {
    if (!socket || !gameId) return
    if (confirm('Êtes-vous sûr de vouloir quitter la partie ?')) {
      try {
        const response = await leaveGame(token)
        if (response.message) {
          socket.emit('leaveRoom', {
            roomId: gameId,
            player: { id: user?.id, nickname: user?.nickname },
          })
          setGameError('Vous avez bien quitté la partie. Vous pouvez fermer cet onglet.')
        }
      } catch (error) {
        console.error('Erreur lors de la sortie de la partie:', error)
      }
    }
  }

  if (gameError) {
    return <div className="alert alert-danger">{gameError}</div>
  }

  return (
    <>
      <Box display="flex" flexDirection="column" height="100vh">
        {/* Header */}
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

        {/* Contenu principal */}
        <Box display="flex" flex={1} p={2} className="game-page-container">
          {/* Colonne gauche : Controls */}
          <Box
            display="flex"
            flexDirection="column"
            width="25%"
            className="left-column"
            mr={2}
          >
            <Box mb={2}>
              {player && (
                <Controls
                  gameId={gameId}
                  fetchGameDetails={handleFetchGameDetails}
                  isCreator={isCreator}
                  canBeReady={canBeReady}
                  canStartGame={canStartGame}
                  player={player}
                />
              )}
            </Box>
          </Box>

          {/* Colonne centrale : Chat */}
          <Box
            display="flex"
            flexDirection="column"
            width="50%"
            className="chat-column"
            mr={2}
            height="85vh"
          >
            {loading ? (
              <Container className="loader-container">
                <div className="spinner-wrapper">
                  <Spinner className="custom-spinner" />
                  <div className="loading-text">Chargement du chat...</div>
                </div>
              </Container>
            ) : (
              <Chat
                gameId={gameId!}
                playerId={user?.id}
                player={player ?? undefined}
                players={players}
                user={user ?? undefined}
                userRole={user?.role}
                messages={messages}
                messagesEndRef={messagesEndRef}
                socket={socket}
              />
            )}
          </Box>

          {/* Colonne droite : Liste des joueurs */}
          <Box
            display="flex"
            flexDirection="column"
            width="25%"
            className="right-column"
          >
            <PlayersList
              players={players}
              isCreator={isCreator}
              creatorNickname={roomData.creator}
              gameId={gameId!}
              socket={socket}
            />
          </Box>
        </Box>
      </Box>

      <Box
        position="fixed"
        bottom={0}
        left={0}
        p={1}
        bgcolor="#f0f0f0"
        borderTop="1px solid #ccc"
        width="100%"
      >
        <Typography variant="caption">
          Partie #{gameId} - v{process.env.REACT_APP_GAME_VERSION}
        </Typography>
      </Box>
    </>
  )
}

export default GamePage
