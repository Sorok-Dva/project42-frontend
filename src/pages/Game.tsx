import React, { useCallback, useEffect, useState } from 'react'
import { Box, Typography, Button, Paper, TextField } from '@mui/material'
import { Container, Spinner } from 'reactstrap'
import { useParams } from 'react-router-dom'

import { useAuth } from 'contexts/AuthContext'
import { useUser } from 'contexts/UserContext'
import { useSocket } from 'contexts/SocketContext'
import { useGame } from 'hooks/useGame'
import {
  fetchGameDetails,
  leaveGame,
} from 'services/gameService'
import Controls from '../components/Game/Controls'
import Chat from '../components/Game/Chat'
import PlayersList from '../components/Game/PlayersList'
import { getRandomColor } from 'utils/getRandomColor'

import 'styles/Game.scss'
import Composition from 'components/Game/Composition'
import ViewersList from 'components/Game/ViewersList'

export const GAME_TYPES: Record<number, string> = {
  0: 'Normal',
  1: 'Fun',
  2: 'Sérieuse',
  3: 'Carnage',
}

/**
 * The GamePage component manages and renders the game interface, user interactions, and real-time updates.
 * It integrates various elements like player controls, chat, and a list of players.
 *
 * @return {JSX.Element} The rendered JSX for the main game interface, including headers, chat, controls, and player list.
 */
const GamePage = () => {
  const { id: gameId } = useParams<{ id: string }>()
  const { user } = useUser()
  const { token } = useAuth()
  const { socket } = useSocket()

  const [highlightedPlayers, setHighlightedPlayers] = useState<{ [nickname: string]: string }>({})

  /**
   * Toggles the highlighting of a player based on their nickname.
   * If the player is already highlighted, they will be removed from the highlighted list.
   * If the player is not highlighted, they will be added with a random color.
   *
   * @param {string} nickname - The nickname of the player to toggle highlighting for.
   * @returns {void}
   */
  const toggleHighlightPlayer = (nickname: string) => {
    setHighlightedPlayers((prev) => {
      if (prev[nickname]) {
        const newState = { ...prev }
        delete newState[nickname]
        return newState
      } else {
        return { ...prev, [nickname]: getRandomColor() }
      }
    })
  }

  // Hook custom "useGame"
  const {
    roomData,
    player,
    viewer,
    viewers,
    players,
    creator,
    isCreator,
    messages,
    canBeReady,
    canStartGame,
    gameError,
    error,
    loading,
    isNight,
    gameStarted,
    gameFinished,
    messagesEndRef,
    passwordRequired,
    isAuthorized,
    password,
    alienList,
    slots,
    setSlots,
    handlePasswordSubmit,
    setPassword,
    setGameError,
    setRoomData,
    setMessages,
    setIsCreator,
    setGameStarted,
    setGameFinished,
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
      setGameFinished(data.room.status === 'completed')
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
        if (player) {
          const response = await leaveGame(token)
          if (response.message) {
            socket.emit('leaveRoom', {
              roomId: gameId,
              player: { id: user?.id, nickname: user?.nickname },
            })
          }
        }
        localStorage.removeItem(`game_auth_${gameId}`)
        setGameError('Vous avez bien quitté la partie. Vous pouvez fermer cet onglet.')
      } catch (error) {
        console.error('Erreur lors de la sortie de la partie:', error)
      }
    }
  }

  if (gameError) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="100vh"
        bgcolor="#f0f0f5"
        style={{
          backgroundImage: 'url(/assets/images/games/background-night.png)',
          backgroundSize: 'cover',
        }}
      >
        <Paper
          elevation={4}
          sx={{
            padding: '2rem',
            borderRadius: '10px',
            textAlign: 'center',
            backgroundColor: '#ffffff',
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)'
          }}
        >
          <Typography variant="h5" gutterBottom>
            ❌Erreur
          </Typography>
          <div className="alert alert-danger mt-2">
            <Typography variant="body1" sx={{ marginBottom: '1rem' }}>
              {gameError}
            </Typography>
          </div>
        </Paper>
      </Box>
    )
  }

  if (passwordRequired && !isAuthorized) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="100vh"
        bgcolor="#f0f0f5"
        sx={{
          backgroundImage: 'url(/assets/images/games/background2.png)',
          backgroundSize: 'cover',
        }}
      >
        <Paper
          elevation={4}
          sx={{
            padding: '2rem',
            borderRadius: '10px',
            textAlign: 'center',
            backgroundColor: '#ffffff',
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)'
          }}
        >
          <Typography variant="h5" gutterBottom>
            🔒 Partie protégée
          </Typography>
          <Typography variant="body1" sx={{ marginBottom: '1rem' }}>
            Entrez le mot de passe pour rejoindre la partie.
          </Typography>
          <TextField
            type="password"
            label="Mot de passe"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ marginBottom: '1rem' }}
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            onClick={handlePasswordSubmit}
          >
            Valider
          </Button>
          { error && <div className="alert alert-danger mt-2">{error}</div>}
        </Paper>
      </Box>
    )
  }

  return isAuthorized && creator ? (
    <>
      <Box display="flex" flexDirection="column" height="100vh"
        sx={{
          backgroundImage: (isNight || gameFinished) ?
            'url(/assets/images/games/background-night.png)'
            : 'url(/assets/images/games/background2.png)',
          backgroundSize: 'cover',
        }}
      >
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
            [{GAME_TYPES[roomData.type]}] Partie : {roomData.name} ({players.length}/{slots})
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
              <Controls
                gameId={gameId}
                roomData={roomData}
                fetchGameDetails={handleFetchGameDetails}
                isCreator={isCreator}
                canBeReady={canBeReady}
                canStartGame={canStartGame}
                player={player}
                gameStarted={gameStarted}
                gameFinished={gameFinished}
                setGameStarted={setGameStarted}
                slots={slots}
                setSlots={setSlots}
              />
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
                viewer={viewer ?? undefined}
                players={players}
                user={user ?? undefined}
                userRole={user?.role}
                messages={messages}
                messagesEndRef={messagesEndRef}
                socket={socket}
                highlightedPlayers={highlightedPlayers}
                isNight={isNight}
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
            <Composition roomData={roomData} />
            <PlayersList
              players={players}
              player={player}
              viewers={viewers}
              viewer={viewer}
              isCreator={isCreator}
              creatorNickname={creator!.nickname}
              gameId={gameId!}
              socket={socket}
              toggleHighlightPlayer={toggleHighlightPlayer}
              highlightedPlayers={highlightedPlayers}
              gameStarted={gameStarted}
              gameFinished={gameFinished}
              alienList={alienList}
              isNight={isNight}
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
          Partie #{gameId} - v{process.env.REACT_APP_GAME_VERSION} || {player?.nickname}
        </Typography>
      </Box>
    </>
  ): (
    <Container className="loader-container">
      <div className="spinner-wrapper">
        <Spinner className="custom-spinner" />
        <div className="loading-text">Chargement de la partie...</div>
      </div>
    </Container>
  )
}

export default GamePage
